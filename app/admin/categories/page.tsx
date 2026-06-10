'use client';

import Link from 'next/link';
import { Plus, Filter, Pencil, Copy, Eye, EyeOff } from 'lucide-react';
import { useAdminCategories } from '@/lib/api/hooks';
import type { AdminCategoryCard } from '@/lib/types';
import AdminPageFooter from '@/components/admin/AdminPageFooter';

const BLUE = '#081F3F';
const BLUE_DARK = '#081F3F';

const trendClass: Record<AdminCategoryCard['trend_variant'], string> = {
  up: 'text-green-600 bg-green-50',
  stable: 'text-[#5A6B7D] bg-[#f0f4f9]',
  down: 'text-red-600 bg-red-50',
};

export default function CategoryManagementPage() {
  const { data: cards = [], isLoading } = useAdminCategories();

  return (
    <div className="flex flex-col min-h-full bg-[#EFF8F9]">
      <div className="flex-1 p-6 lg:p-8">
        <nav className="text-xs text-[#5A6B7D] mb-1">
          Categories / <span className="text-[#243247] font-medium">Category Management</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BLUE_DARK }}>
              Category Management
            </h1>
            <p className="text-sm text-[#5A6B7D] mt-1">
              Organize spare parts for the Kenyan marketplace catalog.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/admin/categories/new"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg text-white"
              style={{ backgroundColor: BLUE }}
            >
              <Plus className="w-4 h-4" />
              Create Category
            </Link>
          </div>
        </div>

        <p className="text-xs mb-4">
          <Link href="/admin/inventory" className="font-bold hover:underline" style={{ color: BLUE }}>
            ← Marketplace inventory (SKUs)
          </Link>
        </p>

        {isLoading ? (
          <p className="text-sm text-[#5A6B7D]">Loading categories…</p>
        ) : cards.length === 0 ? (
          <div className="dc-card p-10 text-center">
            <p className="font-bold text-[#081F3F]">No categories yet</p>
            <p className="mt-2 text-sm text-[#5A6B7D]">
              Categories are created from your product catalog. Add products or create a category below.
            </p>
            <Link
              href="/admin/categories/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#00BC94] px-4 py-2 text-xs font-bold text-[#081F3F]"
            >
              <Plus className="h-4 w-4" />
              Create category
            </Link>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-[#EFF8F9] rounded-lg overflow-hidden"
            >
              <div className="relative h-44">
                <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
                {cat.status === 'draft' && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                    Draft
                  </span>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-bold text-black mb-1">{cat.name}</h2>
                <p className="text-xs text-[#5A6B7D] line-clamp-2 mb-3">{cat.description}</p>
             
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                    <div>
                      <p className="text-[10px] text-[#5A6B7D] uppercase">Total SKUs</p>
                      <p className="font-bold" style={{ color: BLUE_DARK }}>
                        {cat.total_skus.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${trendClass[cat.trend_variant]}`}
                  >
                    {cat.trend}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-t border-[#EFF8F9] pt-3">
                  <Link
                    href={`/admin/categories/${cat.id}/edit`}
                    className="p-2 border border-[#C5D4DC] rounded hover:bg-[#EFF8F9]"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Pencil className="w-4 h-4 text-[#243247]" />
                  </Link>
                  <button type="button" className="p-2 border border-[#C5D4DC] rounded hover:bg-[#EFF8F9]">
                    <Copy className="w-4 h-4 text-[#243247]" />
                  </button>
                  <button type="button" className="p-2 border border-[#C5D4DC] rounded hover:bg-[#EFF8F9] ml-auto">
                    <EyeOff className="w-4 h-4 text-[#5A6B7D]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
      <AdminPageFooter />
    </div>
  );
}
