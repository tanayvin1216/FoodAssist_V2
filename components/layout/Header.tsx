'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Utensils } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useBranding, useNavigation } from '@/contexts/SettingsContext';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { branding } = useBranding();
  const { navigation: navSettings } = useNavigation();

  const headerItems = navSettings.headerItems
    .filter((item) => item.enabled && item.showInHeader)
    .sort((a, b) => a.order - b.order);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center">
            <Utensils className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800 hidden sm:block">
            {branding.siteName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {headerItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-800'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sign In */}
        {navSettings.showSignIn && (
          <Link
            href="/login"
            className="hidden md:block px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
          >
            {navSettings.signInLabel}
          </Link>
        )}

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <Menu className="h-5 w-5 text-slate-600" />
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl h-auto pb-8">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6 mt-2" />
            <nav className="flex flex-col gap-1">
              {headerItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              {navSettings.showSignIn && (
                <>
                  <hr className="my-2 border-slate-100" />
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3.5 text-base font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    {navSettings.signInLabel}
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
