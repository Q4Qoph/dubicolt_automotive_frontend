'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Upload,
  ImageIcon,
  AlertCircle,
  Check,
  Cloud,
} from 'lucide-react';
import AdminPageFooter from '@/components/admin/AdminPageFooter';
import {
  useAdminCategories,
  useCreateInventoryProductMutation,
  useUploadImageMutation,
} from '@/lib/api/hooks';
import { formatAmount, kesToUsd } from '@/lib/currency';

const BLUE = '#081F3F';
const BLUE_DARK = '#081F3F';
const SECTION_BG = '#EFF8F9';
const LOW_STOCK_THRESHOLD = 25;

const STEPS = [
  { id: 1, label: 'Product Info' },
  { id: 2, label: 'Pricing & Stock' },
  { id: 3, label: 'Photos' },
  { id: 4, label: 'Review' },
] as const;

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
  /** Maps to product.image_url — inventory thumbnail & default PDP hero */
  mainImage: string | null;
  /** Maps to product.images (excluding main) — PDP gallery thumbnails */
  otherImages: string[];
  attributes: Attribute[];
}

const initialForm: FormState = {
  name: '',
  sku: '',
  category: '',
  brand: '',
  description: '',
  primaryOrigin: 'CN',
  priceKes: '',
  compareAtPriceKes: '',
  stock: 0,
  minOrder: 1,
  mainImage: null,
  otherImages: [],
  attributes: [{ id: '1', feature: '', value: '' }],
};

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

function formatPricePreview(value: string) {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 'N/A';
  return formatAmount(n);
}

export default function ProductOnboardingPage() {
  const router = useRouter();
  const createProduct = useCreateInventoryProductMutation();
  const uploadImage = useUploadImageMutation();
  const { data: adminCategories = [] } = useAdminCategories();
  const categoryOptions =
    adminCategories.length > 0
      ? adminCategories.map((c) => c.name)
      : [];
  const [form, setForm] = useState<FormState>(initialForm);

  useEffect(() => {
    if (!form.category && categoryOptions[0]) {
      setForm((prev) => ({ ...prev, category: categoryOptions[0] }));
    }
  }, [categoryOptions, form.category]);
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState('N/A');

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setLastSaved('just now');
  }, []);

  const adjustStock = (delta: number) => {
    setForm((prev) => ({ ...prev, stock: Math.max(0, prev.stock + delta) }));
    setLastSaved('just now');
  };

  /** Same shape as storefront Product: image_url + images[] */
  const galleryImages = form.mainImage
    ? [form.mainImage, ...form.otherImages]
    : form.otherImages;

  const stepValid = useMemo(() => {
    const s1 =
      form.name.trim().length > 0 &&
      form.sku.trim().length > 0 &&
      form.category.length > 0 &&
      form.description.trim().length > 0;
    const price = parseFloat(form.priceKes);
    const s2 =
      !Number.isNaN(price) && price > 0 && form.stock > 0 && form.minOrder > 0;
    const s3 = !!form.mainImage;
    return { 1: s1, 2: s2, 3: s3, 4: s1 && s2 && s3 };
  }, [form]);

  const previewPrice = formatPricePreview(form.priceKes);
  const isLowStock = form.stock > 0 && form.stock < LOW_STOCK_THRESHOLD;

  const listingScore = useMemo(() => {
    let score = 0;
    if (form.name.trim()) score += 15;
    if (form.sku.trim()) score += 10;
    if (form.description.trim().length > 20) score += 10;
    if (form.category) score += 5;
    if (parseFloat(form.priceKes) > 0) score += 15;
    if (form.stock > 0) score += 15;
    if (form.mainImage) score += 15;
    if (form.otherImages.length > 0) score += Math.min(10, form.otherImages.length * 2);
    return Math.min(100, score);
  }, [form]);

  const addAttribute = () => {
    update('attributes', [
      ...form.attributes,
      { id: String(Date.now()), feature: '', value: '' },
    ]);
  };

  const removeAttribute = (id: string) => {
    if (form.attributes.length <= 1) return;
    update(
      'attributes',
      form.attributes.filter((a) => a.id !== id),
    );
  };

  const handleMainImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      update('mainImage', url);
    } catch {
      /* upload failed */
    }
    e.target.value = '';
  };

  const handleOtherImagesPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadImage.mutateAsync(file);
        urls.push(url);
      }
      setForm((prev) => ({
        ...prev,
        otherImages: [...prev.otherImages, ...urls].slice(0, 8),
      }));
      setLastSaved('just now');
    } catch {
      /* upload failed */
    }
    e.target.value = '';
  };

  const removeOtherImage = (index: number) => {
    update(
      'otherImages',
      form.otherImages.filter((_, i) => i !== index),
    );
  };

  function goNext() {
    if (currentStep < 4 && stepValid[currentStep as 1 | 2 | 3 | 4]) {
      setCurrentStep((s) => s + 1);
    }
  }

  function goBack() {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  async function saveProduct(status: 'draft' | 'published') {
    if (createProduct.isPending) return;
    if (!form.name.trim() || !form.sku.trim()) return;
    if (status === 'published' && !stepValid[4]) return;

    const priceKes = parseFloat(form.priceKes);
    const imageUrl =
      form.mainImage ??
      'https://images.pexels.com/photos/448361/pexels-photo-448361.jpeg?auto=compress&cs=tinysrgb&w=400';

    try {
      await createProduct.mutateAsync({
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category || 'Uncategorized',
        brand: form.brand.trim() || undefined,
        description: form.description.trim() || form.name.trim(),
        primary_origin: form.primaryOrigin,
        price_kes: Number.isFinite(priceKes) && priceKes > 0 ? Math.round(priceKes) : 1,
        compare_at_price_kes: (() => {
          const raw = form.compareAtPriceKes.trim();
          if (!raw) return null;
          const kes = parseFloat(raw);
          return Number.isFinite(kes) && kes > 0 ? Math.round(kes) : null;
        })(),
        stock: status === 'published' ? Math.max(1, form.stock) : Math.max(0, form.stock),
        min_order: Math.max(1, form.minOrder),
        image_url: imageUrl,
        images: [imageUrl, ...form.otherImages].slice(0, 8),
        attributes: form.attributes
          .filter((a) => a.feature.trim() && a.value.trim())
          .map((a) => ({ feature: a.feature.trim(), value: a.value.trim() })),
        status,
      });
    } catch {
      return;
    }

    setLastSaved('just now');
    router.push('/admin/inventory');
  }

  return (
    <div className="flex flex-col min-h-full bg-[#EFF8F9]">
      <div className="flex flex-1 flex-col xl:flex-row">
        <div className="flex-1 min-w-0 p-6 lg:p-8">
          <nav className="flex items-center gap-1.5 text-xs text-[#5A6B7D] mb-4">
            <Link href="/admin/inventory" className="hover:underline">
              Inventory
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#243247]">Add Product</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BLUE_DARK }}>
                Add Marketplace Product
              </h1>
              <p className="text-sm text-[#5A6B7D] mt-1">
                Same fields as marketplace inventory and the product detail page (main image +
                gallery).
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="bg-white border border-[#EFF8F9] rounded-lg px-4 py-4 mb-6">
            <div className="flex flex-wrap items-center gap-y-3">
              {STEPS.map((step, i) => {
                const done = currentStep > step.id;
                const active = currentStep === step.id;
                const filled = done || active;
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (step.id < currentStep) setCurrentStep(step.id);
                      }}
                      disabled={step.id > currentStep}
                      className="flex items-center gap-2 disabled:cursor-default"
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          filled ? 'text-white' : 'bg-transparent border-2 border-[#C5D4DC] text-[#5A6B7D]'
                        }`}
                        style={filled ? { backgroundColor: BLUE_DARK } : undefined}
                      >
                        {done ? <Check className="w-4 h-4" /> : step.id}
                      </span>
                      <span
                        className={`text-sm ${active ? 'font-bold text-black' : 'text-[#5A6B7D] font-medium'}`}
                      >
                        {step.label}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-8 sm:w-12 h-0.5 mx-2 shrink-0 ${done ? '' : 'bg-[#EFF8F9]'}`}
                        style={done ? { backgroundColor: BLUE } : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#EFF8F9] rounded-lg p-5 mb-6 min-h-[320px]">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-black mb-2">Product Info</h2>
                <div>
                  <FieldLabel htmlFor="name">Product Name *</FieldLabel>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g. Hyperion X8 Solar Inverter 100kW"
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
                      placeholder="DBK-INV-8821"
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
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <FieldLabel htmlFor="brand">Brand / Manufacturer</FieldLabel>
                  <input
                    id="brand"
                    value={form.brand}
                    onChange={(e) => update('brand', e.target.value)}
                    placeholder="Verified OEM"
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
                    placeholder="Specifications, materials, certifications..."
                    className={`${inputClass()} resize-y`}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#243247] mb-2">Primary Origin Hub</p>
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
                        <span className="text-sm font-bold text-black">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-black">Pricing & Stock</h2>
                <div className="max-w-xs">
                  <FieldLabel htmlFor="priceKes">Price (KES) *</FieldLabel>
                  <input
                    id="priceKes"
                    type="number"
                    min="0"
                    step="1"
                    value={form.priceKes}
                    onChange={(e) => update('priceKes', e.target.value)}
                    placeholder="573750"
                    className={inputClass()}
                  />
                </div>

                <div className="max-w-xs">
                  <FieldLabel htmlFor="compareAtPriceKes">Compare-at price (KES)</FieldLabel>
                  <input
                    id="compareAtPriceKes"
                    type="number"
                    min="0"
                    step="1"
                    value={form.compareAtPriceKes}
                    onChange={(e) => update('compareAtPriceKes', e.target.value)}
                    placeholder="Optional. SAVE % calculated on save"
                    className={inputClass()}
                  />
                </div>

                <div className="max-w-xs">
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
                  <p className="text-[10px] text-[#5A6B7D] mt-1">
                    Shown on marketplace cards as Min: N Units
                  </p>
                </div>

                <div className="max-w-md">
                  <FieldLabel htmlFor="stock">Stock Quantity *</FieldLabel>
                  <div className="flex items-center gap-2 p-4 border border-[#EFF8F9] rounded-lg bg-[#EFF8F9]">
                    <button
                      type="button"
                      onClick={() => adjustStock(-10)}
                      className="px-2 py-2 text-[10px] font-bold border border-[#C5D4DC] rounded bg-white"
                    >
                      −10
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustStock(-1)}
                      className="w-9 h-9 flex items-center justify-center border border-[#C5D4DC] rounded bg-white"
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
                      className="w-24 text-center text-sm font-bold border border-[#C5D4DC] rounded py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => adjustStock(1)}
                      className="w-9 h-9 flex items-center justify-center border border-[#C5D4DC] rounded bg-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustStock(10)}
                      className="px-2 py-2 text-[10px] font-bold border border-[#C5D4DC] rounded bg-white"
                    >
                      +10
                    </button>
                    <span className="text-xs text-[#5A6B7D] ml-1">units</span>
                  </div>
                  {isLowStock && (
                    <p className="text-[10px] text-red-600 font-bold mt-2">
                      Low stock: below {LOW_STOCK_THRESHOLD} units
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-xs text-[#5A6B7D]">
                  Matches the product page: a <strong className="text-[#243247]">main image</strong>{' '}
                  (inventory + default gallery view) and optional{' '}
                  <strong className="text-[#243247]">other images</strong> for the thumbnail strip.
                </p>

                <div>
                  <FieldLabel>Main image *</FieldLabel>
                  <p className="text-[10px] text-[#5A6B7D] mb-3">
                    Shown in inventory list and as the default image on /product/[id].
                  </p>
                  <label className="block border-2 border-dashed border-[#C5D4DC] rounded-lg bg-[#EFF8F9] cursor-pointer hover:border-[#081F3F] overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMainImagePick}
                    />
                    <div className="h-[220px] sm:h-[280px] flex items-center justify-center p-4">
                      {form.mainImage ? (
                        <img
                          src={form.mainImage}
                          alt="Main product"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-10 h-10 text-[#5A6B7D] mx-auto mb-2" />
                          <span className="text-sm font-bold text-[#243247] block">
                            Upload main image
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                  {form.mainImage && (
                    <button
                      type="button"
                      onClick={() => update('mainImage', null)}
                      className="mt-2 text-xs font-bold text-red-600 hover:underline"
                    >
                      Remove main image
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-[#EFF8F9]">
                  <FieldLabel>Other images (gallery)</FieldLabel>
                  <p className="text-[10px] text-[#5A6B7D] mb-3">
                    Extra photos for the product page gallery, same row of thumbnails buyers see
                    on the PDP.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.otherImages.map((src, index) => (
                      <div
                        key={`${src}-${index}`}
                        className="relative w-[72px] h-[72px] rounded border-2 border-[#C5D4DC] overflow-hidden bg-[#EFF8F9] shrink-0"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeOtherImage(index)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded text-white hover:bg-red-600"
                          aria-label="Remove gallery image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-[72px] h-[72px] flex flex-col items-center justify-center border-2 border-dashed border-[#C5D4DC] rounded cursor-pointer hover:bg-[#EFF8F9] shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleOtherImagesPick}
                      />
                      <Plus className="w-6 h-6 text-[#5A6B7D]" />
                      <span className="text-[9px] font-bold text-[#243247] mt-1">Add</span>
                    </label>
                  </div>
                  {form.mainImage && form.otherImages.length > 0 && (
                    <p className="text-[10px] text-[#5A6B7D] mt-3">
                      Gallery preview: {galleryImages.length} image
                      {galleryImages.length !== 1 ? 's' : ''} total (main + others)
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#EFF8F9]">
                  <p className="text-xs font-semibold text-[#243247] mb-2">Technical attributes (optional)</p>
                  {form.attributes.map((attr) => (
                    <div key={attr.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
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
                        onClick={() => removeAttribute(attr.id)}
                        disabled={form.attributes.length <= 1}
                        className="w-10 h-[42px] flex items-center justify-center border border-[#C5D4DC] rounded disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="flex items-center gap-1 text-xs font-bold mt-2"
                    style={{ color: BLUE }}
                  >
                    <Plus className="w-4 h-4" /> Add attribute
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-black mb-2">Review & Publish</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-[#EFF8F9] rounded-lg p-4 space-y-2 text-sm">
                    <p className="text-[10px] font-bold uppercase text-[#5A6B7D]">Product Info</p>
                    <p className="font-bold text-black">{form.name}</p>
                    <p className="text-xs text-[#5A6B7D]">SKU: {form.sku}</p>
                    <p>
                      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full border border-[#C5D4DC] bg-[#EFF8F9]">
                        {form.category}
                      </span>
                    </p>
                    {form.brand && <p className="text-xs">Brand: {form.brand}</p>}
                    <p className="text-xs text-[#243247] line-clamp-3">{form.description}</p>
                  </div>
                  <div className="border border-[#EFF8F9] rounded-lg p-4 space-y-3 text-sm">
                    <p className="text-[10px] font-bold uppercase text-[#5A6B7D]">Pricing & Stock</p>
                    <p className="font-bold" style={{ color: BLUE_DARK }}>
                      {previewPrice}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-bold">{form.stock.toLocaleString()}</span> units
                    </p>
                  </div>
                </div>
                {form.mainImage && (
                  <div className="border border-[#EFF8F9] rounded-lg p-3 max-w-sm">
                    <p className="text-[10px] font-bold uppercase text-[#5A6B7D] mb-2">Images</p>
                    <img
                      src={form.mainImage}
                      alt=""
                      className="w-full h-32 object-contain bg-[#EFF8F9] rounded mb-2"
                    />
                    {form.otherImages.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {form.otherImages.map((src) => (
                          <img
                            key={src}
                            src={src}
                            alt=""
                            className="w-10 h-10 object-cover rounded border border-[#EFF8F9]"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!stepValid[currentStep as 1 | 2 | 3 | 4] && currentStep < 4 && (
              <p className="mt-4 text-xs text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Complete required fields on this step to continue.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
            <Link
              href="/admin/inventory"
              className="flex items-center gap-1.5 text-sm font-medium text-[#243247] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Link>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-2.5 text-xs font-bold border-2 rounded-lg bg-white"
                  style={{ borderColor: BLUE, color: BLUE }}
                >
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!stepValid[currentStep as 1 | 2 | 3]}
                  className="px-6 py-2.5 text-xs font-bold uppercase rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: BLUE_DARK }}
                >
                  Next
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => saveProduct('draft')}
                    disabled={!form.name.trim() || !form.sku.trim()}
                    className="px-5 py-2.5 text-xs font-bold border-2 rounded-lg bg-white disabled:opacity-50"
                    style={{ borderColor: BLUE, color: BLUE }}
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => saveProduct('published')}
                    disabled={!stepValid[4]}
                    className="px-6 py-2.5 text-xs font-bold uppercase rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: BLUE_DARK }}
                  >
                    Publish to Marketplace
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <aside
          className="w-full xl:w-72 shrink-0 border-t xl:border-t-0 xl:border-l border-[#EFF8F9] p-6 space-y-5"
          style={{ backgroundColor: SECTION_BG }}
        >
          <div className="bg-white border border-[#EFF8F9] rounded-lg p-4">
            <h4 className="text-xs font-bold text-black mb-3">Listing Strength</h4>
            <div className="h-2 rounded-full bg-[#EFF8F9] overflow-hidden mb-2">
              <div
                className="h-full rounded-full"
                style={{ width: `${listingScore}%`, backgroundColor: BLUE }}
              />
            </div>
            <p className="text-sm font-bold mb-3" style={{ color: BLUE }}>
              {listingScore}% Complete
            </p>
            <ul className="space-y-2 text-xs text-[#243247]">
              <li className="flex items-center gap-2">
                {stepValid[1] ? (
                  <Check className="w-3.5 h-3.5" style={{ color: BLUE }} />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                Product info
              </li>
              <li className="flex items-center gap-2">
                {stepValid[2] ? (
                  <Check className="w-3.5 h-3.5" style={{ color: BLUE }} />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                Price & stock
              </li>
              <li className="flex items-center gap-2">
                {stepValid[3] ? (
                  <Check className="w-3.5 h-3.5" style={{ color: BLUE }} />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                Main image + gallery
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#EFF8F9] rounded-lg p-4">
            <h4 className="text-xs font-bold text-black mb-3">Inventory Preview</h4>
            <div className="border border-[#EFF8F9] rounded-lg overflow-hidden">
              <div className="h-24 bg-[#EFF8F9] flex items-center justify-center">
                {form.mainImage ? (
                  <img src={form.mainImage} alt="" className="max-h-full max-w-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#C5D4DC]" />
                )}
              </div>
              {form.otherImages.length > 0 && (
                <div className="flex gap-1 px-2 pb-2 justify-center border-t border-[#EFF8F9]">
                  {form.otherImages.slice(0, 4).map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="w-8 h-8 object-cover rounded border border-[#C5D4DC]"
                    />
                  ))}
                </div>
              )}
              <div className="p-3">
                <p className="text-xs font-bold text-black line-clamp-2">
                  {form.name || 'Product name'}
                </p>
                <p className="text-[10px] text-[#5A6B7D]">SKU: {form.sku || 'N/A'}</p>
                <p className="text-sm font-bold mt-1" style={{ color: BLUE }}>
                  {previewPrice}
                </p>
                <p className="text-[10px] text-[#5A6B7D] mt-2">
                  Stock: {form.stock > 0 ? `${form.stock} units` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <p className="flex items-center gap-2 text-[10px] text-[#5A6B7D]">
            <Cloud className="w-3.5 h-3.5" />
            Last saved {lastSaved}
          </p>
        </aside>
      </div>

      <AdminPageFooter />
    </div>
  );
}
