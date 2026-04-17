import { requireOrganization } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getVolunteerNeeds } from '@/lib/supabase/queries';
import { PortalVolunteersClient } from './PortalVolunteersClient';

export default async function PortalVolunteersPage() {
  const ctx = await requireOrganization();
  const supabase = await createClient();
  const needs = await getVolunteerNeeds(supabase, ctx.organizationId, false);

  return <PortalVolunteersClient initialNeeds={needs} />;
}
