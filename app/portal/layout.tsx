import { requireOrganization } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationById } from '@/lib/supabase/queries';
import PortalShell from './PortalShell';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrganization();

  const supabase = await createClient();
  const org = await getOrganizationById(supabase, ctx.organizationId);

  const orgName = org?.name ?? ctx.email;

  return (
    <PortalShell orgName={orgName} userEmail={ctx.email}>
      {children}
    </PortalShell>
  );
}
