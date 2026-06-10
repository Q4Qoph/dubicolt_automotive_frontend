'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Globe,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useAdminSourcingRequests } from '@/lib/api/hooks';
import AdminPageFooter from '@/components/admin/AdminPageFooter';
import { DcPage, DcPageHeader, DcPanel } from '@/components/dubicolt/dashboard-ui';
import type { SourcingRequest } from '@/lib/types';

const statusConfig: Record<
  SourcingRequest['status'],
  { label: string; textColor: string; dot: string }
> = {
  pending: { label: 'Pending Quote', textColor: 'text-orange-600', dot: 'bg-orange-500' },
  quoted: { label: 'Quoted', textColor: 'text-[#081F3F]', dot: 'bg-[#081F3F]' },
  shipping: { label: 'Shipping', textColor: 'text-green-600', dot: 'bg-green-500' },
  delivered: { label: 'Delivered', textColor: 'text-[#5A6B7D]', dot: 'bg-[#5A6B7D]' },
};

const PAGE_SIZE = 10;

function ReferencesCell({ req }: { req: SourcingRequest }) {
  const images = req.reference_images.slice(0, 2);
  return (
    <div className="flex items-center gap-1.5">
      {images.map((src, i) => (
        <div
          key={i}
          className="w-10 h-10 rounded border border-[#C5D4DC] overflow-hidden bg-[#EFF8F9] shrink-0"
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
      {req.reference_extra != null && req.reference_extra > 0 && (
        <span className="w-10 h-10 rounded border border-[#C5D4DC] bg-[#EFF8F9] flex items-center justify-center text-xs font-bold text-[#243247] shrink-0">
          +{req.reference_extra}
        </span>
      )}
      {req.has_document && (
        <span className="w-10 h-10 rounded border border-[#C5D4DC] bg-[#EFF8F9] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-[#5A6B7D]" />
        </span>
      )}
    </div>
  );
}

function RequestActions({ req }: { req: SourcingRequest }) {
  return (
    <Link
      href={`/admin/sourcing/${req.id}`}
      className="inline-flex items-center gap-1 rounded-lg bg-[#081F3F] px-3 py-1.5 text-[10px] font-bold uppercase text-white hover:bg-[#0a2850]"
    >
      <ExternalLink className="w-3 h-3" />
      View
    </Link>
  );
}

function DestinationCell({ req }: { req: SourcingRequest }) {
  return (
    <div className="inline-flex items-center gap-2 border border-[#C5D4DC] rounded-lg px-2.5 py-2 bg-white max-w-[200px]">
      <Globe className="w-4 h-4 text-[#5A6B7D] shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-bold text-black truncate">{req.destination}</p>
        <p className="text-[10px] text-[#5A6B7D] leading-tight">Kenya</p>
      </div>
    </div>
  );
}

export default function AdminSourcingPage() {
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: requests = [], isLoading } = useAdminSourcingRequests({
    statuses: statusFilter.length > 0 ? statusFilter : undefined,
  });

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const pageRequests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return requests.slice(start, start + PAGE_SIZE);
  }, [requests, page]);

  const showingFrom = requests.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, requests.length);

  function toggleStatusFilter(s: string) {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
    setPage(1);
  }

  const hasFilters = statusFilter.length > 0;

  return (
    <div className="flex min-h-full flex-col">
      <DcPage>
        <DcPageHeader
          label="Sourcing"
          title="Custom sourcing requests"
          description="Review part requests from Kenyan customers and send quotations."
        />

        <DcPanel title="Filters" className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7D] mb-2">
                Status
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {(['pending', 'quoted', 'shipping'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStatusFilter(s)}
                    className={`px-3 py-1.5 rounded text-xs font-bold capitalize transition-colors ${
                      statusFilter.includes(s)
                        ? 'text-white'
                        : 'bg-white border border-[#C5D4DC] text-[#243247]'
                    }`}
                    style={statusFilter.includes(s) ? { backgroundColor: '#081F3F' } : undefined}
                  >
                    {s === 'pending' ? 'Pending' : s === 'quoted' ? 'Quoted' : 'Shipping'}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter([]);
                  setPage(1);
                }}
                className="text-xs font-bold text-[#00BC94] hover:underline lg:ml-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </DcPanel>

        <DcPanel title="All requests">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#EFF8F9] bg-[#EFF8F9]">
                  {[
                    'Client & ID',
                    'Product Details',
                    'References',
                    'Destination',
                    'Status',
                    'Actions',
                  ].map((h) => (
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
                {pageRequests.length > 0 ? (
                  pageRequests.map((req) => {
                    const sc = statusConfig[req.status];
                    return (
                      <tr
                        key={req.id}
                        className="border-b border-[#EFF8F9] last:border-0 hover:bg-[#EFF8F9]/80"
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                              style={{ backgroundColor: '#00BC94', color: '#081F3F' }}
                            >
                              {req.client_initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-black">{req.client_name}</p>
                              <p className="text-xs text-[#5A6B7D]">#{req.request_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top max-w-[280px]">
                          <p className="text-sm font-bold text-[#00BC94]">
                            {req.product_title}
                          </p>
                          <p className="text-xs text-[#5A6B7D] mt-1 line-clamp-2 leading-relaxed">
                            {req.description}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <ReferencesCell req={req} />
                        </td>
                        <td className="px-5 py-4 align-top">
                          <DestinationCell req={req} />
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                            <span className={`text-xs font-bold ${sc.textColor}`}>
                              {sc.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <RequestActions req={req} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#5A6B7D]">
                      No requests match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#EFF8F9] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#5A6B7D]">
              Showing {showingFrom}-{showingTo} of {requests.length} requests
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center border border-[#C5D4DC] rounded bg-white hover:bg-[#EFF8F9] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center border rounded text-xs font-bold ${
                    page === p
                      ? 'text-white border-transparent'
                      : 'border-[#C5D4DC] text-[#243247] bg-white hover:bg-[#EFF8F9]'
                  }`}
                  style={page === p ? { backgroundColor: '#081F3F' } : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center border border-[#C5D4DC] rounded bg-white hover:bg-[#EFF8F9] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DcPanel>
      </DcPage>

      <AdminPageFooter />
    </div>
  );
}
