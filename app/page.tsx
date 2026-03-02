import { DirectoryList } from '@/components/directory/DirectoryList';
import { sampleOrganizations, getSampleTowns } from '@/lib/utils/sampleData';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection, EmergencySection } from '@/components/home/HomeContent';

export default function HomePage() {
  const organizations = sampleOrganizations;
  const towns = getSampleTowns();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        {/* Hero Section */}
        <HeroSection
          organizationCount={organizations.length}
          townCount={towns.length}
        />

        {/* Directory Section */}
        <section className="container px-4 py-8">
          <div className="max-w-xl mx-auto">
            <DirectoryList initialOrganizations={organizations} towns={towns} />
          </div>
        </section>

        {/* Emergency Help */}
        <EmergencySection />
      </main>
      <Footer />
    </div>
  );
}
