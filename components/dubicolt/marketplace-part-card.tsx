'use client';

import Link from 'next/link';
import { BadgeCheck, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAmount, parseKsh } from '@/lib/currency';
import type { MarketplaceProduct } from '@/lib/domain-types';
import { BRAND } from '@/lib/dubicolt/brand';

function formatKesPrice(value: string | number): string {
  const kes = typeof value === 'number' ? value : parseKsh(String(value));
  return `KES ${formatAmount(kes)}`;
}

function stockBadge(stock: number): { label: string; className: string } {
  if (stock <= 0) {
    return { label: 'Pre-order', className: 'bg-[#DBEAFE] text-[#1D4ED8]' };
  }
  if (stock <= 5) {
    return { label: 'Low stock', className: 'bg-[#FEE2E2] text-[#B91C1C]' };
  }
  return { label: 'In stock', className: 'bg-[#00BC94] text-white' };
}

export function computeFitmentMatch(
  product: MarketplaceProduct,
  vehicle?: { make?: string; model?: string; year?: string },
): number | null {
  if (!vehicle?.make) return null;
  const list = product.compatibleVehicles ?? [];
  if (list.length === 0) return null;

  const year = vehicle.year ? Number(vehicle.year) : null;
  let best = 0;

  for (const fit of list) {
    let score = 40;
    if (fit.make.toLowerCase() !== vehicle.make!.toLowerCase()) continue;
    score += 30;
    if (vehicle.model && fit.model.toLowerCase() === vehicle.model.toLowerCase()) score += 20;
    if (year && year >= fit.yearFrom && year <= fit.yearTo) score += 10;
    best = Math.max(best, Math.min(score, 100));
  }

  return best > 0 ? best : null;
}

export function MarketplacePartCard({
  product,
  href,
  matchPercent,
  onAdd,
}: {
  product: MarketplaceProduct;
  href: string;
  matchPercent?: number | null;
  onAdd?: () => void;
}) {
  const badge = stockBadge(product.stock);
  const inStock = product.stock > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB]/80 bg-white shadow-[0_2px_12px_rgba(8,31,63,0.04)]">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-[#F3F4F6]">
        <span
          className={cn(
            'absolute right-3 top-3 z-10 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
            badge.className,
          )}
        >
          {badge.label}
        </span>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-contain p-5"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#C5D4DC]">
            <Package className="h-10 w-10" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Parts</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#00BC94]">
            {product.vendor || 'OEM'}
          </p>
          {matchPercent != null ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#5A6B7D]">
              <BadgeCheck className="h-3.5 w-3.5 text-[#00BC94]" />
              {matchPercent}% Match
            </span>
          ) : null}
        </div>

        <Link href={href}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#081F3F] hover:text-[#00BC94]">
            {product.name}
          </h3>
        </Link>

        {product.oemNumber ? (
          <p className="mt-1.5 text-xs text-[#9CA3AF]">OEM: {product.oemNumber}</p>
        ) : product.sku ? (
          <p className="mt-1.5 text-xs text-[#9CA3AF]">SKU: {product.sku}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">Price</p>
            <p className="text-lg font-bold tabular-nums text-[#081F3F]">
              {formatKesPrice(product.price_kes)}
            </p>
          </div>
          {inStock && onAdd ? (
            <button
              type="button"
              onClick={onAdd}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND.coldGreen }}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href="/dashboard/sourcing/new"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[#081F3F] text-[#081F3F]"
              aria-label={`Request ${product.name}`}
            >
              <Package className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
