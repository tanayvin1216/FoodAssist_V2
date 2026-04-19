-- Fix site_settings UPDATEs failing with:
--   ERROR: record "new" has no field "last_updated"
--
-- Migration 002 attached trigger update_settings_timestamp to site_settings,
-- which calls update_last_updated() (defined in migration 001). That function
-- assigns NEW.last_updated = NOW(), but site_settings has an updated_at
-- column, not last_updated. Every admin save hit the trigger and raised the
-- error, causing the /api/settings PUT endpoint to return 500 and the UI to
-- silently fail.
--
-- Fix: introduce a sibling trigger function that sets updated_at, and
-- re-point the site_settings trigger at it. Leave update_last_updated()
-- untouched so organizations (which really does use last_updated) keeps
-- working.

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_settings_timestamp ON public.site_settings;

CREATE TRIGGER update_settings_timestamp
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
