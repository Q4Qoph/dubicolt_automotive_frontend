'use client';

import Link from 'next/link';
import { Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAmount, parseKsh } from '@/lib/currency';
import type { PartCardData } from './part-card';

function formatKesLabel(value: string | number): string {
  const kes = typeof value === 'number' ? value : parseKsh(String(value));
  return `KES ${formatAmount(kes)}`;
}

export function LandingPartCard({
  part,
  onAdd,
  className,
}: {
  part: PartCardData;
  onAdd?: () => void;
  className?: string;
}) {
  const link = `/product/${part.productId}`;
  const lowStock = part.stock > 0 && part.stock <= 5;
  const inStock = part.stock > 0;

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB]/80 bg-white',
        className,
      )}
    >
      <Link href={link} className="relative block aspect-square overflow-hidden bg-[#F3F4F6]">
        <div className="absolute left-3 top-3 z-10">
          {inStock ? (
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                lowStock ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#00BC94] text-white',
              )}
            >
              {lowStock ? 'LOW STOCK' : 'IN STOCK'}
            </span>
          ) : null}
        </div>
        {part.image_url ? (
          <img
            src={part.image_url}
            alt={part.name}
            className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#C5D4DC]/60">
            <Package className="h-12 w-12" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <Link href={link}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#081F3F]">{part.name}</h3>
        </Link>
        <p className="mt-1 text-xs text-[#5A6B7D]">Est. Delivery: 48 Hours</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="text-base font-bold tabular-nums text-[#081F3F]">{formatKesLabel(part.price_kes)}</p>
          {onAdd ? (
            <button
              type="button"
              onClick={onAdd}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00BC94] text-white shadow-sm transition-all hover:brightness-105"
              aria-label={`Add ${part.name} to cart`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              href="/marketplace"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00BC94] text-white"
              aria-label={`View ${part.name}`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
