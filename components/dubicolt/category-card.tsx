'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CategoryCard({
  name,
  href,
  imageUrl,
  productCount,
  className,
}: {
  name: string;
  href: string;
  imageUrl?: string | null;
  productCount?: number;
  className?: string;
}) {
  const src = imageUrl?.trim() || null;
  const countLabel =
    productCount && productCount > 0
      ? `${productCount} part${productCount === 1 ? '' : 's'}`
      : 'Browse';

  return (
    <Link
      href={href}
      className={cn(
        'group relative block overflow-hidden rounded-2xl shadow-[0_2px_16px_rgba(8,31,63,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(8,31,63,0.14)]',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#dce9ff] to-[#b8d4f8]">
            <span className="text-3xl font-bold text-[#081F3F]/25">{name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081F3F]/90 via-[#081F3F]/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <p className="text-sm font-bold text-white sm:text-base">{name}</p>
          <p className="mt-0.5 text-[11px] font-medium text-white/75">{countLabel}</p>
        </div>
      </div>
    </Link>
  );
}
