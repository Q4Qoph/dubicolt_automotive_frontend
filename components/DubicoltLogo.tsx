import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LOGO_SRC } from '@/lib/dubicolt/brand';

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16',
  '2xl': 'h-20',
  header: 'h-10 sm:h-12',
} as const;

export type DubicoltLogoProps = {
  size?: keyof typeof sizeClasses;
  className?: string;
  href?: string | null;
  /** Omit white pill background — for dark hero headers */
  onDark?: boolean;
};

export default function DubicoltLogo({
  size = 'md',
  className,
  href = '/',
  onDark = false,
}: DubicoltLogoProps) {
  const image = (
    <span
      className={cn(
        'inline-flex shrink-0 items-center overflow-hidden',
        !onDark && 'rounded-lg bg-white px-2 py-1',
        sizeClasses[size],
        className,
      )}
    >
      <Image
        src={LOGO_SRC}
        alt="Dubicolt Automotive Technologies"
        width={480}
        height={120}
        className={cn('h-full w-auto max-w-none object-contain object-left', onDark && 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]')}
        priority={size === 'header' || size === '2xl'}
      />
    </span>
  );

  if (href === null) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center hover:opacity-90 transition-opacity">
      {image}
    </Link>
  );
}
