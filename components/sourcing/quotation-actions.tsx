'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DcButton, DcInput } from '@/components/dubicolt/ui';
import { useAcceptQuotationMutation, useMpesaStkPushMutation } from '@/lib/api/hooks';

export function QuotationActions({
  quoteId,
  priceLabel,
  canAccept,
}: {
  quoteId: string;
  priceLabel: string;
  canAccept: boolean;
}) {
  const router = useRouter();
  const accept = useAcceptQuotationMutation();
  const stk = useMpesaStkPushMutation();
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!canAccept) return null;

  async function handleAccept() {
    setMessage(null);
    try {
      const res = await accept.mutateAsync(quoteId);
      setOrderId(res.orderId);
      setMessage(`Quotation accepted. Order ${res.orderId} created. Pay with M-Pesa to confirm.`);
    } catch {
      setMessage('Could not accept quotation. It may have expired.');
    }
  }

  async function handlePay() {
    if (!orderId || !phone.trim()) return;
    setMessage(null);
    try {
      const res = await stk.mutateAsync({ orderId, phone: phone.trim() });
      setMessage(res.message);
      router.push(`/dashboard/orders/${orderId}`);
    } catch {
      setMessage('Payment request failed. Check your phone number and try again.');
    }
  }

  return (
    <div className="mt-4 border-t border-[#EFF8F9] pt-4">
      <p className="mb-3 text-sm font-bold text-[#081F3F]">Accept and pay {priceLabel}</p>
      {!orderId ? (
        <DcButton variant="secondary" onClick={handleAccept} disabled={accept.isPending}>
          {accept.isPending ? 'Accepting…' : 'Accept quotation'}
        </DcButton>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="dc-label mb-1 block">M-Pesa phone</label>
            <DcInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XX XXX XXX"
            />
          </div>
          <DcButton variant="primary" onClick={handlePay} disabled={stk.isPending}>
            {stk.isPending ? 'Sending…' : 'Pay with M-Pesa'}
          </DcButton>
        </div>
      )}
      {message ? <p className="mt-3 text-sm text-[#5A6B7D]">{message}</p> : null}
    </div>
  );
}
