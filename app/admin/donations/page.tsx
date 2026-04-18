import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getCouncilDonations, getOrganizations } from '@/lib/supabase/queries';
import { DonationsClient } from './DonationsClient';

export default async function AdminDonationsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [donations, organizations] = await Promise.all([
    getCouncilDonations(supabase),
    getOrganizations(supabase, undefined, false),
  ]);

  return <DonationsClient initialDonations={donations} organizations={organizations} />;
}
