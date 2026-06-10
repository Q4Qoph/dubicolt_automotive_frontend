'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Receipt, FileText, Gauge, Filter } from 'lucide-react';
import {
  useAdminMarketplaceOrders,
  useUpdateMarketplaceOrderStatusMutation,
} from '@/lib/api/hooks';
import {
  MARKETPLACE_ORDER_STATUSES,
  MARKETPLACE_ORDER_STATUS_LABELS,
  type MarketplaceOrderStatus,
} from '@/lib/contracts/enums';
import { useMounted } from '@/hooks/use-mounted';
import { parseKsh } from '@/lib/currency';
import AdminPageFooter from '@/components/admin/AdminPageFooter';
import { DcKpiCard, DcPage, DcPageHeader, DcPanel } from '@/components/dubicolt/dashboard-ui';

function statusClass(status: string) {
  const s = status.toUpperCase();
  if (s.includes('DELIVER')) return 'bg-green-50 text-green-800 border-green-200';
  if (s.includes('TRANSIT') || s.includes('SHIP')) return 'bg-[#EFF8F9] text-[#081F3F] border-[#C5D4DC]';
  if (s.includes('CANCEL')) return 'bg-gray-50 text-gray-700 border-gray-200';
  return 'bg-orange-50 text-orange-700 border-orange-200';
}

function normalizeStatus(status: string): MarketplaceOrderStatus {
  const s = status.toUpperCase();
  if (MARKETPLACE_ORDER_STATUSES.includes(s as MarketplaceOrderStatus)) {
    return s as MarketplaceOrderStatus;
  }
  if (s.includes('DELIVER')) return 'DELIVERED';
  if (s.includes('TRANSIT') || s.includes('SHIP')) return 'IN TRANSIT';
  if (s.includes('CANCEL')) return 'CANCELLED';
  return 'PROCESSING';
}

export default function AdminOrdersPage() {
  const mounted = useMounted();
  const { data: orders = [], isLoading } = useAdminMarketplaceOrders();
  const updateStatus = useUpdateMarketplaceOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const kpiPending = !mounted || isLoading;

  const kpis = useMemo(() => {
    const total = orders.length;
    const revenueKes = orders.reduce((sum, o) => sum + parseKsh(o.price_kes), 0);
    const pending = orders.filter((o) => {
      const s = o.status.toUpperCase();
      return s.includes('PROCESS') || s.includes('PENDING');
    }).length;
    const delivered = orders.filter((o) => o.status.toUpperCase().includes('DELIVER')).length;
    const fulfillmentPct = total > 0 ? Math.round((delivered / total) * 100) : 0;
    return { total, revenueKes, pending, fulfillmentPct };
  }, [orders]);

  async function handleStatusChange(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <DcPage>
        <DcPageHeader
          label="Orders"
          title="Marketplace orders"
          description="Catalog sales from the Dubicolt marketplace."
        />

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DcKpiCard
            label="Total orders"
            value={kpiPending ? '…' : kpis.total.toLocaleString('en-KE')}
            hint="Marketplace catalog"
            icon={TrendingUp}
          />
          <DcKpiCard
            label="Gross revenue"
            value={kpiPending ? '…' : kpis.revenueKes.toLocaleString('en-KE')}
            icon={Receipt}
            tone="green"
          />
          <DcKpiCard
            label="In progress"
            value={kpiPending ? '…' : kpis.pending}
            hint="Processing or pending"
            icon={FileText}
            tone="orange"
          />
          <DcKpiCard
            label="Delivered rate"
            value={kpiPending ? '…' : `${kpis.fulfillmentPct}%`}
            hint="Of all marketplace orders"
            icon={Gauge}
          />
        </div>

        <DcPanel
          title="All orders"
          action={
            <button type="button" className="rounded-lg p-1.5 hover:bg-[#EFF8F9]" aria-label="Filter">
              <Filter className="h-4 w-4 text-[#5A6B7D]" />
            </button>
          }
        >

          {isLoading ? (
            <p className="p-8 text-center text-sm text-[#5A6B7D]">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#5A6B7D]">
              No marketplace orders yet. Orders appear here when buyers complete checkout.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#EFF8F9] bg-[#EFF8F9]">
                    {['Order', 'Customer', 'Product', 'Amount', 'Status', 'ETA'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#5A6B7D]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const currentStatus = normalizeStatus(order.status);
                    const isUpdating = updatingId === order.id;

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-[#EFF8F9] last:border-0 hover:bg-[#EFF8F9]/60"
                      >
                        <td className="px-5 py-4 font-mono text-sm font-bold text-[#00BC94]">
                          #{order.order_number}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-black">{order.customer_name}</p>
                          {order.customer_detail ? (
                            <p className="text-xs text-[#5A6B7D] mt-0.5">{order.customer_detail}</p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-black line-clamp-1">{order.title}</p>
                          <p className="text-xs text-[#5A6B7D]">{order.vendor}</p>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-black">{order.price_kes}</td>
                        <td className="px-5 py-4">
                          <select
                            value={currentStatus}
                            disabled={isUpdating || updateStatus.isPending}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1.5 rounded border bg-white min-w-[130px] ${statusClass(currentStatus)}`}
                          >
                            {MARKETPLACE_ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {MARKETPLACE_ORDER_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#243247]">{order.date_value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DcPanel>
      </DcPage>

      <AdminPageFooter />
    </div>
  );
}
