import type { CheckoutSummary } from '@/lib/contracts';

export function buildCheckoutSummaryKes(subtotalKes: number): CheckoutSummary {
  const subtotal = Math.round(subtotalKes);
  return {
    subtotal,
    shipping: 0,
    customs: 0,
    insurance: 0,
    total: subtotal,
    currency: 'KES',
  };
}
