'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  FileText,
  Store,
  Plus,
  CheckCircle2,
  Search,
} from 'lucide-react';
import {
  useCurrentUser,
  useShipment,
  useUserMarketplaceOrders,
  useUserSourcingDashboard,
} from '@/lib/api/hooks';
import { useCart } from '@/hooks/use-cart';
import { parseKsh, formatKshLabel, formatKshLabelFromKes } from '@/lib/currency';
import { normalizeTrackingId } from '@/lib/tracking-id';
import {
  DcEmptyState,
  DcKpiCard,
  DcLinkAction,
  DcMilestoneList,
  DcPage,
  DcPageHeader,
  DcPanel,
  DcProgressBar,
  DcQuickAction,
  DcStatusPill,
} from '@/components/dubicolt/dashboard-ui';
import { DcButton, DcInput } from '@/components/dubicolt/ui';
import type { UserMarketplaceOrder } from '@/lib/types';

function RecentOrderRow({ order }: { order: UserMarketplaceOrder }) {
  return (
    <Link
      href={`/dashboard/orders/${order.id}#tracking`}
      className="dc-card dc-card-hover flex items-center gap-4 p-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#EFF8F9]">
        <img src={order.image_url} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-mono text-[#5A6B7D]">#{order.order_number}</p>
        <p className="truncate text-sm font-bold text-[#081F3F]">{order.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <DcStatusPill tone={order.status_icon === 'delivered' ? 'success' : 'info'}>
            {order.status}
          </DcStatusPill>
        </div>
        <div className="mt-2">
          <DcProgressBar step={order.progress_step} />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-[#081F3F]">{formatKshLabel(order.price_kes)}</p>
        <p className="mt-1 text-[10px] text-[#5A6B7D]">
          {order.date_label}: {order.date_value}
        </p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { displayName } = useCurrentUser();
  const { data: orders = [], isLoading: ordersLoading } = useUserMarketplaceOrders();
  const { data: sourcingData, isLoading: sourcingLoading } = useUserSourcingDashboard();
  const { itemCount } = useCart();
  const [trackingInput, setTrackingInput] = useState('');
  const [activeTracking, setActiveTracking] = useState('');
  const { data: shipment } = useShipment(activeTracking);

  const summary = sourcingData?.summary;
  const sourcingRequests = (sourcingData?.requests ?? []).slice(0, 3);

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => {
      const s = o.status.toUpperCase();
      return s.includes('PROCESS') || s.includes('TRANSIT') || s.includes('SHIP') || s.includes('DISPATCH');
    }).length;
    const delivered = orders.filter((o) => o.status.toUpperCase().includes('DELIVER')).length;
    const totalSpend = orders.reduce((sum, o) => sum + parseKsh(o.price_kes), 0);
    return { total: orders.length, activeOrders, delivered, totalSpend };
  }, [orders]);

  const recentOrders = orders.slice(0, 4);
  const milestones = shipment?.milestones ?? [];
  const matchedOrderForTracking = activeTracking
    ? orders.find((o) => (o.tracking_id ?? o.order_number) === activeTracking)
    : undefined;
  const firstName = displayName.split(' ')[0] || 'there';

  function submitTracking(raw: string) {
    const id = normalizeTrackingId(raw);
    if (id) setActiveTracking(id);
  }

  return (
    <DcPage>
      <DcPageHeader
        label="Buyer workspace"
        title={`Welcome back, ${firstName}`}
        description="Track purchases, part requests and deliveries in one place."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DcKpiCard
          label="Orders"
          value={ordersLoading ? '…' : stats.total}
          hint={`${stats.activeOrders} in progress`}
          icon={ShoppingBag}
        />
        <DcKpiCard
          label="Delivered"
          value={ordersLoading ? '…' : stats.delivered}
          hint="Completed purchases"
          icon={CheckCircle2}
          tone="green"
        />
        <DcKpiCard
          label="Part requests"
          value={sourcingLoading ? '…' : (summary?.active ?? 0)}
          hint={`${summary?.pending_quotes ?? 0} pending quotes`}
          icon={FileText}
        />
        <DcKpiCard
          label="Order value"
          value={ordersLoading ? '…' : formatKshLabelFromKes(stats.totalSpend)}
          hint="All orders"
          icon={Package}
          tone="orange"
        />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DcQuickAction href="/marketplace" icon={Store} label="Shop parts" description="Browse catalog" />
        <DcQuickAction href="/dashboard/orders" icon={ShoppingBag} label="My orders" description="Purchase history" />
        <DcQuickAction href="/dashboard/sourcing/new" icon={Plus} label="Request part" description="Special order" />
        <DcQuickAction
          href={itemCount > 0 ? '/checkout' : '/marketplace'}
          icon={Package}
          label={itemCount > 0 ? `Cart (${itemCount})` : 'Browse catalog'}
          description={itemCount > 0 ? 'Checkout now' : 'Add items'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DcPanel
          title="Recent orders"
          className="lg:col-span-2"
          action={<DcLinkAction href="/dashboard/orders">View all →</DcLinkAction>}
        >
          {ordersLoading ? (
            <p className="py-8 text-center text-sm text-[#5A6B7D]">Loading orders…</p>
          ) : recentOrders.length === 0 ? (
            <DcEmptyState
              icon={Package}
              title="No orders yet"
              description="Browse the catalog and place your first in-stock order."
              action={
                <DcButton variant="secondary" href="/marketplace">
                  Start shopping
                </DcButton>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <RecentOrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </DcPanel>

        <div className="space-y-6">
          <DcPanel title="Track shipment">
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6B7D]" />
                <DcInput
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitTracking(trackingInput);
                  }}
                  placeholder="Tracking or order ID"
                  className="pl-9"
                />
              </div>
              <DcButton variant="secondary" className="shrink-0 px-4" onClick={() => submitTracking(trackingInput)}>
                Track
              </DcButton>
            </div>

            {activeTracking ? (
              <p className="mb-3 font-mono text-xs font-bold text-[#00BC94]">#{activeTracking}</p>
            ) : null}

            {matchedOrderForTracking ? (
              <DcLinkAction href={`/dashboard/orders/${matchedOrderForTracking.id}#tracking`} className="mb-3 inline-block">
                View full order →
              </DcLinkAction>
            ) : null}

            {milestones.length === 0 ? (
              <p className="text-sm text-[#5A6B7D]">
                {activeTracking
                  ? 'Tracking is being set up. Open your order for full details.'
                  : 'Enter a tracking ID or open an order under My orders.'}
              </p>
            ) : (
              <DcMilestoneList milestones={milestones} />
            )}
          </DcPanel>

          <DcPanel
            title="Part requests"
            action={<DcLinkAction href="/dashboard/sourcing">View all →</DcLinkAction>}
          >
            {sourcingLoading ? (
              <p className="text-sm text-[#5A6B7D]">Loading…</p>
            ) : sourcingRequests.length === 0 ? (
              <p className="text-sm text-[#5A6B7D]">
                No requests yet.{' '}
                <Link href="/dashboard/sourcing/new" className="font-bold text-[#00BC94] hover:underline">
                  Start one
                </Link>
              </p>
            ) : (
              <ul className="space-y-3">
                {sourcingRequests.map((req) => (
                  <li key={req.id}>
                    <Link
                      href={`/dashboard/sourcing/${req.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#EFF8F9] px-3 py-2.5 transition-colors hover:bg-[#00BC94]/10"
                    >
                      <span className="truncate text-sm font-semibold text-[#243247]">{req.title}</span>
                      <DcStatusPill tone="warning">{req.status}</DcStatusPill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </DcPanel>
        </div>
      </div>
    </DcPage>
  );
}
