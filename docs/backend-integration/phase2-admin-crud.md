# Phase 2: Admin Dashboard CRUD Wiring

Status: READY_FOR_BUILD
Branch: `backendIntegrate`
Scope: PLAN.md Steps 6–11 (admin layout auth + 5 admin pages)
Phase 1 already delivered: `lib/supabase/{client,server,auth,middleware}.ts`, middleware active, `site_settings` migrated. This plan only wires CRUD.

---

## Goal
Replace all `sampleData` / local `useState` in `/admin` with real Supabase reads/writes. Every mutation revalidates affected public paths. RLS does the real enforcement; route guards are UX, not security.

---

## Acceptance Criteria (per-page checkboxes the tester will verify)
- `[ ]` Logging in as non-admin and hitting `/admin` redirects (already done in middleware; re-verify).
- `[ ]` Dashboard stats reflect real DB counts.
- `[ ]` Creating/updating/deleting an org persists, the admin list refreshes, and `/` + `/organization/[id]` show the change after revalidation.
- `[ ]` Donations CRUD persists; totals recompute.
- `[ ]` Users page: admin can create a user (email invite), change role, delete (except self).
- `[ ]` Non-admins cannot elevate themselves to admin (server enforces even if client sends it).
- `[ ]` Volunteer needs CRUD persists and revalidates `/volunteers`.
- `[ ]` All mutations show loading state and show a toast on error with an actionable message.

---

## Out of Scope (Phase 2)
- Site-settings persistence → Phase 3.
- CSV/XLS import → Phase 4.
- Public page wiring → Phase 5.
- Portal → Phase 6.
- Audit log, soft-delete recovery, pagination beyond basic (scale is ~50 orgs / ~100 users).
- Editing users (role-change only). Full user-profile edit not required this phase.

---

## Global Patterns (apply to every page below)

### 1. Component split
- Page file (`page.tsx`) → **async Server Component**. Reads via `createClient()` from `lib/supabase/server.ts` and `requireAdmin()` from `lib/supabase/auth.ts`. Fetches initial data, passes to a Client Component.
- UI / interactivity → **Client Component** (`<Feature>Client.tsx` co-located). Accepts server-fetched data as props. Owns dialogs, search filter state, optimistic UI.
- Rationale: Supabase SSR cookie-auth works best from server components; initial render is already authenticated + pre-populated; no client-side `useEffect` fetch spinner on first paint.

### 2. Mutations: Server Actions (not API routes)
- One `actions.ts` file per admin page, located next to `page.tsx` (e.g. `app/admin/organizations/actions.ts`).
- Each action: `'use server'`, takes plain args, constructs server Supabase client, calls existing `lib/supabase/queries.ts` function, calls `revalidatePath(...)`, returns `{ ok: true, data }` or `{ ok: false, error: string }`.
- Rationale: Server Actions give RSC-native revalidation, no manual fetch boilerplate, type-safe end-to-end, same Supabase cookie auth. API routes are only warranted for Phase 4 (multipart upload) and Phase 3 (public settings GET).
- **Re-auth in every action.** Every action opens with `const session = await requireAdmin()` — do not trust the caller. This is belt-and-braces on top of RLS.

### 3. Revalidation
- Mutations that affect the public site call `revalidatePath(path, 'page' | 'layout')`.
- Tags not used this phase (single-page cache is enough; tag indirection adds complexity without payoff here).
- Concrete paths per page listed below.

### 4. Error + Loading UX
- Loading: Next `loading.tsx` sibling to each `page.tsx` for initial fetch. Inside Client Components, button-level `isPending` via `useTransition` around `startTransition(() => action())`.
- Errors from actions: Client uses `sonner` `toast.error(result.error)`. Inline field errors only for form validation (already handled by react-hook-form + zod).
- No global error boundary changes this phase.

### 5. Optimistic updates: NO (by default)
- Why: operation latency is low, the admin user base is tiny (1–2 people), and optimistic UI masks RLS rejections which we actively want the admin to see.
- Exception: toggle-active on orgs MAY be optimistic since it's a one-field, fast, common operation — but only if the builder judges it trivial. If in doubt, don't.

### 6. Concurrency / optimistic locking
- Scale is ~50 orgs, 1–2 admins. Race collision probability is near-zero.
- We will NOT add optimistic locking (`If-Match` on `last_updated`) this phase. We WILL return the updated row after every mutation and `router.refresh()` so the admin sees truth. Documented as an ADR.
- Revisit only if multi-admin editing becomes real.

---

## Page 1: Admin Layout (`app/admin/layout.tsx`) — Step 6

### Current state
Client Component. Calls `createClient()` (browser) in `handleSignOut`. No server-side session check (middleware does it, but relies on middleware being active — belt-and-braces is cheap).

### Changes
- Split into:
  - `app/admin/layout.tsx` → async Server Component. Calls `requireAdmin()`. Passes `session.profile.name` / `session.profile.email` into a new client shell.
  - `app/admin/AdminShell.tsx` (new, client) → what `layout.tsx` currently contains (nav, sheet, sign-out button).
- Sign-out button continues using browser `supabase.auth.signOut()` (already correct; verified in recent commit `43c98b8`).

### Data fetching
- `requireAdmin()` — existing, no new function.

### Mutation / revalidation / RLS / optimistic
- N/A (layout is read-only).

### Loading + error
- Layout has no loading UI. Page-level `loading.tsx` handles per-route spinners.

### Files
- MODIFIED: `app/admin/layout.tsx` (convert to RSC).
- NEW: `app/admin/AdminShell.tsx`.

---

## Page 2: Dashboard (`app/admin/page.tsx`) — Step 7

### Current state
Server Component body but imports `sampleOrganizations`, `sampleVolunteerNeeds`, and hardcoded `totalDonations = 15750`.

### Server vs Client
- **Server Component**. Pure read, no interactivity.

### Data fetching
- Use existing `getAdminStats(supabase)` from `lib/supabase/queries.ts` (lines 281–301).
- Additional read for "Services by Type" + "Recently Updated" sections:
  - NEW function `getDashboardSnapshot(supabase)` in `lib/supabase/queries.ts`.

```ts
// Add to lib/supabase/queries.ts
export async function getDashboardSnapshot(
  supabase: SupabaseClient
): Promise<{
  assistanceTypeCounts: Record<AssistanceType, number>;
  recentOrganizations: Pick<Organization, 'id' | 'name' | 'town' | 'last_updated'>[];
  townCount: number;
}>;
```
- Implementation notes for builder: single `organizations` SELECT of `id, name, town, last_updated, assistance_types, is_active`; compute counts, distinct towns, and top-5-by-last_updated in JS. Two DB round-trips max (this + `getAdminStats`).

### Count queries vs materialized view: **plain count queries.**
- Scale: 50 orgs, ~3k donation rows worst case, 12k profiles. Postgres aggregate over this is <10ms. Materialized view adds refresh complexity for zero user-visible benefit.
- ADR recorded.

### Mutation / revalidation
- None.

### RLS
- Admin SELECT on all tables is covered by "Admins full access orgs" / "Admins view donations" / "Admins full access volunteer needs" / "Admins view all profiles". No policy changes needed.

### Loading + error
- NEW: `app/admin/loading.tsx` with skeleton cards.
- On fetch throw: Next's default error boundary is fine; no custom `error.tsx` this phase.

### Files
- MODIFIED: `app/admin/page.tsx` (remove sampleData, add Supabase fetch).
- NEW: `app/admin/loading.tsx`.
- MODIFIED: `lib/supabase/queries.ts` (add `getDashboardSnapshot`).

---

## Page 3: Organizations (`app/admin/organizations/page.tsx`) — Step 8

### Current state
Client Component using `useState(sampleOrganizations)`. Dialog-based create/edit with `OrgForm`. Toggle-active, delete, search are local-only.

### Server vs Client
- Split:
  - `app/admin/organizations/page.tsx` → async RSC. Fetches orgs. Passes to client.
  - `app/admin/organizations/OrganizationsClient.tsx` (new, client) → everything the current page does, minus sample data, minus local mutation logic. Calls Server Actions.

### Data fetching
- Use existing `getOrganizations(supabase, undefined, false)` from `queries.ts` — pass `activeOnly: false` so admin sees inactive orgs too.
- No new query function needed.

### Mutation pattern — Server Actions
New file: `app/admin/organizations/actions.ts`. Exports:

```ts
'use server';

import type { OrganizationFormValues } from '@/lib/validations/schemas';

export async function createOrganizationAction(
  data: OrganizationFormValues
): Promise<{ ok: true; id: string } | { ok: false; error: string }>;

export async function updateOrganizationAction(
  id: string,
  data: Partial<OrganizationFormValues>
): Promise<{ ok: true } | { ok: false; error: string }>;

export async function deleteOrganizationAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }>;

export async function toggleOrgActiveAction(
  id: string,
  nextIsActive: boolean
): Promise<{ ok: true } | { ok: false; error: string }>;
```

Each action:
1. `await requireAdmin()`.
2. `await createClient()` (server).
3. Call the corresponding existing `queries.ts` function (`createOrganization` / `updateOrganization` / `deleteOrganization`).
4. `revalidatePath('/admin/organizations')`.
5. `revalidatePath('/')` — homepage directory.
6. `revalidatePath('/organization/[id]', 'page')` with dynamic segment — Next needs the literal pattern, so pass `/organization/${id}` and also `'/organization/[id]'`. Builder to confirm syntax on Next 16; fallback is `revalidatePath('/organization/' + id)` which is valid.

### Revalidation summary
| Action | Paths to revalidate |
|--------|---------------------|
| create | `/admin/organizations`, `/` |
| update | `/admin/organizations`, `/`, `/organization/${id}` |
| delete | `/admin/organizations`, `/`, `/organization/${id}` |
| toggle active | `/admin/organizations`, `/`, `/organization/${id}` |

### RLS
- Policy "Admins full access orgs" (FOR ALL, USING `auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')`) — covers all four operations.
- No new policies.

### Loading + error
- Page-level `loading.tsx` for initial fetch.
- Per-action: `useTransition`. On `!result.ok`, `toast.error(result.error)` and keep dialog open. On success, toast + close dialog + `router.refresh()`.

### Optimistic update
- Toggle-active: **optional** optimistic. Keep non-optimistic in the default build; document in the component where optimism could be added later.
- Create/update/delete: **no**.

### Files
- MODIFIED: `app/admin/organizations/page.tsx` (convert to RSC).
- NEW: `app/admin/organizations/OrganizationsClient.tsx`.
- NEW: `app/admin/organizations/actions.ts`.
- NEW: `app/admin/organizations/loading.tsx`.
- DELETED imports: `sampleOrganizations` from sampleData.

---

## Page 4: Donations (`app/admin/donations/page.tsx`) — Step 9

### Current state
Client Component with hardcoded `initialDonations` array. Create via raw `<form onSubmit>`. Org select dropdown uses `sampleOrganizations`.

### Server vs Client
- Split:
  - `app/admin/donations/page.tsx` → RSC. Fetches donations + orgs-for-select.
  - `app/admin/donations/DonationsClient.tsx` (new) → table, filter, dialog.

### Data fetching
- `getCouncilDonations(supabase)` — existing, joins `organizations`.
- `getOrganizations(supabase, undefined, false)` — for the org dropdown in "Log Donation" dialog. Only need `id, name`; builder may create a lightweight variant if perf matters, but full fetch is fine at this scale.

### Mutation pattern — Server Actions
New file: `app/admin/donations/actions.ts`:

```ts
'use server';

import type { CouncilDonationFormValues } from '@/lib/validations/schemas';

export async function createDonationAction(
  data: CouncilDonationFormValues
): Promise<{ ok: true; id: string } | { ok: false; error: string }>;

export async function deleteDonationAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }>;
```
- `recorded_by` field: server action must set this to `session.profile.name ?? session.email` (do NOT trust client). Update the existing `CouncilDonationFormValues` flow accordingly — the form should not render a `recorded_by` input.
- Note: `CouncilDonationFormValues` schema currently requires `recorded_by`. Builder MUST relax that OR omit it from the client payload and have the action inject it before insert. Prefer: remove from form schema, inject server-side.

### Revalidation
| Action | Paths |
|--------|-------|
| create | `/admin/donations`, `/admin` (dashboard stats) |
| delete | `/admin/donations`, `/admin` |

No public-site revalidation — donations are admin-only per RLS.

### RLS
- "Admins view donations" + "Admins manage donations" (both FOR ALL/SELECT with `role='admin'` check). Covers everything.

### Loading + error
- `loading.tsx`, `useTransition` + toast as per global pattern.

### Optimistic update
- No.

### Files
- MODIFIED: `app/admin/donations/page.tsx`.
- NEW: `app/admin/donations/DonationsClient.tsx`.
- NEW: `app/admin/donations/actions.ts`.
- NEW: `app/admin/donations/loading.tsx`.
- MODIFIED: `lib/validations/schemas.ts` — make `recorded_by` optional or remove from `councilDonationSchema` (builder choice; document which).

---

## Page 5: Users (`app/admin/users/page.tsx`) — Step 10

**This is the highest-risk page this phase. Read the whole section carefully.**

### Current state
Hardcoded `initialUsers`. Create via FormData → `setUsers([...])`. No real auth, no role change.

### Server vs Client
- Split:
  - `app/admin/users/page.tsx` → RSC. Fetches profiles.
  - `app/admin/users/UsersClient.tsx` (new) → table, dialogs.

### Data fetching
- `getAllProfiles(supabase)` — existing. Returns profiles joined with organizations.
- `getOrganizations(supabase, undefined, false)` — for the org dropdown when role = organization.

### Mutation pattern — Server Actions (MANDATORY — never a direct client call)
New file: `app/admin/users/actions.ts`:

```ts
'use server';

import type { UserRole } from '@/types/database';

export async function inviteUserAction(input: {
  email: string;
  name: string;
  role: UserRole; // 'admin' | 'organization' — 'public' rejected
  organizationId?: string; // required when role === 'organization'
}): Promise<{ ok: true; userId: string } | { ok: false; error: string }>;

export async function updateUserRoleAction(input: {
  userId: string;
  nextRole: UserRole;
  organizationId?: string; // required when nextRole === 'organization', else null
}): Promise<{ ok: true } | { ok: false; error: string }>;

export async function deleteUserAction(
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }>;
```

### Invite flow
- Invite uses Supabase Admin API: `supabase.auth.admin.inviteUserByEmail(email, { data: { name } })`.
- This requires the **service role key**. Current `lib/supabase/server.ts` uses the anon key.
- NEW: `lib/supabase/admin.ts` — exports `createAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY` (server-only, never imported from a client file). Add to `.env.local.example`.
- After invite returns, upsert a row in `profiles` with role + organization_id. The DB trigger `handle_new_user` already inserts with role='public'; the action runs a follow-up UPDATE to set the correct role and `organization_id`.
- If `supabase.auth.admin` rejects (email already exists), action returns `{ ok: false, error: 'A user with that email already exists.' }`.

### Role-change security answers (REQUIRED BY TASK)

**(a) Can a non-admin ever escalate themselves?**
No. Three defenses:
1. Middleware blocks non-admins from reaching `/admin/*` (already active).
2. Every Server Action opens with `await requireAdmin()` — re-verified server-side.
3. RLS "Admins manage all profiles" only allows updates where `auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')`. Even if all app code were compromised, a non-admin cannot UPDATE another profile.
   - **Gap**: the "Users update own profile" policy has `WITH CHECK (auth.uid() = id)` but does NOT constrain which columns. Technically a user could `UPDATE profiles SET role='admin' WHERE id = auth.uid()`. This is a live vulnerability.
   - **Fix this phase**: NEW migration `004_restrict_self_profile_update.sql` — drop and recreate "Users update own profile" with a column-level restriction. Postgres RLS can't column-restrict directly, so implement as a trigger:
     ```sql
     -- Pseudo; builder to write final SQL
     CREATE OR REPLACE FUNCTION prevent_self_role_change() RETURNS TRIGGER AS $$
     BEGIN
       IF NEW.role IS DISTINCT FROM OLD.role AND
          NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
         RAISE EXCEPTION 'Only admins can change roles';
       END IF;
       IF NEW.organization_id IS DISTINCT FROM OLD.organization_id AND
          NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
         RAISE EXCEPTION 'Only admins can change organization assignment';
       END IF;
       RETURN NEW;
     END; $$ LANGUAGE plpgsql SECURITY DEFINER;

     CREATE TRIGGER profiles_prevent_self_escalation
       BEFORE UPDATE ON profiles
       FOR EACH ROW EXECUTE FUNCTION prevent_self_role_change();
     ```
   - Builder MUST ship this migration as part of Step 10.

**(b) Does the write go through a server action with re-verified role check?**
Yes. `updateUserRoleAction` and `inviteUserAction` both call `await requireAdmin()` as their first line. No client-direct writes permitted.

**(c) How is `organization_id` set when role becomes `organization`?**
- Action signature requires `organizationId` when `nextRole === 'organization'`. If missing, action returns `{ ok: false, error: 'Organization required for org role.' }`.
- When `nextRole !== 'organization'` the action explicitly sets `organization_id = null` to avoid stale links.
- When `nextRole === 'admin'` and role was `organization`, same null cleanup. (Admins are not tied to an org.)

### Delete flow
- `deleteUserAction` calls `supabase.auth.admin.deleteUser(userId)` (admin client). Cascade on `profiles.id → auth.users.id` removes the profile row.
- Self-delete guard: action rejects if `userId === session.id`.
- The "main admin" UI lock (`disabled={user.id === '1'}`) must be replaced with a dynamic guard: disable when `user.id === currentAdminSession.id` (pass session down from RSC).

### Revalidation
| Action | Paths |
|--------|-------|
| invite | `/admin/users` |
| updateRole | `/admin/users` |
| delete | `/admin/users` |

### RLS
- "Admins manage all profiles" (FOR ALL) — covers reads/writes from admin.
- NEW trigger `profiles_prevent_self_escalation` (migration 004) closes the self-escalation gap.

### Loading + error
- `loading.tsx`. Toasts on action result. `useTransition` for button pending state.

### Optimistic update
- No. Auth side-effects (invite email, user deletion) are not safe to optimistically display.

### Files
- MODIFIED: `app/admin/users/page.tsx` → RSC.
- NEW: `app/admin/users/UsersClient.tsx`.
- NEW: `app/admin/users/actions.ts`.
- NEW: `app/admin/users/loading.tsx`.
- NEW: `lib/supabase/admin.ts` (service-role client).
- NEW: `supabase/migrations/004_restrict_self_profile_update.sql`.
- MODIFIED: `.env.local.example` — add `SUPABASE_SERVICE_ROLE_KEY`.

---

## Page 6: Volunteers (Admin) — Step 11

### Current state
`app/admin/volunteers/` **does not exist**. Sidebar nav in `app/admin/layout.tsx` does not link to it either. Currently volunteer needs have no admin surface.

### Decision: **dedicated page** at `app/admin/volunteers/page.tsx`
- Rationale:
  - Admins need a cross-organization view ("which volunteer posts are active right now?"). Nesting under each org detail forces navigating org-by-org.
  - Matches the pattern already established by donations (cross-org list, filter by org).
  - Per-org volunteer management also lives in the **portal** (Phase 6) — admin page is the admin-only cross-cutting view.

### Server vs Client
- `app/admin/volunteers/page.tsx` → RSC. Fetches needs + orgs-for-select.
- `app/admin/volunteers/VolunteersClient.tsx` (new) → table + create/edit dialog.

### Data fetching
- `getVolunteerNeeds(supabase, undefined, false)` — existing, `activeOnly: false` so admin sees inactive too.
- `getOrganizations(supabase, undefined, false)` for select dropdown.

### Mutation pattern — Server Actions
New file: `app/admin/volunteers/actions.ts`:

```ts
'use server';

import type { VolunteerNeedFormValues } from '@/lib/validations/schemas';

export async function createVolunteerNeedAction(
  data: VolunteerNeedFormValues
): Promise<{ ok: true; id: string } | { ok: false; error: string }>;

export async function updateVolunteerNeedAction(
  id: string,
  data: Partial<VolunteerNeedFormValues>
): Promise<{ ok: true } | { ok: false; error: string }>;

export async function deleteVolunteerNeedAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }>;
```
Each wraps existing `createVolunteerNeed` / `updateVolunteerNeed` / `deleteVolunteerNeed` from `queries.ts`.

### Revalidation
| Action | Paths |
|--------|-------|
| create | `/admin/volunteers`, `/volunteers` |
| update | `/admin/volunteers`, `/volunteers` |
| delete | `/admin/volunteers`, `/volunteers` |

### RLS
- "Admins full access volunteer needs" (FOR ALL, admin check) — covers all operations.

### Sidebar nav
- MODIFIED: `app/admin/AdminShell.tsx` (or wherever the nav lands after Step 6 split) — add Volunteers entry between Council Donations and Reports. Icon: `HandHeart` from lucide-react.

### Loading + error + optimistic
- Same global pattern. No optimistic.

### Files
- NEW: `app/admin/volunteers/page.tsx`.
- NEW: `app/admin/volunteers/VolunteersClient.tsx`.
- NEW: `app/admin/volunteers/actions.ts`.
- NEW: `app/admin/volunteers/loading.tsx`.
- MODIFIED: `app/admin/AdminShell.tsx` (nav entry).

---

## Aggregate file list

### New (14)
- `app/admin/AdminShell.tsx`
- `app/admin/loading.tsx`
- `app/admin/organizations/OrganizationsClient.tsx`
- `app/admin/organizations/actions.ts`
- `app/admin/organizations/loading.tsx`
- `app/admin/donations/DonationsClient.tsx`
- `app/admin/donations/actions.ts`
- `app/admin/donations/loading.tsx`
- `app/admin/users/UsersClient.tsx`
- `app/admin/users/actions.ts`
- `app/admin/users/loading.tsx`
- `app/admin/volunteers/page.tsx`
- `app/admin/volunteers/VolunteersClient.tsx`
- `app/admin/volunteers/actions.ts`
- `app/admin/volunteers/loading.tsx`
- `lib/supabase/admin.ts`
- `supabase/migrations/004_restrict_self_profile_update.sql`

(Count: 17 new files.)

### Modified (7)
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/organizations/page.tsx`
- `app/admin/donations/page.tsx`
- `app/admin/users/page.tsx`
- `lib/supabase/queries.ts` (add `getDashboardSnapshot`)
- `lib/validations/schemas.ts` (relax `recorded_by` on donation schema)
- `.env.local.example` (add service role key)

(Count: 8 modified files.)

### Total touched: 25

---

## Data Flow (summary diagram)

```
Browser (admin) ──click──▶ Client Component
                              │ startTransition
                              ▼
                          Server Action ('use server')
                              │ requireAdmin() — re-auth
                              │ createClient() — server Supabase w/ cookies
                              ▼
                          queries.ts function ──▶ Supabase (RLS enforced)
                              │
                              ▼
                          revalidatePath(admin + public)
                              │
                              ▼
                          return { ok, data|error } ──▶ Client
                                                         │
                                                         ▼
                                                    toast + router.refresh()
```

User-management flow adds a side-channel via the admin Supabase client (`lib/supabase/admin.ts`) for `auth.admin.inviteUserByEmail` / `deleteUser`. Regular reads/writes on `profiles` still go through the cookie-scoped server client so RLS applies.

---

## Integration points with Phase 1
- `requireAdmin()` — already exported from `lib/supabase/auth.ts`. Used by every RSC page and every Server Action in this phase.
- `createClient()` (server) — already exported from `lib/supabase/server.ts`. Used in every action after `requireAdmin()`.
- Middleware — already role-gates `/admin`. Actions still re-verify (defense in depth).
- `profiles.role` — already the source of truth. No schema change for roles. Trigger-based self-escalation guard is the only schema addition.

---

## Risks
| Risk | Mitigation |
|------|------------|
| Service role key leaks to client bundle. | `lib/supabase/admin.ts` has a top-of-file comment `// SERVER ONLY — never import from 'use client'`. Add an ESLint rule later (out of scope Phase 2) to block imports from client files. |
| `revalidatePath` misses a dynamic route. | Use literal `/organization/${id}` style. If the public org page is ISR-cached with `generateStaticParams`, builder must verify revalidation actually invalidates. Acceptance test: edit an org, reload `/organization/${id}` in incognito, see change. |
| RLS self-escalation gap. | Migration 004 adds trigger. Verification query in migration file. |
| Supabase Auth admin API rate limits invites. | Out of scope at current scale (<5 invites/day). Document limit in migration/action comment. |
| Server Action + multipart = doesn't work. | Not applicable this phase (Phase 4 covers file upload via API route). |
| Concurrent admin edits overwrite each other. | Accepted — ADR. Revisit if >1 admin. |
| `OrganizationFormData` type in `queries.ts` requires fields the zod form marks optional. | Builder must align types; likely trivial since zod schema is already the canonical source. If mismatch, update `OrganizationFormData` in `types/database.ts`. |

---

## Execution chunks (for the backend-dev agent)

1. **Chunk A — Foundations** (unblocks all others)
   - Add `lib/supabase/admin.ts`.
   - Update `.env.local.example`.
   - Ship migration 004 (self-escalation trigger).
   - Add `getDashboardSnapshot` to `queries.ts`.
   - Adjust `recorded_by` in donation schema.

2. **Chunk B — Layout + Dashboard** (Steps 6–7)
   - Split admin layout RSC/client.
   - Rewrite dashboard page + add loading.tsx.

3. **Chunk C — Organizations** (Step 8)
   - `actions.ts`, client split, loading, wiring.

4. **Chunk D — Donations** (Step 9)
   - Same structure as C.

5. **Chunk E — Users** (Step 10 — highest risk, do alone)
   - Actions with service-role admin client.
   - Self-escalation migration verification (manually attempt escalation in SQL editor as a non-admin user).
   - UI for role change.

6. **Chunk F — Volunteers** (Step 11)
   - New page, actions, nav entry.

7. **Chunk G — Verification pass**
   - Run `npm run typecheck`, `npm run lint`, build.
   - Manual acceptance-criteria walkthrough.

Each chunk = one conventional commit (or at most two: schema + code).

---

Handoff to: backend-dev
