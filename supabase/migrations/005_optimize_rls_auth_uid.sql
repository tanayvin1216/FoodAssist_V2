-- Performance: wrap auth.uid() in (select auth.uid()) so Postgres
-- evaluates it once per query instead of once per row.
-- Supabase linter: auth_rls_initplan (WARN) — see
-- https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
-- Also add the missing covering index on site_settings.updated_by
-- (linter: unindexed_foreign_keys).

-- organizations
DROP POLICY IF EXISTS "Orgs update own record" ON public.organizations;
CREATE POLICY "Orgs update own record"
  ON public.organizations FOR UPDATE
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles
      WHERE organization_id = organizations.id
    )
  );

DROP POLICY IF EXISTS "Admins full access orgs" ON public.organizations;
CREATE POLICY "Admins full access orgs"
  ON public.organizations FOR ALL
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- council_donations
DROP POLICY IF EXISTS "Admins view donations" ON public.council_donations;
CREATE POLICY "Admins view donations"
  ON public.council_donations FOR SELECT
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins manage donations" ON public.council_donations;
CREATE POLICY "Admins manage donations"
  ON public.council_donations FOR ALL
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- volunteer_needs
DROP POLICY IF EXISTS "Orgs manage own volunteer needs" ON public.volunteer_needs;
CREATE POLICY "Orgs manage own volunteer needs"
  ON public.volunteer_needs FOR ALL
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles
      WHERE organization_id = volunteer_needs.organization_id
    )
  );

DROP POLICY IF EXISTS "Admins full access volunteer needs" ON public.volunteer_needs;
CREATE POLICY "Admins full access volunteer needs"
  ON public.volunteer_needs FOR ALL
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- profiles
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
CREATE POLICY "Admins manage all profiles"
  ON public.profiles FOR ALL
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- site_settings
DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;
CREATE POLICY "Admins manage settings"
  ON public.site_settings FOR ALL
  USING (
    (SELECT auth.uid()) IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Missing covering index (linter: unindexed_foreign_keys)
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by
  ON public.site_settings(updated_by);
