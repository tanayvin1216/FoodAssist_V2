import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getAllProfiles } from '@/lib/supabase/queries';
import { getOrganizations } from '@/lib/supabase/queries';
import UsersClient from './UsersClient';

export const metadata = { title: 'User Management — FoodAssist Admin' };

export default async function AdminUsersPage() {
  // AC-1: first line is requireAdmin — gate + identity for self-guards
  const session = await requireAdmin();

  const supabase = await createClient();

  const [profiles, organizations] = await Promise.all([
    getAllProfiles(supabase),
    getOrganizations(supabase, undefined, false),
  ]);

  // Slim orgs to what the client needs (id + name only)
  const orgsForSelect = organizations.map(({ id, name }) => ({ id, name }));

  return (
    <UsersClient
      initialUsers={profiles}
      organizations={orgsForSelect}
      currentAdminId={session.id}
    />
  );
}
