import { requireOrganization } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import type { VolunteerApplication } from '@/types/database';
import { PortalApplicationsClient } from './PortalApplicationsClient';

export const dynamic = 'force-dynamic';

export default async function PortalVolunteerApplicationsPage() {
  const ctx = await requireOrganization();
  const supabase = await createClient();

  const { data: needRows } = await supabase
    .from('volunteer_needs')
    .select('id')
    .eq('organization_id', ctx.organizationId);
  const needIds = (needRows ?? []).map((r) => r.id);

  // Applications either addressed directly to this org or targeting one
  // of its posted needs. RLS also enforces this server-side.
  let query = supabase
    .from('volunteer_applications')
    .select('*, volunteer_need:volunteer_needs(id, title)')
    .order('created_at', { ascending: false });

  if (needIds.length > 0) {
    query = query.or(
      `organization_id.eq.${ctx.organizationId},volunteer_need_id.in.(${needIds.join(',')})`,
    );
  } else {
    query = query.eq('organization_id', ctx.organizationId);
  }

  const { data, error } = await query;
  const applications = (error ? [] : (data ?? [])) as VolunteerApplication[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display text-navy">Volunteer Applications</h1>
        <p className="text-sm text-body-text mt-1">
          Review people who applied to volunteer with your organization. Reach out to
          them directly by email or phone — no automated email is sent.
        </p>
      </header>
      <PortalApplicationsClient applications={applications} />
    </div>
  );
}
