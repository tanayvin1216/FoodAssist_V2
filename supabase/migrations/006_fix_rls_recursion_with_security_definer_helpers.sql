-- Fix Postgres error 42P17 (infinite recursion detected in policy for
-- relation "profiles") that migration 005 introduced.
--
-- Migration 005 rewrote admin-check RLS policies to use
--   (SELECT auth.uid()) IN (SELECT id FROM profiles WHERE role = 'admin')
-- When this runs against the profiles table itself, the inner SELECT
-- re-applies the same RLS policies to profiles, which infinitely
-- recurses. Postgres detects and aborts the query with 42P17. Any
-- authenticated request that hit /admin/* triggered this because the
-- middleware reads the profile to gate the route.
--
-- Canonical Supabase fix: replace the sub-select with a SECURITY
-- DEFINER helper. SECURITY DEFINER runs as the function owner
-- (postgres, which has BYPASSRLS), so the helper's own SELECT on
-- profiles does not trigger policy evaluation.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated, anon;

-- organizations
DROP POLICY IF EXISTS "Orgs update own record" ON public.organizations;
CREATE POLICY "Orgs update own record"
  ON public.organizations FOR UPDATE
  USING (id = public.current_organization_id());

DROP POLICY IF EXISTS "Admins full access orgs" ON public.organizations;
CREATE POLICY "Admins full access orgs"
  ON public.organizations FOR ALL
  USING (public.is_admin());

-- council_donations
DROP POLICY IF EXISTS "Admins view donations" ON public.council_donations;
CREATE POLICY "Admins view donations"
  ON public.council_donations FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage donations" ON public.council_donations;
CREATE POLICY "Admins manage donations"
  ON public.council_donations FOR ALL
  USING (public.is_admin());

-- volunteer_needs
DROP POLICY IF EXISTS "Orgs manage own volunteer needs" ON public.volunteer_needs;
CREATE POLICY "Orgs manage own volunteer needs"
  ON public.volunteer_needs FOR ALL
  USING (organization_id = public.current_organization_id());

DROP POLICY IF EXISTS "Admins full access volunteer needs" ON public.volunteer_needs;
CREATE POLICY "Admins full access volunteer needs"
  ON public.volunteer_needs FOR ALL
  USING (public.is_admin());

-- profiles — THE actual fix
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
CREATE POLICY "Admins manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- site_settings
DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;
CREATE POLICY "Admins manage settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());
