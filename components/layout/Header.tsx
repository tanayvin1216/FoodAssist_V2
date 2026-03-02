'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Utensils } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Find Food', href: '/' },
  { name: 'Volunteer', href: '/volunteers' },
  { name: 'Organizations', href: '/portal/dashboard' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center">
            <Utensils className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-stone-800 hidden sm:block">
            FoodAssist
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-100 text-stone-800'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sign In */}
        <Link
          href="/login"
          className="hidden md:block px-4 py-2 text-stone-600 hover:text-stone-800 font-medium text-sm transition-colors"
        >
          Sign In
        </Link>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <Menu className="h-5 w-5 text-stone-600" />
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl h-auto pb-8">
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-6 mt-2" />
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <hr className="my-2 border-stone-200" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-3.5 text-base font-medium text-stone-500 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Sign In
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
