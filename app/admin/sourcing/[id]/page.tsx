'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { useAdminSourcingDetail } from '@/lib/api/hooks';
import type { SourcingRequestDetail } from '@/lib/types';
import AdminOfficialQuoteForm from '@/components/sourcing/AdminOfficialQuoteForm';
import AdminPageFooter from '@/components/admin/AdminPageFooter';

const BLUE = '#081F3F';
const BLUE_DARK = '#081F3F';

const statusBadge: Record<SourcingRequestDetail['status'], string> = {
  pending: 'ACTIVE REQUEST',
  quoted: 'QUOTED',
  shipping: 'IN TRANSIT',
  delivered: 'DELIVERED',
};

export default function AdminSourcingDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data: detail, isLoading, refetch } = useAdminSourcingDetail(id);

  if (isLoading) {
    return <div className="p-8 text-sm text-[#5A6B7D] bg-[#EFF8F9] min-h-full">Loading request…</div>;
  }

  if (!detail) {
    return (
      <div className="p-8 bg-[#EFF8F9] min-h-full">
        <p className="text-sm text-[#5A6B7D] mb-4">Request not found.</p>
        <Link href="/admin/sourcing" className="text-sm font-bold hover:underline" style={{ color: BLUE }}>
          ← Back to sourcing requests
        </Link>
      </div>
    );
  }

  const officialQuote = detail.quotes[0] ?? null;

  return (
    <div className="flex flex-col min-h-full bg-[#EFF8F9]">
      <div className="flex-1 p-6 lg:p-8">
        <nav className="text-xs text-[#5A6B7D] mb-4">
          <Link href="/admin/sourcing" className="hover:underline">
            Sourcing Requests
          </Link>
          {' / '}
          <span className="text-[#243247] font-medium">Request Detail</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <span
              className="inline-block text-[10px] font-bold px-2.5 py-1 rounded text-white mb-2"
              style={{ backgroundColor: BLUE }}
            >
              {statusBadge[detail.status]}
            </span>
            <p className="text-sm font-mono text-[#5A6B7D] mb-1">#{detail.request_number}</p>
            <h1 className="text-2xl font-bold text-black">{detail.product_title}</h1>
            <p className="text-sm text-[#5A6B7D] mt-1">
              {detail.client_name}
              {detail.requester_location ? ` · ${detail.requester_location}` : ''}
            </p>
          </div>
          <a
            href="#official-quote"
            className="px-4 py-2 text-xs font-bold rounded-lg text-white shrink-0 hover:opacity-90"
            style={{ backgroundColor: BLUE_DARK }}
          >
            {officialQuote ? 'Edit Official Quote' : 'Add Official Quote'}
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <section className="lg:col-span-2 bg-white border border-[#EFF8F9] rounded-lg p-5">
            <h2 className="text-sm font-bold text-black mb-3">Product Description</h2>
            <p className="text-sm text-[#243247] leading-relaxed mb-4">{detail.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EFF8F9]">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#5A6B7D]">Quantity</p>
                <p className="text-sm font-bold text-black">{detail.quantity}</p>
              </div>
              {detail.voltage_range && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#5A6B7D]">Voltage Range</p>
                  <p className="text-sm font-bold text-black">{detail.voltage_range}</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white border border-[#EFF8F9] rounded-lg p-5">
            <h2 className="text-sm font-bold text-black mb-3">Budget Allocation</h2>
            <p className="text-3xl font-bold" style={{ color: BLUE_DARK }}>
              {detail.budget_total}
            </p>
            <p className="text-xs text-[#5A6B7D] mt-1">{detail.budget_subtitle}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {detail.regional_targets.map((t) => (
                <span
                  key={t.code}
                  className="text-xs font-bold px-2.5 py-1.5 border border-[#C5D4DC] rounded bg-[#EFF8F9]"
                >
                  {t.label}
                </span>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white border border-[#EFF8F9] rounded-lg p-5 mb-5">
          <h2 className="text-sm font-bold text-black mb-4">Technical Documentation</h2>
          <div className="flex flex-wrap gap-3">
            {detail.attachments.length > 0 ? (
              detail.attachments.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-3 border border-[#EFF8F9] rounded-lg px-4 py-3 min-w-[200px]"
                >
                  <FileText className="w-8 h-8 text-[#5A6B7D]" />
                  <div>
                    <p className="text-xs font-bold text-black">{f.name}</p>
                    <p className="text-[10px] text-[#5A6B7D]">{f.size}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#5A6B7D]">No attachments.</p>
            )}
          </div>
        </section>

        <AdminOfficialQuoteForm
          requestId={detail.id}
          clientName={detail.client_name}
          initialQuote={officialQuote}
          onSaved={() => refetch()}
        />
      </div>
      <AdminPageFooter />
    </div>
  );
}
