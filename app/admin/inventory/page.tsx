'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  AlertTriangle,
  ChevronDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
} from 'lucide-react';
import { useAdminInventory, useAdminInventoryKpis } from '@/lib/api/hooks';
import { PRODUCT_STATUS_LABELS } from '@/lib/contracts/enums';
import type { AdminInventoryItem } from '@/lib/types';
import AdminPageFooter from '@/components/admin/AdminPageFooter';
import { DcKpiCard, DcLinkAction, DcPage, DcPageHeader, DcPanel } from '@/components/dubicolt/dashboard-ui';
import { DcButton } from '@/components/dubicolt/ui';
const PAGE_SIZE = 10;

export default function AdminInventoryPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [page, setPage] = useState(1);
  const { data: items = [], isLoading: itemsLoading } = useAdminInventory(search);
  const { data: kpis, isLoading: kpisLoading } = useAdminInventoryKpis();

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(items.map((i) => i.category)))],
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchStatus && matchSearch;
    });
  }, [items, search, categoryFilter, statusFilter]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="flex min-h-full flex-col">
      <DcPage>
        <DcPageHeader
          label="Inventory"
          title="Marketplace inventory"
          description="Manage active SKUs, stock levels, and pricing. Origin is set per product (Kenya in MVP)."
          action={
            <DcButton variant="secondary" href="/admin/inventory/new">
              <Plus className="h-4 w-4" />
              Add product
            </DcButton>
          }
        />

        {kpis ? (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <DcKpiCard
              label="Total active products"
              value={kpis.total_active_products.toLocaleString()}
              hint={`+${kpis.new_this_week} new this week`}
              icon={Package}
            />
            <DcKpiCard
              label="Total inventory value"
              value={kpis.total_inventory_value}
              hint="Kenya marketplace stock"
              icon={TrendingUp}
              tone="green"
            />
            <DcKpiCard
              label="Low stock alerts"
              value={`${kpis.low_stock_count} SKUs`}
              hint="Requires attention"
              icon={AlertTriangle}
              tone="orange"
            />
          </div>
        ) : null}

        <p className="mb-4 text-xs text-[#5A6B7D]">
          Classifications: <DcLinkAction href="/admin/categories">Category management →</DcLinkAction>
        </p>

        <DcPanel title="Product catalog">
          <div className="p-4 border-b border-[#EFF8F9] flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B7D]" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, SKU, or category..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#C5D4DC] rounded-lg bg-[#EFF8F9] focus:outline-none focus:border-[#081F3F]"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as 'all' | 'draft' | 'published');
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-bold border border-[#C5D4DC] rounded-lg bg-white text-[#243247] focus:outline-none focus:border-[#081F3F]"
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B7D] pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-bold border border-[#C5D4DC] rounded-lg bg-white text-[#243247] focus:outline-none focus:border-[#081F3F]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'all' ? 'Category' : c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B7D] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-[#EFF8F9] bg-[#EFF8F9]">
                  {['Product Info', 'Category', 'Status', 'Stock', 'Price', 'Actions'].map((h) => (
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
                {pageItems.length > 0 ? (
                  pageItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#EFF8F9] last:border-0 hover:bg-[#EFF8F9]/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded border border-[#EFF8F9] overflow-hidden bg-[#EFF8F9] shrink-0">
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-black leading-snug">{item.name}</p>
                            <p className="text-xs text-[#5A6B7D] mt-0.5">SKU: {item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border border-[#C5D4DC] bg-[#EFF8F9] text-[#243247]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            item.status === 'published'
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {PRODUCT_STATUS_LABELS[item.status] ?? item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-black">
                            {item.stock.toLocaleString()} units
                          </span>
                          {item.low_stock && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" />
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="text-sm font-bold text-[#081F3F]">
                          {item.marketplace_price}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/inventory/${item.id}/edit`}
                            className="p-2 border border-[#C5D4DC] rounded hover:bg-[#EFF8F9]"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="w-4 h-4 text-[#243247]" />
                          </Link>
                          <button
                            type="button"
                            className="p-2 border border-[#C5D4DC] rounded hover:bg-red-50 text-red-600"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#5A6B7D]">
                      No products match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#EFF8F9] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#5A6B7D]">
              Showing {showingFrom}-{showingTo} of {filtered.length.toLocaleString()} products
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
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 1 && p <= page + 1),
                )
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 ? (
                      <span className="px-1 text-[#5A6B7D]">…</span>
                    ) : null}
                    <button
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
                  </span>
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
