-- Security hardening: pin search_path on database functions to prevent
-- privilege-escalation via search_path manipulation. Both functions are
-- invoked as triggers and were flagged by Supabase security advisor
-- (lint 0011_function_search_path_mutable).

ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_last_updated() SET search_path = public, pg_temp;
