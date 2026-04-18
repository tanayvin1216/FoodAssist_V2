-- =============================================================================
-- Migration: restrict_self_profile_update
-- =============================================================================
--
-- SECURITY GAP (CVE class: privilege escalation via self-UPDATE)
-- ---------------------------------------------------------------
-- The existing RLS policy "Users update own profile" on public.profiles is:
--
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id)
--
-- Postgres RLS cannot restrict *which columns* a policy applies to. This means
-- any authenticated user can issue:
--
--   UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
--
-- and the policy permits it, bypassing the admin-only guard. This is a live
-- vulnerability even with middleware and server-action re-auth in place,
-- because a user holding a valid JWT can hit the Supabase REST endpoint
-- directly without going through any app code.
--
-- THE FIX
-- -------
-- Add a BEFORE UPDATE trigger that runs as SECURITY DEFINER. The trigger:
--   1. Checks whether `role` or `organization_id` changed on the row.
--   2. If so, looks up whether the *current session user* (via auth.uid())
--      holds an admin role in the profiles table.
--   3. Non-admins who attempt to change either column receive an exception.
--   4. Admins pass through unconditionally.
--   5. When auth.uid() returns NULL (i.e. the write comes from the service-role
--      or postgres superuser context — no JWT session), the function also passes
--      through. This ensures admin Server Actions that use the service-role client
--      are not blocked. These paths already have their own auth controls.
--
-- DOES NOT AFFECT
-- ---------------
-- - The existing handle_new_user INSERT trigger (INSERT, not UPDATE).
-- - The update_last_updated() trigger (handles updated_at column, not role/org).
-- - RLS SELECT or admin UPDATE policies — those remain unchanged.
-- - Admins updating another user's role via the service-role path.
--
-- SEARCH_PATH HARDENING
-- ---------------------
-- Function is created with search_path pinned to `public, pg_temp` (same
-- pattern as migration 003) to prevent search_path manipulation attacks.
--
-- VERIFICATION (run these after applying)
-- ----------------------------------------
-- 1. SELECT tgname, tgtype FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass;
--    → Expect: profiles_prevent_self_escalation (plus pre-existing triggers)
-- 2. SELECT proname, prosrc FROM pg_proc WHERE proname = 'prevent_self_role_change';
--    → Confirm function body is present
-- 3. SELECT proconfig FROM pg_proc WHERE proname = 'prevent_self_role_change';
--    → Confirm: {search_path=public,pg_temp}
--
-- MANUAL VERIFICATION (requires a test non-admin user in auth.users)
-- -------------------------------------------------------------------
-- In the Supabase SQL editor, with a non-admin JWT set via `SET LOCAL role`:
--   BEGIN;
--   SET LOCAL request.jwt.claims = '{"sub":"<non-admin-user-id>","role":"authenticated"}';
--   UPDATE profiles SET role = 'admin' WHERE id = '<non-admin-user-id>';
--   -- Should raise: "Only admins can change role or organization assignment."
--   ROLLBACK;
-- =============================================================================

CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_uid UUID;
  is_admin    BOOLEAN;
BEGIN
  -- Resolve the authenticated user from the JWT claim.
  -- Returns NULL when called from service-role / superuser context (no JWT).
  current_uid := auth.uid();

  -- If there is no JWT session (service-role writes, postgres superuser,
  -- or internal triggers), allow the update unconditionally. These callers
  -- have separate auth controls and must not be blocked here.
  IF current_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only proceed if one of the sensitive columns actually changed.
  -- No-op if neither role nor organization_id is being modified.
  IF (NEW.role IS NOT DISTINCT FROM OLD.role) AND
     (NEW.organization_id IS NOT DISTINCT FROM OLD.organization_id) THEN
    RETURN NEW;
  END IF;

  -- Check whether the calling user is an admin.
  -- We look up the profiles table directly rather than trusting a JWT claim,
  -- because JWT claims can lag behind DB role changes.
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = current_uid AND role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can change role or organization assignment.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: fires BEFORE every UPDATE on profiles, for each affected row.
-- BEFORE (not AFTER) so the exception aborts the statement cleanly.
CREATE TRIGGER profiles_prevent_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_change();
