/**
 * Homepage — Server Component.
 * Fetches active organizations and distinct towns from Supabase.
 * Empty-state (zero orgs) is handled gracefully by HomePageClient which renders
 * a "no results" message when the organizations array is empty.
 */
import { createClient } from '@/lib/supabase/server';
import { getOrganizations, getUniqueTowns } from '@/lib/supabase/queries';
import { HomePageClient } from '@/components/home/HomePageClient';

export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await createClient();

  const [organizations, towns] = await Promise.all([
    getOrganizations(supabase),
    getUniqueTowns(supabase),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <HomePageClient organizations={organizations} towns={towns} />
    </div>
  );
}
