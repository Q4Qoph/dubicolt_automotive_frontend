'use client';

import { Filter, Plus, TrendingUp, ArrowRight } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import AdminPageFooter from '@/components/admin/AdminPageFooter';
import { useAdminAnalytics, useShipments } from '@/lib/api/hooks';
import { formatKshLabelFromKes } from '@/lib/currency';
import type { Shipment } from '@/lib/types';

const BLUE = '#081F3F';
const BLUE_DARK = '#081F3F';
const ORANGE = '#ff924d';
const MAP_BG = '#2d3748';

function hubFromCity(city: string): string {
  const c = city.toLowerCase();
  if (c.includes('dubai') || c.includes('jebel')) return 'AE';
  if (c.includes('nairobi') || c.includes('mombasa') || c.includes('kenya')) return 'KE';
  if (c.includes('shenzhen') || c.includes('ningbo') || c.includes('china')) return 'CN';
  return city.slice(0, 2).toUpperCase();
}

function mapShipmentRow(s: Shipment) {
  const status = s.current_status.toUpperCase();
  let statusClass = 'bg-[#EFF8F9] text-[#081F3F] border-[#C5D4DC]';
  if (status.includes('CUSTOM')) statusClass = 'bg-red-50 text-red-700 border-red-200';
  else if (status.includes('PORT')) statusClass = 'bg-orange-50 text-orange-700 border-orange-200';
  const eta = s.milestones?.find((m) => !m.done)?.date ?? 'N/A';
  return {
    id: s.tracking_id,
    commodity: s.vessel ? `${s.vessel}` : s.current_status,
    origin: hubFromCity(s.origin_city),
    dest: hubFromCity(s.destination_city),
    status,
    statusClass,
    eta,
    action: 'Manage',
  };
}

function RoutePill({ code }: { code: string }) {
  return (
    <span className="px-2 py-0.5 border border-[#C5D4DC] rounded text-[10px] font-bold text-[#243247] bg-white">
      {code}
    </span>
  );
}

function statusBucket(status: string): 'port' | 'transit' | 'customs' | 'other' {
  const s = status.toUpperCase();
  if (s.includes('PORT')) return 'port';
  if (s.includes('CUSTOM')) return 'customs';
  if (s.includes('TRANSIT') || s.includes('SEA') || s.includes('VESSEL')) return 'transit';
  return 'other';
}

export default function AdminLogisticsPage() {
  const mounted = useMounted();
  const { data: shipmentRows = [], isLoading } = useShipments();
  const { dashboard } = useAdminAnalytics();
  const kpiPending = !mounted || isLoading;
  const shipments = shipmentRows.map(mapShipmentRow);
  const buckets = shipmentRows.reduce(
    (acc, s) => {
      const b = statusBucket(s.current_status);
      acc[b] += 1;
      return acc;
    },
    { port: 0, transit: 0, customs: 0, other: 0 },
  );

  return (
    <div className="flex flex-col min-h-full bg-[#EFF8F9]">
      <div className="flex-1 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BLUE_DARK }}>
              Logistics Management
            </h1>
            <p className="text-sm text-[#5A6B7D] mt-1">
              Real-time oversight of global trade lanes and active freight.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border-2 rounded-lg bg-white"
              style={{ borderColor: BLUE, color: BLUE }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg text-white"
              style={{ backgroundColor: BLUE_DARK }}
            >
              <Plus className="w-4 h-4" />
              Track New Shipment
            </button>
          </div>
        </div>

        {/* Map + metric cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-white border border-[#EFF8F9] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-black">Global Trade Lanes</h2>
              <div className="flex items-center gap-4 text-[10px] font-bold text-[#5A6B7D]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BLUE }} />
                  Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ORANGE }} />
                  Delay
                </span>
              </div>
            </div>
            <div
              className="rounded-lg overflow-hidden relative"
              style={{ backgroundColor: MAP_BG, minHeight: 280 }}
            >
              <svg
                viewBox="0 0 800 400"
                className="w-full h-full min-h-[280px]"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
              >
                <rect width="800" height="400" fill={MAP_BG} />
                {/* Simplified land masses */}
                <ellipse cx="200" cy="200" rx="120" ry="80" fill="#3d4a5c" opacity="0.6" />
                <ellipse cx="420" cy="180" rx="100" ry="70" fill="#3d4a5c" opacity="0.6" />
                <ellipse cx="580" cy="220" rx="90" ry="60" fill="#3d4a5c" opacity="0.6" />
                {/* Trade routes */}
                <path
                  d="M 280 200 Q 400 120 520 140"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                />
                <path
                  d="M 320 220 Q 450 200 600 180"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <path
                  d="M 200 240 Q 350 280 550 260"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <line
                  x1="340"
                  y1="190"
                  x2="590"
                  y2="120"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                {/* Active dots */}
                <circle cx="340" cy="190" r="7" fill={BLUE} stroke="white" strokeWidth="2" />
                <circle cx="590" cy="120" r="7" fill={BLUE} stroke="white" strokeWidth="2" />
                <circle cx="480" cy="250" r="7" fill={ORANGE} stroke="white" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[#EFF8F9] rounded-lg p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7D] mb-1">
                Marketplace revenue (28d)
              </p>
              <p className="text-3xl font-bold" style={{ color: BLUE_DARK }}>
                {dashboard?.kpis
                  ? formatKshLabelFromKes(dashboard.kpis.global_sales_usd)
                  : kpiPending
                    ? '…'
                    : 'N/A'}
              </p>
              {dashboard?.kpis?.global_sales_change ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">
                    {dashboard.kpis.global_sales_change}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="bg-white border border-[#EFF8F9] rounded-lg p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7D] mb-1">
                Active Shipments
              </p>
              <p className="text-3xl font-bold" style={{ color: ORANGE }}>
                {kpiPending ? '…' : shipments.length}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#EFF8F9]">
                {[
                  { label: 'At Port', value: buckets.port },
                  { label: 'Transit', value: buckets.transit },
                  { label: 'Customs', value: buckets.customs },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-lg font-bold" style={{ color: BLUE_DARK }}>
                      {item.value}
                    </p>
                    <p className="text-[10px] text-[#5A6B7D] font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active shipments table */}
        <div className="bg-white border border-[#EFF8F9] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EFF8F9]">
            <h2 className="text-sm font-bold text-black">Active Shipments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#EFF8F9] bg-[#EFF8F9]">
                  {['Tracking ID', 'Commodity', 'Route', 'Status', 'ETA', 'Action'].map((h) => (
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
                {isLoading && shipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-sm text-[#5A6B7D]">
                      Loading shipments…
                    </td>
                  </tr>
                ) : null}
                {shipments.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-[#EFF8F9] last:border-0 hover:bg-[#EFF8F9]/60"
                  >
                    <td className="px-5 py-4 text-sm font-bold font-mono" style={{ color: BLUE }}>
                      {s.id}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#243247]">{s.commodity}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <RoutePill code={s.origin} />
                        <ArrowRight className="w-3.5 h-3.5 text-[#5A6B7D]" />
                        <RoutePill code={s.dest} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.statusClass}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#5A6B7D]">{s.eta}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="text-xs font-bold hover:underline"
                        style={{ color: BLUE }}
                      >
                        {s.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminPageFooter />
    </div>
  );
}
