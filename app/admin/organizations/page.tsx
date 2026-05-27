import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getOrganizations, getVolunteerNeeds } from '@/lib/supabase/queries';
import { OrganizationsClient } from './OrganizationsClient';

export default async function AdminOrganizationsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [organizations, volunteerNeeds] = await Promise.all([
    getOrganizations(supabase, undefined, false),
    // All needs (including inactive) so the org form can manage them inline.
    getVolunteerNeeds(supabase, undefined, false),
  ]);

  return (
    <OrganizationsClient initialOrgs={organizations} initialNeeds={volunteerNeeds} />
  );
}
