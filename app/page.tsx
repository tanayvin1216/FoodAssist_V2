import { DirectoryList } from '@/components/directory/DirectoryList';
import { sampleOrganizations, getSampleTowns } from '@/lib/utils/sampleData';
import { Phone, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  const organizations = sampleOrganizations;
  const towns = getSampleTowns();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-stone-50">
        {/* Hero Section - Warm, trustworthy */}
        <section className="bg-white border-b border-stone-200">
          <div className="container px-4 py-12 md:py-16">
            <div className="max-w-xl mx-auto text-center">
              {/* Location Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full text-sm font-medium mb-5">
                <MapPin className="w-4 h-4" />
                <span>Carteret County, NC</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 leading-tight">
                Find Food Assistance Near You
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-stone-500 mb-8 leading-relaxed">
                Connect with local food pantries, hot meals, and community programs in your area.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="px-4 py-2.5 bg-stone-100 rounded-xl">
                  <span className="font-bold text-stone-700">{organizations.length}</span>
                  <span className="text-stone-500 ml-1.5 text-sm">locations</span>
                </div>
                <div className="px-4 py-2.5 bg-stone-100 rounded-xl">
                  <span className="font-bold text-stone-700">{towns.length}</span>
                  <span className="text-stone-500 ml-1.5 text-sm">towns</span>
                </div>
                <div className="px-4 py-2.5 bg-emerald-50 rounded-xl">
                  <span className="font-bold text-emerald-700">Free</span>
                  <span className="text-emerald-600 ml-1.5 text-sm">services</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Section */}
        <section className="container px-4 py-8">
          <div className="max-w-xl mx-auto">
            <DirectoryList initialOrganizations={organizations} towns={towns} />
          </div>
        </section>

        {/* Emergency Help */}
        <section className="container px-4 pb-10">
          <div className="max-w-xl mx-auto">
            <div className="bg-slate-700 rounded-2xl p-6 text-center text-white">
              <h2 className="text-xl font-bold mb-2">
                Need Immediate Help?
              </h2>
              <p className="text-slate-300 text-sm mb-5">
                Contact us for emergency food assistance
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <a
                  href="tel:2527287000"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-700 font-medium rounded-xl hover:bg-stone-100 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  (252) 728-7000
                </a>
                <a
                  href="https://211.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 bg-slate-600 text-white font-medium rounded-xl hover:bg-slate-500 transition-colors text-sm"
                >
                  Dial 211 for Help
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
