# WIP.md — Backend Integration

## Original Request
Wire the entire FoodAssist V2 app to Supabase backend. Admin dashboard controls everything: orgs, donations, users, settings, file import. Public frontend reads from DB. Every change committed as conventional commits, user as sole author.

## Current Step: Phase 2 — Story 0 (security hotfix)
## Active Story: Ship migration 004 — self-escalation trigger (blocks Chunk E later)
## Status: Architect plan READY_FOR_BUILD at `docs/backend-integration/phase2-admin-crud.md`. Research brief at `docs/backend-integration/research-briefs.md`.
## Next Action: backend-dev writes migration 004 + verification SQL; commit; then Chunk A foundations.
## Blockers: SUPABASE_SERVICE_ROLE_KEY not provided (required for Chunk E user invite/delete). User supplied JWT-looking value `9976e990-…` which is the project JWT secret, not the service role API key. Ask user at Chunk E unless we descope to role-edit-only users page.

## Step Tracker

### Phase 1: Foundation — COMPLETE
- [x] Step 1: Supabase connection setup (.env.local with anon key + URL, verified via MCP)
- [x] Step 2: Database migration (site_settings table applied; seeded default row)
- [x] Step 2b: Security hardening — pinned search_path on handle_new_user + update_last_updated
- [x] Step 3: Auth helpers (`lib/supabase/auth.ts` — getSession, requireAuth, requireAdmin)
- [x] Step 4: Middleware active with role-based admin route protection
- [x] Step 5: Auth pages fixed — sign-out uses supabase.auth.signOut(), demo login removed

### Phase 2: Admin Dashboard Wiring
- [ ] Step 6: Admin layout auth guard
- [ ] Step 7: Admin dashboard stats from DB
- [ ] Step 8: Admin organizations CRUD
- [ ] Step 9: Admin donations CRUD
- [ ] Step 10: Admin users management
- [ ] Step 11: Admin volunteers management

### Phase 3: Settings Persistence
- [ ] Step 12: Settings API routes
- [ ] Step 13: SettingsContext backend integration
- [ ] Step 14: Admin settings page wiring

### Phase 4: File Import
- [ ] Step 15: Import API route (XLS/CSV parsing)
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
- Branch: `backendIntegrate`
- Supabase SDK installed but not connected
- Migration SQL exists but never run
- Query functions written in `lib/supabase/queries.ts` but never called
- All admin/public pages use hardcoded sample data
- Middleware disabled (saved as .bak)
- No API routes exist
- No site_settings table in schema
