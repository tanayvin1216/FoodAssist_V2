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
 * Require authentication. Redirects to login if not authenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

/**
 * Require admin role. Redirects to login if not authenticated,
 * redirects to home if authenticated but not admin.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();

  if (session.profile.role !== 'admin') {
    redirect('/');
  }

  return session;
}

/**
 * Require organization role. Redirects to login if not authenticated,
 * redirects to home if not an org user.
 */
export async function requireOrgUser(): Promise<SessionUser> {
  const session = await requireAuth();

  if (session.profile.role !== 'organization' && session.profile.role !== 'admin') {
    redirect('/');
  }

  return session;
}

/**
 * Check if the current user has a specific role without redirecting.
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await getSession();
  return session?.profile.role === role;
}
