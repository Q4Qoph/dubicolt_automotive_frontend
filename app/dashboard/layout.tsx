'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Plus, ShoppingBag, Store } from 'lucide-react';
import DubicoltLogo from '@/components/DubicoltLogo';
import { SidebarLogoutLink } from '@/components/dashboard/sidebar-logout-link';
import UserAccountMenu from '@/components/UserAccountMenu';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useCurrentUser } from '@/lib/api/hooks';
import { BRAND } from '@/lib/dubicolt/brand';

const nav = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Parts catalog', href: '/marketplace', icon: Store },
  { label: 'My orders', href: '/dashboard/orders', icon: ShoppingBag },
  { label: 'Part requests', href: '/dashboard/sourcing', icon: Package },
];

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, isLoggedIn } = useAuthSession();
  const { displayName, user, initials } = useCurrentUser();

  useEffect(() => {
    if (ready && !isLoggedIn) router.replace('/auth/login');
  }, [ready, isLoggedIn, router]);

  if (!ready || !isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFF8F9] text-sm text-[#5A6B7D]">
        Loading account…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#EFF8F9]">
      <header
        className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-white/10 px-4 sm:px-6"
        style={{ backgroundColor: BRAND.deepBlue }}
      >
        <DubicoltLogo href="/" size="sm" />
        <div className="flex-1" />
        <UserAccountMenu />
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="fixed bottom-0 left-0 top-14 z-10 flex w-64 flex-col bg-white shadow-[4px_0_24px_rgba(8,31,63,0.06)]">
          <div className="border-b border-[#EFF8F9] p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: BRAND.coldGreen, color: BRAND.deepBlue }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#243247]">{displayName}</p>
                <p className="truncate text-xs text-[#5A6B7D]">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {nav.map(({ label, href, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== '/dashboard' && href !== '/marketplace' && pathname.startsWith(href)) ||
                (href === '/marketplace' && pathname.startsWith('/marketplace'));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'text-[#081F3F]'
                      : 'text-[#5A6B7D] hover:bg-[#EFF8F9] hover:text-[#243247]'
                  }`}
                  style={active ? { backgroundColor: `${BRAND.coldGreen}22`, borderLeft: `3px solid ${BRAND.coldGreen}` } : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 space-y-2 border-t border-[#EFF8F9] p-3">
            <Link
              href="/dashboard/sourcing/new"
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-[#081F3F] transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND.coldGreen }}
            >
              <Plus className="h-4 w-4" />
              Request a part
            </Link>
            <SidebarLogoutLink />
          </div>
        </aside>

        <main className="ml-64 min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
