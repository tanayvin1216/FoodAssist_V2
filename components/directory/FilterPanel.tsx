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
    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-5 animate-in slide-in-from-top-2 duration-200">
      {/* Town Selection */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-stone-400" />
          Town
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ ...filters, town: undefined })}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              !filters.town
                ? 'bg-slate-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {towns.map((town) => (
            <button
              key={town}
              onClick={() => onChange({ ...filters, town })}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.town === town
                  ? 'bg-slate-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {town}
            </button>
          ))}
        </div>
      </div>

      {/* Assistance Type */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-stone-700 mb-3">
          Type of Help
        </h4>
        <div className="flex flex-wrap gap-2">
          {ASSISTANCE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleAssistanceTypeChange(type)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.assistanceTypes?.includes(type)
                  ? 'bg-slate-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {ASSISTANCE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Days Open */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-stone-700 mb-3">
          Open On
        </h4>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => handleDayChange(day)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                filters.daysOpen?.includes(day)
                  ? 'bg-slate-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {DAY_LABELS[day].slice(0, 2)}
            </button>
          ))}
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onClose}
        className="w-full py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors text-sm"
      >
        Done
      </button>
    </div>
  );
}
