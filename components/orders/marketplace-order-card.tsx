'use client';

import Link from 'next/link';
import { Truck, CheckCircle2, Loader2 } from 'lucide-react';
import { DcProgressBar, DcStatusPill } from '@/components/dubicolt/dashboard-ui';
import { formatKshLabel } from '@/lib/currency';
import type { UserMarketplaceOrder } from '@/lib/types';

function StatusIcon({ type }: { type: UserMarketplaceOrder['status_icon'] }) {
  if (type === 'delivered') return <CheckCircle2 className="h-4 w-4 text-[#007a62]" />;
  if (type === 'processing') return <Loader2 className="h-4 w-4 text-amber-600" />;
  return <Truck className="h-4 w-4 text-[#081F3F]" />;
}

export function MarketplaceOrderCard({ order }: { order: UserMarketplaceOrder }) {
  const detailHref = `/dashboard/orders/${order.id}`;

  return (
    <div className="dc-card dc-card-hover flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
      <Link
        href={detailHref}
        className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-[#EFF8F9] lg:w-28"
      >
        <img src={order.image_url} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-[#243247] shadow-sm">
          {order.origin_flag}
        </span>
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <Link href={detailHref} className="block">
          <p className="text-xs font-mono text-[#5A6B7D]">#{order.order_number}</p>
          <p className="text-sm font-bold text-[#081F3F]">{order.title}</p>
        </Link>
        <div className="flex items-center gap-2">
          <StatusIcon type={order.status_icon} />
          <span className="text-xs font-semibold text-[#243247]">{order.status}</span>
        </div>
        <DcProgressBar step={order.progress_step} />
        {order.tracking_id ? (
          <p className="text-[10px] font-mono text-[#5A6B7D]">
            Tracking: <span className="font-semibold text-[#081F3F]">{order.tracking_id}</span>
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-start justify-between gap-3 lg:items-end">
        <div className="lg:text-right">
          <p className="text-lg font-bold text-[#081F3F]">{formatKshLabel(order.price_kes)}</p>
          {order.price_secondary ? (
            <p className="text-xs text-[#5A6B7D]">{formatKshLabel(order.price_secondary)}</p>
          ) : null}
          <p className="mt-1 text-[10px] text-[#5A6B7D]">
            {order.date_label}: <span className="font-semibold text-[#243247]">{order.date_value}</span>
          </p>
        </div>
        <Link
          href={detailHref}
          className="rounded-lg bg-[#081F3F] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a2850]"
        >
          {order.secondary_action}
        </Link>
      </div>
    </div>
  );
}
