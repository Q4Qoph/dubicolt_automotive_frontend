import Link from 'next/link';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/dubicolt/brand';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'text-[#081F3F] hover:brightness-105 shadow-sm',
  secondary: 'bg-[#081F3F] text-white hover:bg-[#0a2850] shadow-sm',
  outline: 'border-2 border-[#081F3F] text-[#081F3F] bg-transparent hover:bg-[#EFF8F9]',
  ghost: 'text-[#243247] hover:bg-[#EFF8F9]',
};

export function DcButton({
  variant = 'primary',
  className,
  children,
  href,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-50 disabled:pointer-events-none',
    buttonStyles[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} style={variant === 'primary' ? { backgroundColor: BRAND.coldGreen } : undefined}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      className={classes}
      style={variant === 'primary' ? { backgroundColor: BRAND.coldGreen } : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

export function DcInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-[#C5D4DC] bg-white px-4 py-3 text-sm text-[#243247] placeholder:text-[#5A6B7D] focus:outline-none focus:ring-2 focus:ring-[#00BC94]/30 focus:border-[#00BC94] transition-all',
        className,
      )}
      {...props}
    />
  );
}

export function DcBadge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'ice';
  className?: string;
}) {
  const tones = {
    default: 'bg-[#081F3F] text-white',
    success: 'bg-[#00BC94]/20 text-[#006b56]',
    warning: 'bg-amber-100 text-amber-900',
    ice: 'bg-white/90 text-[#243247] shadow-sm',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', tones[tone], className)}>
      {children}
    </span>
  );
}

export function DcSection({
  label,
  title,
  description,
  action,
  children,
  className,
}: {
  label?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('py-14 lg:py-20', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {(label || title) && (
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {label ? <p className="dc-label mb-2">{label}</p> : null}
              {title ? <h2 className="dc-heading text-3xl sm:text-4xl">{title}</h2> : null}
              {description ? <p className="mt-2 max-w-2xl text-[#5A6B7D]">{description}</p> : null}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function DcStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="px-2 py-1 lg:border-l lg:border-[#EFF8F9] lg:pl-6 first:lg:border-l-0 first:lg:pl-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#00BC94]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#081F3F]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#5A6B7D]">{hint}</p> : null}
    </div>
  );
}
