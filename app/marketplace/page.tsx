'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight, MapPin, SlidersHorizontal } from 'lucide-react';
import {
  MarketplacePartCard,
  computeFitmentMatch,
} from '@/components/dubicolt/marketplace-part-card';
import { MarketplaceShell } from '@/components/dubicolt/marketplace-shell';
import { useExploreCategories, useHomePageData, useMarketplaceProducts } from '@/lib/api/hooks';
import { usePromptedCart } from '@/hooks/use-prompted-cart';
import { parseKsh } from '@/lib/currency';
import type { MarketplaceProduct } from '@/lib/domain-types';
import { marketplaceProductHref } from '@/lib/marketplace-navigation';
import { BRAND } from '@/lib/dubicolt/brand';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

type SortOption = 'relevant' | 'price-asc' | 'price-desc' | 'name';

function MarketplaceCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('search') ?? '').trim();
  const urlMake = searchParams.get('make') ?? '';
  const urlModel = searchParams.get('model') ?? '';
  const urlYear = searchParams.get('year') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevant');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('Nairobi, Kenya');

  const { data: categoryData } = useExploreCategories(1, 50);
  const apiCategories = categoryData?.categories ?? [];
  const { data: homeData } = useHomePageData();
  const vehicleFilter = homeData?.vehicleFilter ?? { makes: [], modelsByMake: {}, years: [] };

  const [make, setMake] = useState(urlMake);
  const [model, setModel] = useState(urlModel);
  const [year, setYear] = useState(urlYear);

  useEffect(() => {
    setMake(urlMake);
    setModel(urlModel);
    setYear(urlYear);
  }, [urlMake, urlModel, urlYear]);

  const { data: products = [], isLoading } = useMarketplaceProducts(
    undefined,
    searchQuery || undefined,
    undefined,
    urlMake || urlModel || urlYear
      ? { make: urlMake || undefined, model: urlModel || undefined, year: urlYear || undefined }
      : undefined,
  );
  const { addToCart, GuestCartPrompt } = usePromptedCart();

  const brandOptions = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.vendor?.trim()) brands.add(p.vendor.trim());
    });
    return [...brands].sort();
  }, [products]);

  const priceBounds = useMemo(() => {
    const prices = products.map((p) => parseKsh(p.price_kes)).filter((n) => n > 0);
    if (prices.length === 0) return { min: 0, max: 500000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  useEffect(() => {
    if (priceMax === null && priceBounds.max > 0) {
      setPriceMax(priceBounds.max);
    }
  }, [priceBounds.max, priceMax]);

  const models = make ? vehicleFilter.modelsByMake[make] ?? [] : [];

  function updateVehicleParams(next: { make?: string; model?: string; year?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const m = next.make ?? make;
    const mo = next.model ?? model;
    const y = next.year ?? year;
    if (m) params.set('make', m);
    else params.delete('make');
    if (mo) params.set('model', mo);
    else params.delete('model');
    if (y) params.set('year', y);
    else params.delete('year');
    params.delete('page');
    router.replace(params.toString() ? `/marketplace?${params}` : '/marketplace');
  }

  function clearAllFilters() {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceMax(priceBounds.max);
    setMake('');
    setModel('');
    setYear('');
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    router.replace(params.toString() ? `/marketplace?${params}` : '/marketplace');
  }

  function setPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete('page');
    else params.set('page', String(next));
    router.replace(`/marketplace?${params}`);
  }

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }
    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.vendor));
    }
    if (priceMax != null) {
      list = list.filter((p) => parseKsh(p.price_kes) <= priceMax);
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => parseKsh(a.price_kes) - parseKsh(b.price_kes));
        break;
      case 'price-desc':
        list.sort((a, b) => parseKsh(b.price_kes) - parseKsh(a.price_kes));
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => {
          const ma = computeFitmentMatch(a, { make: urlMake, model: urlModel, year: urlYear }) ?? 0;
          const mb = computeFitmentMatch(b, { make: urlMake, model: urlModel, year: urlYear }) ?? 0;
          return mb - ma;
        });
        break;
    }

    return list;
  }, [products, selectedCategories, selectedBrands, priceMax, sortBy, urlMake, urlModel, urlYear]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const vehicle = { make: urlMake, model: urlModel, year: urlYear };

  const resultsTitle = searchQuery
    ? `Search Results for '${searchQuery}'`
    : urlMake
      ? `Results for ${[urlMake, urlModel, urlYear].filter(Boolean).join(' ')}`
      : 'Browse spare parts';

  const showingFrom = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, filteredProducts.length);

  const selectClass =
    'w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-9 text-sm text-[#243247] focus:border-[#00BC94] focus:outline-none focus:ring-2 focus:ring-[#00BC94]/15';

  const filtersPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#081F3F]">Filters</h2>
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-xs font-semibold text-[#00BC94] hover:text-[#007a62]"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#5A6B7D]">Vehicle</p>
        <div className="relative">
          <select
            value={make}
            onChange={(e) => {
              const next = e.target.value;
              setMake(next);
              setModel('');
              setYear('');
              updateVehicleParams({ make: next, model: '', year: '' });
            }}
            className={selectClass}
          >
            <option value="">Make</option>
            {vehicleFilter.makes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
        <div className="relative">
          <select
            value={model}
            disabled={!make}
            onChange={(e) => {
              const next = e.target.value;
              setModel(next);
              setYear('');
              updateVehicleParams({ model: next, year: '' });
            }}
            className={cn(selectClass, !make && 'opacity-50')}
          >
            <option value="">Model</option>
            {models.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
        <div className="relative">
          <select
            value={year}
            disabled={!model}
            onChange={(e) => {
              const next = e.target.value;
              setYear(next);
              updateVehicleParams({ year: next });
            }}
            className={cn(selectClass, !model && 'opacity-50')}
          >
            <option value="">Year</option>
            {vehicleFilter.years.map((item) => (
              <option key={item} value={String(item)}>{item}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
      </div>

      {apiCategories.length > 0 ? (
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6B7D]">Category</p>
          <div className="space-y-2.5">
            {apiCategories.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#243247]">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.name)}
                  onChange={(e) => {
                    setSelectedCategories((prev) =>
                      e.target.checked
                        ? [...prev, cat.name]
                        : prev.filter((n) => n !== cat.name),
                    );
                  }}
                  className="h-4 w-4 rounded border-[#C5D4DC] text-[#00BC94] focus:ring-[#00BC94]/30"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {brandOptions.length > 0 ? (
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6B7D]">Preferred Brands</p>
          <div className="space-y-2.5">
            {brandOptions.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#243247]">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={(e) => {
                    setSelectedBrands((prev) =>
                      e.target.checked ? [...prev, brand] : prev.filter((b) => b !== brand),
                    );
                  }}
                  className="h-4 w-4 rounded border-[#C5D4DC] text-[#00BC94] focus:ring-[#00BC94]/30"
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6B7D]">Price Range</p>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={Math.max(500, Math.round((priceBounds.max - priceBounds.min) / 100))}
          value={priceMax ?? priceBounds.max}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-[#00BC94]"
        />
        <div className="mt-2 flex justify-between text-xs text-[#5A6B7D]">
          <span>KES {priceBounds.min.toLocaleString('en-KE')}</span>
          <span>KES {(priceMax ?? priceBounds.max).toLocaleString('en-KE')}+</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5A6B7D]">Delivery Location</p>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#243247] focus:border-[#00BC94] focus:outline-none focus:ring-2 focus:ring-[#00BC94]/15"
          />
        </div>
      </div>
    </div>
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (currentPage > 3) pages.push('…');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i += 1) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <MarketplaceShell>
      <GuestCartPrompt />

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:py-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-[#E5E7EB]/80 bg-white p-5 shadow-sm">
            {filtersPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#243247] lg:hidden"
            onClick={() => setShowMobileFilters((o) => !o)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {showMobileFilters ? (
            <div className="mb-6 rounded-xl border border-[#E5E7EB]/80 bg-white p-5 shadow-sm lg:hidden">
              {filtersPanel}
            </div>
          ) : null}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#081F3F] sm:text-3xl">{resultsTitle}</h1>
              <p className="mt-1 text-sm text-[#5A6B7D]">
                {isLoading
                  ? 'Loading catalog…'
                  : filteredProducts.length === 0
                    ? 'No matches found'
                    : `Showing ${showingFrom}-${showingTo} of ${filteredProducts.length} high-precision matches found`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs font-medium text-[#5A6B7D]">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none rounded-lg border border-[#E5E7EB] bg-white py-2 pl-3 pr-9 text-sm font-medium text-[#243247] focus:border-[#00BC94] focus:outline-none"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name A–Z</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white" />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-8 py-16 text-center">
              <p className="font-bold text-[#243247]">No parts match your filters</p>
              <p className="mt-2 text-sm text-[#5A6B7D]">
                Try adjusting filters or{' '}
                <Link href="/dashboard/sourcing/new" className="font-bold text-[#00BC94]">
                  request a part
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((p: MarketplaceProduct) => (
                  <MarketplacePartCard
                    key={p.id}
                    product={p}
                    href={marketplaceProductHref(p.productId, {
                      category: selectedCategories[0],
                      search: searchQuery,
                    })}
                    matchPercent={computeFitmentMatch(p, vehicle)}
                    onAdd={
                      p.stock > 0
                        ? () =>
                            void addToCart({
                              id: p.productId,
                              productId: p.productId,
                              name: p.name,
                              sku: p.sku || p.productId,
                              unitPrice: 0,
                              unitPriceKes: parseKsh(p.price_kes),
                              origin: p.origin,
                              imageUrl: p.image_url,
                            })
                        : undefined
                    }
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#243247] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageNumbers.map((n, i) =>
                    n === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-[#9CA3AF]">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={cn(
                          'flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold',
                          n === currentPage
                            ? 'border-[#00BC94] text-white'
                            : 'border-[#E5E7EB] bg-white text-[#243247] hover:border-[#00BC94]/40',
                        )}
                        style={n === currentPage ? { backgroundColor: BRAND.coldGreen } : undefined}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#243247] disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </MarketplaceShell>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] text-[#5A6B7D]">
          Loading catalog…
        </div>
      }
    >
      <MarketplaceCatalog />
    </Suspense>
  );
}
