'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';
import { useAdminCategory } from '@/lib/api/hooks';
import type { AdminCategoryCard } from '@/lib/types';

const BLUE = '#081F3F';

export default function EditCategoryPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data: category, isLoading } = useAdminCategory(id);

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-[#5A6B7D] bg-[#EFF8F9] min-h-full">Loading category…</div>
    );
  }

  if (!category) {
    return (
      <div className="p-8 bg-[#EFF8F9] min-h-full">
        <p className="text-sm text-[#5A6B7D] mb-4">Category not found.</p>
        <Link href="/admin/categories" className="text-sm font-bold hover:underline" style={{ color: BLUE }}>
          ← Back to categories
        </Link>
      </div>
    );
  }

  return <CategoryForm mode="edit" categoryId={id} initial={category} />;
}
