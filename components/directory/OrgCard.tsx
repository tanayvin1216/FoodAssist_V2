'use client';

import Link from 'next/link';
import { MapPin, Phone, Clock, Navigation, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Name and badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {name}
              </h3>
              {spanish_available && (
                <Badge variant="outline" className="text-xs">
                  Espanol
                </Badge>
              )}
            </div>

            {/* Assistance types */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {assistance_types.slice(0, 3).map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {ASSISTANCE_TYPE_LABELS[type]}
                </Badge>
              ))}
              {assistance_types.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{assistance_types.length - 3} more
                </Badge>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>
                  {address}, {town}, NC {zip}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <a
                  href={`tel:${phone}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {formatPhone(phone)}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>{getTodayHours(operating_hours)}</span>
                <span className="text-gray-400">
                  ({getShortHoursSummary(operating_hours)})
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 sm:items-end">
            <Link href={`/organization/${id}`} className="flex-1 sm:flex-none">
              <Button variant="default" size="sm" className="w-full sm:w-auto">
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a
              href={getDirectionsUrl(address, town, zip)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Directions
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
