'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Smartphone } from 'lucide-react';
import { MarketingShell } from '@/components/dubicolt/marketing-shell';
import { DcButton, DcInput } from '@/components/dubicolt/ui';
import { EmptyCartState } from '@/components/cart/empty-cart-state';
import { OrderSuccessState } from '@/components/cart/order-success-state';
import { useCart } from '@/hooks/use-cart';
import { useDubicoltCheckoutMutation, useMpesaStkPushMutation } from '@/lib/api/hooks';
import { formatAmount, formatKshLabel } from '@/lib/currency';

function lineTotal(item: { unitPriceKes: number; quantity: number }) {
  return item.unitPriceKes * item.quantity;
}

export default function CheckoutPage() {
  const { items, updateQuantity, ready, isPending, isLoggedIn } = useCart();
  const checkoutMutation = useDubicoltCheckoutMutation();
  const stkMutation = useMpesaStkPushMutation();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    phone: '',
    address: '',
    deliveryMethod: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
  });

  const subtotal = useMemo(() => items.reduce((s, i) => s + lineTotal(i), 0), [items]);

  if (!ready) {
    return (
      <MarketingShell>
        <div className="flex flex-1 items-center justify-center py-32 text-[#5A6B7D]">
          Loading cart…
        </div>
      </MarketingShell>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <MarketingShell>
        <EmptyCartState />
      </MarketingShell>
    );
  }

  if (orderPlaced) {
    return (
      <MarketingShell>
        <OrderSuccessState orderNumber={orderPlaced} email="" />
      </MarketingShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <MarketingShell>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <p className="dc-label mb-2">Checkout</p>
          <h1 className="dc-heading text-3xl">Review your cart</h1>
          <p className="mt-2 text-sm text-[#5A6B7D]">
            Your items are saved in this browser. Sign in to pay with M-Pesa and track your order.
          </p>

          <div className="mt-8 dc-card divide-y divide-[#EFF8F9] p-5">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#EFF8F9]">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#243247]">{item.name}</p>
                  <p className="text-sm text-[#5A6B7D]">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-[#081F3F]">{formatKshLabel(lineTotal(item))}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 dc-card p-5">
            <div className="flex justify-between text-sm">
              <span className="text-[#5A6B7D]">Subtotal</span>
              <span className="font-bold text-[#081F3F]">KSh {formatAmount(subtotal)}</span>
            </div>
            <DcButton variant="primary" href="/auth/login?redirect=/checkout" className="mt-6 w-full py-3">
              Sign in to checkout
            </DcButton>
            <DcButton variant="outline" href="/auth/register?redirect=/checkout" className="mt-3 w-full py-3">
              Create account
            </DcButton>
          </div>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <p className="dc-label mb-2">Checkout</p>
        <h1 className="dc-heading text-3xl">Complete your order</h1>

        {/* Steps */}
        <div className="mt-6 flex gap-2">
          {['Delivery', 'M-Pesa payment'].map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done || active ? 'bg-[#00BC94] text-[#081F3F]' : 'border border-[#C5D4DC] text-[#5A6B7D]'}`}
                >
                  {n}
                </span>
                <span className={`text-sm font-semibold ${active ? 'text-[#081F3F]' : 'text-[#5A6B7D]'}`}>{label}</span>
                {i < 1 ? <div className="mx-2 h-px w-8 bg-[#C5D4DC]" /> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Cart lines */}
            <div className="dc-card p-5">
              <h2 className="font-bold text-[#081F3F]">Order items ({items.length})</h2>
              <div className="mt-4 divide-y divide-[#EFF8F9]">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#EFF8F9]">
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#243247]">{item.name}</p>
                      <p className="text-sm font-bold text-[#081F3F]">{formatKshLabel(lineTotal(item))}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)} className="flex h-8 w-8 items-center justify-center rounded border border-[#C5D4DC]" disabled={isPending}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)} className="flex h-8 w-8 items-center justify-center rounded border border-[#C5D4DC]" disabled={isPending}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {step >= 1 && (
              <div className="dc-card p-5">
                <h2 className="font-bold text-[#081F3F]">Fulfilment method</h2>
                <div className="mt-4 flex gap-3">
                  {(['DELIVERY', 'PICKUP'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, deliveryMethod: m })}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${form.deliveryMethod === m ? 'border-[#00BC94] bg-[#00BC94]/10 text-[#081F3F]' : 'border-[#C5D4DC] text-[#5A6B7D]'}`}
                    >
                      {m === 'DELIVERY' ? 'Home delivery' : 'Shop pickup'}
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-sm font-semibold text-[#243247]">
                  {form.deliveryMethod === 'DELIVERY' ? 'Delivery address' : 'Pickup details'}
                </label>
                <DcInput
                  className="mt-2"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder={form.deliveryMethod === 'DELIVERY' ? 'Street, area, county' : 'Name for pickup collection'}
                />
              </div>
            )}

            {step >= 2 && (
              <div className="dc-card p-5">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-[#00BC94]" />
                  <h2 className="font-bold text-[#081F3F]">M-Pesa payment</h2>
                </div>
                <p className="mt-2 text-sm text-[#5A6B7D]">Enter your M-Pesa number to receive an STK push.</p>
                <DcInput
                  className="mt-4"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="254712345678"
                />
                {paymentMessage ? <p className="mt-3 text-sm font-semibold text-[#007a62]">{paymentMessage}</p> : null}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="dc-card p-5">
              <h2 className="font-bold text-[#081F3F]">Summary</h2>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-[#5A6B7D]">Subtotal</span>
                <span className="font-bold text-[#081F3F]">KSh {formatAmount(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[#EFF8F9] pt-4">
                <span className="font-bold text-[#243247]">Total</span>
                <span className="text-xl font-bold text-[#081F3F]">KSh {formatAmount(subtotal)}</span>
              </div>
              <DcButton
                variant="primary"
                className="mt-6 w-full py-3"
                disabled={
                  checkoutMutation.isPending ||
                  stkMutation.isPending ||
                  (step === 1 && form.address.trim().length < 4) ||
                  (step === 2 && form.phone.trim().length < 9)
                }
                onClick={async () => {
                  if (step === 1) {
                    try {
                      const res = await checkoutMutation.mutateAsync({
                        deliveryMethod: form.deliveryMethod,
                        deliveryAddress: form.address.trim(),
                      });
                      setOrderId(res.orderId);
                      setStep(2);
                    } catch { /* toast handled elsewhere */ }
                    return;
                  }
                  if (step === 2 && orderId) {
                    try {
                      const res = await stkMutation.mutateAsync({ orderId, phone: form.phone.trim() });
                      setPaymentMessage(res.message);
                      setOrderPlaced(res.orderId);
                    } catch { /* */ }
                  }
                }}
              >
                {step === 1
                  ? checkoutMutation.isPending ? 'Creating order…' : 'Continue to payment'
                  : stkMutation.isPending ? 'Sending STK push…' : 'Pay with M-Pesa'}
              </DcButton>
              <p className="mt-3 text-center text-[11px] text-[#5A6B7D]">
                Secure payment · Price locked at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
