'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Loader2, Truck } from 'lucide-react';
import { useOrderInvoice, useUserMarketplaceOrder } from '@/lib/api/hooks';
import { OrderShipmentTracker } from '@/components/orders/order-shipment-tracker';
import { formatKshLabel } from '@/lib/currency';
import type { UserMarketplaceOrder } from '@/lib/types';
import {
  DcLinkAction,
  DcPage,
  DcPanel,
  DcProgressBar,
  DcStatusPill,
} from '@/components/dubicolt/dashboard-ui';

function StatusIcon({ type }: { type: UserMarketplaceOrder['status_icon'] }) {
  if (type === 'delivered') return <CheckCircle2 className="h-5 w-5 text-[#00BC94]" />;
  if (type === 'processing') return <Loader2 className="h-5 w-5 text-amber-500" />;
  return <Truck className="h-5 w-5 text-[#081F3F]" />;
}

export default function UserMarketplaceOrderDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data, isLoading } = useUserMarketplaceOrder(id);
  const paid =
    !!data?.order &&
    !data.order.status.toLowerCase().includes('pending') &&
    !data.order.status.toLowerCase().includes('cancel');
  const { data: invoice } = useOrderInvoice(id, paid);

  if (isLoading) {
    return (
      <DcPage>
        <p className="text-sm text-[#5A6B7D]">Loading order…</p>
      </DcPage>
    );
  }

  if (!data?.order) {
    return (
      <DcPage>
        <p className="mb-4 text-sm text-[#5A6B7D]">Order not found.</p>
        <DcLinkAction href="/dashboard/orders">← Back to orders</DcLinkAction>
      </DcPage>
    );
  }

  const { order, shipment } = data;
  const trackingId = order.tracking_id ?? order.order_number;
  const statusTone =
    order.status_icon === 'delivered' ? 'success' : order.status_icon === 'processing' ? 'warning' : 'info';

  return (
    <DcPage>
      <nav className="mb-6 text-xs text-[#5A6B7D]">
        <Link href="/dashboard/orders" className="hover:text-[#00BC94]">
          My orders
        </Link>
        {' / '}
        <span className="font-medium text-[#243247]">#{order.order_number}</span>
      </nav>

      <div className="mb-8 flex flex-col gap-6 lg:flex-row">
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-[#EFF8F9] lg:w-44">
          <img src={order.image_url} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#243247] shadow-sm">
            {order.origin_flag}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-sm text-[#5A6B7D]">#{order.order_number}</p>
          <h1 className="dc-heading mb-3 text-2xl">{order.title}</h1>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <StatusIcon type={order.status_icon} />
            <DcStatusPill tone={statusTone}>{order.status}</DcStatusPill>
          </div>
          <DcProgressBar step={order.progress_step} />
        </div>

        <div className="shrink-0 lg:text-right">
          <p className="text-2xl font-bold text-[#081F3F]">{formatKshLabel(order.price_kes)}</p>
          <p className="mt-2 text-sm text-[#5A6B7D]">
            {order.date_label}: <span className="font-semibold text-[#243247]">{order.date_value}</span>
          </p>
        </div>
      </div>

      {invoice?.paid ? (
        <DcPanel title="Invoice" className="mb-6">
          <div className="text-sm text-[#243247]">
            <p>
              <span className="text-[#5A6B7D]">Order:</span> #{invoice.orderNumber}
            </p>
            <p className="mt-1">
              <span className="text-[#5A6B7D]">Total:</span> KSh {invoice.total.toLocaleString()}
            </p>
            {invoice.deliveryMethod ? (
              <p className="mt-1">
                <span className="text-[#5A6B7D]">Fulfilment:</span>{' '}
                {invoice.deliveryMethod === 'PICKUP' ? 'Shop pickup' : invoice.deliveryAddress}
              </p>
            ) : null}
            <ul className="mt-3 space-y-1 border-t border-[#EFF8F9] pt-3">
              {invoice.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>
                    {item.title} × {item.quantity}
                  </span>
                  <span className="font-bold">KSh {(item.unitPrice * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </DcPanel>
      ) : null}

      <div id="tracking" className="scroll-mt-6">
        <DcPanel title="Delivery tracking">
          {shipment?.milestones?.length ? (
            <>
              <OrderShipmentTracker milestones={shipment.milestones} progressStep={order.progress_step} />
              {shipment.proof_url ? (
                <div className="mt-4 border-t border-[#EFF8F9] pt-4">
                  <p className="dc-label mb-2">Proof of delivery</p>
                  <a
                    href={shipment.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-[#00BC94] hover:underline"
                  >
                    View delivery proof
                  </a>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-[#5A6B7D]">
              Tracking for <span className="font-mono font-bold text-[#00BC94]">#{trackingId}</span> updates as your
              order moves through fulfilment.
            </p>
          )}
        </DcPanel>
      </div>

      <div className="mt-6">
        <DcLinkAction href="/dashboard/orders">← All orders</DcLinkAction>
      </div>
    </DcPage>
  );
}
