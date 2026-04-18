# PLAN.md — Backend Integration

## Vision
Wire the entire FoodAssist V2 application to a real Supabase backend. The admin dashboard becomes the single control plane for the website — every organization, volunteer need, donation, and site-wide setting is managed from `/admin` and persisted to Supabase. Public-facing pages read from the database, not sample data. Admin changes trigger frontend updates via Next.js revalidation. XLS/CSV file import allows bulk data entry.

## User Problem
The app currently runs entirely on hardcoded sample data. Nothing persists. The admin dashboard is a demo. There is no authentication, no database connection, no settings persistence. The Carteret County Food & Health Council cannot use this in production.

## Success Metrics
- Admin can log in, manage organizations, donations, users, volunteers, and site settings
- All changes persist to Supabase and appear on the public frontend
- XLS/CSV drag-and-drop import works for bulk organization data
- 12,000 public users can browse the directory without performance issues
- Settings changes (branding, hero, emergency, navigation) update the live site

## Kill Criteria
- If Supabase free tier cannot handle the data model, escalate before continuing
- If auth breaks existing public pages, revert immediately
- If admin writes corrupt frontend rendering, add validation before proceeding

## Acceptance Criteria
1. `.env.local` template is documented; app connects to Supabase on startup
2. All 4 database tables created via migration with RLS policies active
3. Middleware protects `/admin` (admin role only) and `/portal` (authenticated)
4. Admin login/logout works end-to-end with Supabase Auth
5. Admin CRUD for organizations reads/writes Supabase (no sample data)
6. Admin CRUD for donations reads/writes Supabase
7. Admin user management reads/writes profiles table
8. Admin settings persist to `site_settings` table and load on app init
9. XLS/CSV import parses file and upserts organizations
10. Public pages (`/`, `/volunteers`, `/organization/[id]`) read from Supabase
11. Organization portal reads real data filtered by user's org
12. Every change is a conventional commit with only the user as author

## Scope

### In Scope
- Supabase connection setup (env template, client verification)
- Database migration: add `site_settings` table to existing schema
- Activate middleware (rename .bak), add role-based route protection
- Fix auth flow: sign-out, session handling, redirect logic
- Wire all 6 admin pages to Supabase queries
- Settings persistence: SettingsContext loads from DB, admin saves to DB
- API routes for file import (`/api/import/organizations`)
- API route for revalidation (`/api/revalidate`)
- Replace all sampleData imports on public pages with Supabase queries
- Wire organization portal to real data
- Auth helpers (getSession, requireAdmin, requireAuth)

### Explicitly Out of Scope
- Frontend styling changes (separate branch: frontend redesign)
- New UI components or pages
- Dark mode
- Email notification system
- Image/logo upload to Supabase Storage
- Audit logging (Phase 2)
- Google Sheets API integration (Phase 2 — this phase does CSV/XLS file upload)

## Steps

### Phase 1: Foundation
- [ ] Step 1: Supabase connection — create `.env.local.example`, verify client setup, test connection
- [ ] Step 2: Database migration — add `site_settings` table, add `import_batch` tracking columns to organizations
- [ ] Step 3: Auth helpers — create `lib/supabase/auth.ts` with getSession, requireAuth, requireAdmin helpers
- [ ] Step 4: Activate middleware — rename `.bak`, add role-based checks for `/admin` vs `/portal`
- [ ] Step 5: Fix auth pages — wire sign-out to `supabase.auth.signOut()`, fix redirects, remove demo login

### Phase 2: Admin Dashboard Wiring
- [ ] Step 6: Admin layout auth guard — server-side session check, redirect if not admin
- [ ] Step 7: Admin dashboard stats — replace hardcoded stats with `getAdminStats()` query
- [ ] Step 8: Admin organizations CRUD — wire to Supabase queries, real-time state
- [ ] Step 9: Admin donations CRUD — wire to Supabase queries
- [ ] Step 10: Admin users management — wire to profiles table, role management
- [ ] Step 11: Admin volunteers — wire to volunteer_needs table (if page exists, or add to org detail)

### Phase 3: Settings Persistence
- [ ] Step 12: Settings API routes — GET/PUT `/api/settings` reading/writing `site_settings` table
- [ ] Step 13: SettingsContext backend — load settings from API on mount, save via API on admin update
- [ ] Step 14: Admin settings page — wire save buttons to API, add loading/success states

### Phase 4: File Import
- [ ] Step 15: Import API route — `/api/import/organizations` accepts XLS/CSV, parses with `xlsx` library
- [ ] Step 16: Import UI — drag-and-drop zone in admin/organizations, column mapping preview, confirm

### Phase 5: Public Frontend Wiring
- [ ] Step 17: Homepage — fetch organizations from Supabase server-side, pass to DirectoryList
- [ ] Step 18: Organization detail — fetch single org by ID from Supabase
- [ ] Step 19: Volunteers page — fetch volunteer_needs from Supabase
- [ ] Step 20: Revalidation — admin mutations call `revalidatePath()` to refresh public pages

### Phase 6: Organization Portal
- [ ] Step 21: Portal auth — verify user has `organization` role, load their org
- [ ] Step 22: Portal dashboard — real data for the user's organization
- [ ] Step 23: Portal profile — edit organization details (own record only via RLS)

## Database Schema Addition

```sql
-- Site settings table (single row)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branding JSONB NOT NULL DEFAULT '{}',
  contact JSONB NOT NULL DEFAULT '{}',
  hero JSONB NOT NULL DEFAULT '{}',
  emergency JSONB NOT NULL DEFAULT '{}',
  navigation JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- RLS: public can read settings, admins can update
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage settings"
  ON site_settings FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Ensure only one row exists
CREATE UNIQUE INDEX single_settings_row ON site_settings ((true));
```

## API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/settings` | GET | Public | Fetch site settings |
| `/api/settings` | PUT | Admin | Update site settings |
| `/api/import/organizations` | POST | Admin | Upload XLS/CSV, parse, upsert orgs |
| `/api/revalidate` | POST | Admin | Trigger ISR revalidation for specific paths |
| `/api/auth/signout` | POST | Auth | Sign out and clear session |

## Data Flow

```
Admin edits org → Supabase UPDATE → revalidatePath('/') → public sees change
Admin edits settings → Supabase UPDATE site_settings → revalidatePath('/') → SettingsContext reloads
Admin uploads XLS → API parses → Supabase UPSERT organizations → revalidatePath('/') → directory updates
```

## Dependencies to Add
- `xlsx` — XLS/XLSX/CSV parsing for file import (lightweight, no native deps)

## Risks
- **Supabase not provisioned**: User must create a Supabase project and provide credentials. BLOCKER until done.
- **RLS policy conflicts**: The existing schema has overlapping SELECT policies. The "Admins full access" policy uses FOR ALL which includes SELECT, potentially conflicting with the public read policy. Test after migration.
- **Settings race condition**: Single-row table with JSONB columns. Concurrent admin edits could overwrite. Acceptable for this scale (1-2 admins). Add optimistic locking later if needed.
- **XLS parsing edge cases**: Column names vary across spreadsheets. The import UI must show a column mapping step.

## Commit Strategy
Every step = at least one conventional commit. Format: `<type>[scope]: <description>`
- Only the user appears as author (NO Co-Authored-By lines)
- Atomic commits — one logical change per commit
- Types: feat, fix, refactor, chore, docs
