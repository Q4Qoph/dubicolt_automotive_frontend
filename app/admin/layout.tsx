'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/lib/api/hooks';
import { LayoutDashboard, Package, ShoppingCart, FileText, Tags } from 'lucide-react';
import DubicoltLogo from '@/components/DubicoltLogo';
import { SidebarLogoutLink } from '@/components/dashboard/sidebar-logout-link';
import UserAccountMenu from '@/components/UserAccountMenu';
import { BRAND } from '@/lib/dubicolt/brand';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Part requests', href: '/admin/sourcing', icon: FileText },
  { label: 'Inventory', href: '/admin/inventory', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { displayName, company, initials, role, mounted, isLoading } = useCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#EFF8F9]">
      <header
        className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-white/10 px-4 sm:px-6"
        style={{ backgroundColor: BRAND.deepBlue }}
      >
        <DubicoltLogo href="/admin" size="sm" />
        <span className="hidden text-xs font-bold uppercase tracking-wider text-[#00BC94] sm:inline">
          Admin workspace
        </span>
        <div className="ml-auto">
          <UserAccountMenu />
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="fixed bottom-0 left-0 top-14 z-10 flex w-64 flex-col bg-white shadow-[4px_0_24px_rgba(8,31,63,0.06)]">
          <div className="border-b border-[#EFF8F9] p-4">
            {!mounted || isLoading ? (
              <div className="h-10 animate-pulse rounded-lg bg-[#EFF8F9]" />
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ backgroundColor: BRAND.deepBlue, color: BRAND.coldGreen }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#243247]">{displayName}</p>
                  <p className="truncate text-xs text-[#5A6B7D]">
                    {role === 'admin' ? 'Administrator' : company || 'Staff'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                    active ? 'text-[#081F3F]' : 'text-[#5A6B7D] hover:bg-[#EFF8F9]'
                  }`}
                  style={active ? { backgroundColor: `${BRAND.coldGreen}22`, borderLeft: `3px solid ${BRAND.coldGreen}` } : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-[#EFF8F9] p-3">
            <SidebarLogoutLink />
          </div>
        </aside>

        <main className="ml-64 min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
