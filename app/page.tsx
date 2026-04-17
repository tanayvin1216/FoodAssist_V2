import { sampleOrganizations, getSampleTowns } from '@/lib/utils/sampleData';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePageClient } from '@/components/home/HomePageClient';

export default function HomePage() {
  const organizations = sampleOrganizations;
  const towns = getSampleTowns();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <HomePageClient organizations={organizations} towns={towns} />
      </main>
      <Footer />
    </div>
  );
}
