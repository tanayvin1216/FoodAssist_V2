'use client';

import { Phone, MapPin, Heart, AlertCircle } from 'lucide-react';
import {
  useHeroSettings,
  useEmergencySettings,
  useContact,
} from '@/contexts/SettingsContext';

interface HomeContentProps {
  organizationCount: number;
  townCount: number;
}

const iconMap = {
  heart: Heart,
  phone: Phone,
  alert: AlertCircle,
};

export function HeroSection({ organizationCount, townCount }: HomeContentProps) {
  const { hero } = useHeroSettings();

  return (
    <section className="relative min-h-[420px] md:min-h-[480px] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-bg.jpg)', backgroundColor: '#1E3A5F' }}
      />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/30" />
      <div className="container px-6 pb-24 pt-24 md:pb-28 md:pt-32 relative text-center max-w-5xl mx-auto">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-medium text-white/70 mb-4 tracking-wide uppercase">
            <MapPin className="w-3.5 h-3.5 inline mr-1.5 relative -top-px" />
            {hero.locationBadge}
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] text-white leading-[1.1] mb-6">
            {hero.headline}
          </h1>
          <p className="text-lg text-white/80 max-w-lg mx-auto mb-10">
            {hero.subtitle}
          </p>
          {hero.showStats && (
            <div className="flex items-center justify-center gap-5 text-sm text-white/70">
              <span>
                <strong className="text-white font-semibold">{organizationCount}</strong>{' '}
                {hero.statsLabels.locations}
              </span>
              <span className="w-px h-4 bg-white/20" />
              <span>
                <strong className="text-white font-semibold">{townCount}</strong>{' '}
                {hero.statsLabels.towns}
              </span>
              <span className="w-px h-4 bg-white/20" />
              <span>
                <strong className="text-white font-semibold">Free</strong>{' '}
                {hero.statsLabels.services}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function EmergencySection() {
  const { emergency } = useEmergencySettings();
  const { contact } = useContact();

  if (!emergency.enabled) {
    return null;
  }

  const Icon = iconMap[emergency.icon];

  return (
    <section className="container px-6 pb-16">
      <div className="max-w-xl">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="border-l-4 border-amber-400 p-6">
            <p className="text-base font-semibold text-navy mb-2">
              {emergency.title}
            </p>
            <p className="text-sm text-muted-text mb-5">
              {emergency.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {emergency.showPrimaryPhone && (
                <a
                  href={`tel:${contact.emergencyPhone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium text-white bg-navy hover:bg-navy-light transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {contact.emergencyPhoneDisplay}
                </a>
              )}
              {emergency.showExternalHelp && (
                <a
                  href={contact.externalHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium text-navy border border-navy hover:bg-navy/5 transition-colors"
                >
                  {contact.externalHelpLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
