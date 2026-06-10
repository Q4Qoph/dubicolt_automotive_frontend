'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Upload,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import AdminPageFooter from '@/components/admin/AdminPageFooter';
import {
  useAdminCategories,
  useAdminInventoryProduct,
  useUpdateInventoryProductMutation,
  useUploadImageMutation,
} from '@/lib/api/hooks';
import type { AdminInventoryProductDetail } from '@/lib/contracts';
const BLUE = '#081F3F';
const BLUE_DARK = '#081F3F';
const LOW_STOCK_THRESHOLD = 25;

type HubCode = 'CN' | 'AE' | 'KE';

const HUBS: { code: HubCode; label: string; flag: string }[] = [
  { code: 'CN', label: 'China', flag: '🇨🇳' },
  { code: 'AE', label: 'Dubai (UAE)', flag: '🇦🇪' },
  { code: 'KE', label: 'Kenya', flag: '🇰🇪' },
];

interface Attribute {
  id: string;
  feature: string;
  value: string;
}

interface FormState {
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  primaryOrigin: HubCode;
  priceKes: string;
  compareAtPriceKes: string;
  stock: number;
  minOrder: number;
  status: 'draft' | 'published';
  mainImage: string | null;
  otherImages: string[];
  attributes: Attribute[];
}

function detailToForm(d: AdminInventoryProductDetail): FormState {
  return {
    name: d.name,
    sku: d.sku,
    category: d.category,
    brand: d.brand ?? '',
    description: d.description,
    primaryOrigin: d.primary_origin,
    priceKes: String(d.price_kes),
    compareAtPriceKes:
      d.compare_at_price_kes != null ? String(d.compare_at_price_kes) : '',
    stock: d.stock,
    minOrder: d.min_order ?? 1,
    status: d.status ?? (d.on_marketplace ? 'published' : 'draft'),
    mainImage: d.image_url,
    otherImages: d.gallery_images ?? [],
    attributes:
      d.attributes?.length > 0
        ? d.attributes.map((a, i) => ({ id: String(i), feature: a.feature, value: a.value }))
        : [{ id: '1', feature: '', value: '' }],
  };
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-[#243247] mb-1.5">
      {children}
    </label>
  );
}

function inputClass() {
  return 'w-full px-3 py-2.5 text-sm border border-[#C5D4DC] rounded bg-white focus:outline-none focus:border-[#081F3F]';
}

export default function EditInventoryProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: product, isLoading, isError } = useAdminInventoryProduct(params.id);
  const { data: adminCategories = [] } = useAdminCategories();
  const updateProduct = useUpdateInventoryProductMutation(params.id);
  const uploadImage = useUploadImageMutation();
  const [form, setForm] = useState<FormState | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categoryOptions = adminCategories.map((c) => c.name);

  useEffect(() => {
    if (product) setForm(detailToForm(product));
  }, [product]);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  if (isLoading || !form) {
    return (
      <div className="min-h-full flex items-center justify-center text-[#5A6B7D] gap-2 p-8">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading product…
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-full p-8 text-center">
        <p className="text-red-600 mb-4">Product not found.</p>
        <Link href="/admin/inventory" className="text-sm font-bold underline" style={{ color: BLUE }}>
          Back to inventory
        </Link>
      </div>
    );
  }

  const isLowStock = form.stock > 0 && form.stock < LOW_STOCK_THRESHOLD;
  const canSave =
    form.name.trim() &&
    form.sku.trim() &&
    form.category &&
    form.description.trim() &&
    form.mainImage &&
    parseFloat(form.priceKes) > 0 &&
    form.stock >= 0;

  async function handleSave(listingStatus?: 'draft' | 'published') {
    const f = form;
    if (!f || !product) return;
    const status = listingStatus ?? f.status;
    const publishing = status === 'published';
    if ((publishing && !canSave) || updateProduct.isPending) return;
    if (!f.name.trim() || !f.sku.trim()) return;
    const priceKes = parseFloat(f.priceKes);
    setSaveError(null);
    try {
      await updateProduct.mutateAsync({
        name: f.name.trim(),
        sku: f.sku.trim(),
        category: f.category,
        brand: f.brand.trim() || undefined,
        description: f.description.trim(),
        primary_origin: f.primaryOrigin,
        price_kes: Math.round(priceKes),
        compare_at_price_kes: (() => {
          const raw = f.compareAtPriceKes.trim();
          if (!raw) return null;
          const kes = parseFloat(raw);
          return Number.isFinite(kes) && kes > 0 ? Math.round(kes) : null;
        })(),
        stock: Math.max(0, f.stock),
        min_order: Math.max(1, f.minOrder),
        image_url: f.mainImage ?? product.image_url,
        images: [f.mainImage ?? product.image_url, ...f.otherImages].slice(0, 8),
        attributes: f.attributes
          .filter((a) => a.feature.trim() && a.value.trim())
          .map((a) => ({ feature: a.feature.trim(), value: a.value.trim() })),
        status,
      });
      router.push('/admin/inventory');
    } catch {
      setSaveError('Could not save changes. Check you are logged in as admin.');
    }
  }

  async function handleMainImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      update('mainImage', url);
    } catch {
      setSaveError('Image upload failed.');
    }
    e.target.value = '';
  }

  async function handleOtherImagesPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadImage.mutateAsync(file);
        urls.push(url);
      }
      const f = form;
      if (!f) return;
      update('otherImages', [...f.otherImages, ...urls].slice(0, 8));
    } catch {
      setSaveError('Image upload failed.');
    }
    e.target.value = '';
  }

  return (
    <div className="flex flex-col min-h-full bg-[#EFF8F9]">
      <div className="flex-1 p-6 lg:p-8 max-w-4xl">
        <nav className="flex items-center gap-1.5 text-xs text-[#5A6B7D] mb-4">
          <Link href="/admin/inventory" className="hover:underline">
            Inventory
          </Link>
          <span>/</span>
          <span className="text-[#243247]">Edit product</span>
        </nav>

        <h1 className="text-2xl font-bold mb-1" style={{ color: BLUE_DARK }}>
          Edit product
        </h1>
        <p className="text-sm text-[#5A6B7D] mb-2">
          Update listing details, stock, and images.
        </p>
        <p className="mb-6">
          <span
            className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
              form.status === 'published'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {form.status === 'published' ? 'Published. Visible on marketplace' : 'Draft. Not visible to buyers'}
          </span>
        </p>

        {saveError ? (
          <p className="text-sm text-red-600 mb-4 flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {saveError}
          </p>
        ) : null}

        <div className="space-y-6">
          <section className="bg-white border border-[#EFF8F9] rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-black">Product info</h2>
            <div>
              <FieldLabel htmlFor="name">Product name *</FieldLabel>
              <input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputClass()}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="sku">SKU *</FieldLabel>
                <input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => update('sku', e.target.value)}
                  className={inputClass()}
                />
              </div>
              <div>
                <FieldLabel htmlFor="category">Category *</FieldLabel>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className={inputClass()}
                >
                  {categoryOptions.length === 0 ? (
                    <option value={form.category}>{form.category}</option>
                  ) : (
                    categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="brand">Brand / manufacturer</FieldLabel>
              <input
                id="brand"
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
                className={inputClass()}
              />
            </div>
            <div>
              <FieldLabel htmlFor="description">Description *</FieldLabel>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                className={`${inputClass()} resize-y`}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#243247] mb-2">Primary origin hub</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {HUBS.map((o) => (
                  <button
                    key={o.code}
                    type="button"
                    onClick={() => update('primaryOrigin', o.code)}
                    className={`flex items-center gap-3 border-2 rounded-lg p-3 text-left bg-white ${
                      form.primaryOrigin === o.code ? 'border-[#081F3F]' : 'border-[#C5D4DC]'
                    }`}
                  >
                    <span className="text-xl">{o.flag}</span>
                    <span className="text-sm font-bold">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#EFF8F9] rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-black">Pricing & stock</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="priceKes">Price (KES) *</FieldLabel>
                <input
                  id="priceKes"
                  type="number"
                  min="0"
                  step="1"
                  value={form.priceKes}
                  onChange={(e) => update('priceKes', e.target.value)}
                  className={inputClass()}
                />
              </div>
              <div>
                <FieldLabel htmlFor="compareAtPriceKes">Compare-at price (KES)</FieldLabel>
                <input
                  id="compareAtPriceKes"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Optional. SAVE % when above price"
                  value={form.compareAtPriceKes}
                  onChange={(e) => update('compareAtPriceKes', e.target.value)}
                  className={inputClass()}
                />
              </div>
              <div>
                <FieldLabel htmlFor="minOrder">Minimum order (units) *</FieldLabel>
                <input
                  id="minOrder"
                  type="number"
                  min={1}
                  value={form.minOrder}
                  onChange={(e) =>
                    update('minOrder', Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className={inputClass()}
                />
              </div>
              <div>
                <FieldLabel htmlFor="stock">Stock *</FieldLabel>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => update('stock', Math.max(0, form.stock - 1))}
                    className="w-9 h-9 border border-[#C5D4DC] rounded flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    id="stock"
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) =>
                      update('stock', Math.max(0, parseInt(e.target.value, 10) || 0))
                    }
                    className="w-24 text-center text-sm font-bold border border-[#C5D4DC] rounded py-2"
                  />
                  <button
                    type="button"
                    onClick={() => update('stock', form.stock + 1)}
                    className="w-9 h-9 border border-[#C5D4DC] rounded flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {isLowStock ? (
                  <p className="text-[10px] text-red-600 font-bold mt-1">Low stock alert</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#EFF8F9] rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-black">Images</h2>
            <div>
              <FieldLabel>Main image *</FieldLabel>
              <label className="block border-2 border-dashed border-[#C5D4DC] rounded-lg cursor-pointer mt-2">
                <input type="file" accept="image/*" className="hidden" onChange={handleMainImagePick} />
                <div className="h-48 flex items-center justify-center p-4">
                  {form.mainImage ? (
                    <img src={form.mainImage} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Upload className="w-8 h-8 text-[#5A6B7D]" />
                  )}
                </div>
              </label>
            </div>
            <div>
              <FieldLabel>Gallery images</FieldLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.otherImages.map((src, index) => (
                  <div key={`${src}-${index}`} className="relative w-16 h-16 rounded border overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          'otherImages',
                          form.otherImages.filter((_, i) => i !== index),
                        )
                      }
                      className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleOtherImagesPick}
                  />
                  <Plus className="w-5 h-5 text-[#5A6B7D]" />
                </label>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#EFF8F9] rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-bold text-black">Specifications (optional)</h2>
            {form.attributes.map((attr) => (
              <div key={attr.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  value={attr.feature}
                  onChange={(e) =>
                    update(
                      'attributes',
                      form.attributes.map((a) =>
                        a.id === attr.id ? { ...a, feature: e.target.value } : a,
                      ),
                    )
                  }
                  placeholder="Feature"
                  className={inputClass()}
                />
                <input
                  value={attr.value}
                  onChange={(e) =>
                    update(
                      'attributes',
                      form.attributes.map((a) =>
                        a.id === attr.id ? { ...a, value: e.target.value } : a,
                      ),
                    )
                  }
                  placeholder="Value"
                  className={inputClass()}
                />
                <button
                  type="button"
                  disabled={form.attributes.length <= 1}
                  onClick={() =>
                    update(
                      'attributes',
                      form.attributes.filter((a) => a.id !== attr.id),
                    )
                  }
                  className="w-10 h-[42px] border rounded flex items-center justify-center disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update('attributes', [
                  ...form.attributes,
                  { id: String(Date.now()), feature: '', value: '' },
                ])
              }
              className="text-xs font-bold flex items-center gap-1"
              style={{ color: BLUE }}
            >
              <Plus className="w-4 h-4" /> Add attribute
            </button>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pb-8">
          <Link
            href="/admin/inventory"
            className="flex items-center gap-1.5 text-sm font-medium text-[#243247] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Link>
          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={!form.name.trim() || !form.sku.trim() || updateProduct.isPending}
                className="px-5 py-2.5 text-xs font-bold border-2 rounded-lg bg-white disabled:opacity-50"
                style={{ borderColor: BLUE, color: BLUE }}
              >
                {updateProduct.isPending ? 'Saving…' : 'Save as draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSave('published')}
                disabled={!canSave || updateProduct.isPending}
                className="px-6 py-2.5 text-xs font-bold uppercase rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: BLUE_DARK }}
              >
                {updateProduct.isPending ? 'Saving…' : 'Publish to marketplace'}
              </button>
            </div>
            <p className="text-[10px] text-[#5A6B7D] max-w-xs text-right">
              Draft keeps the product hidden. Publish makes it visible to buyers.
            </p>
          </div>
        </div>
      </div>
      <AdminPageFooter />
    </div>
  );
}
