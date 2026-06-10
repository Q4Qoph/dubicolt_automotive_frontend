'use client';

import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Package,
  Clock,
} from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { useAdminAnalytics } from '@/lib/api/hooks';
import { formatKshLabelFromKes, formatCompactKes } from '@/lib/currency';
import AdminPageFooter from '@/components/admin/AdminPageFooter';
import {
  DcKpiCard,
  DcLinkAction,
  DcPage,
  DcPageHeader,
  DcPanel,
} from '@/components/dubicolt/dashboard-ui';
import { BRAND } from '@/lib/dubicolt/brand';

const ACCENT = BRAND.coldGreen;
const ORANGE = '#ff924d';

const tagStyles: Record<'orange' | 'blue' | 'red', string> = {
  orange: 'bg-amber-100 text-amber-900',
  blue: 'bg-[#081F3F]/8 text-[#081F3F]',
  red: 'bg-red-50 text-red-700',
};

function RouteBadge({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="rounded-lg bg-[#EFF8F9] px-2 py-1 text-xs font-bold text-[#243247]">{from}</span>
      <ArrowRight className="h-3.5 w-3.5 text-[#5A6B7D]" />
      <span className="rounded-lg bg-[#EFF8F9] px-2 py-1 text-xs font-bold text-[#243247]">{to}</span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const mounted = useMounted();
  const { dashboard, inventoryKpis, charts, isLoading } = useAdminAnalytics();
  const kpis = dashboard?.kpis;
  const kpiPending = !mounted || (isLoading && !kpis);
  const sourcingRows = dashboard?.sourcingRows ?? [];
  const weeklyData = charts?.weekly_volume ?? [];
  const topCategories = charts?.top_categories ?? [];
  const maxVal = Math.max(1, ...weeklyData.flatMap((w) => [w.kenya, w.dubai, w.china]));

  const revenueChange = kpis?.global_sales_change ?? '';
  const revenueHint =
    mounted && kpis
      ? `${revenueChange}${revenueChange ? ' · ' : ''}last 28 days`
      : undefined;

  const kpiCards = [
    {
      label: 'Marketplace revenue',
      value: kpis
        ? formatKshLabelFromKes(kpis.global_sales_usd)
        : kpiPending
          ? '…'
          : 'KSh 0',
      hint: revenueHint,
      icon: DollarSign,
      tone: 'green' as const,
    },
    {
      label: 'Active requests',
      value: kpis ? String(kpis.active_requests) : kpiPending ? '…' : '0',
      hint: kpis ? `${kpis.pending_quotes} pending quotes` : undefined,
      icon: Package,
      tone: 'default' as const,
    },
    {
      label: 'On-time delivery',
      value: kpis ? `${kpis.otd_percent}%` : kpiPending ? '…' : '0%',
      hint: kpis ? `${kpis.delayed_shipments} need attention` : undefined,
      icon: Clock,
      tone: 'orange' as const,
    },
    {
      label: 'Inventory value',
      value: inventoryKpis?.total_inventory_value ?? (kpiPending ? '…' : '0'),
      hint: mounted ? inventoryKpis?.hubs_label : undefined,
      icon: TrendingUp,
      tone: 'default' as const,
    },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <DcPage className="space-y-8">
        <DcPageHeader
          label="Admin workspace"
          title="Operations dashboard"
          description="Marketplace performance, sourcing pipeline and inventory at a glance."
        />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <DcKpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              hint={kpi.hint}
              icon={kpi.icon}
              tone={kpi.tone}
            />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DcPanel title="Weekly marketplace revenue (KES)" className="lg:col-span-2">
            <p className="-mt-3 mb-4 text-[11px] text-[#5A6B7D]">
              Paid orders from the Dubicolt catalog. Kenya marketplace only in MVP.
            </p>
            <div className="flex h-52 items-end gap-6 px-2">
              {weeklyData.length === 0 && mounted && !isLoading ? (
                <p className="py-8 text-sm text-[#5A6B7D]">No paid orders in the last four weeks yet.</p>
              ) : null}
              {weeklyData.map((w) => (
                <div key={w.week} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end justify-center">
                    <div
                      className="w-8 rounded-t-lg"
                      style={{
                        height: `${(w.kenya / maxVal) * 100}%`,
                        backgroundColor: ACCENT,
                        minHeight: 4,
                      }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-[#5A6B7D]">{w.week}</p>
                </div>
              ))}
            </div>
          </DcPanel>

          <DcPanel title="Top categories by sales">
            <p className="-mt-3 mb-4 text-[11px] text-[#5A6B7D]">All-time order revenue by product category</p>
            <div className="space-y-4">
              {topCategories.length === 0 && mounted && !isLoading ? (
                <p className="text-xs text-[#5A6B7D]">No order revenue yet.</p>
              ) : null}
              {topCategories.map((cat) => (
                <div key={cat.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-[#243247]">{cat.name}</span>
                    <span className="font-bold text-[#00BC94]">{formatCompactKes(cat.value_usd)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EFF8F9]">
                    <div className="h-full rounded-full bg-[#00BC94]" style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </DcPanel>
        </section>

        <DcPanel
          title="Recent sourcing requests"
          action={<DcLinkAction href="/admin/sourcing">View all →</DcLinkAction>}
        >
          {sourcingRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#5A6B7D]">No recent sourcing requests.</p>
          ) : (
            <div className="divide-y divide-[#EFF8F9]">
              {sourcingRows.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center"
                >
                  <RouteBadge from={row.origin} to={row.destination} />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#081F3F]">
                      {row.product_title}{' '}
                      <span className="font-normal text-[#5A6B7D]">({row.quantity})</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#5A6B7D]">Vendor: {row.vendor}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {row.status_tags.map((tag) => (
                      <span
                        key={tag.label}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${tagStyles[tag.variant]}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  <p className="shrink-0 text-xs text-[#5A6B7D] lg:w-24">{row.time_ago}</p>

                  <Link
                    href={`/admin/sourcing/${row.id}`}
                    className="shrink-0 rounded-lg bg-[#081F3F] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a2850] whitespace-nowrap"
                  >
                    View details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </DcPanel>
      </DcPage>

      <AdminPageFooter />
    </div>
  );
}
