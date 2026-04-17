'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useBranding, useNavigation } from '@/contexts/SettingsContext';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { branding } = useBranding();
  const { navigation: navSettings } = useNavigation();

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

        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(!open)}
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
          </nav>
        </div>
      )}
    </header>
  );
}
