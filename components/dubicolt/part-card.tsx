'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatKshLabel } from '@/lib/currency';
import { DcBadge, DcButton } from './ui';

export interface PartCardData {
  productId: string;
  name: string;
  image_url: string;
  category: string;
  price_kes: string;
  stock: number;
  brand?: string;
}

export function PartCard({
  part,
  href,
  footer,
  onAdd,
  className,
}: {
  part: PartCardData;
  href?: string;
  footer?: ReactNode;
  onAdd?: () => void;
  className?: string;
}) {
  const link = href ?? `/product/${part.productId}`;
  const inStock = part.stock > 0;

  return (
    <article
      className={cn(
        'group dc-card dc-card-hover flex flex-col overflow-hidden',
        className,
      )}
    >
      <Link
        href={link}
        className="relative block aspect-[4/3] overflow-hidden bg-[#EFF8F9]"
      >
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          <DcBadge tone="ice">{part.category}</DcBadge>
          {inStock ? (
            <DcBadge tone="success">In stock</DcBadge>
          ) : (
            <DcBadge tone="warning">Sourcing</DcBadge>
          )}
        </div>
        {part.image_url ? (
          <img
            src={part.image_url}
            alt={part.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#C5D4DC]/60">
            <Package className="h-12 w-12" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-3">
        {part.brand ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7D]">{part.brand}</p>
        ) : null}
        <Link href={link}>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[#243247] transition-colors group-hover:text-[#081F3F]">
            {part.name}
          </h3>
        </Link>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold tabular-nums text-[#081F3F]">{formatKshLabel(part.price_kes)}</p>
          <p className="text-[11px] font-medium text-[#5A6B7D]">
            {inStock ? `${part.stock} available` : 'Request quote'}
          </p>
        </div>

        <div className="mt-auto pt-4">
          {footer ?? (
            inStock ? (
              <DcButton variant="secondary" className="w-full text-xs py-2" onClick={onAdd}>
                Add to cart
              </DcButton>
            ) : (
              <DcButton variant="outline" className="w-full text-xs py-2" href="/dashboard/sourcing/new">
                Request this part
              </DcButton>
            )
          )}
        </div>
      </div>
    </article>
  );
}
