'use client';

import type { ReactNode } from 'react';

export function CheckoutMessageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 bg-[#f8f9ff] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">{children}</div>
    </main>
  );
}
