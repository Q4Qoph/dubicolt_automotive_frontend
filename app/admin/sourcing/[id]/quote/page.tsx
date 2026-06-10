'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminSourcingDetail } from '@/lib/api/hooks';
import AdminOfficialQuoteForm from '@/components/sourcing/AdminOfficialQuoteForm';
import AdminPageFooter from '@/components/admin/AdminPageFooter';

const BLUE = '#081F3F';

export default function AdminGenerateQuotePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data: detail, isLoading, refetch } = useAdminSourcingDetail(id);

  if (isLoading) {
    return <div className="p-8 text-sm text-[#5A6B7D] bg-[#EFF8F9] min-h-full">Loading…</div>;
  }

  if (!detail) {
    return (
      <div className="p-8 bg-[#EFF8F9] min-h-full">
        <p className="text-sm text-[#5A6B7D] mb-4">Request not found.</p>
        <Link href="/admin/sourcing" className="text-sm font-bold hover:underline" style={{ color: BLUE }}>
          ← Back to sourcing
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#EFF8F9]">
      <div className="flex-1 p-6 lg:p-8">
        <nav className="text-xs text-[#5A6B7D] mb-4">
          <Link href="/admin/sourcing" className="hover:underline">
            Sourcing Requests
          </Link>
          {' / '}
          <Link href={`/admin/sourcing/${id}`} className="hover:underline">
            Request Detail
          </Link>
          {' / '}
          <span className="text-[#243247] font-medium">Official Quote</span>
        </nav>

        <AdminOfficialQuoteForm
          requestId={detail.id}
          clientName={detail.client_name}
          initialQuote={detail.quotes[0] ?? null}
          onSaved={() => refetch()}
        />

        <p className="text-xs text-[#5A6B7D] mt-4 text-center">
          <Link href={`/admin/sourcing/${id}`} className="font-bold hover:underline" style={{ color: BLUE }}>
            ← Back to full request detail
          </Link>
        </p>
      </div>
      <AdminPageFooter />
    </div>
  );
}
