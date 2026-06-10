'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package, Plus } from 'lucide-react';
import { useUserMarketplaceOrders, useUserSourcingDashboard } from '@/lib/api/hooks';
import { MarketplaceOrderCard } from '@/components/orders/marketplace-order-card';
import { DcEmptyState, DcLinkAction, DcPage, DcPageHeader, DcPanel, DcStatusPill } from '@/components/dubicolt/dashboard-ui';
import { DcButton } from '@/components/dubicolt/ui';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

export default function UserOrdersPage() {
  const [tab, setTab] = useState<'marketplace' | 'sourcing'>('marketplace');
  const [page, setPage] = useState(1);
  const { data: orders = [], isLoading } = useUserMarketplaceOrders();
  const { data: sourcingData } = useUserSourcingDashboard();
  const sourcing = sourcingData?.requests ?? [];

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageOrders = orders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <DcPage>
      <DcPageHeader
        label="Orders"
        title="My orders"
        description="View purchase history, tracking and part requests."
      />

      <div className="mb-6 flex gap-2">
        {(['marketplace', 'sourcing'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-bold transition-all',
              tab === key
                ? 'bg-[#081F3F] text-white shadow-sm'
                : 'bg-white text-[#5A6B7D] shadow-sm hover:text-[#081F3F]',
            )}
          >
            {key === 'marketplace' ? 'Purchases' : 'Requests'}
          </button>
        ))}
      </div>

      {tab === 'marketplace' ? (
        <>
          {isLoading ? (
            <p className="py-12 text-center text-sm text-[#5A6B7D]">Loading orders…</p>
          ) : orders.length === 0 ? (
            <DcPanel>
              <DcEmptyState
                icon={Package}
                title="No purchases yet"
                description="Browse in-stock parts and checkout with M-Pesa."
                action={
                  <DcButton variant="primary" href="/marketplace">
                    Start shopping
                  </DcButton>
                }
              />
            </DcPanel>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                {pageOrders.map((order) => (
                  <MarketplaceOrderCard key={order.id} order={order} />
                ))}
              </div>
              {totalPages > 1 ? (
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm disabled:opacity-40"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        'h-9 w-9 rounded-lg text-xs font-bold shadow-sm',
                        safePage === p ? 'bg-[#081F3F] text-white' : 'bg-white text-[#243247]',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm disabled:opacity-40"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {sourcing.length === 0 ? (
            <DcPanel>
              <DcEmptyState
                title="No part requests"
                description="Submit vehicle details for parts not in catalog."
                action={
                  <DcButton variant="primary" href="/dashboard/sourcing/new">
                    Request a part
                  </DcButton>
                }
              />
            </DcPanel>
          ) : (
            sourcing.map((req) => (
              <div key={req.id} className="dc-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-[#5A6B7D]">#{req.request_number}</p>
                  <p className="text-sm font-bold text-[#081F3F]">{req.title}</p>
                  <p className="mt-1 text-sm font-bold text-[#00BC94]">{req.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DcStatusPill tone="warning">{req.status}</DcStatusPill>
                  <Link
                    href={`/dashboard/sourcing/${req.id}`}
                    className="rounded-lg bg-[#081F3F] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a2850]"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
          <DcLinkAction href="/dashboard/sourcing/new" className="inline-flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" />
            Request a part
          </DcLinkAction>
        </div>
      )}
    </DcPage>
  );
}
