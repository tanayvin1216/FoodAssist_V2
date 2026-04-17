'use client';

import { MapPin } from 'lucide-react';
import {
  AssistanceType,
  DayOfWeek,
  DirectoryFilters,
} from '@/types/database';
import {
  ASSISTANCE_TYPE_LABELS,
  DAY_LABELS,
  ASSISTANCE_TYPES,
  DAYS_OF_WEEK,
} from '@/lib/utils/constants';

interface FilterPanelProps {
  filters: DirectoryFilters;
  onChange: (filters: DirectoryFilters) => void;
  towns: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function FilterPanel({ filters, onChange, towns, isOpen, onClose }: FilterPanelProps) {
  const handleAssistanceTypeChange = (type: AssistanceType) => {
    const current = filters.assistanceTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ ...filters, assistanceTypes: updated });
  };

  const handleDayChange = (day: DayOfWeek) => {
    const current = filters.daysOpen || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onChange({ ...filters, daysOpen: updated });
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-in slide-in-from-top-2 duration-200">
      <div className="mb-5">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-text mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Town
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ ...filters, town: undefined })}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !filters.town
                ? 'bg-navy text-white'
                : 'text-body-text hover:bg-navy/5'
            }`}
          >
            All
          </button>
          {towns.map((town) => (
            <button
              key={town}
              onClick={() => onChange({ ...filters, town })}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filters.town === town
                  ? 'bg-navy text-white'
                  : 'text-body-text hover:bg-navy/5'
              }`}
            >
              {town}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-text mb-3">
          Type of Help
        </h4>
        <div className="flex flex-wrap gap-2">
          {ASSISTANCE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleAssistanceTypeChange(type)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filters.assistanceTypes?.includes(type)
                  ? 'bg-navy text-white'
                  : 'text-body-text hover:bg-navy/5'
              }`}
            >
              {ASSISTANCE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-text mb-3">
          Open On
        </h4>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => handleDayChange(day)}
              className={`w-11 h-11 rounded-full text-sm transition-colors ${
                filters.daysOpen?.includes(day)
                  ? 'bg-navy text-white'
                  : 'text-body-text hover:bg-navy/5'
              }`}
            >
              {DAY_LABELS[day].slice(0, 2)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full h-11 text-sm font-medium text-white bg-navy rounded-full hover:bg-navy-light transition-colors"
      >
        Done
      </button>
    </div>
  );
}
