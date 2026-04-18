import { requireAdmin } from '@/lib/supabase/auth';
import AdminShell from './AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const adminName = session.profile.name ?? session.email;
  const adminEmail = session.email;

  return (
    <AdminShell adminName={adminName} adminEmail={adminEmail}>
      {children}
    </AdminShell>
  );
}
