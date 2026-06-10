import { Suspense } from 'react';
import { AuthShell } from '@/components/dubicolt/auth-shell';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthShell>
      <Suspense fallback={<div className="py-12 text-center text-sm text-[#5A6B7D]">Loading…</div>}>
        {children}
      </Suspense>
    </AuthShell>
  );
}
