'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AssistanceType,
  DayOfWeek,
  DonationType,
  DirectoryFilters,
} from '@/types/database';
import {
  ASSISTANCE_TYPE_LABELS,
  DONATION_TYPE_LABELS,
  DAY_LABELS,
  ASSISTANCE_TYPES,
  DONATION_TYPES,
  DAYS_OF_WEEK,
} from '@/lib/utils/constants';

interface FilterPanelProps {
  filters: DirectoryFilters;
  onChange: (filters: DirectoryFilters) => void;
  towns: string[];
}

export function FilterPanel({ filters, onChange, towns }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount =
    (filters.town ? 1 : 0) +
    (filters.assistanceTypes?.length || 0) +
    (filters.daysOpen?.length || 0) +
    (filters.donationTypes?.length || 0);

  const handleAssistanceTypeChange = (type: AssistanceType, checked: boolean) => {
    const current = filters.assistanceTypes || [];
    const updated = checked
      ? [...current, type]
      : current.filter((t) => t !== type);
    onChange({ ...filters, assistanceTypes: updated });
  };

  const handleDayChange = (day: DayOfWeek, checked: boolean) => {
    const current = filters.daysOpen || [];
    const updated = checked ? [...current, day] : current.filter((d) => d !== day);
    onChange({ ...filters, daysOpen: updated });
  };

  const handleDonationTypeChange = (type: DonationType, checked: boolean) => {
    const current = filters.donationTypes || [];
    const updated = checked
      ? [...current, type]
      : current.filter((t) => t !== type);
    onChange({ ...filters, donationTypes: updated });
  };

  const clearFilters = () => {
    onChange({
      search: filters.search,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t">
          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all filters
              </Button>
            </div>
          )}

          {/* Town Filter */}
          <div className="pt-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Town
            </Label>
            <Select
              value={filters.town || 'all'}
              onValueChange={(value) =>
                onChange({ ...filters, town: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All towns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All towns</SelectItem>
                {towns.map((town) => (
                  <SelectItem key={town} value={town}>
                    {town}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assistance Type Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Type of Assistance
            </Label>
            <div className="space-y-2">
              {ASSISTANCE_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assistance-${type}`}
                    checked={filters.assistanceTypes?.includes(type) || false}
                    onCheckedChange={(checked) =>
                      handleAssistanceTypeChange(type, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`assistance-${type}`}
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    {ASSISTANCE_TYPE_LABELS[type]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Days Open Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Days Open
            </Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <label
                  key={day}
                  className={`
                    flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer
                    transition-colors text-sm
                    ${
                      filters.daysOpen?.includes(day)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={filters.daysOpen?.includes(day) || false}
                    onChange={(e) => handleDayChange(day, e.target.checked)}
                  />
                  {DAY_LABELS[day].slice(0, 3)}
                </label>
              ))}
            </div>
          </div>

          {/* Donation Types Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Accepts Donations Of
            </Label>
            <div className="space-y-2">
              {DONATION_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`donation-${type}`}
                    checked={filters.donationTypes?.includes(type) || false}
                    onCheckedChange={(checked) =>
                      handleDonationTypeChange(type, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`donation-${type}`}
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    {DONATION_TYPE_LABELS[type]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
