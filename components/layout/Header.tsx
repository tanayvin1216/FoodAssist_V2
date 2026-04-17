'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Shield, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useBranding, useNavigation } from '@/contexts/SettingsContext';
import { useTranslation } from '@/contexts/LocaleContext';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { branding } = useBranding();
  const { navigation: navSettings } = useNavigation();
  const { t } = useTranslation();

  // Sign-in is not a public concept on this site — admin + organization logins
  // live at dedicated URLs reachable from the footer.
  const headerItems = navSettings.headerItems
    .filter((item) => item.enabled && item.showInHeader)
    .sort((a, b) => a.order - b.order);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container flex h-16 items-center justify-between px-6 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-display text-xl tracking-tight text-navy">
            {branding.siteName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {headerItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-navy font-medium'
                    : 'text-body-text hover:text-navy'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle className="hidden md:inline-flex" size="sm" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hidden md:inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium text-navy border border-navy/20 rounded-full hover:bg-navy/5 transition-colors"
                aria-label={t('nav.signIn')}
              >
                {t('nav.signIn')}
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-muted-text">
                {t('nav.signInStaffPartners')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/portal/login" className="flex items-start gap-3 py-2 cursor-pointer">
                  <Building2 className="h-4 w-4 mt-0.5 text-navy" />
                  <div>
                    <p className="text-sm font-medium text-navy">{t('nav.signInOrg')}</p>
                    <p className="text-xs text-muted-text">{t('nav.signInOrgHint')}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/login" className="flex items-start gap-3 py-2 cursor-pointer">
                  <Shield className="h-4 w-4 mt-0.5 text-navy" />
                  <div>
                    <p className="text-sm font-medium text-navy">{t('nav.signInAdmin')}</p>
                    <p className="text-xs text-muted-text">{t('nav.signInAdminHint')}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            className="md:hidden p-2 text-muted-text hover:text-navy transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="container px-6 py-4 flex flex-col gap-1 max-w-5xl mx-auto">
            {headerItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`py-3 text-base transition-colors ${
                    isActive
                      ? 'text-navy font-medium'
                      : 'text-body-text hover:text-navy'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="mt-2 pt-3 border-t border-divider/50 flex flex-col gap-3">
              <LanguageToggle size="sm" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-text mb-1">
                {t('nav.signIn')}
              </p>
              <Link
                href="/portal/login"
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-body-text hover:text-navy flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" /> {t('nav.signInOrg')}
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-body-text hover:text-navy flex items-center gap-2"
              >
                <Shield className="h-4 w-4" /> {t('nav.signInAdmin')}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
