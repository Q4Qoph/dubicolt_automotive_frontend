import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/logo.png';

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-14',
  '2xl': 'h-20',
  header: 'h-14 sm:h-16',
} as const;

export type DubikenLogoProps = {
  size?: keyof typeof sizeClasses;
  className?: string;
  href?: string | null;
};

export default function DubikenLogo({ size = 'md', className, href = '/' }: DubikenLogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt="Dubiken Electronics"
      width={400}
      height={120}
      className={cn('w-auto max-w-none object-contain', sizeClasses[size], className)}
      priority={size === 'header' || size === '2xl'}
    />
  );

  if (href === null) {
    return <span className="inline-flex shrink-0 items-center">{image}</span>;
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
