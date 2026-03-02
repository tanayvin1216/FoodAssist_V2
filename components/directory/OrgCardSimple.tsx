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
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6 sm:p-8">
        {/* Status Row */}
        <div className="flex items-center justify-between mb-6">
          <div
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-base font-bold ${
              isOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            {isOpen ? 'OPEN NOW' : 'CLOSED'}
          </div>
          {spanish_available && (
            <span className="text-base text-blue-600 font-semibold">
              Español
            </span>
          )}
        </div>

        {/* Name - Large and clear */}
        <Link href={`/organization/${id}`}>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors leading-tight">
            {name}
          </h3>
        </Link>

        {/* Location */}
        <p className="text-lg text-gray-600 mb-6">{town}, NC</p>

        {/* Hours and Phone - Key Info */}
        <div className="space-y-4 mb-8">
          {/* Hours */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <Clock className="w-6 h-6 text-gray-500 flex-shrink-0" />
            <span className="text-lg text-gray-800 font-medium">
              {todayHours}
            </span>
          </div>

          {/* Phone */}
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Phone className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <span className="text-lg text-blue-800 font-semibold">
              {formatPhone(phone)}
            </span>
          </a>
        </div>

        {/* Large action buttons */}
        <div className="flex gap-4">
          <Link href={`/organization/${id}`} className="flex-1">
            <Button
              variant="default"
              size="lg"
              className="w-full text-lg py-7 font-semibold"
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
              className="w-full text-lg py-7 font-semibold"
            >
              <Navigation className="w-6 h-6 mr-3" />
              Directions
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
