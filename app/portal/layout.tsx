'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { name: 'Edit Profile', href: '/portal/profile', icon: Building2 },
  { name: 'Volunteer Needs', href: '/portal/volunteers', icon: Users },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex h-16 items-center px-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold text-sm">
            FA
          </div>
          <span className="font-semibold text-gray-900">Org Portal</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-white border-b">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold text-sm">
            FA
          </div>
          <span className="font-semibold text-gray-900">Org Portal</span>
        </Link>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="container max-w-5xl py-8 px-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
