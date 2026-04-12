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
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />

      <div className="content-container py-16 md:py-24 relative">
        <div className="max-w-xl mx-auto text-center">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/20">
            <MapPin className="w-4 h-4" />
            <span>{hero.locationBadge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            {hero.headline}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-md mx-auto">
            {hero.subtitle}
          </p>

          {/* Quick Stats */}
          {hero.showStats && (
            <div className="flex flex-wrap justify-center gap-3">
              <div className="px-5 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                <span className="font-bold text-2xl text-white">
                  {organizationCount}
                </span>
                <span className="text-white/80 ml-2 text-sm">
                  {hero.statsLabels.locations}
                </span>
              </div>
              <div className="px-5 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                <span className="font-bold text-2xl text-white">{townCount}</span>
                <span className="text-white/80 ml-2 text-sm">
                  {hero.statsLabels.towns}
                </span>
              </div>
              <div className="px-5 py-3 bg-emerald-500/80 backdrop-blur-sm rounded-2xl">
                <span className="font-bold text-2xl text-white">Free</span>
                <span className="text-white/90 ml-2 text-sm">
                  {hero.statsLabels.services}
                </span>
              </div>
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
    <section className="content-container pb-12">
      <div className="max-w-xl mx-auto">
        <div className="bg-slate-700 rounded-3xl p-8 text-center text-white shadow-xl">
          <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">{emergency.title}</h2>
          <p className="text-slate-300 text-sm mb-6 max-w-xs mx-auto">
            {emergency.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {emergency.showPrimaryPhone && (
              <a
                href={`tel:${contact.emergencyPhone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm"
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
                className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-500 transition-colors text-sm"
              >
                {contact.externalHelpLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
