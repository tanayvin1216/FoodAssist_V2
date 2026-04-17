import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getVolunteerNeeds, getOrganizations } from '@/lib/supabase/queries';
import { VolunteersClient } from './VolunteersClient';

export default async function VolunteersPage() {
  await requireAdmin();

  const supabase = await createClient();

  const [volunteerNeeds, organizations] = await Promise.all([
    getVolunteerNeeds(supabase, undefined, false),
    getOrganizations(supabase, undefined, false),
  ]);

  return (
    <VolunteersClient
      initialVolunteerNeeds={volunteerNeeds}
      organizations={organizations}
    />
  );
}
