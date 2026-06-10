'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { useUserSourcingDetail } from '@/lib/api/hooks';
import type { UserSourcingRequestDetail } from '@/lib/types';
import SourcingQuotesList from '@/components/sourcing/SourcingQuotesList';
import {
  DcLinkAction,
  DcPage,
  DcPageHeader,
  DcPanel,
  DcStatusPill,
} from '@/components/dubicolt/dashboard-ui';
import { DcButton } from '@/components/dubicolt/ui';

const statusTone: Record<UserSourcingRequestDetail['status_variant'], 'warning' | 'info' | 'default'> = {
  orange: 'warning',
  blue: 'info',
  gray: 'default',
};

export default function UserSourcingDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data: detail, isLoading } = useUserSourcingDetail(id);

  if (isLoading) {
    return (
      <DcPage>
        <p className="text-sm text-[#5A6B7D]">Loading request…</p>
      </DcPage>
    );
  }

  if (!detail) {
    return (
      <DcPage>
        <p className="mb-4 text-sm text-[#5A6B7D]">Request not found.</p>
        <DcLinkAction href="/dashboard/sourcing">← Back to part requests</DcLinkAction>
      </DcPage>
    );
  }

  return (
    <DcPage>
      <nav className="mb-4 text-xs text-[#5A6B7D]">
        <Link href="/dashboard/sourcing" className="hover:text-[#00BC94]">
          Part requests
        </Link>
        {' / '}
        <span className="font-medium text-[#243247]">Request detail</span>
      </nav>

      <DcPageHeader
        label={`#${detail.request_number}`}
        title={detail.title}
        description={`Origin: ${detail.origin}`}
        action={
          <DcButton variant="ghost" href="/dashboard/sourcing">
            ← All requests
          </DcButton>
        }
      />

      <div className="mb-2">
        <DcStatusPill tone={statusTone[detail.status_variant]}>{detail.status}</DcStatusPill>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <DcPanel title="Product description" className="lg:col-span-2">
          <p className="text-sm leading-relaxed text-[#243247]">{detail.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#EFF8F9] pt-5">
            <div>
              <p className="dc-label mb-1">Quantity</p>
              <p className="text-sm font-bold text-[#081F3F]">{detail.quantity}</p>
            </div>
            {detail.voltage_range ? (
              <div>
                <p className="dc-label mb-1">Voltage range</p>
                <p className="text-sm font-bold text-[#081F3F]">{detail.voltage_range}</p>
              </div>
            ) : null}
          </div>
        </DcPanel>

        <DcPanel title="Budget">
          <p className="text-3xl font-bold text-[#081F3F]">{detail.budget_total}</p>
          <p className="mt-1 text-xs text-[#5A6B7D]">{detail.budget_subtitle}</p>
          {detail.delivery_county || detail.delivery_address ? (
            <div className="mt-5 border-t border-[#EFF8F9] pt-5 text-sm">
              <p className="dc-label mb-2">Delivery</p>
              {detail.delivery_county ? (
                <p className="font-bold text-[#081F3F]">{detail.delivery_county}</p>
              ) : null}
              {detail.delivery_address ? (
                <p className="mt-1 leading-relaxed text-[#243247]">{detail.delivery_address}</p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {detail.regional_targets.map((t) => (
              <span
                key={t.code}
                className="rounded-lg bg-[#EFF8F9] px-2.5 py-1.5 text-xs font-bold text-[#243247]"
              >
                {t.label}
              </span>
            ))}
          </div>
        </DcPanel>
      </div>

      {detail.attachments.length > 0 ? (
        <DcPanel title="Your attachments" className="mb-6">
          <div className="flex flex-wrap gap-3">
            {detail.attachments.map((f) => (
              <div key={f.name} className="dc-card overflow-hidden">
                {f.url ? (
                  <img src={f.url} alt={f.name} className="h-32 w-32 object-cover" />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <FileText className="h-8 w-8 text-[#5A6B7D]" />
                    <div>
                      <p className="text-xs font-bold text-[#081F3F]">{f.name}</p>
                      <p className="text-[10px] text-[#5A6B7D]">{f.size}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DcPanel>
      ) : null}

      <SourcingQuotesList quotes={detail.quotes} title="Quotation" showFilter={false} />
    </DcPage>
  );
}
