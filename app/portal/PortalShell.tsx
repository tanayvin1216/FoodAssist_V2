'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, LayoutDashboard, Users, LogOut, Menu, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { name: 'Edit Profile', href: '/portal/profile', icon: Building2 },
  { name: 'Volunteer Needs', href: '/portal/volunteers', icon: Users },
];

interface PortalShellProps {
  orgName: string;
  userEmail: string;
  children: React.ReactNode;
}

export default function PortalShell({ orgName, userEmail, children }: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const NavContent = () => (
    <>
      <div
        className="flex h-16 items-center px-4 border-b"
        style={{ backgroundColor: '#1B2D3A' }}
      >
        <Link href="/portal" className="flex items-center space-x-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded font-bold text-sm"
            style={{ backgroundColor: '#0D7C8F', color: '#FFFFFF' }}
          >
            FA
          </div>
          <span className="font-semibold text-white">Org Portal</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/portal' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'text-white' : 'hover:bg-[#F5F0EB]'
              )}
              style={isActive ? { backgroundColor: '#0D7C8F' } : { color: '#4A5568' }}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-2" style={{ borderColor: '#C4B8AD' }}>
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium truncate" style={{ color: '#1B2D3A' }}>
            {orgName}
          </p>
          <p className="text-xs truncate" style={{ color: '#8C7E72' }}>
            {userEmail}
          </p>
        </div>
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            size="sm"
            style={{ color: '#4A5568' }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Public Site
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          size="sm"
          style={{ color: '#4A5568' }}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0EB' }}>
      {/* Mobile header */}
      <div
        className="lg:hidden flex items-center justify-between px-4 h-16"
        style={{ backgroundColor: '#1B2D3A' }}
      >
        <Link href="/portal" className="flex items-center space-x-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded font-bold text-sm"
            style={{ backgroundColor: '#0D7C8F', color: '#FFFFFF' }}
          >
            FA
          </div>
          <span className="font-semibold text-white">Org Portal</span>
        </Link>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex flex-col h-full">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
        >
          <NavContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-64">
          <div className="max-w-5xl py-8 px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
