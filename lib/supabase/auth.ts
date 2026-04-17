import { createClient } from './server';
import { redirect } from 'next/navigation';
import type { Profile } from '@/types/database';

export type UserRole = 'admin' | 'organization' | 'public';

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile;
}

/**
 * Get the current authenticated user session.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? '',
    profile: profile as Profile,
  };
}

/**
 * Require authentication. Defaults unauthenticated callers to the admin
 * sign-in page; area-specific helpers below override this with their own
 * matching login URL.
 */
export async function requireAuth(
  loginPath: string = '/admin/login'
): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect(loginPath);
  }

  return session;
}

/**
 * Require admin role. Redirects to the admin login if not authenticated,
 * to the homepage if the caller is authenticated but lacks the role.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth('/admin/login');

  if (session.profile.role !== 'admin') {
    redirect('/');
  }

  return session;
}

/**
 * Require an organization user. Sends unauthenticated callers to the
 * organization sign-in page; anything with the wrong role bounces home.
 */
export async function requireOrganization(): Promise<
  SessionUser & { organizationId: string }
> {
  const session = await requireAuth('/portal/login');

  if (session.profile.role !== 'organization') {
    redirect('/');
  }

  if (!session.profile.organization_id) {
    redirect('/');
  }

  return {
    ...session,
    organizationId: session.profile.organization_id,
  };
}

/**
 * Check if the current user has a specific role without redirecting.
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await getSession();
  return session?.profile.role === role;
}
