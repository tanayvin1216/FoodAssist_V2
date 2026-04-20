'use client';

import { useState, useMemo } from 'react';
import { Organization, DirectoryFilters } from '@/types/database';
import { FilterPanel } from './FilterPanel';
import { OrgCardSimple } from './OrgCardSimple';
import { useTranslation } from '@/contexts/LocaleContext';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';

interface DirectoryListProps {
  initialOrganizations: Organization[];
  towns: string[];
  externalSearch?: string;
}

export function DirectoryList({
  initialOrganizations,
  towns,
  externalSearch = '',
}: DirectoryListProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<DirectoryFilters>({});
  const [isLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount =
    (filters.town ? 1 : 0) +
    (filters.assistanceTypes?.length || 0) +
    (filters.daysOpen?.length || 0);

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

  return (
    <div className="space-y-5">
      {/* Toolbar: filter + language */}
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
            {t('dir.filter.label')}
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center bg-white text-navy">
                {activeFilterCount}
              </span>
            )}
          </button>
          <p className="text-sm text-muted-text">
            {filteredOrganizations.length} {t('dir.resultsSuffix')}
          </p>
        </div>

        <LanguageToggle />
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
          <p className="text-navy font-medium text-sm">{t('dir.empty.title')}</p>
          <p className="text-xs text-muted-text mt-1">
            {t('dir.empty.body')}
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
