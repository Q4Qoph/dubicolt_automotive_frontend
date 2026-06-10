'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ContinueToDashboardButton({ label = 'Sign in to continue' }: { label?: string }) {
  return (
    <Link
      href="/auth/login"
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#081F3F] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0a2850]"
    >
      {label}
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}
