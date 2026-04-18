# LEARNINGS.md — Backend Integration

## Initial Observations

### Existing Infrastructure (Ready to Use)
- `lib/supabase/client.ts` — browser client, reads env vars
- `lib/supabase/server.ts` — server client with cookie-based SSR sessions
- `lib/supabase/middleware.ts` — session refresh + route protection logic (disabled via .bak rename)
- `lib/supabase/queries.ts` — full CRUD query functions for all 4 tables, never called
- `supabase/migrations/001_initial_schema.sql` — 4 tables, RLS, triggers, indexes
- `supabase/seed.sql` — 8 sample orgs matching sampleData.ts
- `types/database.ts` — TypeScript types for all entities
- `types/settings.ts` — TypeScript types for site settings

### Key Gaps Identified
- No `.env.local` — Supabase not connected
- `middleware.ts` renamed to `.bak` — route protection disabled
- No `site_settings` table in schema — settings are React-only
- No API routes (`app/api/` doesn't exist)
- No auth helpers (no getSession wrapper, no requireAdmin)
- Sign-out buttons link to `/` instead of calling `supabase.auth.signOut()`
- Demo login button bypasses auth entirely
- Admin layout doesn't verify admin role
- All 6 admin pages use `useState(sampleData)` — no DB calls
- No file import capability

### RLS Policy Notes
- Organizations: public read active, org users update own, admins full access
- Donations: admin-only (view and manage)
- Volunteer needs: public read active, org users manage own, admins full access
- Profiles: users read/update own, admins view/manage all
- The `handle_new_user()` trigger auto-creates profiles on signup with role='public'

### Architecture Decision
- Direct Supabase client calls (no REST API layer between frontend and Supabase) for standard CRUD
- API routes only where needed: file import parsing, settings cache, revalidation triggers
- Server Components for public pages (data fetching at render time)
- Client Components for admin pages (interactive CRUD with real-time state)

## Mistakes Log
<!-- Agents log their mistakes here for learning -->

## Pattern Library
<!-- Successful patterns discovered during work -->

### Supabase MCP workflow (validated 2026-04-17)
- `mcp__supabase__list_tables` confirms schema state independent of local migration files
- `apply_migration` writes to the DB but the local `supabase/migrations/` dir is the source of truth for replay
- After every DDL change, run `get_advisors(type: security)` — caught two `search_path` warnings on triggers
- Project ref `yhvbnvouifkwofvfooum` (URL `https://yhvbnvouifkwofvfooum.supabase.co`)
- Anon key is in `.env.local` (gitignored) and is safe to ship client-side; service-role key has not been issued and is not required for Phase 1–6 since all admin writes go through user-session RLS

### Self-escalation prevention via BEFORE UPDATE trigger (migration 004, applied 2026-04-17)

**Pattern**: Column-level RLS emulated via SECURITY DEFINER trigger.

**Problem class**: Postgres RLS cannot restrict which columns a policy applies to. A policy of
`USING (auth.uid() = id)` on an UPDATE permits the user to change ANY column on their own row,
including `role` and `organization_id`. This allows any authenticated user to self-promote to admin
by hitting the Supabase REST endpoint directly with a valid JWT.

**Fix**: BEFORE UPDATE trigger on the protected table that:
1. Reads `auth.uid()` (returns NULL for service-role / superuser context — no JWT session).
2. Short-circuits when NULL (service-role admin actions must not be blocked).
3. Short-circuits when neither sensitive column changed (avoids unnecessary lookup).
4. Queries `profiles.role` directly rather than trusting JWT claims (JWT can lag DB state).
5. Raises `insufficient_privilege` exception if non-admin attempts to change `role` or `organization_id`.

**Function hardening**: `SECURITY DEFINER` with `SET search_path = public, pg_temp` (same pattern
as migration 003) prevents search_path manipulation attacks on the trigger function itself.

**Defense stack**: Three concurrent defenses in this project:
- Middleware blocks non-admins from `/admin/*` (UX gate).
- Every Server Action opens with `await requireAdmin()` (belt-and-braces app layer).
- DB trigger `profiles_prevent_self_escalation` (final backstop, cannot be bypassed by app code).

**Key insight on service-role pass-through**: When `auth.uid()` returns NULL, the calling context
is the service-role or postgres superuser — not a JWT-authenticated end user. These callers bypass
RLS entirely anyway; the trigger NULL check ensures they also bypass the trigger guard without
needing to inspect their role.

**Verification queries** (run after applying):
```sql
SELECT tgname, tgtype FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass;
-- tgtype 19 = BEFORE UPDATE ROW (bits: 1=ROW | 2=BEFORE | 16=UPDATE)
SELECT proconfig FROM pg_proc WHERE proname = 'prevent_self_role_change';
-- Expected: {search_path=public,pg_temp}
```

### Branch discipline
- `backendIntegrate` has pre-existing uncommitted frontend-redesign work (8+ files in `components/directory`, `components/layout`, `app/(public)`, `app/globals.css`)
- These belong on a different branch — never stage them during backend commits. Use explicit `git add <path>` per commit, never `git add .` or `git add -A`.
