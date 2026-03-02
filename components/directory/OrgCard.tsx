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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Name and badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-800 truncate">
              {name}
            </h3>
            {spanish_available && (
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                Español
              </span>
            )}
          </div>

          {/* Assistance types */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {assistance_types.slice(0, 3).map((type) => (
              <span
                key={type}
                className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md"
              >
                {ASSISTANCE_TYPE_LABELS[type]}
              </span>
            ))}
            {assistance_types.length > 3 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                +{assistance_types.length - 3} more
              </span>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-1.5 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
              <span>
                {address}, {town}, NC {zip}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 flex-shrink-0 text-slate-500" />
              <a
                href={`tel:${phone}`}
                className="hover:text-slate-800 transition-colors"
              >
                {formatPhone(phone)}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span>{getTodayHours(operating_hours)}</span>
              <span className="text-slate-400">
                ({getShortHoursSummary(operating_hours)})
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 sm:items-end">
          <Link href={`/organization/${id}`} className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1">
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
          <a
            href={getDirectionsUrl(address, town, zip)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
          >
            <button className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1">
              <Navigation className="w-4 h-4" />
              Directions
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
