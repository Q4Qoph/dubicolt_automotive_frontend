'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, Check, Clock } from 'lucide-react';
import type { AdminCategoryCard } from '@/lib/types';
import { useSaveAdminCategoryMutation, useUploadImageMutation } from '@/lib/api/hooks';
import AdminPageFooter from '@/components/admin/AdminPageFooter';

const BLUE = '#081F3F';
const BLUE_DARK = '#081F3F';


export interface CategoryFormValues {
  name: string;
  description: string;
  origins: ('KE')[];
  status: AdminCategoryCard['status'];
  imageUrl: string | null;
}

function emptyValues(): CategoryFormValues {
  return {
    name: '',
    description: '',
    origins: ['KE'],
    status: 'draft',
    imageUrl: null,
  };
}

function fromCategory(cat: AdminCategoryCard): CategoryFormValues {
  return {
    name: cat.name,
    description: cat.description,
    origins: ['KE'],
    status: cat.status,
    imageUrl: cat.image_url,
  };
}

export interface CategoryFormProps {
  mode: 'create' | 'edit';
  categoryId?: string;
  initial?: AdminCategoryCard | null;
}

export default function CategoryForm({ mode, categoryId, initial }: CategoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CategoryFormValues>(
    initial ? fromCategory(initial) : emptyValues(),
  );
  const [saved, setSaved] = useState(false);
  const saveCategory = useSaveAdminCategoryMutation();
  const uploadImage = useUploadImageMutation();

  const title = mode === 'create' ? 'Create Product Category' : 'Edit Product Category';
  const breadcrumbCurrent = mode === 'create' ? 'New Category' : 'Edit Category';

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      setValues((v) => ({ ...v, imageUrl: url }));
    } catch {
      /* upload failed */
    }
  };

  const canPublish =
    values.name.trim().length > 0 &&
    values.description.trim().length > 0 &&
    true;

  async function handleSave(publish: boolean) {
    if (!canPublish || saveCategory.isPending) return;
    const status = publish ? 'published' : 'draft';
    try {
      await saveCategory.mutateAsync({
        id: categoryId,
        name: values.name.trim(),
        description: values.description.trim(),
        origins: ['KE'],
        image_url: values.imageUrl ?? '',
        status,
      });
      setValues((v) => ({ ...v, status }));
      setSaved(true);
      setTimeout(() => router.push('/admin/categories'), 600);
    } catch {
      /* mutation error */
    }
  }

  const previewImage = values.imageUrl;

  return (
    <div className="flex flex-col min-h-full bg-[#EFF8F9]">
      <div className="flex-1 p-6 lg:p-8">
        <nav className="text-xs text-[#5A6B7D] mb-1">
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
          {' / '}
          <Link href="/admin/categories" className="hover:underline">
            Categories
          </Link>
          {' / '}
          <span className="text-[#243247]">{breadcrumbCurrent}</span>
        </nav>

        <h1 className="text-2xl font-bold mt-2 mb-1" style={{ color: BLUE_DARK }}>
          {title}
        </h1>
        <p className="text-sm text-[#5A6B7D] mb-8 max-w-xl">
          {mode === 'create'
            ? 'Group spare parts for the Kenyan marketplace catalog.'
            : `Update classification ${categoryId ? `#${categoryId}` : ''} for catalog and search.`}
        </p>

        {saved && (
          <p
            className="mb-4 text-sm font-semibold px-3 py-2 rounded-lg border border-[#b0c6ff] bg-white"
            style={{ color: BLUE }}
          >
            Category saved. Redirecting to category list…
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(true);
          }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        >
          <div className="xl:col-span-2 space-y-5">
            <section className="bg-white border border-[#EFF8F9] rounded-lg p-5">
              <h2 className="text-sm font-bold text-black mb-4">Category Essentials</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cat-name" className="block text-xs font-bold text-[#243247] mb-1.5">
                    Category Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="cat-name"
                    name="name"
                    required
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    placeholder="e.g. Industrial Textiles"
                    className="w-full px-3 py-2.5 text-sm border border-[#C5D4DC] rounded focus:outline-none focus:border-[#081F3F]"
                  />
                </div>
                <div>
                  <label htmlFor="cat-desc" className="block text-xs font-bold text-[#243247] mb-1.5">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="cat-desc"
                    name="description"
                    required
                    value={values.description}
                    onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                    rows={4}
                    placeholder="Describe the category scope and sourcing guidelines..."
                    className="w-full px-3 py-2.5 text-sm border border-[#C5D4DC] rounded resize-y focus:outline-none focus:border-[#081F3F]"
                  />
                </div>
                <div>
                  <label htmlFor="cat-status" className="block text-xs font-bold text-[#243247] mb-1.5">
                    Publication Status
                  </label>
                  <select
                    id="cat-status"
                    value={values.status}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        status: e.target.value as AdminCategoryCard['status'],
                      }))
                    }
                    className="w-full max-w-xs px-3 py-2.5 text-sm border border-[#C5D4DC] rounded bg-white focus:outline-none focus:border-[#081F3F]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-white border border-[#EFF8F9] rounded-lg p-5">
              <h2 className="text-sm font-bold text-black mb-4">Visual Assets</h2>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#C5D4DC] rounded-lg p-10 cursor-pointer hover:bg-[#EFF8F9] min-h-[180px]">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageChange}
                />
                {values.imageUrl ? (
                  <img
                    src={values.imageUrl}
                    alt="Category preview upload"
                    className="max-h-32 object-contain mb-3 rounded"
                  />
                ) : (
                  <Upload className="w-10 h-10 text-[#5A6B7D] mb-3" />
                )}
                <p className="text-sm text-[#243247] text-center">
                  Drop image here or{' '}
                  <span className="font-bold" style={{ color: BLUE }}>
                    click to upload
                  </span>
                </p>
              </label>
            </section>

            <div className="flex flex-wrap gap-3 justify-end">
              <Link
                href="/admin/categories"
                className="px-5 py-2.5 text-xs font-bold border-2 rounded-lg bg-white"
                style={{ borderColor: BLUE, color: BLUE }}
              >
                Discard Draft
              </Link>
              <button
                type="button"
                disabled={!canPublish || saveCategory.isPending}
                onClick={() => handleSave(false)}
                className="px-5 py-2.5 text-xs font-bold border-2 rounded-lg bg-white disabled:opacity-50"
                style={{ borderColor: BLUE, color: BLUE }}
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={!canPublish || saveCategory.isPending}
                className="px-5 py-2.5 text-xs font-bold rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: BLUE_DARK }}
              >
                {saveCategory.isPending ? 'Saving…' : 'Publish Category'}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <section className="bg-white border border-[#EFF8F9] rounded-lg p-5">
              <h2 className="text-sm font-bold text-black mb-4">Live Preview</h2>
              <div className="border border-[#EFF8F9] rounded-lg overflow-hidden">
                <div className="h-32 bg-[#EFF8F9] flex items-center justify-center">
                  {previewImage ? (
                    <img src={previewImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-[#5A6B7D]">Upload an image</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex gap-1 mb-2">
                    {values.origins.map((o) => (
                      <span
                        key={o}
                        className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#C5D4DC] rounded"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-black">{values.name || 'Category Title'}</p>
                  <p className="text-xs text-[#5A6B7D] mt-1 line-clamp-3">
                    {values.description || 'Category description preview for marketplace users.'}
                  </p>
                  <button
                    type="button"
                    className="mt-3 w-full py-2 text-xs font-bold rounded-lg text-white"
                    style={{ backgroundColor: BLUE }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>
      <AdminPageFooter />
    </div>
  );
}
