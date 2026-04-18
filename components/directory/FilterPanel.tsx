'use client';

import { MapPin } from 'lucide-react';
import {
  AssistanceType,
  DayOfWeek,
  DirectoryFilters,
} from '@/types/database';
import {
  ASSISTANCE_TYPES,
  DAYS_OF_WEEK,
} from '@/lib/utils/constants';
import { useTranslation } from '@/contexts/LocaleContext';
import type { MessageKey } from '@/lib/i18n/dictionary';

interface FilterPanelProps {
  filters: DirectoryFilters;
  onChange: (filters: DirectoryFilters) => void;
  towns: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function FilterPanel({ filters, onChange, towns, isOpen, onClose }: FilterPanelProps) {
  const { t, locale } = useTranslation();
  const DAY_SHORT_EN: Record<DayOfWeek, string> = {
    monday: 'Mo',
    tuesday: 'Tu',
    wednesday: 'We',
    thursday: 'Th',
    friday: 'Fr',
    saturday: 'Sa',
    sunday: 'Su',
  };
  const DAY_SHORT_ES: Record<DayOfWeek, string> = {
    monday: 'Lu',
    tuesday: 'Ma',
    wednesday: 'Mi',
    thursday: 'Ju',
    friday: 'Vi',
    saturday: 'Sá',
    sunday: 'Do',
  };
  const dayShort = locale === 'es' ? DAY_SHORT_ES : DAY_SHORT_EN;

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
          {t('dir.filter.town')}
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
            {t('dir.filter.all')}
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
          {t('dir.filter.assistance')}
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
              {t(`assistance.${type}` as MessageKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-text mb-3">
          {t('dir.filter.day')}
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
              aria-label={t(`day.${day}` as MessageKey)}
            >
              {dayShort[day]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full h-11 text-sm font-medium text-white bg-navy rounded-full hover:bg-navy-light transition-colors"
      >
        {locale === 'es' ? 'Listo' : 'Done'}
      </button>
    </div>
  );
}
