'use client';

import { ShieldCheck } from 'lucide-react';
import type { SourcingQuoteReceived } from '@/lib/types';
import { QuotationActions } from '@/components/sourcing/quotation-actions';
import { DcPanel } from '@/components/dubicolt/dashboard-ui';

export default function SourcingQuotesList({
  quotes,
  title = 'Quotes Received',
  showFilter = true,
}: {
  quotes: SourcingQuoteReceived[];
  title?: string;
  showFilter?: boolean;
}) {
  if (quotes.length === 0) {
    return (
      <DcPanel title={title}>
        <p className="text-sm text-[#5A6B7D]">No quotation yet. Dubicolt will review your request and send a price.</p>
      </DcPanel>
    );
  }

  return (
    <DcPanel title={title}>
      <div className="space-y-4">
        {quotes.map((q) => (
          <div key={q.id} className="rounded-xl bg-[#EFF8F9] p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#00BC94]" />
              <span className="text-xs font-bold text-[#081F3F]">Dubicolt quotation</span>
              {q.status && q.status !== 'PENDING' ? (
                <span className="text-[10px] font-bold uppercase text-[#5A6B7D]">{q.status}</span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="dc-label mb-0.5">Price</p>
                <p className="font-bold text-[#081F3F]">{q.unit_price}</p>
              </div>
              <div>
                <p className="dc-label mb-0.5">Lead time</p>
                <p className="font-bold text-[#081F3F]">{q.lead_time}</p>
              </div>
              <div>
                <p className="dc-label mb-0.5">Delivery</p>
                <p className="font-bold text-[#081F3F]">{q.shipment}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="dc-label mb-0.5">Validity</p>
                <p className="text-xs text-[#243247]">{q.notes}</p>
              </div>
            </div>
            <QuotationActions
              quoteId={q.id}
              priceLabel={q.unit_price}
              canAccept={q.status === 'PENDING' || q.status === undefined}
            />
          </div>
        ))}
      </div>
    </DcPanel>
  );
}
