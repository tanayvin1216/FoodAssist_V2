-- Fix recursive RLS policies on profiles by using a SECURITY DEFINER role helper.

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid();
$$;

CREATE POLICY "Admins view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins manage all profiles"
  ON public.profiles
  FOR ALL
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');
