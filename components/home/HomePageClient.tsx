'use client';

import { useState } from 'react';
import { Search, X, Phone, MapPin } from 'lucide-react';
import { Organization } from '@/types/database';
import { DirectoryList } from '@/components/directory/DirectoryList';

interface HomePageClientProps {
  organizations: Organization[];
  towns: string[];
}

export function HomePageClient({ organizations, towns }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[420px] md:min-h-[480px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-bg.jpg)', backgroundColor: '#1E3A5F' }}
        />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/30" />

        <div className="w-full px-6 pb-24 pt-24 md:pb-28 md:pt-32 relative text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm text-white rounded-full text-sm border border-white/20 mb-6">
              <MapPin className="w-4 h-4" />
              Carteret County, NC
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] text-white leading-[1.1] mb-4">
              Find Food Assistance Near You
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-lg mx-auto mb-8">
              Connect with local food pantries, hot meals, and community
              programs in your area.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                <strong className="text-white text-lg font-semibold">{organizations.length}</strong>
                <span className="text-white/70 text-sm">locations</span>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                <strong className="text-white text-lg font-semibold">{towns.length}</strong>
                <span className="text-white/70 text-sm">towns</span>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-white/70 text-sm">Free services</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Search Bar */}
      <div className="max-w-2xl mx-auto px-6 relative z-20 -mt-7">
        <div className="bg-white rounded-full shadow-xl flex items-center h-14 px-6 border border-gray-100">
          <Search className="w-5 h-5 text-muted-text mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, town, or zip..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-body-text placeholder-muted-text text-base"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="ml-2 text-muted-text hover:text-navy transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Directory */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <DirectoryList
          initialOrganizations={organizations}
          towns={towns}
          externalSearch={searchQuery}
        />
      </div>

      {/* Emergency Help */}
      <div className="max-w-2xl mx-auto px-6 pb-14">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="border-l-4 border-amber-400 p-6">
            <p className="text-base font-semibold text-navy mb-1">
              Need Immediate Help?
            </p>
            <p className="text-sm text-muted-text mb-5">
              Contact us for emergency food assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:2527287000"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-medium text-white bg-navy rounded-full hover:bg-navy-light transition-colors"
              >
                <Phone className="w-4 h-4" />
                (252) 728-7000
              </a>
              <a
                href="https://211.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-11 px-6 text-sm font-medium text-navy border border-navy rounded-full hover:bg-navy/5 transition-colors"
              >
                Dial 211 for Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
