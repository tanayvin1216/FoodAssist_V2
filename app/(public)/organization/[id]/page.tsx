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
    <div className="bg-slate-50 min-h-screen">
      <div className="container px-4 py-8 max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Directory
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{name}</h1>
            {spanish_available && (
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-full">
                Español disponible
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {assistance_types.map((type) => (
              <span
                key={type}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg"
              >
                {ASSISTANCE_TYPE_LABELS[type]}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Contact Information</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">{address}</p>
                  <p className="text-slate-500">
                    {town}, NC {zip}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-500" />
                <a
                  href={`tel:${phone}`}
                  className="font-medium text-slate-700 hover:text-slate-900"
                >
                  {formatPhone(phone)}
                </a>
              </div>

              {contact_name && (
                <div className="text-sm text-slate-500">
                  Contact: {contact_name}
                </div>
              )}

              {email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <a
                    href={`mailto:${email}`}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    {email}
                  </a>
                </div>
              )}

              {website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-800"
                  >
                    Visit Website
                  </a>
                </div>
              )}

              {facebook && (
                <div className="flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-slate-400" />
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-800"
                  >
                    Facebook Page
                  </a>
                </div>
              )}

              <div className="pt-2">
                <a
                  href={getDirectionsUrl(address, town, zip)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </button>
                </a>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-800">Operating Hours</h2>
            </div>
            <div className="p-5">
              <div className="space-y-2">
                {operating_hours?.map((hours) => (
                  <div
                    key={hours.day}
                    className="flex justify-between items-center py-1.5"
                  >
                    <span className="font-medium text-slate-700">{DAY_LABELS[hours.day]}</span>
                    <span
                      className={
                        hours.is_closed ? 'text-slate-400' : 'text-slate-600'
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
                <p className="mt-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {hours_notes}
                </p>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Services</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">
                  Population Served
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {who_served?.map((pop) => (
                    <span
                      key={pop}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg"
                    >
                      {SERVED_POPULATION_LABELS[pop]}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Cost</p>
                <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg">
                  {COST_LABELS[cost]}
                </span>
              </div>

              {num_meals_available && (
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">
                    Meals Available
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {num_meals_available} meals/day
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Donations Accepted */}
          {donations_accepted && donations_accepted.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Donations Accepted</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {donations_accepted.map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg"
                    >
                      {DONATION_TYPE_LABELS[type]}
                    </span>
                  ))}
                </div>

                {storage_capacity && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">
                      Storage Capacity
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        {storage_capacity.refrigerator ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300" />
                        )}
                        <span className="text-slate-600">Refrigerator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {storage_capacity.freezer ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300" />
                        )}
                        <span className="text-slate-600">Freezer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {storage_capacity.dry_storage ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300" />
                        )}
                        <span className="text-slate-600">Dry Storage</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {comments && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Additional Information</h2>
              </div>
              <div className="p-5">
                <p className="text-slate-600">{comments}</p>
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <p className="text-sm text-slate-400 mt-6 text-center">
          Last updated: {formatDate(last_updated)}
        </p>
      </div>
    </div>
  );
}
