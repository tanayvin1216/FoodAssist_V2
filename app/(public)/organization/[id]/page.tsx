/**
 * Organization detail page — Server Component.
 * Fetches a single active organization by id from Supabase.
 * Calls notFound() when the id is not found (PGRST116) or the org is inactive.
 */
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
import { createClient } from '@/lib/supabase/server';
import { getOrganizationById } from '@/lib/supabase/queries';
import {
  SERVED_POPULATION_LABELS,
  COST_LABELS,
} from '@/lib/utils/constants';
import {
  formatPhone,
  formatTime,
  getDirectionsUrl,
  formatDate,
} from '@/lib/utils/formatters';
import { getServerTranslator } from '@/lib/i18n/server';
import type { MessageKey } from '@/lib/i18n/dictionary';

export const revalidate = 3600;

interface OrganizationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const [organization, { t, locale }] = await Promise.all([
    getOrganizationById(supabase, id),
    getServerTranslator(),
  ]);

  if (!organization || !organization.is_active) {
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
    <div className="min-h-screen">
      <div className="container px-6 py-10 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-text hover:text-navy mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('org.emergencyBack')}
        </Link>

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="font-display text-3xl md:text-4xl text-navy">{name}</h1>
            {spanish_available && (
              <span className="text-navy bg-tag-bg rounded-full px-2.5 py-1 text-xs">{t('org.spanishSpoken')}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {assistance_types.map((type) => (
              <span
                key={type}
                className="text-navy bg-tag-bg rounded-full px-2.5 py-1 text-xs"
              >
                {t(`assistance.${type}` as MessageKey)}
              </span>
            ))}
          </div>
        </div>

        {/* Contact - the only elevated card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-text mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy">{address}</p>
                <p className="text-sm text-body-text">{town}, NC {zip}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-text" />
              <a
                href={`tel:${phone}`}
                className="text-sm font-medium text-navy hover:text-navy-light transition-colors"
              >
                {formatPhone(phone)}
              </a>
            </div>

            {contact_name && (
              <p className="text-sm text-body-text pl-7">
                {t('org.contact')}: {contact_name}
              </p>
            )}

            {email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-text" />
                <a href={`mailto:${email}`} className="text-sm text-body-text hover:text-navy-light transition-colors">
                  {email}
                </a>
              </div>
            )}

            <div className="flex items-center gap-4 pl-7">
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-text hover:text-navy-light transition-colors inline-flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {t('org.website')}
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-text hover:text-navy-light transition-colors inline-flex items-center gap-1">
                  <Facebook className="w-3.5 h-3.5" />
                  {t('org.facebook')}
                </a>
              )}
            </div>

            <a
              href={getDirectionsUrl(address, town, zip)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full rounded-2xl py-3 px-5 text-white bg-navy hover:bg-navy-light transition-colors flex items-center gap-3 text-left"
              aria-label={`${t('org.getDirections')}: ${address ? address + ', ' : ''}${town}${zip ? ' ' + zip : ''}`}
            >
              <Navigation className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase tracking-wider text-white/60">
                  {t('org.getDirections')}
                </span>
                <span className="block text-sm font-medium truncate">
                  {[address, town, zip].filter(Boolean).join(', ') || t('hero.locationBadge')}
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* Remaining content flows naturally */}
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-text" />
              <h2 className="text-muted-text text-xs uppercase tracking-wider">{t('org.hours')}</h2>
            </div>
            <div className="space-y-2">
              {operating_hours?.map((hours) => (
                <div key={hours.day} className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium text-navy">{t(`day.${hours.day}` as MessageKey)}</span>
                  <span className={`text-sm ${hours.is_closed ? 'text-muted-text' : 'text-body-text'}`}>
                    {hours.is_closed
                      ? t('org.dayClosed')
                      : `${formatTime(hours.open_time ?? '')} - ${formatTime(hours.close_time ?? '')}`}
                  </span>
                </div>
              ))}
            </div>
            {hours_notes && (
              <p className="mt-3 text-sm text-body-text bg-gray-50 rounded-xl p-3">
                {hours_notes}
              </p>
            )}
          </section>

          <hr className="border-divider" />

          <section>
            <h2 className="text-muted-text text-xs uppercase tracking-wider mb-4">{t('org.services')}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-text mb-2">{t('org.whoServed')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {who_served?.map((pop) => (
                    <span key={pop} className="text-navy bg-tag-bg rounded-full px-2.5 py-1 text-xs">
                      {SERVED_POPULATION_LABELS[pop]}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-text mb-2">
                  {locale === 'es' ? 'Costo' : 'Cost'}
                </p>
                <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full">
                  {COST_LABELS[cost]}
                </span>
              </div>
              {num_meals_available && (
                <div>
                  <p className="text-xs text-muted-text mb-2">
                    {locale === 'es' ? 'Comidas disponibles' : 'Meals Available'}
                  </p>
                  <p className="text-lg font-semibold text-navy">
                    {num_meals_available} {locale === 'es' ? 'comidas/día' : 'meals/day'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {donations_accepted && donations_accepted.length > 0 && (
            <>
              <hr className="border-divider" />
              <section>
                <h2 className="text-muted-text text-xs uppercase tracking-wider mb-4">{t('org.donationsAccepted')}</h2>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {donations_accepted.map((type) => (
                    <span key={type} className="text-navy bg-tag-bg rounded-full px-2.5 py-1 text-xs">
                      {t(`donation.${type}` as MessageKey)}
                    </span>
                  ))}
                </div>
                {storage_capacity && (
                  <div>
                    <p className="text-xs text-muted-text mb-2">{t('org.storage')}</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        {storage_capacity.refrigerator ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className="text-body-text">{locale === 'es' ? 'Refrigerador' : 'Refrigerator'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {storage_capacity.freezer ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className="text-body-text">{locale === 'es' ? 'Congelador' : 'Freezer'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {storage_capacity.dry_storage ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className="text-body-text">{locale === 'es' ? 'Almacenamiento seco' : 'Dry Storage'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {comments && (
            <>
              <hr className="border-divider" />
              <section>
                <h2 className="text-muted-text text-xs uppercase tracking-wider mb-3">{t('org.additionalNotes')}</h2>
                <p className="text-sm text-body-text">{comments}</p>
              </section>
            </>
          )}
        </div>

        <p className="text-xs text-muted-text mt-10 text-center">
          Last updated: {formatDate(last_updated)}
        </p>
      </div>
    </div>
  );
}
