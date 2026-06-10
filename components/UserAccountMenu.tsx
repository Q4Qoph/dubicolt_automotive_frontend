'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Shield, User } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { useCurrentUser, useLogoutMutation } from '@/lib/api/hooks';
import { clearAuthSession } from '@/lib/auth-session';
import { BRAND } from '@/lib/dubicolt/brand';

const avatarButtonClass =
  'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#00BC94]/40 focus:ring-offset-1';

export default function UserAccountMenu({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, displayName, dashboardHref, initials, isLoading } = useCurrentUser();
  const onAdmin = pathname.startsWith('/admin');
  const onDashboard = pathname.startsWith('/dashboard');
  const mounted = useMounted();
  const logout = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onClickOutside);
      return () => document.removeEventListener('mousedown', onClickOutside);
    }
  }, [open]);

  if (!mounted || isLoading) {
    return (
      <div
        className="w-10 h-10 rounded-full bg-[#C5D4DC] animate-pulse shrink-0"
        aria-hidden
      />
    );
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } catch {
      /* still clear local session */
    }
    clearAuthSession();
    setOpen(false);
    router.push('/auth/login');
  }

  const avatar = (
    <span className={avatarButtonClass} style={{ backgroundColor: BRAND.deepBlue }}>
      {initials}
    </span>
  );

  if (compact) {
    return (
      <Link href={dashboardHref} aria-label={`${displayName} account`}>
        {avatar}
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full"
        aria-expanded={open}
        aria-label={`${displayName} account menu`}
      >
        {avatar}
      </button>
      {open ? (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#C5D4DC] rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-[#EFF8F9]">
            <p className="text-sm font-bold text-[#081F3F] truncate">{displayName}</p>
            <p className="text-xs text-[#5A6B7D] truncate mt-0.5">{user.email}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#00BC94] mt-2">
              {user.role === 'admin' ? 'Administrator' : 'Buyer account'}
            </p>
          </div>
          {user.role === 'admin' && !onAdmin ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#243247] hover:bg-[#EFF8F9]"
              onClick={() => setOpen(false)}
            >
              <Shield className="w-4 h-4" />
              Admin dashboard
            </Link>
          ) : null}
          {!onDashboard ? (
            <Link
              href={dashboardHref}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#243247] hover:bg-[#EFF8F9]"
              onClick={() => setOpen(false)}
            >
              <User className="w-4 h-4" />
              My dashboard
            </Link>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
