import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getOrganizations } from '@/lib/supabase/queries';
import { OrganizationsClient } from './OrganizationsClient';

export default async function AdminOrganizationsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const organizations = await getOrganizations(supabase, undefined, false);

  return <OrganizationsClient initialOrgs={organizations} />;
}
