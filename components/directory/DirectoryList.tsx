'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Organization, DirectoryFilters } from '@/types/database';
import { FilterPanel } from './FilterPanel';
import { OrgCardSimple } from './OrgCardSimple';
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface DirectoryListProps {
  initialOrganizations: Organization[];
  towns: string[];
  externalSearch?: string;
}

type ScrollView = 'list' | 'carousel';

export function DirectoryList({
  initialOrganizations,
  towns,
  externalSearch = '',
}: DirectoryListProps) {
  const [filters, setFilters] = useState<DirectoryFilters>({});
  const [isLoading] = useState(false);
  const [scrollView, setScrollView] = useState<ScrollView>('carousel');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const activeFilterCount =
    (filters.town ? 1 : 0) +
    (filters.assistanceTypes?.length || 0) +
    (filters.daysOpen?.length || 0);

  useEffect(() => {
    const savedScroll = localStorage.getItem('scrollView');
    if (savedScroll === 'list' || savedScroll === 'carousel') {
      setScrollView(savedScroll);
    }
  }, []);

  const toggleScrollView = (view: ScrollView) => {
    setScrollView(view);
    localStorage.setItem('scrollView', view);
  };

  const filteredOrganizations = useMemo(() => {
    let result = initialOrganizations;

    if (externalSearch) {
      const search = externalSearch.toLowerCase();
      result = result.filter(
        (org) =>
          org.name.toLowerCase().includes(search) ||
          org.town.toLowerCase().includes(search) ||
          org.address.toLowerCase().includes(search) ||
          org.zip.includes(search)
      );
    }

    if (filters.town) {
      result = result.filter((org) => org.town === filters.town);
    }

    if (filters.assistanceTypes && filters.assistanceTypes.length > 0) {
      result = result.filter((org) =>
        filters.assistanceTypes!.some((type) =>
          org.assistance_types.includes(type)
        )
      );
    }

    if (filters.daysOpen && filters.daysOpen.length > 0) {
      result = result.filter((org) => {
        const openDays = org.operating_hours
          ?.filter((h) => !h.is_closed)
          .map((h) => h.day);
        return filters.daysOpen!.some((day) => openDays?.includes(day));
      });
    }

    if (filters.donationTypes && filters.donationTypes.length > 0) {
      result = result.filter((org) =>
        filters.donationTypes!.some((type) =>
          org.donations_accepted?.includes(type)
        )
      );
    }

    return result;
  }, [initialOrganizations, externalSearch, filters]);

  const handleScroll = useCallback(() => {
    if (carouselRef.current && filteredOrganizations.length > 0) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      const clampedIndex = Math.max(0, Math.min(newIndex, filteredOrganizations.length - 1));
      setCurrentIndex(clampedIndex);
    }
  }, [filteredOrganizations.length]);

  const goToCard = useCallback((index: number) => {
    if (carouselRef.current && filteredOrganizations.length > 0) {
      const cardWidth = carouselRef.current.offsetWidth;
      let targetIndex = index;
      if (index < 0) {
        targetIndex = filteredOrganizations.length - 1;
      } else if (index >= filteredOrganizations.length) {
        targetIndex = 0;
      }
      carouselRef.current.scrollTo({
        left: cardWidth * targetIndex,
        behavior: 'smooth',
      });
      setCurrentIndex(targetIndex);
    }
  }, [filteredOrganizations.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    setTimeout(() => {
      if (!carouselRef.current || filteredOrganizations.length <= 1) return;
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth;
      const actualIndex = Math.round(scrollLeft / cardWidth);
      const lastIndex = filteredOrganizations.length - 1;

      if (diff > swipeThreshold && actualIndex >= lastIndex) {
        goToCard(0);
      } else if (diff < -swipeThreshold && actualIndex <= 0) {
        goToCard(lastIndex);
      }
    }, 250);
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!carouselRef.current || filteredOrganizations.length <= 1) return;
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!isHorizontalScroll) return;

    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.offsetWidth;
    const actualIndex = Math.round(scrollLeft / cardWidth);
    const lastIndex = filteredOrganizations.length - 1;
    const maxScroll = cardWidth * lastIndex;

    if (e.deltaX > 20 && actualIndex >= lastIndex && scrollLeft >= maxScroll - 10) {
      e.preventDefault();
      goToCard(0);
    } else if (e.deltaX < -20 && actualIndex <= 0 && scrollLeft <= 10) {
      e.preventDefault();
      goToCard(lastIndex);
    }
  }, [filteredOrganizations.length, goToCard]);


  return (
    <div className="space-y-5">
      {/* Toolbar: filter + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`h-10 px-5 text-sm rounded-full transition-colors flex items-center gap-2 ${
              filterOpen || activeFilterCount > 0
                ? 'bg-navy text-white'
                : 'text-body-text bg-tag-bg hover:bg-navy/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center bg-white text-navy">
                {activeFilterCount}
              </span>
            )}
          </button>
          <p className="text-sm text-muted-text">
            {filteredOrganizations.length} places
          </p>
        </div>

        <div className="flex bg-tag-bg rounded-full p-1">
          <button
            onClick={() => toggleScrollView('carousel')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              scrollView === 'carousel'
                ? 'bg-navy text-white shadow-sm'
                : 'text-body-text hover:text-navy'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => toggleScrollView('list')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              scrollView === 'list'
                ? 'bg-navy text-white shadow-sm'
                : 'text-body-text hover:text-navy'
            }`}
          >
            List
          </button>
        </div>
      </div>

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        towns={towns}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-navy" />
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-5 h-5 mx-auto mb-3 text-muted-text" />
          <p className="text-navy font-medium text-sm">No places found</p>
          <p className="text-xs text-muted-text mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : scrollView === 'carousel' ? (
        <div className="relative">
          <button
            onClick={() => goToCard(currentIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5 text-navy" />
          </button>
          <button
            onClick={() => goToCard(currentIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5 text-navy" />
          </button>

          <div
            ref={carouselRef}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="flex-shrink-0 w-full snap-center px-1">
                <OrgCardSimple organization={org} />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-5">
            {filteredOrganizations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToCard(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-6 h-2 bg-navy'
                    : 'w-2 h-2 bg-divider hover:bg-muted-text'
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>

          <p className="text-center text-xs text-muted-text mt-2 sm:hidden">
            Swipe to see more
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrganizations.map((org) => (
            <OrgCardSimple key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
}
