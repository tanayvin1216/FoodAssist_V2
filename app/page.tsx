import { DirectoryList } from '@/components/directory/DirectoryList';
import { sampleOrganizations, getSampleTowns } from '@/lib/utils/sampleData';
import { MapPin, Phone, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  const organizations = sampleOrganizations;
  const towns = getSampleTowns();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="container px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Find Food Assistance in Carteret County
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                Search for food pantries, hot meals, and other food assistance
                programs in your area.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl md:text-3xl font-bold">
                    {organizations.length}
                  </div>
                  <div className="text-sm text-blue-100">Organizations</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl md:text-3xl font-bold">{towns.length}</div>
                  <div className="text-sm text-blue-100">Towns Served</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl md:text-3xl font-bold">24/7</div>
                  <div className="text-sm text-blue-100">Access</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Help Section */}
        <section className="bg-white border-b">
          <div className="container px-4 py-6">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Search by location</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Call for assistance</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Check hours</span>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Section */}
        <section className="container px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Food Assistance Directory
            </h2>
            <DirectoryList initialOrganizations={organizations} towns={towns} />
          </div>
        </section>

        {/* Need Help Section */}
        <section className="bg-gray-100 border-t">
          <div className="container px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need Immediate Help?
              </h2>
              <p className="text-gray-600 mb-6">
                If you need emergency food assistance, contact the Carteret County
                Department of Social Services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:2527287000"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call (252) 728-7000
                </a>
                <a
                  href="https://211.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
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

