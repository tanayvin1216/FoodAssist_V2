'use client';

import { useState, useEffect, useMemo } from 'react';
import { Organization, DirectoryFilters } from '@/types/database';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { OrgCard } from './OrgCard';
import { OrgCardSimple } from './OrgCardSimple';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DirectoryListProps {
  initialOrganizations: Organization[];
  towns: string[];
}

type CardView = 'classic' | 'simple';

export function DirectoryList({
  initialOrganizations,
  towns,
}: DirectoryListProps) {
  const [filters, setFilters] = useState<DirectoryFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cardView, setCardView] = useState<CardView>('classic');

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cardView');
    if (saved === 'classic' || saved === 'simple') {
      setCardView(saved);
    }
  }, []);

  // Save preference when changed
  const toggleCardView = (view: CardView) => {
    setCardView(view);
    localStorage.setItem('cardView', view);
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

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar
        value={filters.search || ''}
        onChange={(search) => setFilters({ ...filters, search })}
      />

      {/* Filters */}
      <FilterPanel filters={filters} onChange={setFilters} towns={towns} />

      {/* Results count and view toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredOrganizations.length === 0 ? (
            'No organizations found'
          ) : filteredOrganizations.length === 1 ? (
            '1 organization found'
          ) : (
            `${filteredOrganizations.length} organizations found`
          )}
        </p>

        {/* Card view toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={cardView === 'classic' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleCardView('classic')}
            className="text-xs px-3"
          >
            <List className="w-4 h-4 mr-1" />
            Detailed
          </Button>
          <Button
            variant={cardView === 'simple' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleCardView('simple')}
            className="text-xs px-3"
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            Simple
          </Button>
        </div>
      </div>

      {/* Organization List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">
            No organizations match your search criteria.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
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
