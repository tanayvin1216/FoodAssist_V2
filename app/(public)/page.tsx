import { DirectoryList } from '@/components/directory/DirectoryList';
import { sampleOrganizations, getSampleTowns } from '@/lib/utils/sampleData';
import { HeroSection, EmergencySection } from '@/components/home/HomeContent';

export default function HomePage() {
  const organizations = sampleOrganizations;
  const towns = getSampleTowns();

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection
        organizationCount={organizations.length}
        townCount={towns.length}
      />

      {/* Directory Section */}
      <section className="content-container py-8">
        <div className="max-w-xl mx-auto">
          <DirectoryList initialOrganizations={organizations} towns={towns} />
        </div>
      </section>

      <EmergencySection />
    </div>
  );
}
