import { requireOrganization } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationById } from '@/lib/supabase/queries';
import ProfileEditor from './ProfileEditor';

export default async function PortalProfilePage() {
  const ctx = await requireOrganization();
  const supabase = await createClient();
  const org = await getOrganizationById(supabase, ctx.organizationId);

  if (!org) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold" style={{ color: '#1B2D3A' }}>
          Organization not found
        </h1>
        <p style={{ color: '#4A5568' }}>
          Your account is not linked to an active organization. Contact your administrator.
        </p>
      </div>
    );
  }

  return <ProfileEditor organization={org} />;
}
