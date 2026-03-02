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

interface OrgCardSimpleProps {
  organization: Organization;
}

export function OrgCardSimple({ organization }: OrgCardSimpleProps) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Status Banner */}
      <div
        className={`px-5 py-3 ${
          isOpen
            ? 'bg-emerald-50 border-b border-emerald-100'
            : 'bg-slate-50 border-b border-slate-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOpen ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span
              className={`font-semibold text-sm tracking-wide ${
                isOpen ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
          {spanish_available && (
            <span className="text-slate-600 text-sm font-medium bg-slate-100 px-2 py-0.5 rounded-full">
              Español
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name */}
        <Link href={`/organization/${id}`}>
          <h3 className="text-xl font-bold text-slate-800 mb-1.5 hover:text-slate-600 transition-colors leading-tight">
            {name}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-500 mb-5">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{town}, NC</span>
        </div>

        {/* Info Cards */}
        <div className="space-y-2.5 mb-5">
          {/* Hours */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-slate-700 font-medium text-sm">{todayHours}</span>
          </div>

          {/* Phone - Tappable */}
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-700 font-semibold text-sm">
              {formatPhone(phone)}
            </span>
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <Link href={`/organization/${id}`} className="flex-1">
            <button className="w-full py-3.5 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors text-sm">
              More Details
            </button>
          </Link>
          <a
            href={getDirectionsUrl(address, town, zip)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <button className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              <Navigation className="w-4 h-4" />
              Directions
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
