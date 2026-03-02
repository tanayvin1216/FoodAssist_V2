'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Organization, DirectoryFilters } from '@/types/database';
import { FilterPanel } from './FilterPanel';
import { OrgCard } from './OrgCard';
import { OrgCardSimple } from './OrgCardSimple';
import {
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DirectoryListProps {
  initialOrganizations: Organization[];
  towns: string[];
}

type CardView = 'classic' | 'simple';
type ScrollView = 'list' | 'carousel';

export function DirectoryList({
  initialOrganizations,
  towns,
}: DirectoryListProps) {
  const [filters, setFilters] = useState<DirectoryFilters>({});
  const [isLoading] = useState(false);
  const [cardView, setCardView] = useState<CardView>('simple');
  const [scrollView, setScrollView] = useState<ScrollView>('carousel');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get active filter count
  const activeFilterCount =
    (filters.town ? 1 : 0) +
    (filters.assistanceTypes?.length || 0) +
    (filters.daysOpen?.length || 0);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedCard = localStorage.getItem('cardView');
    if (savedCard === 'classic' || savedCard === 'simple') {
      setCardView(savedCard);
    }
    const savedScroll = localStorage.getItem('scrollView');
    if (savedScroll === 'list' || savedScroll === 'carousel') {
      setScrollView(savedScroll);
    }
  }, []);

  // Save preference when changed
  const toggleCardView = (view: CardView) => {
    setCardView(view);
    localStorage.setItem('cardView', view);
  };

  const toggleScrollView = (view: ScrollView) => {
    setScrollView(view);
    localStorage.setItem('scrollView', view);
  };

  // Client-side filtering for immediate feedback
  const filteredOrganizations = useMemo(() => {
    let result = initialOrganizations;

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (org) =>
          org.name.toLowerCase().includes(search) ||
          org.town.toLowerCase().includes(search) ||
          org.address.toLowerCase().includes(search) ||
          org.zip.includes(search)
      );
    }

    // Town filter
    if (filters.town) {
      result = result.filter((org) => org.town === filters.town);
    }

    // Assistance types filter
    if (filters.assistanceTypes && filters.assistanceTypes.length > 0) {
      result = result.filter((org) =>
        filters.assistanceTypes!.some((type) =>
          org.assistance_types.includes(type)
        )
      );
    }

    // Days open filter
    if (filters.daysOpen && filters.daysOpen.length > 0) {
      result = result.filter((org) => {
        const openDays = org.operating_hours
          ?.filter((h) => !h.is_closed)
          .map((h) => h.day);
        return filters.daysOpen!.some((day) => openDays?.includes(day));
      });
    }

    // Donation types filter
    if (filters.donationTypes && filters.donationTypes.length > 0) {
      result = result.filter((org) =>
        filters.donationTypes!.some((type) =>
          org.donations_accepted?.includes(type)
        )
      );
    }

    return result;
  }, [initialOrganizations, filters]);

  // Handle scroll to update current index
  const handleScroll = useCallback(() => {
    if (carouselRef.current && filteredOrganizations.length > 0) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);

      // Clamp index to valid range
      const clampedIndex = Math.max(0, Math.min(newIndex, filteredOrganizations.length - 1));
      setCurrentIndex(clampedIndex);
    }
  }, [filteredOrganizations.length]);

  // Navigate carousel with looping
  const goToCard = useCallback((index: number) => {
    if (carouselRef.current && filteredOrganizations.length > 0) {
      const cardWidth = carouselRef.current.offsetWidth;
      // Handle looping
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

  // Touch handlers for swipe detection with looping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    // Wait for scroll to settle, then check actual position
    setTimeout(() => {
      if (!carouselRef.current || filteredOrganizations.length <= 1) return;

      // Get ACTUAL current position from scroll, not from state
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth;
      const actualIndex = Math.round(scrollLeft / cardWidth);
      const lastIndex = filteredOrganizations.length - 1;

      // Swiped left (trying to go next) while actually at last card
      if (diff > swipeThreshold && actualIndex >= lastIndex) {
        goToCard(0);
      }
      // Swiped right (trying to go previous) while actually at first card
      else if (diff < -swipeThreshold && actualIndex <= 0) {
        goToCard(lastIndex);
      }
    }, 250);
  };

  // Wheel handler for desktop scrolling with looping
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!carouselRef.current || filteredOrganizations.length <= 1) return;

    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!isHorizontalScroll) return;

    // Get actual position from scroll
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.offsetWidth;
    const actualIndex = Math.round(scrollLeft / cardWidth);
    const lastIndex = filteredOrganizations.length - 1;
    const maxScroll = cardWidth * lastIndex;

    const isScrollingRight = e.deltaX > 20;
    const isScrollingLeft = e.deltaX < -20;

    // At last card and scrolled to max, scrolling right -> loop to first
    if (actualIndex >= lastIndex && scrollLeft >= maxScroll - 10 && isScrollingRight) {
      e.preventDefault();
      goToCard(0);
    }
    // At first card and scrolled to start, scrolling left -> loop to last
    else if (actualIndex <= 0 && scrollLeft <= 10 && isScrollingLeft) {
      e.preventDefault();
      goToCard(lastIndex);
    }
  }, [filteredOrganizations.length, goToCard]);


  return (
    <div className="space-y-5">
      {/* Search + Filter Bar - Animated */}
      <div className="flex items-center justify-center gap-3">
        {/* Search Button (stays visible, transforms when active) */}
        <button
          onClick={() => {
            if (searchOpen) {
              setSearchOpen(false);
              setFilters({ ...filters, search: '' });
            } else {
              setSearchOpen(true);
              setFilterOpen(false);
            }
          }}
          className={`flex-shrink-0 h-12 rounded-full flex items-center justify-center transition-all duration-400 ease-in-out ${
            searchOpen
              ? 'w-12 bg-slate-700 text-white shadow-lg'
              : 'w-auto px-5 gap-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Search
              className={`absolute transition-all duration-400 ease-in-out ${
                searchOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
              }`}
              style={{ width: 24, height: 24 }}
            />
            <X
              className={`absolute transition-all duration-400 ease-in-out ${
                searchOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
              }`}
              style={{ width: 20, height: 20 }}
            />
          </div>
          <span
            className={`font-medium overflow-hidden transition-all duration-400 ease-in-out ${
              searchOpen ? 'w-0 ml-0 opacity-0' : 'w-16 ml-1 opacity-100'
            }`}
          >
            Search
          </span>
        </button>

        {/* Expanding Search Input */}
        <div
          className={`transition-all duration-400 ease-in-out ${
            searchOpen
              ? 'w-48 sm:w-56 md:w-72 opacity-100'
              : 'w-0 opacity-0'
          }`}
          style={{ overflow: 'hidden' }}
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-base focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        {/* Filter Button - Gets pushed right */}
        <button
          onClick={() => {
            setFilterOpen(!filterOpen);
            if (searchOpen) setSearchOpen(false);
          }}
          className={`flex-shrink-0 flex items-center justify-center h-12 rounded-full transition-all duration-400 ease-in-out ${
            searchOpen ? 'w-12 px-0' : 'w-auto px-5 gap-2.5'
          } ${
            filterOpen || activeFilterCount > 0
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <svg
            className="w-6 h-6 flex-shrink-0 transition-all duration-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
          <span
            className={`font-medium overflow-hidden transition-all duration-400 ease-in-out ${
              searchOpen ? 'w-0 opacity-0' : 'w-14 opacity-100'
            }`}
          >
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span
              className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-400 ${
                filterOpen || activeFilterCount > 0
                  ? 'bg-white text-slate-700'
                  : 'bg-slate-700 text-white'
              } ${searchOpen ? 'ml-0' : 'ml-1'}`}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel (below the bar) */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        towns={towns}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filteredOrganizations.length} places
        </p>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => toggleScrollView('carousel')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                scrollView === 'carousel'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => toggleScrollView('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                scrollView === 'list'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              List
            </button>
          </div>

          {/* Detail Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => toggleCardView('simple')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                cardView === 'simple'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => toggleCardView('classic')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                cardView === 'classic'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Full
            </button>
          </div>
        </div>
      </div>

      {/* Organization Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium">No places found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search
          </p>
        </div>
      ) : scrollView === 'carousel' ? (
        /* Carousel View */
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={() => goToCard(currentIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => goToCard(currentIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>

          {/* Carousel Container */}
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
              <div
                key={org.id}
                className="flex-shrink-0 w-full snap-center"
              >
                {cardView === 'simple' ? (
                  <OrgCardSimple organization={org} />
                ) : (
                  <OrgCard organization={org} />
                )}
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {filteredOrganizations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToCard(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-6 h-1.5 bg-slate-600'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>

          {/* Swipe Hint - Mobile */}
          <p className="text-center text-xs text-slate-400 mt-2 sm:hidden">
            Swipe to see more
          </p>
        </div>
      ) : (
        /* Clean List View */
        <div className="space-y-4">
          {filteredOrganizations.map((org) =>
            cardView === 'simple' ? (
              <OrgCardSimple key={org.id} organization={org} />
            ) : (
              <OrgCard key={org.id} organization={org} />
            )
          )}
        </div>
      )}
    </div>
  );
}
