'use client';

import Link from 'next/link';
import { Heart, Utensils } from 'lucide-react';
import { useBranding, useContact, useNavigation } from '@/contexts/SettingsContext';

export function Footer() {
  const { branding } = useBranding();
  const { contact } = useContact();
  const { navigation: navSettings } = useNavigation();

  const footerLinks = navSettings.footerQuickLinks
    .filter((item) => item.enabled && item.showInFooter)
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="content-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                {branding.siteName}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {branding.footerTagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>{contact.organizationName}</li>
              <li>
                {contact.city}, {contact.state}
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          <p className="flex items-center justify-center">
            Made with{' '}
            <Heart className="w-4 h-4 mx-1.5 text-red-400" fill="currentColor" />{' '}
            for {contact.city}
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} {contact.organizationName}
          </p>
        </div>
      </div>
    </footer>
  );
}
