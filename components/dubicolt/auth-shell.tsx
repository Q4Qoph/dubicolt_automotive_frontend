'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import DubicoltLogo from '@/components/DubicoltLogo';
import AuthMarketingPanel from '@/components/auth/auth-marketing-panel';
import { BRAND } from '@/lib/dubicolt/brand';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header
        className="flex h-14 items-center justify-between border-b border-white/10 px-4 sm:px-6 lg:hidden"
        style={{ backgroundColor: BRAND.deepBlue }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Home
        </Link>
        <DubicoltLogo href="/" size="sm" />
        <div className="w-14" aria-hidden />
      </header>

      <div className="flex flex-1">
        <AuthMarketingPanel />

        <div className="flex flex-1 flex-col bg-white">
          <div className="hidden items-center justify-between border-b border-[#EFF8F9] px-8 py-5 lg:flex">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A6B7D] hover:text-[#081F3F] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to home
            </Link>
            <Link
              href="/marketplace"
              className="text-sm font-semibold text-[#00BC94] hover:underline"
            >
              Browse parts
            </Link>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
            <div className="w-full max-w-[420px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
