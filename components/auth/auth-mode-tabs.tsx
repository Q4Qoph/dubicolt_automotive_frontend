'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const tabs = [
  { href: '/auth/login', label: 'Sign in' },
  { href: '/auth/register', label: 'Create account' },
] as const;

export default function AuthModeTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <div className="mb-8 flex gap-1 border-b border-[#EFF8F9]">
      {tabs.map(({ href, label }) => {
        const active = pathname === href;
        const dest = query ? `${href}?${query}` : href;
        return (
          <Link
            key={href}
            href={dest}
            className={`relative px-4 pb-3 text-sm font-bold transition-colors ${
              active
                ? 'text-[#081F3F]'
                : 'text-[#5A6B7D] hover:text-[#243247]'
            }`}
          >
            {label}
            {active ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#00BC94]" />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
