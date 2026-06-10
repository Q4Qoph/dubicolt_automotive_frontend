export interface SourcingRequestFilters {
  market?: string;
  statuses?: string[];
}

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  products: {
    detail: (id: string) => ['products', id] as const,
    related: (id: string, limit?: number) => ['products', id, 'related', limit] as const,
  },
  marketplace: {
    products: (query?: Record<string, string | number>) =>
      ['marketplace', 'products', query] as const,
  },
  home: ['home', 'feed'] as const,
  categories: {
    exploreAll: ['categories', 'explore'] as const,
    explore: (page?: number, pageSize?: number) =>
      ['categories', 'explore', page, pageSize] as const,
  },
  cart: ['cart'] as const,
  checkout: {
    session: (checkoutId: string) => ['checkout', checkoutId] as const,
  },
  me: {
    sourcing: ['me', 'sourcing'] as const,
    sourcingDetail: (id: string) => ['me', 'sourcing', id] as const,
    marketplaceOrders: ['me', 'orders', 'marketplace'] as const,
    marketplaceOrder: (id: string) => ['me', 'orders', 'marketplace', id] as const,
    shipments: ['me', 'shipments'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    analytics: ['admin', 'analytics'] as const,
    categories: ['admin', 'categories'] as const,
    category: (id: string) => ['admin', 'categories', id] as const,
    inventory: (query?: Record<string, string | number>) =>
      ['admin', 'inventory', query] as const,
    inventoryKpis: ['admin', 'inventory', 'kpis'] as const,
    inventoryProduct: (id: string) => ['admin', 'inventory', 'product', id] as const,
    sourcing: (filters?: SourcingRequestFilters) =>
      ['admin', 'sourcing', filters] as const,
    sourcingDetail: (id: string) => ['admin', 'sourcing', id] as const,
    orders: ['admin', 'orders', 'marketplace'] as const,
  },
  shipments: {
    byTracking: (trackingId: string) => ['shipments', trackingId] as const,
  },
  dashboard: {
    recentOrders: (limit: number) => ['dashboard', 'recent-orders', limit] as const,
  },
} as const;
