import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/queries';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const profile = await getProfile(supabase, user.id);
  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return <AdminShell>{children}</AdminShell>;
}
