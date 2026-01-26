'use client';

import { useState, useEffect, useMemo } from 'react';
import { Organization, DirectoryFilters } from '@/types/database';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { OrgCard } from './OrgCard';
import { Loader2 } from 'lucide-react';

interface DirectoryListProps {
  initialOrganizations: Organization[];
  towns: string[];
}

export function DirectoryList({
  initialOrganizations,
  towns,
}: DirectoryListProps) {
  const [filters, setFilters] = useState<DirectoryFilters>({});
  const [isLoading, setIsLoading] = useState(false);

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

      {/* Results count */}
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
          {filteredOrganizations.map((org) => (
            <OrgCard key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
}
