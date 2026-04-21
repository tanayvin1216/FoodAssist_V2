import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import type { VolunteerApplication } from '@/types/database';
import { AdminApplicationsClient } from './AdminApplicationsClient';

export const dynamic = 'force-dynamic';

export default async function AdminVolunteerApplicationsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [appsRes, orgsRes] = await Promise.all([
    supabase
      .from('volunteer_applications')
      .select(
        '*, organization:organizations(id, name), volunteer_need:volunteer_needs(id, title, organization_id)',
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('organizations')
      .select('id, name')
      .eq('sector', 'food_insecurity')
      .order('name', { ascending: true }),
  ]);

  const applications = (appsRes.data ?? []) as VolunteerApplication[];
  const organizations = (orgsRes.data ?? []) as { id: string; name: string }[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display text-navy">Volunteer Applications</h1>
        <p className="text-sm text-body-text mt-1">
          Every application across Carteret County. Filter by organization, review status,
          and keep internal notes. Contact applicants directly by email or phone.
        </p>
      </header>
      <AdminApplicationsClient
        applications={applications}
        organizations={organizations}
      />
    </div>
  );
}
