# WIP.md — Backend Integration

## Original Request
Wire the entire FoodAssist V2 app to Supabase backend. Admin dashboard controls everything: orgs, donations, users, settings, file import. Public frontend reads from DB. Every change committed as conventional commits, user as sole author.

## Current Step: Phase 2 Chunks B-E complete; code-reviewer + design-guardian running; Phase 3 API in flight
## Active Story: Phase 3 settings API routes (parallel) + Chunk F volunteers (queued)
## Status: Chunks B/C/D/E shipped and pushed (commits 0e343c9, 243b676, 6e7abe6, 7cb4d00). Shadcn Skeleton primitive added (7a12151). Migration 004 self-escalation trigger live. Security advisor clean.
## Next Action: (1) await Phase 3 agent (settings API routes, SettingsContext fetch, schemas.ts settings patch); (2) apply code-reviewer + design-guardian verdicts; (3) spawn Chunk F volunteers; (4) Phase 4 XLS import.
## Blockers: SUPABASE_SERVICE_ROLE_KEY — user must paste the service_role key from Supabase dashboard → Project Settings → API (NOT the JWT secret `9976e990-…` provided earlier, which is the separate JWT signing secret). Until then, invite/delete actions on the Users page will toast a friendly "Admin user invites are not configured yet" error.

## Step Tracker

### Phase 1: Foundation — COMPLETE
- [x] Step 1: Supabase connection setup (.env.local with anon key + URL, verified via MCP)
- [x] Step 2: Database migration (site_settings table applied; seeded default row)
- [x] Step 2b: Security hardening — pinned search_path on handle_new_user + update_last_updated
- [x] Step 3: Auth helpers (`lib/supabase/auth.ts` — getSession, requireAuth, requireAdmin)
- [x] Step 4: Middleware active with role-based admin route protection
- [x] Step 5: Auth pages fixed — sign-out uses supabase.auth.signOut(), demo login removed

### Phase 2: Admin Dashboard Wiring
- [x] Story 0: Security hotfix — migration 004 self-escalation trigger (applied 2026-04-17)
- [x] Chunk A: foundations — lib/supabase/admin.ts, getDashboardSnapshot, donation schema, env.example
- [x] Step 6 (Chunk B): Admin layout RSC + AdminShell client + requireAdmin guard
- [x] Step 7 (Chunk B): Admin dashboard stats from Supabase via Promise.all + loading skeleton
- [x] Step 8 (Chunk C): Admin organizations CRUD via Server Actions + revalidatePath
- [x] Step 9 (Chunk D): Admin donations CRUD with server-injected recorded_by
- [x] Step 10 (Chunk E): Admin users — invite / role-change / delete via service-role client
- [ ] Step 11 (Chunk F): Admin volunteers page (new route, AdminShell nav entry)

### Phase 3: Settings Persistence
- [ ] Step 12: Settings API routes (IN FLIGHT — background agent)
- [ ] Step 13: SettingsContext backend integration (IN FLIGHT)
- [ ] Step 14: Admin settings page wiring

### Phase 4: File Import
- [ ] Step 15: Import API route (XLS/CSV parsing via exceljs — see research-briefs.md)
- [ ] Step 16: Import UI (drag-and-drop, column mapping, preview)

### Phase 5: Public Frontend Wiring
- [ ] Step 17: Homepage reads from Supabase
- [ ] Step 18: Organization detail page reads from Supabase
- [ ] Step 19: Volunteers page reads from Supabase
- [ ] Step 20: Revalidation on admin mutations

### Phase 6: Organization Portal
- [ ] Step 21: Portal auth + org loading
- [ ] Step 22: Portal dashboard with real data
- [ ] Step 23: Portal profile editing

## Current State
- Branch: `backendIntegrate` — 10+ commits ahead of main on this story cycle.
- Supabase: connected; 4 initial tables + site_settings all live with RLS; migrations 002/003/004 applied; security advisor clean.
- Admin dashboard (Chunks B-E): all 5 pages now read/write Supabase. No sampleData imports remain anywhere in `app/admin/`.
- Server Actions (ADR-001) used for every admin mutation; each one re-verifies admin via requireAdmin().
- Client shell AdminShell.tsx (mobile Sheet + sidebar) wraps all admin routes; layout.tsx is a Server Component.
- Middleware gates `/admin/*` and `/portal/*`; trigger `profiles_prevent_self_escalation` is the DB backstop.
- Public pages still use sampleData (Phase 5 not started).
- `components/ui/skeleton.tsx` added (was missing; used by Chunks B, C, D loading states).

## Outstanding Concerns
- Frontend redesign branch work is sitting uncommitted in `components/directory/*`, `components/layout/*`, `app/(public)/*`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/(auth)/*`. NEVER stage these on backendIntegrate (use explicit `git add <path>` per commit). They belong on the frontend-redesign branch and will merge with this branch on main later.
- Type mismatch between `OrganizationFormValues` (zod `string[]`) and `OrganizationFormData` (branded union arrays in `types/database.ts`). Chunk C uses `as unknown as` casts. Worth consolidating before public pages wire up.
- `queries.ts` will grow again when Phase 3 settings agent finishes — expect `getSiteSettings`, `updateSiteSettings` additions.
