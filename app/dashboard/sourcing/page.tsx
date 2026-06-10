'use client';

import Link from 'next/link';
import { Plus, ClipboardList, FileText, Wallet } from 'lucide-react';
import { useUserSourcingDashboard } from '@/lib/api/hooks';
import type { UserSourcingRequestItem } from '@/lib/types';
import {
  DcEmptyState,
  DcKpiCard,
  DcPage,
  DcPageHeader,
  DcPanel,
  DcStatusPill,
} from '@/components/dubicolt/dashboard-ui';
import { DcButton } from '@/components/dubicolt/ui';

const statusTone: Record<UserSourcingRequestItem['status_variant'], 'default' | 'warning' | 'info'> = {
  orange: 'warning',
  blue: 'info',
  gray: 'default',
};

export default function UserSourcingPage() {
  const { data, isLoading } = useUserSourcingDashboard();
  const summary = data?.summary ?? { active: 0, pending_quotes: 0, procured_total: 'KSh 0' };
  const requests = data?.requests ?? [];

  return (
    <DcPage>
      <DcPageHeader
        label="Sourcing"
        title="Part requests"
        description="Track quotes and status for parts you asked Dubicolt to source."
        action={
          <DcButton variant="secondary" href="/dashboard/sourcing/new">
            <Plus className="h-4 w-4" />
            Request a part
          </DcButton>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DcKpiCard label="Active requests" value={summary.active} icon={ClipboardList} />
        <DcKpiCard label="Pending quotes" value={summary.pending_quotes} icon={FileText} tone="green" />
        <DcKpiCard label="Procured total" value={summary.procured_total} icon={Wallet} tone="orange" />
      </div>

      <DcPanel title="Your requests">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-[#5A6B7D]">Loading requests…</p>
        ) : requests.length === 0 ? (
          <DcEmptyState
            title="No part requests yet"
            description="Submit vehicle details and photos for parts not in catalog."
            action={
              <DcButton variant="primary" href="/dashboard/sourcing/new">
                Start a request
              </DcButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Link
                key={req.id}
                href={`/dashboard/sourcing/${req.id}`}
                className="dc-card dc-card-hover flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[#5A6B7D]">#{req.request_number}</p>
                  <p className="truncate text-sm font-bold text-[#081F3F]">{req.title}</p>
                  <p className="mt-1 text-sm font-bold text-[#00BC94]">{req.price}</p>
                </div>
                <DcStatusPill tone={statusTone[req.status_variant]}>{req.status}</DcStatusPill>
              </Link>
            ))}
          </div>
        )}
      </DcPanel>
    </DcPage>
  );
}
