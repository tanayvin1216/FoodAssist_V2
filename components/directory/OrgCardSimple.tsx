'use client';

import Link from 'next/link';
import { Phone, Navigation, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardContent className="p-5 sm:p-6">
        {/* Status Row */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
              isOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            {isOpen ? 'OPEN NOW' : 'CLOSED'}
          </div>
          {spanish_available && (
            <span className="text-sm text-blue-600 font-semibold">
              Español
            </span>
          )}
        </div>

        {/* Name - Large and clear */}
        <Link href={`/organization/${id}`}>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors leading-tight">
            {name}
          </h3>
        </Link>

        {/* Location */}
        <p className="text-base text-gray-600 mb-4">{town}, NC</p>

        {/* Hours and Phone - Key Info */}
        <div className="space-y-3 mb-6">
          {/* Hours */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span className="text-base text-gray-800 font-medium">
              {todayHours}
            </span>
          </div>

          {/* Phone */}
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-base text-blue-800 font-semibold">
              {formatPhone(phone)}
            </span>
          </a>
        </div>

        {/* Large action buttons */}
        <div className="flex gap-3">
          <Link href={`/organization/${id}`} className="flex-1">
            <Button
              variant="default"
              size="lg"
              className="w-full text-base py-5 font-semibold"
            >
              More Details
            </Button>
          </Link>
          <a
            href={getDirectionsUrl(address, town, zip)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full text-base py-5 font-semibold"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Directions
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
