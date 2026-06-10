'use client';

import { useEffect, useState } from 'react';
import { Send, FileEdit } from 'lucide-react';
import { useSaveOfficialQuoteMutation } from '@/lib/api/hooks';
import type { SourcingQuoteReceived } from '@/lib/types';
import { TRANSPORT_TYPES } from '@/lib/contracts';
import { stripCurrencyPrefix } from '@/lib/currency';

const BLUE = '#081F3F';
const BLUE_DARK = '#081F3F';
const SECTION_BG = '#EFF8F9';

const transportOptions = [...TRANSPORT_TYPES];

export interface QuoteFormValues {
  unitPrice: string;
  shippingCost: string;
  transport: string;
  leadDays: string;
  notes: string;
}

function emptyValues(): QuoteFormValues {
  return { unitPrice: '', shippingCost: '', transport: '', leadDays: '', notes: '' };
}

function valuesFromQuote(quote: SourcingQuoteReceived | null | undefined): QuoteFormValues {
  if (!quote) return emptyValues();
  return {
    unitPrice: stripCurrencyPrefix(quote.unit_price),
    shippingCost: quote.shipping_cost ? stripCurrencyPrefix(quote.shipping_cost) : '',
    transport: quote.shipment,
    leadDays: quote.lead_time.match(/\d+/)?.[0] ?? '',
    notes: quote.notes,
  };
}

export interface AdminOfficialQuoteFormProps {
  requestId: string;
  clientName: string;
  initialQuote: SourcingQuoteReceived | null;
  onSaved: () => void;
}

export default function AdminOfficialQuoteForm({
  requestId,
  clientName,
  initialQuote,
  onSaved,
}: AdminOfficialQuoteFormProps) {
  const hasQuote = Boolean(initialQuote);
  const [values, setValues] = useState<QuoteFormValues>(() => valuesFromQuote(initialQuote));
  const saveQuote = useSaveOfficialQuoteMutation(requestId);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setValues(valuesFromQuote(initialQuote));
  }, [initialQuote]);

  const pdfNote = `This information will be displayed on the final PDF quote issued to ${clientName}.`;

  async function handleSave() {
    if (!values.unitPrice.trim() || !values.transport || !values.leadDays.trim()) return;
    try {
      await saveQuote.mutateAsync({
        unit_price: values.unitPrice,
        shipping_cost: values.shippingCost,
        transport: values.transport,
        lead_time_days: values.leadDays,
        notes: values.notes,
      });
      setSavedFlash(true);
      onSaved();
      setTimeout(() => setSavedFlash(false), 2000);
    } catch {
      /* ApiError surfaced by parent if needed */
    }
  }

  return (
    <section
      id="official-quote"
      className="bg-white border-2 rounded-lg p-6 scroll-mt-6"
      style={{ borderColor: hasQuote ? BLUE : '#ff924d' }}
    >
      <div
        className="rounded-lg px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3"
        style={{ backgroundColor: SECTION_BG }}
      >
        <div className="flex items-center gap-2">
          <FileEdit className="w-5 h-5" style={{ color: BLUE }} />
          <div>
            <h2 className="text-sm font-bold text-black">Official Quote</h2>
            <p className="text-xs text-[#5A6B7D]">
              {hasQuote
                ? 'Edit the quote below. Changes update what the buyer sees.'
                : 'Add your single official quote for this request here.'}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded ${
            hasQuote ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}
        >
          {hasQuote ? 'Quote on file' : 'No quote yet'}
        </span>
      </div>

      {!hasQuote && (
        <div className="border-2 border-dashed border-[#ff924d] rounded-lg px-4 py-3 mb-5 text-center">
          <p className="text-sm font-bold text-[#243247]">Add official quote</p>
          <p className="text-xs text-[#5A6B7D] mt-1">
            Fill in unit price, shipping, transport, lead time, and notes, then save.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-xs font-bold text-[#243247] mb-1.5">
            Unit price (KSh) <span className="text-red-600">*</span>
          </label>
          <div className="flex border border-[#C5D4DC] rounded-lg overflow-hidden">
            <span className="px-3 py-2.5 bg-[#EFF8F9] text-sm font-semibold text-[#243247] border-r border-[#C5D4DC]">
              KSh
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={values.unitPrice}
              onChange={(e) => setValues((v) => ({ ...v, unitPrice: e.target.value }))}
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none focus:border-[#081F3F]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#243247] mb-1.5">Shipping cost (KSh)</label>
          <div className="flex border border-[#C5D4DC] rounded-lg overflow-hidden">
            <span className="px-3 py-2.5 bg-[#EFF8F9] text-sm font-semibold text-[#243247] border-r border-[#C5D4DC]">
              KSh
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={values.shippingCost}
              onChange={(e) => setValues((v) => ({ ...v, shippingCost: e.target.value }))}
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#243247] mb-1.5">
            Transport Type <span className="text-red-600">*</span>
          </label>
          <select
            value={values.transport}
            onChange={(e) => setValues((v) => ({ ...v, transport: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-[#C5D4DC] rounded-lg bg-white focus:outline-none focus:border-[#081F3F]"
          >
            <option value="">Select transport type</option>
            {transportOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#243247] mb-1.5">
            Lead Time <span className="text-red-600">*</span>
          </label>
          <div className="flex border border-[#C5D4DC] rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="e.g. 15"
              value={values.leadDays}
              onChange={(e) => setValues((v) => ({ ...v, leadDays: e.target.value }))}
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
            />
            <span className="px-3 py-2.5 bg-[#EFF8F9] text-sm text-[#5A6B7D] border-l border-[#C5D4DC]">
              days
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-[#243247] mb-1.5">Official Notes from Admin</label>
        <textarea
          rows={4}
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
          placeholder="Quality certifications, packaging, warranty terms..."
          className="w-full px-3 py-2.5 text-sm border border-[#C5D4DC] rounded-lg focus:outline-none focus:border-[#081F3F] resize-y"
        />
      </div>

      <p className="text-[10px] text-[#5A6B7D] mb-4 leading-relaxed">{pdfNote}</p>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#EFF8F9]">
        {savedFlash && (
          <span className="text-xs font-bold text-green-700 mr-auto">Quote saved.</span>
        )}
        <button
          type="button"
          disabled={saveQuote.isPending}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg text-white disabled:opacity-50"
          style={{ backgroundColor: BLUE_DARK }}
        >
          <Send className="w-4 h-4" />
          {saveQuote.isPending ? 'Saving…' : hasQuote ? 'Save Changes' : 'Issue Official Quote'}
        </button>
      </div>
    </section>
  );
}
