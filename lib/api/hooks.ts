'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as api from './services';
import {
  createUserSourcingRequest,
  getAdminCategoryById,
  getAdminCategoryCards,
  getAdminDashboard,
  getAdminInventoryItems,
  getAdminInventoryKpis,
  getAdminInventoryProduct,
  getAdminAnalytics,
  getExploreCategories,
  getHomeFeed,
  listMyShipments,
  getMarketplaceProducts,
  getProductById,
  getRecentOrders,
  getRelatedProducts,
  getShipmentByTrackingId,
  getMyShipmentByTrackingId,
  getAdminMarketplaceOrders,
  getSourcingRequestById,
  getSourcingRequests,
  listShipments,
  getUserMarketplaceOrder,
  getUserMarketplaceOrders,
  getUserSourcingDashboard,
  getUserSourcingRequestById,
  saveAdminCategory,
  saveAdminOfficialQuote,
  type AdminCategoryFormInput,
  type AdminOfficialQuoteInput,
  type CreateSourcingRequestInput,
  type SourcingRequestFilters,
} from '@/lib/data';
import type {
  CartResponse,
  CheckoutCompleteRequest,
  CheckoutShippingRequest,
  CreateInventoryProductRequest,
  LoginRequest,
  RegisterRequest,
} from '@/lib/contracts';
import { getAccessToken } from './client';
import { normalizeTrackingId } from '@/lib/tracking-id';
import { getAuthSession } from '@/lib/auth-session';
import { useMounted } from '@/hooks/use-mounted';

function userInitials(name?: string | null): string {
  if (!name?.trim()) return 'N/A';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function requiresAuth(extra?: boolean): boolean {
  if (extra === false) return false;
  return !!getAccessToken();
}

// ——— Auth ———

export function useAuthMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => api.apiAuthMe(),
    enabled: requiresAuth(),
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => api.apiLogin(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegisterMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterRequest) => api.apiRegister(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.apiLogout(),
    onSuccess: () => qc.clear(),
  });
}

// ——— Catalog (public) ———

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

export function useRelatedProducts(id: string, limit = 4) {
  return useQuery({
    queryKey: queryKeys.products.related(id, limit),
    queryFn: () => getRelatedProducts(id, limit),
    enabled: !!id,
  });
}

export function useMarketplaceProducts(
  category?: string,
  search?: string,
  brand?: string,
  vehicle?: { make?: string; model?: string; year?: string },
  page = 1,
  pageSize = 48,
  sortBy?: string,
) {
  const query: Record<string, string | number> = { page, pageSize };
  if (category) query.category = category;
  if (search?.trim()) query.search = search.trim();
  if (brand) query.supplier = brand;
  if (vehicle?.make) query.make = vehicle.make;
  if (vehicle?.model) query.model = vehicle.model;
  if (vehicle?.year) query.year = vehicle.year;
  if (sortBy) {
    if (sortBy === 'price-asc') {
      query.sortBy = 'price';
      query.sortDirection = 'asc';
    } else if (sortBy === 'price-desc') {
      query.sortBy = 'price';
      query.sortDirection = 'desc';
    } else if (sortBy === 'name') {
      query.sortBy = 'partName';
      query.sortDirection = 'asc';
    }
  }

  return useQuery({
    queryKey: ['marketplace', 'parts', query],
    queryFn: () => api.apiGetMarketplaceProducts(query),
  });
}

export function useExploreCategories(page = 1, pageSize = 12) {
  return useQuery({
    queryKey: queryKeys.categories.explore(page, pageSize),
    queryFn: () => getExploreCategories(page, pageSize),
  });
}

/** Home page: public feed from API */
export function useHomePageData() {
  return useQuery({
    queryKey: queryKeys.home,
    queryFn: getHomeFeed,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

/** Logged-in user from session + optional refresh from /auth/me */
export function useCurrentUser() {
  const mounted = useMounted();
  const sessionQuery = useQuery({
    queryKey: ['auth', 'session-user'],
    queryFn: async () => {
      const raw =
        localStorage.getItem('dubicolt_session') ?? localStorage.getItem('dubiken_session');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { loggedIn?: boolean; user?: import('@/lib/contracts').AuthUser };
      return parsed.loggedIn ? parsed.user ?? null : null;
    },
    enabled: mounted,
  });

  const token = mounted ? getAccessToken() : null;
  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => api.apiAuthMe(),
    enabled: mounted && !!token,
  });

  const session = mounted ? getAuthSession() : null;
  const user = mounted ? (meQuery.data ?? sessionQuery.data ?? session?.user ?? null) : null;
  const isLoggedIn =
    mounted && !!(session?.loggedIn && (session.access_token || user));

  return {
    user,
    isLoggedIn,
    mounted,
    isLoading: !mounted || meQuery.isLoading || sessionQuery.isFetching,
    displayName: user?.name ?? 'Account',
    company: user?.company ?? '',
    role: user?.role,
    dashboardHref: user?.role === 'admin' ? '/admin' : '/dashboard',
    initials: userInitials(user?.name),
  };
}

// ——— Cart & checkout ———

const emptyCart: CartResponse = { items: [], item_count: 0, subtotal: 0 };

function readCartCache(qc: ReturnType<typeof useQueryClient>): CartResponse {
  return qc.getQueryData<CartResponse>(queryKeys.cart) ?? emptyCart;
}

export function useCartQuery() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => api.apiGetCart(),
    enabled: requiresAuth(),
    placeholderData: emptyCart,
  });
}

export function useAddCartItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.apiAddCartItem(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const previous = readCartCache(qc);
      const existing = previous.items.find((i) => i.product_id === productId);
      const items = existing
        ? previous.items.map((i) =>
            i.product_id === productId ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : previous.items;
      qc.setQueryData<CartResponse>(queryKeys.cart, {
        ...previous,
        items,
        item_count: previous.item_count + quantity,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.cart, context.previous);
    },
    onSuccess: (data) => qc.setQueryData(queryKeys.cart, data),
  });
}

export function useUpdateCartItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, quantity }: { lineId: string; quantity: number }) =>
      api.apiUpdateCartItem(lineId, { quantity }),
    onMutate: async ({ lineId, quantity }) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const previous = readCartCache(qc);
      const line = previous.items.find((i) => i.id === lineId);
      if (!line) return { previous };
      const delta = quantity - line.quantity;
      qc.setQueryData<CartResponse>(queryKeys.cart, {
        ...previous,
        items: previous.items.map((i) => (i.id === lineId ? { ...i, quantity } : i)),
        item_count: previous.item_count + delta,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.cart, context.previous);
    },
    onSuccess: (data) => qc.setQueryData(queryKeys.cart, data),
  });
}

export function useRemoveCartItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lineId: string) => api.apiRemoveCartItem(lineId),
    onMutate: async (lineId) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const previous = readCartCache(qc);
      const line = previous.items.find((i) => i.id === lineId);
      if (!line) return { previous };
      qc.setQueryData<CartResponse>(queryKeys.cart, {
        ...previous,
        items: previous.items.filter((i) => i.id !== lineId),
        item_count: previous.item_count - line.quantity,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.cart, context.previous);
    },
    onSuccess: (data) => qc.setQueryData(queryKeys.cart, data),
  });
}

export function useDubicoltCheckoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { deliveryMethod: 'DELIVERY' | 'PICKUP'; deliveryAddress: string }) =>
      api.apiCheckout(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      qc.invalidateQueries({ queryKey: queryKeys.me.marketplaceOrders });
    },
  });
}

export function useMpesaStkPushMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, phone }: { orderId: string; phone: string }) =>
      api.apiMpesaStkPush(orderId, phone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.me.marketplaceOrders });
      qc.invalidateQueries({ queryKey: queryKeys.admin.orders });
    },
  });
}

/** @deprecated Use useDubicoltCheckoutMutation */
export function useCheckoutShippingMutation() {
  return useMutation({
    mutationFn: (_body: CheckoutShippingRequest) => {
      throw new Error('Use useDubicoltCheckoutMutation');
    },
  });
}

/** @deprecated Use useDubicoltCheckoutMutation + useMpesaStkPushMutation */
export function useCheckoutCompleteMutation() {
  return useMutation({
    mutationFn: (_body: CheckoutCompleteRequest) => {
      throw new Error('Use useDubicoltCheckoutMutation');
    },
  });
}

/** @deprecated Guest checkout not supported in Dubicolt MVP */
export function useGuestCheckoutMutation() {
  return useMutation({
    mutationFn: () => {
      throw new Error('Please sign in to checkout');
    },
  });
}

// ——— User sourcing & orders ———

export function useUserSourcingDashboard() {
  return useQuery({
    queryKey: queryKeys.me.sourcing,
    queryFn: getUserSourcingDashboard,
    enabled: requiresAuth(),
  });
}

export function useUserSourcingDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.me.sourcingDetail(id),
    queryFn: () => getUserSourcingRequestById(id),
    enabled: requiresAuth(!!id),
  });
}

export function useCreateSourcingRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSourcingRequestInput) => createUserSourcingRequest(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me.sourcing }),
  });
}

export function useUserMarketplaceOrders() {
  return useQuery({
    queryKey: queryKeys.me.marketplaceOrders,
    queryFn: getUserMarketplaceOrders,
    enabled: requiresAuth(),
  });
}

export function useUserMarketplaceOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.me.marketplaceOrder(id),
    queryFn: () => getUserMarketplaceOrder(id),
    enabled: requiresAuth() && !!id,
  });
}

export function useAcceptQuotationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quotationId: string) => api.apiAcceptQuotation(quotationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.me.sourcing });
      qc.invalidateQueries({ queryKey: queryKeys.me.marketplaceOrders });
    },
  });
}

export function useOrderInvoice(orderId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['order-invoice', orderId],
    queryFn: () => api.apiGetOrderInvoice(orderId),
    enabled: requiresAuth() && enabled && !!orderId,
  });
}

// ——— Admin ———

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: getAdminDashboard,
    enabled: requiresAuth(),
  });
}

export function useAdminSourcingRequests(filters: SourcingRequestFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.sourcing(filters),
    queryFn: () => getSourcingRequests(filters),
    enabled: requiresAuth(),
  });
}

export function useAdminSourcingDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.sourcingDetail(id),
    queryFn: () => getSourcingRequestById(id),
    enabled: requiresAuth(!!id),
  });
}

export function useSaveOfficialQuoteMutation(requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminOfficialQuoteInput) => saveAdminOfficialQuote(requestId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.sourcingDetail(requestId) });
      qc.invalidateQueries({ queryKey: ['admin', 'sourcing'] });
      qc.invalidateQueries({ queryKey: queryKeys.me.sourcing });
    },
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: getAdminCategoryCards,
    enabled: requiresAuth(),
  });
}

export function useAdminCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.category(id),
    queryFn: () => getAdminCategoryById(id),
    enabled: requiresAuth(!!id),
  });
}

export function useSaveAdminCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminCategoryFormInput) => saveAdminCategory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.categories });
      qc.invalidateQueries({ queryKey: queryKeys.categories.exploreAll });
    },
  });
}

export function useAdminInventory(search?: string) {
  const query: Record<string, string | number> = { page_size: 100 };
  if (search) query.search = search;
  return useQuery({
    queryKey: queryKeys.admin.inventory(query),
    queryFn: () => getAdminInventoryItems(search),
    enabled: requiresAuth(),
  });
}

export function useAdminInventoryProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.inventoryProduct(id),
    queryFn: () => getAdminInventoryProduct(id),
    enabled: requiresAuth(!!id),
  });
}

export function useAdminInventoryKpis() {
  return useQuery({
    queryKey: queryKeys.admin.inventoryKpis,
    queryFn: getAdminInventoryKpis,
    enabled: requiresAuth(),
  });
}

export function useCreateInventoryProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInventoryProductRequest) => api.apiCreateInventoryProduct(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      qc.invalidateQueries({ queryKey: queryKeys.admin.inventoryKpis });
      qc.invalidateQueries({ queryKey: queryKeys.marketplace.products() });
      qc.invalidateQueries({ queryKey: queryKeys.categories.exploreAll });
    },
  });
}

export function useUpdateInventoryProductMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<CreateInventoryProductRequest>) =>
      api.apiUpdateInventoryProduct(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      qc.invalidateQueries({ queryKey: queryKeys.admin.inventoryKpis });
      qc.invalidateQueries({ queryKey: queryKeys.admin.inventoryProduct(id) });
      qc.invalidateQueries({ queryKey: queryKeys.marketplace.products() });
      qc.invalidateQueries({ queryKey: queryKeys.home });
      qc.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
    },
  });
}

export function useAdminMarketplaceOrders() {
  return useQuery({
    queryKey: queryKeys.admin.orders,
    queryFn: getAdminMarketplaceOrders,
    enabled: requiresAuth(),
  });
}

export function useUpdateMarketplaceOrderStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.apiUpdateMarketplaceOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.orders });
    },
  });
}

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: (file: File) => api.apiUploadImage(file),
  });
}

// ——— Shipments & dashboard ———

export function useShipment(trackingId: string) {
  const normalized = normalizeTrackingId(trackingId);
  const authed = requiresAuth();
  return useQuery({
    queryKey: queryKeys.shipments.byTracking(normalized),
    queryFn: () =>
      authed ? getMyShipmentByTrackingId(normalized) : getShipmentByTrackingId(normalized),
    enabled: !!normalized,
  });
}

export function useShipments() {
  return useQuery({
    queryKey: ['shipments', 'list'] as const,
    queryFn: listShipments,
    enabled: requiresAuth(),
  });
}

export function useMyShipments() {
  return useQuery({
    queryKey: queryKeys.me.shipments,
    queryFn: listMyShipments,
    enabled: requiresAuth(),
  });
}

export function useAdminAnalyticsDetail() {
  return useQuery({
    queryKey: queryKeys.admin.analytics,
    queryFn: getAdminAnalytics,
    enabled: requiresAuth(),
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentOrders(limit),
    queryFn: () => getRecentOrders(limit),
    enabled: requiresAuth(),
  });
}

/** Admin analytics: dashboard KPIs + inventory KPIs + charts */
export function useAdminAnalytics() {
  const dashboard = useAdminDashboard();
  const inventoryKpis = useAdminInventoryKpis();
  const charts = useAdminAnalyticsDetail();
  return {
    dashboard: dashboard.data,
    inventoryKpis: inventoryKpis.data,
    charts: charts.data,
    isLoading: dashboard.isLoading || inventoryKpis.isLoading || charts.isLoading,
  };
}
