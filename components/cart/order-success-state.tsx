'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { DcButton } from '@/components/dubicolt/ui';

export interface OrderSuccessStateProps {
  orderNumber: string;
  email?: string;
}

export function OrderSuccessState({ orderNumber, email }: OrderSuccessStateProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-[#00BC94]" />
      <h1 className="text-2xl font-bold text-[#081F3F]">Order confirmed</h1>
      <p className="mt-2 text-sm text-[#5A6B7D]">
        Order <span className="font-bold text-[#243247]">#{orderNumber}</span> is being processed.
      </p>
      {email ? (
        <p className="mt-1 text-sm text-[#5A6B7D]">
          Confirmation sent to <span className="font-medium">{email}</span>
        </p>
      ) : null}
      <p className="mt-4 text-xs text-[#5A6B7D]">Track fulfilment milestones in your account.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <DcButton variant="primary" href={`/dashboard/orders/${orderNumber}`}>
          Track order
        </DcButton>
        <DcButton variant="outline" href="/marketplace">
          Continue shopping
        </DcButton>
      </div>
    </div>
  );
}
