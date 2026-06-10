'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import DubicoltLogo from '@/components/DubicoltLogo';
import { MarketingHeader } from '@/components/dubicolt/marketing-shell';
import { BRAND } from '@/lib/dubicolt/brand';

export function MarketplaceFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="text-white" style={{ backgroundColor: BRAND.deepBlue }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <DubicoltLogo href="/" size="md" onDark />
          <p className="mt-3 text-xs text-white/80">
            © {year} Dubicolt Automotive Technologies. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="cursor-default hover:text-white">Privacy Policy</span>
          <span className="cursor-default hover:text-white">Terms of Service</span>
          <Link href="/marketplace" className="hover:text-white">OEM Guide</Link>
          <Link href="/dashboard/orders" className="hover:text-white">Contact Support</Link>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <MarketingHeader heroOverlay showSearch />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
