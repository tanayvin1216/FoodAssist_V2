# WIP.md — Backend Integration

## Original Request
Wire the entire FoodAssist V2 app to Supabase backend. Admin dashboard controls everything: orgs, donations, users, settings, file import. Public frontend reads from DB. Every change committed as conventional commits, user as sole author.

## Current Step: Backend integration complete except Phase 5 public pages (blocked on branch decision) + Step 14 admin settings save wiring
## Active Story: Awaiting user decision on Phase 5 (public pages overlap with frontend-redesign branch)
## Status: 19 commits shipped + pushed to origin/backendIntegrate. All Phase 1–4 + Phase 6 + security/perf audits DONE. See commit log.
## Next Action: (1) Get SUPABASE_SERVICE_ROLE_KEY from user and add to .env.local; (2) user decides on Phase 5 path; (3) optional: wire admin settings page save buttons (Step 14).
## Blockers: SUPABASE_SERVICE_ROLE_KEY (user-supplied only; Supabase dashboard → Project Settings → API → service_role secret). The value `9976e990-…` provided earlier is the JWT signing secret, not the service role API key.

## Step Tracker

### Phase 1: Foundation — COMPLETE
- [x] Step 1: Supabase connection (.env.local with anon key + URL, MCP verified)
- [x] Step 2: Database migration — site_settings applied + seeded
- [x] Step 2b: Security hardening — pinned search_path on trigger functions (migration 003)
- [x] Step 3: Auth helpers (getSession, requireAuth, requireAdmin + requireOrganization added in Phase 6)
- [x] Step 4: Middleware active with role-based route protection
- [x] Step 5: Auth pages fixed — sign-out via supabase.auth.signOut(), demo login removed

### Phase 2: Admin Dashboard Wiring — COMPLETE
- [x] Story 0: Security hotfix — migration 004 self-escalation trigger
- [x] Chunk A: admin.ts service-role client, getDashboardSnapshot, donation schema, env.example
- [x] Chunk B (Step 6+7): Admin layout RSC + AdminShell + dashboard from DB
- [x] Chunk C (Step 8): Admin organizations CRUD
- [x] Chunk D (Step 9): Admin donations CRUD with server-injected recorded_by
- [x] Chunk E (Step 10): Admin users — invite / role-change / delete (service-role)
- [x] Chunk F (Step 11): Admin volunteers — new page + AdminShell nav entry
- [x] Reviewer fixes: auth bypass in orgs/actions.ts, window.confirm → Dialog, AdminShell palette

### Phase 3: Settings Persistence — PARTIAL
- [x] Step 12: Settings API routes (GET public, PUT admin, zod validation, revalidatePath)
- [x] Step 13: SettingsContext DB hydration with refresh() + defaults fallback
- [ ] Step 14: Admin settings page save-button wiring (PUT /api/settings + refresh())

### Phase 4: File Import — COMPLETE
- [x] Step 15: /api/import/organizations POST route via exceljs (Node.js runtime, 2 MB cap, MIME+ext allowlist, per-row validation, upsert keyed on lower(name)|lower(town), ?dryRun=1 support)
- [x] Step 16: ImportOrganizationsDialog drag-and-drop UI with header mapping preview + per-row errors

### Phase 5: Public Frontend Wiring — DEFERRED
- [ ] Step 17: Homepage reads from Supabase
- [ ] Step 18: Organization detail reads from Supabase
- [ ] Step 19: Volunteers page reads from Supabase
- [ ] Step 20: Revalidation hooks
- **Why deferred**: all three pages are currently modified in the uncommitted frontend-redesign changeset on this branch. Wiring Supabase data fetching into them would tangle the two branches. Needs user decision: commit the redesign to this branch, or do Phase 5 after merging the frontend branch into main.

### Phase 6: Organization Portal — COMPLETE (with known follow-ups)
- [x] Step 21: requireOrganization() helper + layout server-guard
- [x] Step 22: Portal dashboard with real data (org name, active needs, last_updated)
- [x] Step 23: Portal profile editing (reuses OrgForm; is_active stripped server-side so only admins can (de)activate)
- Known follow-ups (out of scope this story): /portal/dashboard and /portal/volunteers still import sampleData; unused requireOrgUser() helper remains.

### Database migrations applied
- 001 initial_schema (pre-existing)
- 002 site_settings
- 003 harden_function_search_path
- 004 restrict_self_profile_update (self-escalation trigger)
- 005 optimize_rls_auth_uid (perf: (SELECT auth.uid()) + idx_site_settings_updated_by)

### Audits
- Security advisor: 0 lints.
- Performance advisor: 0 WARN; remaining INFO-level unused_index advisories are expected on an empty DB and will resolve with real traffic.
- Code-reviewer verdict on Chunks B-E: PASS after auth-bypass + confirm-dialog fixes.
- Design-guardian verdict on Chunks B-E: PASS with palette nit fixed (AdminShell hover bg-gray-50 → bg-[#F5F0EB]).

## Commit Log (backendIntegrate)
- f361524 docs: planning docs
- 946da03 feat(db): harden function search_path
- 08db82e docs: phase 2 architecture plan + ADRs
- 09bc2c8 feat(db): prevent profile self-escalation (migration 004)
- 3583e96 feat(backend): chunk A foundations
- 393c271 docs: research briefs
- 7a12151 feat(ui): Skeleton primitive
- 0e343c9 feat(admin): chunk B layout + dashboard
- 243b676 feat(admin): chunk C organizations CRUD
- 6e7abe6 feat(admin): chunk D donations CRUD
- 7cb4d00 feat(admin): chunk E users management
- 9149da3 docs: WIP tracker update
- 06eae64 feat(settings): phase 3 API + context hydration
- a4b4444 fix(admin): reviewer findings
- bd25e5f feat(admin): chunk F volunteers page
- 5871b50 feat(portal): phase 6 portal wiring
- bfe8a64 feat(import): phase 4 XLS/CSV import via exceljs
- 8e34caf docs: security-audit + vercel-deploy
- b44dc12 perf(db): optimize RLS auth.uid() evaluation

## Outstanding User Decisions
1. **SUPABASE_SERVICE_ROLE_KEY**: paste into .env.local so the admin Users page invite/delete buttons work.
2. **Phase 5 path**: (a) commit frontend-redesign files to this branch and wire Supabase into them, or (b) merge frontend-redesign to main first, then do Phase 5 as a follow-up branch.
3. **Vercel + Supabase Pro**: deploy readiness doc is at `docs/backend-integration/vercel-deploy.md`. Upgrade Supabase to Pro ($25/mo) before launch to avoid 7-day inactivity pause.
