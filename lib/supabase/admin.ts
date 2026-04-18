// SERVER ONLY — never import from a 'use client' file.
// Rationale: this client uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely.
// Importing it from client-side code would expose the service role key to the browser bundle.
// Use lib/supabase/server.ts (cookie-scoped, anon key) for all non-admin server operations.

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client authenticated with the service role key.
 * Bypasses RLS — use only for privileged admin operations (user invite, user delete).
 * Throws at call time (not import time) so the rest of the app still boots in dev
 * without the key present.
 *
 * Never cache or share this instance — create fresh per admin action.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'createAdminClient: NEXT_PUBLIC_SUPABASE_URL is not set. ' +
        'Add it to your .env.local file.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'createAdminClient: SUPABASE_SERVICE_ROLE_KEY is not set. ' +
        'Required for admin user management (Phase 2 Step 10). ' +
        'Find it in your Supabase project settings → API → service_role key. ' +
        'Add it to .env.local — never expose this key to the client.'
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable automatic token refresh — this is a server-side one-shot client.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
