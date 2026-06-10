/** REST path templates — prefix with `API_BASE_URL` from config */

export const API_PATHS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/profile',
  },
  products: {
    search: '/products/search',
    list: '/products',
    byId: (id: string) => `/products/${id}`,
  },
  vehicles: {
    root: '/vehicles',
    byId: (id: string) => `/vehicles/${id}`,
  },
  cart: {
    root: '/cart',
    item: (lineId: string) => `/cart/items/${lineId}`,
    items: '/cart/items',
    checkout: '/cart/checkout',
  },
  orders: {
    root: '/orders',
    byId: (id: string) => `/orders/${id}`,
    invoice: (id: string) => `/orders/${id}/invoice`,
    status: (id: string) => `/orders/${id}/status`,
  },
  categories: {
    root: '/categories',
    byId: (id: string) => `/categories/${id}`,
  },
  payments: {
    stkPush: '/payments/mpesa/stk-push',
  },
  partRequests: {
    root: '/part-requests',
    byId: (id: string) => `/part-requests/${id}`,
  },
  quotations: {
    root: '/quotations',
    byId: (id: string) => `/quotations/${id}`,
    accept: (id: string) => `/quotations/${id}/accept`,
    reject: (id: string) => `/quotations/${id}/reject`,
  },
  inventory: {
    root: '/inventory',
    stockIn: '/inventory/stock-in',
    stockOut: '/inventory/stock-out',
  },
  deliveries: {
    root: '/deliveries',
    byId: (id: string) => `/deliveries/${id}`,
    status: (id: string) => `/deliveries/${id}/status`,
  },
  reports: {
    dashboard: '/reports/dashboard',
    analytics: '/reports/analytics',
  },
  suppliers: {
    root: '/suppliers',
    byId: (id: string) => `/suppliers/${id}`,
  },
  uploads: {
    image: '/uploads/image',
    images: '/uploads/images',
  },
} as const;
