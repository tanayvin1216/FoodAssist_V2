'use client';

import Link from 'next/link';
import { Phone, Navigation, Clock, MapPin } from 'lucide-react';
import { Organization } from '@/types/database';
import {
  formatPhone,
  getDirectionsUrl,
  isOpenNow,
  getTodayHours,
} from '@/lib/utils/formatters';
import { useTranslation } from '@/contexts/LocaleContext';

interface OrgCardSimpleProps {
  organization: Organization;
}

export function OrgCardSimple({ organization }: OrgCardSimpleProps) {
  const { t } = useTranslation();
  const {
    id,
    name,
    town,
    address,
    zip,
    phone,
    operating_hours,
    spanish_available,
  } = organization;

  const isOpen = isOpenNow(operating_hours);
  const todayHours = getTodayHours(operating_hours);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isOpen ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className={`text-xs font-medium ${
            isOpen ? 'text-green-600' : 'text-muted-text'
          }`}>
            {isOpen ? t('org.openNow') : t('common.closed')}
          </span>
        </div>
        {spanish_available && (
          <span className="text-xs text-navy bg-tag-bg px-2.5 py-1 rounded-full">
            {t('org.spanishSpoken')}
          </span>
        )}
      </div>

      <Link href={`/organization/${id}`}>
        <h3 className="text-lg font-semibold text-navy mb-1 hover:text-navy-light transition-colors">
          {name}
        </h3>
      </Link>

      <div className="flex items-center gap-1.5 text-sm text-muted-text mb-4">
        <MapPin className="w-3.5 h-3.5" />
        <span>{town}, NC</span>
      </div>

      <div className="space-y-2.5 mb-6">
        <div className="flex items-center gap-3 text-sm text-body-text">
          <Clock className="w-4 h-4 text-muted-text" />
          <span>{todayHours}</span>
        </div>
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 text-sm text-body-text hover:text-navy transition-colors"
        >
          <Phone className="w-4 h-4 text-muted-text" />
          <span>{formatPhone(phone)}</span>
        </a>
      </div>

      <div className="flex gap-3">
        <Link href={`/organization/${id}`} className="flex-1">
          <button className="w-full h-11 text-sm font-medium text-white bg-navy rounded-full hover:bg-navy-light transition-colors">
            {t('org.details')}
          </button>
        </Link>
        <a
          href={getDirectionsUrl(address, town, zip)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0"
          aria-label={`Open directions to ${[address, town, zip].filter(Boolean).join(', ')} in Google Maps`}
        >
          <button className="w-full h-11 px-4 text-sm font-medium text-navy border border-navy rounded-full hover:bg-navy/5 transition-colors inline-flex items-center justify-center gap-1.5 max-w-full">
            <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="underline underline-offset-2 truncate">
              {address || t('org.directions')}
            </span>
          </button>
        </a>
      </div>
    </div>
  );
}
