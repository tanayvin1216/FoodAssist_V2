import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Facebook,
  Navigation,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { sampleOrganizations } from '@/lib/utils/sampleData';
import {
  ASSISTANCE_TYPE_LABELS,
  DONATION_TYPE_LABELS,
  SERVED_POPULATION_LABELS,
  DAY_LABELS,
  COST_LABELS,
} from '@/lib/utils/constants';
import {
  formatPhone,
  formatTime,
  getDirectionsUrl,
  formatDate,
} from '@/lib/utils/formatters';

interface OrganizationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { id } = await params;

  // In production, fetch from Supabase
  const organization = sampleOrganizations.find((org) => org.id === id);

  if (!organization) {
    notFound();
  }

  const {
    name,
    address,
    town,
    zip,
    contact_name,
    phone,
    email,
    website,
    facebook,
    assistance_types,
    who_served,
    cost,
    num_meals_available,
    operating_hours,
    hours_notes,
    donations_accepted,
    storage_capacity,
    comments,
    last_updated,
    spanish_available,
  } = organization;

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Directory
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          {spanish_available && (
            <Badge variant="outline">Espanol disponible</Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {assistance_types.map((type) => (
            <Badge key={type} variant="secondary">
              {ASSISTANCE_TYPE_LABELS[type]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">{address}</p>
                <p className="text-gray-600">
                  {town}, NC {zip}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <a
                href={`tel:${phone}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {formatPhone(phone)}
              </a>
            </div>

            {contact_name && (
              <div className="text-sm text-gray-600">
                Contact: {contact_name}
              </div>
            )}

            {email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a
                  href={`mailto:${email}`}
                  className="text-blue-600 hover:underline"
                >
                  {email}
                </a>
              </div>
            )}

            {website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}

            {facebook && (
              <div className="flex items-center gap-3">
                <Facebook className="w-5 h-5 text-gray-400" />
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Facebook Page
                </a>
              </div>
            )}

            <Separator />

            <a
              href={getDirectionsUrl(address, town, zip)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full">
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {operating_hours?.map((hours) => (
                <div
                  key={hours.day}
                  className="flex justify-between items-center py-1"
                >
                  <span className="font-medium">{DAY_LABELS[hours.day]}</span>
                  <span
                    className={
                      hours.is_closed ? 'text-gray-400' : 'text-gray-700'
                    }
                  >
                    {hours.is_closed
                      ? 'Closed'
                      : `${formatTime(hours.open_time!)} - ${formatTime(hours.close_time!)}`}
                  </span>
                </div>
              ))}
            </div>
            {hours_notes && (
              <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {hours_notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Population Served
              </p>
              <div className="flex flex-wrap gap-2">
                {who_served?.map((pop) => (
                  <Badge key={pop} variant="outline">
                    {SERVED_POPULATION_LABELS[pop]}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Cost</p>
              <Badge variant="secondary">{COST_LABELS[cost]}</Badge>
            </div>

            {num_meals_available && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Meals Available
                </p>
                <p className="text-lg font-semibold">
                  {num_meals_available} meals/day
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donations Accepted */}
        {donations_accepted && donations_accepted.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Donations Accepted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {donations_accepted.map((type) => (
                  <Badge key={type} variant="outline">
                    {DONATION_TYPE_LABELS[type]}
                  </Badge>
                ))}
              </div>

              {storage_capacity && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Storage Capacity
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {storage_capacity.refrigerator ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <span>Refrigerator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {storage_capacity.freezer ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <span>Freezer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {storage_capacity.dry_storage ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <span>Dry Storage</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Information */}
      {comments && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{comments}</p>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <p className="text-sm text-gray-500 mt-6 text-center">
        Last updated: {formatDate(last_updated)}
      </p>
    </div>
  );
}
