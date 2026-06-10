export type MarketplaceFilters = {
  hub?: string;
  category?: string;
  search?: string;
};

export function marketplaceHref(filters?: MarketplaceFilters): string {
  const params = new URLSearchParams();
  if (filters?.hub && filters.hub !== 'all') params.set('hub', filters.hub);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search?.trim()) params.set('search', filters.search.trim());
  const qs = params.toString();
  return qs ? `/marketplace?${qs}` : '/marketplace';
}

/** Product URL that preserves marketplace filters for browser back + breadcrumb return. */
export function marketplaceProductHref(
  productId: string,
  filters?: MarketplaceFilters,
): string {
  const params = new URLSearchParams({ from: 'marketplace' });
  if (filters?.hub && filters.hub !== 'all') params.set('hub', filters.hub);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search?.trim()) params.set('search', filters.search.trim());
  return `/product/${productId}?${params.toString()}`;
}

export function marketplaceReturnHref(
  searchParams: Pick<URLSearchParams, 'get'>,
): string {
  if (searchParams.get('from') !== 'marketplace') {
    return '/marketplace';
  }
  return marketplaceHref({
    hub: searchParams.get('hub') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  });
}
