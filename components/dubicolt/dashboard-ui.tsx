import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/dubicolt/brand';

export function DcPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-h-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10', className)}>
      {children}
    </div>
  );
}

export function DcPageHeader({
  label,
  title,
  description,
  action,
}: {
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {label ? <p className="dc-label mb-2">{label}</p> : null}
        <h1 className="dc-heading text-2xl sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#5A6B7D]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DcKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'green' | 'orange';
}) {
  const iconBg =
    tone === 'green'
      ? 'bg-[#00BC94]/15 text-[#007a62]'
      : tone === 'orange'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-[#081F3F]/8 text-[#081F3F]';

  return (
    <div className="dc-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#00BC94]">{label}</p>
        {Icon ? (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', iconBg)}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-bold text-[#081F3F]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#5A6B7D]">{hint}</p> : null}
    </div>
  );
}

export function DcQuickAction({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
}) {
  return (
    <Link
      href={href}
      className="group dc-card dc-card-hover flex items-center gap-4 p-4 transition-colors hover:bg-[#081F3F]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#081F3F] text-[#00BC94] transition-colors group-hover:bg-[#00BC94] group-hover:text-[#081F3F]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#243247] transition-colors group-hover:text-white">{label}</p>
        {description ? (
          <p className="text-xs text-[#5A6B7D] transition-colors group-hover:text-white/70">{description}</p>
        ) : null}
      </div>
    </Link>
  );
}

export function DcPanel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('dc-card p-5 sm:p-6', className)}>
      {title ? (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#081F3F]">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function DcEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="py-12 text-center">
      {Icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF8F9]">
          <Icon className="h-7 w-7 text-[#5A6B7D]" />
        </div>
      ) : null}
      <p className="font-bold text-[#243247]">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-sm text-sm text-[#5A6B7D]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function DcProgressBar({ step, max = 4 }: { step: number; max?: number }) {
  return (
    <div className="flex w-full max-w-[200px] gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((i) => (
        <div
          key={i}
          className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-[#00BC94]' : 'bg-[#EFF8F9]')}
        />
      ))}
    </div>
  );
}

export function DcMilestoneList({
  milestones,
}: {
  milestones: { label: string; detail?: string; date?: string; done?: boolean; active?: boolean }[];
}) {
  return (
    <div className="space-y-4">
      {milestones.map((m, i) => (
        <div key={i} className="flex gap-3">
          <div
            className={cn(
              'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
              m.active ? 'bg-amber-500' : m.done ? 'bg-[#00BC94]' : 'bg-[#C5D4DC]',
            )}
          />
          <div>
            <p
              className={cn(
                'text-sm font-bold',
                m.active ? 'text-amber-700' : m.done ? 'text-[#081F3F]' : 'text-[#5A6B7D]',
              )}
            >
              {m.label}
            </p>
            {m.detail || m.date ? (
              <p className="text-xs text-[#5A6B7D]">
                {[m.detail, m.date].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DcLinkAction({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn('text-xs font-bold text-[#00BC94] hover:underline', className)}>
      {children}
    </Link>
  );
}

export function DcStatusPill({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'info';
}) {
  const tones = {
    default: 'bg-[#EFF8F9] text-[#243247]',
    success: 'bg-[#00BC94]/15 text-[#007a62]',
    warning: 'bg-amber-100 text-amber-900',
    info: 'bg-[#081F3F]/8 text-[#081F3F]',
  };
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase', tones[tone])}>
      {children}
    </span>
  );
}

export { BRAND };
