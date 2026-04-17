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

### Branch discipline
- `backendIntegrate` has pre-existing uncommitted frontend-redesign work (8+ files in `components/directory`, `components/layout`, `app/(public)`, `app/globals.css`)
- These belong on a different branch — never stage them during backend commits. Use explicit `git add <path>` per commit, never `git add .` or `git add -A`.
