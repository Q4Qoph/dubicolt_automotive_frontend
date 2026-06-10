'use client';

import { Suspense, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Globe, Menu, Search, Share2, User, Volume2, X } from 'lucide-react';
import DubicoltLogo from '@/components/DubicoltLogo';
import UserAccountMenu from '@/components/UserAccountMenu';
import { useMounted } from '@/hooks/use-mounted';
import { useCurrentUser } from '@/lib/api/hooks';
import { BRAND } from '@/lib/dubicolt/brand';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/marketplace', label: 'Find Parts' },
  { href: '/dashboard/sourcing/new', label: 'Request a Part' },
];

function SiteHeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('search') ?? '');

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const term = q.trim();
    if (term) params.set('search', term);
    else params.delete('search');
    params.delete('page');
    router.replace(params.toString() ? `/marketplace?${params}` : '/marketplace');
  }

  return (
    <form onSubmit={submit} className="hidden w-44 xl:w-56 lg:block">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search parts…"
          className="w-full rounded-full border border-[#E5E7EB] bg-[#F3F4F6] py-2 pl-9 pr-3 text-sm text-[#243247] placeholder:text-[#9CA3AF] focus:border-[#00BC94] focus:outline-none focus:ring-2 focus:ring-[#00BC94]/15"
        />
      </div>
    </form>
  );
}

export function MarketingHeader({
  heroOverlay = false,
  showSearch = false,
}: {
  heroOverlay?: boolean;
  showSearch?: boolean;
}) {
  const pathname = usePathname();
  const mounted = useMounted();
  const { isLoggedIn } = useCurrentUser();
  const [mobileNav, setMobileNav] = useState(false);

  const whiteBar = heroOverlay;

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        whiteBar ? 'border-b border-[#E5E7EB] bg-white' : 'border-b border-white/10',
      )}
      style={whiteBar ? undefined : { backgroundColor: BRAND.deepBlue }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-[72px] items-center gap-4">
          <DubicoltLogo href="/" size="header" onDark={!whiteBar} />

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === '/marketplace' &&
                  (pathname === '/' || pathname.startsWith('/marketplace')));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'pb-0.5 text-sm font-semibold transition-colors',
                    whiteBar
                      ? active
                        ? 'border-b-2 border-[#00BC94] text-[#081F3F]'
                        : 'border-b-2 border-transparent text-[#5A6B7D] hover:text-[#081F3F]'
                      : active
                        ? 'border-b-2 border-[#00BC94] text-white'
                        : 'border-b-2 border-transparent text-white hover:text-[#00BC94]',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {showSearch ? (
              <Suspense
                fallback={
                  <div className="hidden h-10 w-44 animate-pulse rounded-full bg-[#F3F4F6] lg:block xl:w-56" />
                }
              >
                <SiteHeaderSearch />
              </Suspense>
            ) : null}

            {mounted && isLoggedIn ? (
              <UserAccountMenu compact />
            ) : mounted ? (
              <Link
                href="/auth/login"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90',
                  !whiteBar && 'rounded-lg shadow-md',
                )}
                style={{ backgroundColor: BRAND.deepBlue }}
              >
                <User className="h-4 w-4" />
                Account
              </Link>
            ) : (
              <div
                className={cn(
                  'h-10 w-28 animate-pulse rounded-full',
                  whiteBar ? 'bg-[#F3F4F6]' : 'rounded-lg bg-white/20',
                )}
              />
            )}

            <button
              type="button"
              className={cn(
                'rounded-lg p-2 lg:hidden',
                whiteBar ? 'text-[#081F3F]' : 'text-white drop-shadow-sm',
              )}
              onClick={() => setMobileNav((o) => !o)}
              aria-label="Menu"
            >
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileNav ? (
        <div
          className={cn(
            'border-t px-4 py-3 lg:hidden',
            whiteBar ? 'border-[#E5E7EB] bg-white' : 'border-white/10 bg-[#081F3F]/95 backdrop-blur-sm',
          )}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block py-2.5 text-sm font-semibold',
                whiteBar ? 'text-[#081F3F]' : 'text-white',
              )}
              onClick={() => setMobileNav(false)}
            >
              {item.label}
            </Link>
          ))}
          {!isLoggedIn && mounted ? (
            <Link
              href="/auth/login"
              className="mt-2 block py-2.5 text-sm font-semibold text-[#00BC94]"
              onClick={() => setMobileNav(false)}
            >
              Account
            </Link>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="text-white" style={{ backgroundColor: BRAND.deepBlue }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <DubicoltLogo href="/" size="lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white">
              Advancing the automotive spare parts ecosystem in East Africa through precision
              technology and superior logistics integration.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-white">
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><Link href="/marketplace" className="hover:text-[#00BC94]">OEM Status</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-[#00BC94]">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">HQ Address</h4>
            <address className="not-italic text-sm leading-relaxed text-white">
              Dubicolt Tech Plaza<br />
              Enterprise Road, Industrial Area<br />
              Nairobi, Kenya
            </address>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white">
            © {year} Dubicolt Automotive Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40">
              <Volume2 className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40">
              <Share2 className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40">
              <Globe className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function MarketingShell({
  children,
  heroOverlay = false,
}: {
  children: ReactNode;
  heroOverlay?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader heroOverlay={heroOverlay} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
