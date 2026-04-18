# Security Audit — FoodAssist V2 Backend Integration

**Date:** 2026-04-17
**Branch:** backendIntegrate
**Scope:** Phases 1–3 (auth, admin CRUD, settings API, import API)
**Auditor:** researcher subagent (read-only)

---

## 1. Supabase Advisor Results

> **Note:** The Supabase MCP server (`mcp__supabase__get_advisors`) is not provisioned in this session. The findings below are derived from the migration files and WIP.md audit trail, which records the advisor runs performed during active development.

### Security Advisor (lint class: 0011)
From WIP.md: "Security advisor clean" after migration 003 was applied.

- **`handle_new_user()`** — FIXED. Migration 003 pins `search_path = public, pg_temp`. No longer flagged.
- **`update_last_updated()`** — FIXED. Same migration 003 pin. No longer flagged.
- **`prevent_self_role_change()`** (migration 004) — Created with `SET search_path = public, pg_temp` inline. Clean from birth.

**Verdict: 0 outstanding security advisor flags.** (Confidence: HIGH — all three functions pinned in migrations 003/004.)

### Performance Advisor
No performance advisor run output is preserved in docs. The current indexes present in migration 001 cover:
- `idx_org_active` — supports the hot public query `WHERE is_active = true`
- `idx_org_assistance_types` GIN index — supports array-contains filter
- `idx_org_town`, `idx_org_zip` — support directory filtering
- `idx_volunteer_active`, `idx_volunteer_org` — support public volunteer page
- `idx_profiles_role` — used by every RLS subquery that checks `WHERE role = 'admin'`

**Potential performance warning (LOW confidence):** RLS policies on `organizations`, `volunteer_needs`, `council_donations`, and `site_settings` all use a correlated subquery `auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')`. This is executed per-row. Supabase's advisor typically flags this pattern as `auth_rls_initplan`. The `idx_profiles_role` index mitigates this but does not eliminate the subquery overhead. Acceptable at current scale; consider materializing `is_admin` as a column or using `auth.jwt() ->> 'role'` in a future performance pass.

---

## 2. Schema Review — RLS Policies Per Table

### `organizations` (3 policies)

| Policy | Command | USING clause |
|--------|---------|--------------|
| "Public read active orgs" | FOR SELECT | `is_active = true` |
| "Orgs update own record" | FOR UPDATE | `auth.uid() IN (SELECT id FROM profiles WHERE organization_id = organizations.id)` |
| "Admins full access orgs" | FOR ALL | `auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')` |

**Overlap analysis:** "Admins full access orgs" (FOR ALL) covers SELECT. "Public read active orgs" covers SELECT with `is_active = true`. For a non-authenticated visitor hitting the SELECT path, `auth.uid()` returns NULL — the admin policy evaluates to false, and the public policy allows reads of active orgs. For an admin user, both SELECT policies match, but Postgres applies OR logic across permissive policies, so the admin sees ALL rows (active and inactive) via the FOR ALL policy. This is the intended behavior: admins see everything, public sees only active.

**No fix required.** The overlap is additive, not conflicting.

**Flag:** Admins can SELECT inactive orgs but the public policy requires `is_active = true`. This is intentional (admin needs to view/restore inactive orgs). Precedence is correct.

### `council_donations` (2 policies)

| Policy | Command | USING clause |
|--------|---------|--------------|
| "Admins view donations" | FOR SELECT | admin subquery |
| "Admins manage donations" | FOR ALL | admin subquery |

**Overlap:** "Admins manage donations" FOR ALL already covers SELECT. "Admins view donations" FOR SELECT is fully redundant — it adds no new access and will never fire independently. It is not a security issue but is dead policy. **Recommendation:** drop "Admins view donations" in a future cleanup migration.

### `volunteer_needs` (3 policies)

| Policy | Command | USING clause |
|--------|---------|--------------|
| "Public read active volunteer needs" | FOR SELECT | `is_active = true` |
| "Orgs manage own volunteer needs" | FOR ALL | org membership subquery |
| "Admins full access volunteer needs" | FOR ALL | admin subquery |

Same additive-OR pattern as organizations. No conflicts. Public sees active only; org users see/manage their own; admins see all.

### `profiles` (4 policies)

| Policy | Command | USING / WITH CHECK |
|--------|---------|---------------------|
| "Users read own profile" | FOR SELECT | `auth.uid() = id` |
| "Users update own profile" | FOR UPDATE | `auth.uid() = id` / `auth.uid() = id` |
| "Admins view all profiles" | FOR SELECT | admin subquery |
| "Admins manage all profiles" | FOR ALL | admin subquery |

**Critical gap — closed by trigger:** "Users update own profile" WITH CHECK allows any column to be changed, including `role` and `organization_id`. Migration 004 (`profiles_prevent_self_escalation` trigger) closes this gap at the DB level. **Confirmed present.**

"Admins manage all profiles" FOR ALL overlaps with "Admins view all profiles" FOR SELECT — same redundancy as donations. Low priority cleanup.

### `site_settings` (2 policies)

| Policy | Command | USING |
|--------|---------|-------|
| "Public read settings" | FOR SELECT | `true` |
| "Admins manage settings" | FOR ALL | admin subquery |

Clean. No conflicts. The FOR ALL admin policy covers UPDATE/INSERT/DELETE; the public policy covers SELECT for unauthenticated SettingsContext reads.

---

## 3. Service-Role Key Handling

**Grep results — `SUPABASE_SERVICE_ROLE_KEY`:**

```
lib/supabase/admin.ts:2   // comment: key bypasses RLS — server only
lib/supabase/admin.ts:18  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
lib/supabase/admin.ts:29  error string mentioning the key name
app/admin/users/actions.ts:30  friendly error string mentioning key name (no value)
app/admin/users/actions.ts:139 same
```

**No hits in any `'use client'` file. Zero hits in `components/`.** The env var name appears in error messages only (not the value). Clean.

**Grep results — `createAdminClient`:**

```
app/admin/users/actions.ts:6   import (server action — 'use server' at line 1)
app/admin/users/actions.ts:25  createAdminClient() call
app/admin/users/actions.ts:134 createAdminClient() call
```

**Zero hits in `components/**`. Zero hits in any `'use client'` file.** Only used inside a `'use server'` action. Clean.

---

## 4. Secret Leak Check

Grep patterns: `eyJ`, `sk_live`, `service_role` (literal values), hardcoded JWTs.

**Results:**
- `eyJ` — zero hits in `app/`, `lib/`, `components/`
- `sk_live` — zero hits
- Literal `service_role` values — zero hits
- `.env.example` contains only empty placeholder: `SUPABASE_SERVICE_ROLE_KEY=` (no value)
- `.gitignore` excludes `.env*` with the exception of `.env.example`

**Verdict: No hardcoded secrets found.** (Confidence: HIGH)

---

## 5. RLS Tri-Layer Self-Escalation Defense

Three layers required per ADR-003:

**Layer 1 — Server Action re-verification:**
- `updateUserRoleAction` in `app/admin/users/actions.ts` calls `requireAdmin()` at line 86 as first statement. CONFIRMED.

**Layer 2 — Service-role client isolation:**
- `createAdminClient()` is imported only in `app/admin/users/actions.ts` (a `'use server'` file). Zero imports in client components or `lib/` beyond the definition file. CONFIRMED.

**Layer 3 — Postgres trigger:**
- `profiles_prevent_self_escalation` trigger defined in migration 004, BEFORE UPDATE on `public.profiles`, calling `prevent_self_role_change()` with `SECURITY DEFINER` and pinned `search_path`. Service-role / superuser writes pass through (NULL JWT check at line 83). CONFIRMED in migration file.

**All three layers active.** (Confidence: HIGH)

---

## 6. Route Protection Summary

### Admin routes (`/admin/*`)

| Route | Middleware guard | Action-level guard |
|-------|-----------------|-------------------|
| `/admin` (dashboard) | `updateSession` checks role=admin, redirects to `/` if not | RSC `layout.tsx` calls `requireAdmin()` |
| `/admin/organizations` | middleware | `requireAdmin()` before every action |
| `/admin/donations` | middleware | `requireAdmin()` before every action |
| `/admin/users` | middleware | `requireAdmin()` before every action |
| `/admin/volunteers` | middleware | `requireAdmin()` before every action |
| `/admin/reports` | middleware | page is `'use client'` — no server-side data fetch yet (Phase 3 incomplete) |
| `/admin/settings` | middleware | SettingsPageClient is `'use client'` — API route `/api/settings` PUT uses `requireAdmin()` |

**Flag (MEDIUM severity):** `/admin/reports` is a client-only page with no server-side auth guard beyond middleware. If reports eventually fetch sensitive data, a server component wrapper calling `requireAdmin()` must be added.

### Portal routes (`/portal/*`)

| Route | Middleware guard | Layout-level guard |
|-------|-----------------|-------------------|
| `/portal` (root) | middleware checks `user` exists | `app/portal/layout.tsx` calls `requireOrganization()` |
| `/portal/dashboard` | middleware | inherited from layout |
| `/portal/profile` | middleware | inherited from layout |
| `/portal/volunteers` | middleware | inherited from layout |

**Portal layout guard confirmed.** (Confidence: HIGH)

### API routes

| Route | Method | Auth |
|-------|--------|------|
| `/api/settings` | GET | Public (intentional — public reads settings) |
| `/api/settings` | PUT | `requireAdmin()` called before try block |
| `/api/import/organizations` | POST | `requireAdmin()` called at line 67 |

---

## 7. Input Validation

| Mutation path | Zod validation | Notes |
|---------------|---------------|-------|
| `createOrganizationAction` | TypeScript type `OrganizationFormValues` (Zod-derived) — validated in the form layer before submission; action does not re-parse | **Gap:** action accepts raw `OrganizationFormValues` trusting the client-side form to have validated it. No `safeParse` in the action itself. |
| `updateOrganizationAction` | Same — partial, no re-parse in action | Same gap |
| `deleteOrganizationAction` | ID is a string — no UUID format check | Low risk (RLS rejects mismatches) |
| `toggleOrgActiveAction` | ID + boolean — no parsing | Low risk |
| `createDonationAction` | `CouncilDonationFormValues` — `organization_id` null-check only; no re-parse | Same gap as orgs |
| `deleteDonationAction` | ID string only | Low risk |
| `inviteUserAction` | Email, name, role, organizationId — no Zod parse in action | Gap |
| `updateUserRoleAction` | Role enum not validated against Zod; TypeScript-only | Gap |
| `deleteUserAction` | ID string — no UUID check | Low risk |
| `createVolunteerNeedAction` | `VolunteerNeedFormValues` — no re-parse | Gap |
| `PUT /api/settings` | `settingsPatchSchema.safeParse(body)` — VALIDATED | Clean |
| `POST /api/import/organizations` | `organizationSchema.safeParse(mapped)` per row — VALIDATED | Clean |

**Summary:** The two API routes properly re-validate with Zod. The four Server Action files trust TypeScript types from the client-side form layer without re-parsing in the action. For an admin-only surface where all mutations require an authenticated admin session this is acceptable, but it violates the "validate at the boundary" principle. Any future public-facing mutation must use `safeParse` in the action.

---

## 8. Server Action Auth-Bypass Pattern Check

`requireAdmin()` placement relative to first `try {}` block in each actions file:

| File | requireAdmin line | First try line | BEFORE try? |
|------|-----------------|----------------|-------------|
| `organizations/actions.ts` | 17, 35, 52, 71 | 18, 36, 53, 72 | YES — all four functions |
| `donations/actions.ts` | 16, 50 | 22, 52 | YES — both functions |
| `users/actions.ts` | 17, 86, 126 | 24, (no try for role update), 133 | YES — all three paths |
| `volunteers/actions.ts` | 17, 34, 50 | 18, 35, 51 | YES — all three functions |

**All `requireAdmin()` calls precede their respective `try` blocks.** An exception in `requireAdmin()` (including `redirect()`) will propagate before any DB write is attempted. CONFIRMED. (Confidence: HIGH)

---

## 9. Prod-Readiness Gaps

| Gap | Severity | Detail |
|-----|---------|--------|
| Supabase free-tier pause | HIGH | Free projects pause after 7 days of no activity. A production civic app must be on Supabase Pro ($25/mo) before launch or accept the risk of a paused DB for real users. |
| `SUPABASE_SERVICE_ROLE_KEY` not yet set | MEDIUM | WIP.md confirms the key is missing; user invite/delete actions degrade gracefully with a friendly toast error. Must be added before user management is usable. |
| `exceljs` requires `runtime = 'nodejs'` | MEDIUM | The import route at `app/api/import/organizations/route.ts` must declare `export const runtime = 'nodejs'`. If absent, Vercel will attempt edge deployment and the route will fail. Confirm this export is present before deploy. |
| No `revalidate` ISR on public pages | MEDIUM | Public pages (Phase 5 not started) still use `sampleData`. When they switch to Supabase, they must set `export const revalidate = 3600` or the 5 GB free-tier egress cap becomes a real risk at 12k MAU. |
| Cookie security flags | LOW | `@supabase/ssr` `createServerClient` manages `Secure` and `HttpOnly` cookie flags internally when `NODE_ENV=production`. No explicit override needed — but verify in Vercel logs after first deploy that `sb-*` cookies carry `Secure; HttpOnly; SameSite=Lax`. |
| `.env.local` gitignore | CONFIRMED CLEAN | `.gitignore` excludes `.env*` (except `.env.example`). No `.env.local` will ever reach the repo. |
| `/admin/reports` client-only | LOW | Currently a stub. Add `requireAdmin()` at layout/page level before adding any sensitive data query. |
| Redundant RLS policies | LOW | `"Admins view donations"` on `council_donations` and `"Admins view all profiles"` on `profiles` are subsumed by their FOR ALL counterparts. Dead policies; no security impact; cleanup in a future migration. |
