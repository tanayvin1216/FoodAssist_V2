import { sampleOrganizations, getSampleTowns } from '@/lib/utils/sampleData';
import { HomePageClient } from '@/components/home/HomePageClient';

export default function HomePage() {
  const organizations = sampleOrganizations;
  const towns = getSampleTowns();

  return (
    <div className="min-h-screen bg-white">
      <HomePageClient organizations={organizations} towns={towns} />
    </div>
  );
}
