# Vercel Deploy Checklist — FoodAssist V2

**Branch to deploy:** `main` (after merging `backendIntegrate`)
**Framework:** Next.js (App Router)
**Runtime:** Node.js (not Edge — exceljs requires Node.js)

---

## Pre-Deploy Checklist

Complete every item before linking the repo to Vercel.

1. **Supabase project created and migrations applied.**
   Confirm all four migrations have been run in the Supabase SQL Editor in order:
   `001_initial_schema.sql` → `002_site_settings.sql` → `003_harden_function_search_path.sql` → `004_restrict_self_profile_update.sql`
   Verify: `SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass;` must return `profiles_prevent_self_escalation`.

2. **Supabase Pro tier active (or risk acknowledged).**
   Free projects pause after 7 days of no activity. For a production civic app, upgrade to Supabase Pro ($25/project/month) at Supabase dashboard → Settings → Billing before launch. If staying on free for a staging deploy, document this risk.

3. **Vercel Pro plan active.**
   The Hobby plan prohibits commercial use. A professionally-developed civic app requires Vercel Pro ($20/user/month). Create or upgrade the team at vercel.com/teams before importing the project.

4. **All env vars collected and scoped.**
   Gather the following from Supabase dashboard → Project Settings → API before starting the Vercel import:

   | Variable | Value source | Vercel scope |
   |----------|-------------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL field | Production + Preview + Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key | Production + Preview + Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (secret) | **Production only** |

   The `SUPABASE_SERVICE_ROLE_KEY` must NOT be added to Preview scope. Every PR deploy is a potential exposure vector.

5. **Confirm `export const runtime = 'nodejs'` in import route.**
   Open `app/api/import/organizations/route.ts` and confirm the line `export const runtime = 'nodejs';` is present near the top. If absent, Vercel will attempt Edge deployment, exceljs will fail to load, and the import feature will error on every request.

6. **No `.env.local` or secrets committed.**
   Run `git log --all --full-history -- .env.local` — it must return nothing. Run `git grep "service_role" HEAD` — must return zero value hits (only the placeholder in `.env.example` is acceptable).

7. **Branch merged to `main`.**
   The `backendIntegrate` branch must be merged via PR to `main`. Vercel should deploy from `main` (production) and `backendIntegrate` or feature branches (preview). Never deploy `backendIntegrate` directly to production.

8. **Admin user seeded.**
   After deploy, at least one admin user must exist in `auth.users` + `profiles` with `role = 'admin'`. Use the Supabase dashboard to create the first admin manually: create the user in Auth → Users, then `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';` via the SQL Editor. The `SUPABASE_SERVICE_ROLE_KEY` must be set before admin invite flows will work from the app.

---

## Step-by-Step Vercel Connection

### 1. Import the repository

1. Go to vercel.com → New Project.
2. Select the GitHub repo (`FoodAssist_V2` or equivalent name).
3. Vercel auto-detects Next.js. Framework Preset will show "Next.js" — confirm.

### 2. Configure build settings

These are auto-detected but verify:
- **Build Command:** `npm run build` (default)
- **Install Command:** `npm install` (default; do not use `npm ci` unless you have a lockfile committed)
- **Output Directory:** `.next` (default)
- **Root Directory:** leave blank (project root)

### 3. Add environment variables

In the Vercel import wizard (or Project Settings → Environment Variables after import):

| Variable | Value | Production | Preview | Development |
|----------|-------|:---:|:---:|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) | ✓ | ✓ | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role key) | ✓ | — | — |

Double-check: click each variable after saving and confirm Preview checkbox is unchecked for `SUPABASE_SERVICE_ROLE_KEY`.

### 4. Deploy

Click "Deploy". First deploy takes 60–90 seconds. Watch the build logs for:
- TypeScript compile errors (none expected if branch is clean)
- Missing env var warnings from `createAdminClient` (will throw at call time, not build time — acceptable)

### 5. Set production domain

After first deploy succeeds, go to Project Settings → Domains and add your custom domain (e.g., `foodassist.carteretcounty.gov` or similar). Vercel handles SSL automatically.

---

## Post-Deploy Verification

Run these five checks immediately after the first production deploy.

### Check 1 — Settings API returns data
```
curl https://your-domain.com/api/settings
```
Expected: `{"ok":true,"settings":{...}}` with the seeded defaults from migration 002.
Failure: `{"ok":false,"error":"Failed to load settings"}` means Supabase URL/anon key env vars are missing or wrong.

### Check 2 — Public homepage renders
Open `https://your-domain.com` in a browser. The organization directory should render (currently with sample data until Phase 5 is complete). If the page shows a crash or white screen, check Vercel function logs.

### Check 3 — Admin login works
Navigate to `https://your-domain.com/login`. Log in with the seeded admin account. You should be redirected to `https://your-domain.com/admin`. If redirected back to `/login`, the admin profile row is missing or `role` is not set to `'admin'`.

### Check 4 — Non-admin is redirected from /admin
Log out. Attempt to navigate to `https://your-domain.com/admin` without a session. You should be redirected to `/login?redirect=/admin`. If the admin page renders without auth, middleware is broken.

### Check 5 — Organization detail page renders
Navigate to `https://your-domain.com/organization/<any-uuid-from-db>`. Replace `<any-uuid-from-db>` with a real org ID from the Supabase dashboard. The page should render org details or show a 404 if the ID does not exist. A 500 means the DB query is failing.

---

## Monitoring After Deploy

### Vercel
- **Function Logs:** Vercel dashboard → Project → Deployments → latest → Functions tab. Filter by path prefix `/api/` and `/admin`. Watch for uncaught exceptions.
- **Build logs:** same location, "Build" tab. Bookmark for every redeploy.

### Supabase
- **Database Logs:** Supabase dashboard → Logs → Database. Watch for RLS violations (`permission denied`) or trigger exceptions (`Only admins can change role`).
- **Auth Logs:** Supabase dashboard → Logs → Auth. Watch for failed logins or invite failures.
- **Advisors:** Supabase dashboard → Database → Advisors. Re-run security and performance advisors after every migration. Expect zero security flags and review any new performance flags.

---

## Upgrade Path

### Supabase
| Trigger | Action |
|---------|--------|
| Project paused (free tier, 7-day inactivity) | Upgrade to Pro ($25/project/month) at Supabase dashboard → Billing. Restore paused project before upgrading. |
| Approaching 5 GB egress/month | Ensure ISR is active on all public pages (`export const revalidate = 3600`). If still close, upgrade to Pro. |
| Auth MAU nearing 50k | Free tier allows 50k MAU. With admin-only auth and anonymous public browsing, this cap will not be reached. No action needed. |

### Vercel
| Trigger | Action |
|---------|--------|
| Function timeout errors (>10s responses) | Increase timeout in `next.config.ts` → `serverExternalPackages` or upgrade to Vercel Enterprise for 900s limit. Default Pro limit is 300s — sufficient for XLS import of 500 rows. |
| Bandwidth > 1 TB/month | Overage is purchased automatically on Pro. Review ISR settings first. |

---

## Rollback Plan

### Instant rollback (code only)
In Vercel dashboard → Project → Deployments, find the last known-good deployment and click "Redeploy" (or the "..." menu → "Promote to Production"). Takes under 60 seconds. No data is affected.

### Migration rollback
Supabase does not support automatic migration rollback. For each migration applied, a manual reversal must be run in the SQL Editor:

- **Migration 004 reversal:** `DROP TRIGGER IF EXISTS profiles_prevent_self_escalation ON public.profiles; DROP FUNCTION IF EXISTS public.prevent_self_role_change();`
- **Migration 003 reversal:** `ALTER FUNCTION public.handle_new_user() RESET search_path; ALTER FUNCTION public.update_last_updated() RESET search_path;` (note: this re-opens the search_path vulnerability — only do this if absolutely required)
- **Migrations 001/002:** Destructive to reverse. Do not roll these back without a full database backup.

**Best practice:** Take a Supabase database backup (dashboard → Database → Backups → Download) before applying any migration to production.
