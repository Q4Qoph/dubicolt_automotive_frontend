/** REST path templates — prefix with `API_BASE_URL` from config */

export const API_PATHS = {
  auth: {
    login: '/User/login',
    register: '/User/register',
    logout: '/User/logout',
    me: '/user',
  },
  parts: {
    list: '/parts/parts',
    byId: (id: string) => `/parts/PartsSeed/${id}`,
  },
  products: {
    search: '/parts/parts',
    list: '/parts/parts',
    byId: (id: string) => `/parts/PartsSeed/${id}`,
  },
  vehicles: {
    root: '/vehicles',
    byId: (id: string) => `/vehicles/${id}`,
  },
  cart: {
    root: '/Cart',
    item: (id: string) => `/Cart/${id}`,
    items: '/Cart',
    checkout: '/Order/create',
  },
  orders: {
    root: '/Order',
    create: '/Order/create',
    userOrders: '/Order/user',
    byId: (id: string) => `/Order/${id}`,
    invoice: (id: string) => `/Order/${id}/invoice`,
    status: (id: string) => `/Order/${id}/status`,
  },
  categories: {
    root: '/categories',
    byId: (id: string) => `/categories/${id}`,
  },
  payments: {
    root: '/Payment',
    stkPush: '/Payment/initiateStkPush',
    validate: (orderId: string) => `/Payment/validate/${orderId}`,
    byId: (checkoutId: string) => `/Payment/${checkoutId}`,
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
