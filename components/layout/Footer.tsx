'use client';

import Link from 'next/link';
import { useBranding, useContact, useNavigation } from '@/contexts/SettingsContext';
import { useTranslation } from '@/contexts/LocaleContext';

export function Footer() {
  const { branding } = useBranding();
  const { contact } = useContact();
  const { navigation: navSettings } = useNavigation();
  const { t } = useTranslation();

  const footerLinks = navSettings.footerQuickLinks
    .filter((item) => item.enabled && item.showInFooter)
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="bg-navy">
      <div className="container px-6 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <span className="font-display text-lg text-white">
              {branding.siteName}
            </span>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-xs">
              {branding.footerTagline}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-4">
              {t('footer.quickLinks')}
            </p>
            <ul className="space-y-3">
              {footerLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-4">
              {t('footer.contact')}
            </p>
            <ul className="space-y-3 text-sm text-white/60">
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

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} {contact.organizationName}</p>
          <div className="flex items-center gap-5">
            <Link
              href="/portal/login"
              className="hover:text-white transition-colors"
            >
              {t('footer.orgSignIn')}
            </Link>
            <span className="h-3 w-px bg-white/20" aria-hidden />
            <Link
              href="/admin/login"
              className="hover:text-white transition-colors"
            >
              {t('footer.adminSignIn')}
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/30">
          Developed by{' '}
          <a
            href="https://tanayvin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Tanay Vinaykya
          </a>
        </div>
      </div>
    </footer>
  );
}
