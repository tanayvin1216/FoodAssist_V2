'use client';

import Link from 'next/link';
import { MapPin, Phone, Clock, Navigation, ChevronRight } from 'lucide-react';
import { Organization } from '@/types/database';
import { ASSISTANCE_TYPE_LABELS } from '@/lib/utils/constants';
import {
  formatPhone,
  getShortHoursSummary,
  getTodayHours,
  getDirectionsUrl,
} from '@/lib/utils/formatters';

interface OrgCardProps {
  organization: Organization;
}

export function OrgCard({ organization }: OrgCardProps) {
  const {
    id,
    name,
    address,
    town,
    zip,
    phone,
    assistance_types,
    operating_hours,
    spanish_available,
  } = organization;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-navy truncate">
              {name}
            </h3>
            {spanish_available && (
              <span className="text-xs text-navy bg-tag-bg px-2.5 py-1 rounded-full">Espanol</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {assistance_types.slice(0, 3).map((type) => (
              <span
                key={type}
                className="px-2.5 py-1 text-xs text-navy bg-tag-bg rounded-full"
              >
                {ASSISTANCE_TYPE_LABELS[type]}
              </span>
            ))}
            {assistance_types.length > 3 && (
              <span className="px-2.5 py-1 text-xs text-muted-text bg-gray-50 rounded-full">
                +{assistance_types.length - 3} more
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-sm text-body-text">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-text" />
              <span>
                {address}, {town}, NC {zip}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-text" />
              <a
                href={`tel:${phone}`}
                className="hover:text-navy transition-colors"
              >
                {formatPhone(phone)}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-text" />
              <span>{getTodayHours(operating_hours)}</span>
              <span className="text-muted-text">
                ({getShortHoursSummary(operating_hours)})
              </span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 sm:items-end">
          <Link href={`/organization/${id}`} className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto h-11 px-6 text-sm font-medium text-white bg-navy rounded-full hover:bg-navy-light transition-colors flex items-center justify-center gap-1">
              Details
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
          <a
            href={getDirectionsUrl(address, town, zip)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
          >
            <button className="w-full sm:w-auto h-11 px-6 text-sm font-medium text-navy border border-navy rounded-full hover:bg-navy/5 transition-colors flex items-center justify-center gap-1">
              <Navigation className="w-3.5 h-3.5" />
              Directions
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
