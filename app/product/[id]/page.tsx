'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Minus, Package, Plus, Shield, Truck } from 'lucide-react';
import { MarketingShell } from '@/components/dubicolt/marketing-shell';
import { PartCard } from '@/components/dubicolt/part-card';
import { DcBadge, DcButton } from '@/components/dubicolt/ui';
import { useProduct, useRelatedProducts } from '@/lib/api/hooks';
import { usePromptedCart } from '@/hooks/use-prompted-cart';
import { formatKshLabel } from '@/lib/currency';
import { marketplaceProductHref, marketplaceReturnHref } from '@/lib/marketplace-navigation';

function ProductDetailContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const backHref = useMemo(() => marketplaceReturnHref(searchParams), [searchParams]);
  const { data: product, isLoading } = useProduct(params.id);
  const { data: related = [] } = useRelatedProducts(params.id, 4);
  const [qty, setQty] = useState(1);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const { addToCart, buyNow, GuestCartPrompt } = usePromptedCart();

  const stock = Number(product?.specs?.Stock ?? 0);
  const inStock = stock > 0;

  function payload() {
    if (!product) return null;
    return {
      id: product.id,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: 0,
      unitPriceKes: product.price_kes,
      origin: product.category,
      imageUrl: product.image_url,
      quantity: qty,
    };
  }

  if (isLoading || !product) {
    return (
      <MarketingShell>
        <div className="flex flex-1 items-center justify-center py-32 text-[#5A6B7D]">
          Loading part details…
        </div>
      </MarketingShell>
    );
  }

  const images = product.images?.length ? product.images : [product.image_url].filter(Boolean);
  const specs = Object.entries(product.specs ?? {}).filter(([, v]) => v?.trim());

  return (
    <MarketingShell>
      <GuestCartPrompt />

      <div className="border-b border-[#C5D4DC]/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <Link href={backHref} className="inline-flex items-center gap-1 text-sm font-semibold text-[#5A6B7D] hover:text-[#081F3F]">
            <ChevronLeft className="h-4 w-4" />
            Back to catalog
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div className="dc-card overflow-hidden">
            <div className="flex aspect-square items-center justify-center bg-[#EFF8F9] p-8">
              {images[0] ? (
                <img src={images[0]} alt={product.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <Package className="h-16 w-16 text-[#C5D4DC]" />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2">
              <DcBadge tone="ice">{product.category}</DcBadge>
              <DcBadge tone="default">{product.vendor}</DcBadge>
              {inStock ? <DcBadge tone="success">In stock</DcBadge> : <DcBadge tone="warning">Request part</DcBadge>}
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-tight text-[#081F3F] lg:text-3xl">{product.name}</h1>
            <p className="mt-2 text-sm text-[#5A6B7D]">SKU: {product.sku}</p>

            <p className="mt-6 text-4xl font-bold tabular-nums text-[#081F3F]">{formatKshLabel(product.price_kes)}</p>
            <p className="mt-1 text-sm text-[#5A6B7D]">{product.logistics_note}</p>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-semibold text-[#243247]">Quantity</span>
              <div className="flex overflow-hidden rounded-lg border border-[#C5D4DC]">
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-10 w-10 items-center justify-center hover:bg-[#EFF8F9]">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center border-x border-[#C5D4DC] text-sm font-bold">{qty}</span>
                <button type="button" onClick={() => setQty(qty + 1)} className="flex h-10 w-10 items-center justify-center hover:bg-[#EFF8F9]">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {inStock ? (
                <>
                  <DcButton
                    variant="primary"
                    className="w-full py-3.5"
                    disabled={buyNowLoading}
                    onClick={async () => {
                      const p = payload();
                      if (!p) return;
                      setBuyNowLoading(true);
                      try { await buyNow(p); } finally { setBuyNowLoading(false); }
                    }}
                  >
                    {buyNowLoading ? 'Processing…' : 'Buy now & checkout'}
                  </DcButton>
                  <DcButton variant="secondary" className="w-full py-3.5" onClick={() => { const p = payload(); if (p) void addToCart(p); }}>
                    Add to cart
                  </DcButton>
                </>
              ) : (
                <DcButton variant="primary" href="/dashboard/sourcing/new" className="w-full py-3.5">
                  Request this part
                </DcButton>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#C5D4DC] bg-[#EFF8F9] p-4">
                <Shield className="mb-2 h-5 w-5 text-[#00BC94]" />
                <p className="text-sm font-bold text-[#081F3F]">Compatibility check</p>
                <p className="mt-1 text-xs text-[#5A6B7D]">Verify fitment before purchase. Ask Dubicolt to confirm if unsure.</p>
              </div>
              <div className="rounded-xl border border-[#C5D4DC] bg-[#EFF8F9] p-4">
                <Truck className="mb-2 h-5 w-5 text-[#00BC94]" />
                <p className="text-sm font-bold text-[#081F3F]">Delivery or pickup</p>
                <p className="mt-1 text-xs text-[#5A6B7D]">Choose home delivery or collect at shop after M-Pesa payment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description & specs */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="dc-card p-6">
            <h2 className="text-lg font-bold text-[#081F3F]">Description</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5A6B7D]">{product.description || 'No description provided.'}</p>
          </div>
          <div className="dc-card p-6">
            <h2 className="text-lg font-bold text-[#081F3F]">Specifications</h2>
            {specs.length === 0 ? (
              <p className="mt-3 text-sm text-[#5A6B7D]">No specifications listed.</p>
            ) : (
              <dl className="mt-4 divide-y divide-[#EFF8F9]">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="text-[#5A6B7D]">{k}</dt>
                    <dd className="font-bold text-[#081F3F] text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-14">
            <h2 className="mb-6 text-xl font-bold text-[#081F3F]">Related parts</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((item) => (
                <PartCard
                  key={item.id}
                  href={marketplaceProductHref(item.id, {
                    category: searchParams.get('category') ?? undefined,
                    search: searchParams.get('search') ?? undefined,
                  })}
                  part={{
                    productId: item.id,
                    name: item.name,
                    image_url: item.image_url,
                    category: item.origin,
                    price_kes: item.price_kes,
                    stock: item.stock,
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </MarketingShell>
  );
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[#5A6B7D]">Loading…</div>}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
