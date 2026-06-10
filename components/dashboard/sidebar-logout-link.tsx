'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuthSession } from '@/hooks/use-auth-session';

export function SidebarLogoutLink() {
  const router = useRouter();
  const { logout } = useAuthSession();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#5A6B7D] transition-colors hover:bg-[#EFF8F9] hover:text-[#081F3F]"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      Logout
    </button>
  );
}
