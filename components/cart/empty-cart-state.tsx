'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { DcButton } from '@/components/dubicolt/ui';
import { useIsLoggedIn } from '@/hooks/use-cart';

export function EmptyCartState() {
  const isLoggedIn = useIsLoggedIn();

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF8F9]">
        <ShoppingBag className="h-8 w-8 text-[#5A6B7D]" />
      </div>
      <h1 className="text-xl font-bold text-[#081F3F]">Your cart is empty</h1>
      <p className="mt-2 text-sm text-[#5A6B7D]">Browse the parts catalog and add items to checkout.</p>
      <DcButton variant="primary" href="/marketplace" className="mt-6">
        Browse parts
      </DcButton>
      {!isLoggedIn ? (
        <p className="mt-6 text-sm text-[#5A6B7D]">
          Have an account?{' '}
          <Link href="/auth/login?redirect=/checkout" className="font-bold text-[#00BC94] hover:underline">
            Sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
