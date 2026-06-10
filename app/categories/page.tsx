'use client';

import { useEffect, useState } from 'react';
import type { ExploreCategory } from '@/lib/types';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageLoader from '@/components/PageLoader';
import { useExploreCategories } from '@/lib/api/hooks';

const BLUE = '#004aad';
const BLUE_DARK = '#00357f';
const PAGE_SIZE = 12;

export default function ExploreCategoriesPage() {
  const [page, setPage] = useState(1);
  const [allCategories, setAllCategories] = useState<ExploreCategory[]>([]);
  const { data, isLoading, isFetching } = useExploreCategories(page, PAGE_SIZE);

  useEffect(() => {
    if (!data?.categories) return;
    setAllCategories((prev) => {
      if (page === 1) return data.categories;
      const ids = new Set(prev.map((c) => c.id));
      return [...prev, ...data.categories.filter((c) => !ids.has(c.id))];
    });
  }, [data, page]);

  const categories = allCategories;
  const meta = data?.meta;
  const total = meta?.total ?? categories.length;
  const shown = categories.length;
  const hasMore = shown < total;
  const showLoader = isLoading && page === 1 && categories.length === 0;

  if (showLoader) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 bg-[#f8f9ff]">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: BLUE_DARK }}>
                Categories
              </h1>
              <p className="text-sm text-[#737784] mt-2">
                Choose a category and start shopping.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {categories.map((cat) => {
              const samples = cat.sample_products ?? [];
              const categoryHref = `/marketplace?category=${encodeURIComponent(cat.name)}`;

              return (
                <div
                  key={cat.id}
                  className="bg-white border border-[#e5eeff] rounded-lg overflow-hidden flex flex-col"
                >
                  <Link href={categoryHref} className="group relative min-h-[160px] block">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#dce9ff]" />
                    )}
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h2 className="text-lg font-bold">{cat.name}</h2>
                      <p className="text-xs opacity-90">
                        {cat.product_count.toLocaleString()} product
                        {cat.product_count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </Link>

                  {samples.length > 0 ? (
                    <div className="p-3 border-t border-[#e5eeff]">
                      <div className="grid grid-cols-4 gap-2">
                        {samples.slice(0, 4).map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.id}`}
                            className="block rounded border border-[#e5eeff] overflow-hidden bg-[#f8f9ff] hover:border-[#004aad]"
                            title={p.name}
                          >
                            <div className="aspect-square flex items-center justify-center p-1">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt=""
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#dce9ff]" />
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={categoryHref}
                        className="mt-2 block text-center text-xs font-bold hover:underline"
                        style={{ color: BLUE }}
                      >
                        View all in {cat.name} →
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 border-t border-[#e5eeff] text-center">
                      <Link
                        href={categoryHref}
                        className="text-xs font-bold hover:underline"
                        style={{ color: BLUE }}
                      >
                        Browse category →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isLoading && categories.length === 0 ? (
            <p className="text-sm text-[#737784] text-center mb-8">
              No published categories yet.
            </p>
          ) : null}

          <div className="text-center">
            {hasMore ? (
              <button
                type="button"
                disabled={isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="w-full max-w-md py-3.5 rounded-lg text-sm font-bold text-white mb-3 disabled:opacity-60"
                style={{ backgroundColor: BLUE_DARK }}
              >
                {isFetching ? 'Loading…' : 'Load more categories'}
              </button>
            ) : null}
            <p className="text-xs text-[#737784] font-medium">
              Showing {shown} of {total} categories
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
