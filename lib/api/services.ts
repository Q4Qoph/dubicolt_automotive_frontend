import { clearAuthSessionOnUnauthorized } from '@/lib/auth-session';
import {
  mapCart,
  mapOrderDetail,
  mapOrderSummary,
  mapPartRequestDashboard,
  mapPartRequestDetail,
  mapProduct,
  mapPartRecordToProduct,
  mapPartRecordToMarketplaceProduct,
  mapNetOrderResponseToUserMarketplaceOrder,
} from '@/lib/dubicolt/mappers';
import type {
  DubicoltCheckoutRequest,
  DubicoltCheckoutResponse,
  DubicoltDashboard,
  DubicoltInventoryItem,
  DubicoltOrderDetail,
  DubicoltOrderSummary,
  DubicoltPartRequest,
  DubicoltPartRequestDetail,
  DubicoltPartRequestInput,
  DubicoltProduct,
  DubicoltQuotation,
  DubicoltStkPushResponse,
  DubicoltVehicle,
} from '@/lib/dubicolt/types';
import { apiRequest, buildApiUrl, getAccessToken } from './client';
import { API_PATHS } from './paths';
import type {
  AuthTokensResponse,
  AuthUser,
  CartResponse,
  LoginRequest,
  RegisterRequest,
  UpdateCartItemRequest,
  PartRecord,
  RecordResponse,
  NetCartItem,
  NetOrderResponseDto,
  StkPushResponseDto,
} from '@/lib/contracts';
import type {
  AdminDashboardKpis,
  AdminInventoryKpis,
  AdminMarketplaceOrderRow,
  DashboardSourcingRow,
  LogisticsPipelineCard,
  UserMarketplaceOrder,
  UserMarketplaceOrderDetail,
  MarketplaceProduct,
  Product,
} from '@/lib/types';

function token() {
  return getAccessToken();
}

// ——— Auth ———

export async function apiLogin(body: LoginRequest): Promise<AuthTokensResponse> {
  const res = await apiRequest<{ token: string; message?: string }>(API_PATHS.auth.login, {
    method: 'POST',
    body: { email: body.email, password: body.password },
  });
  return {
    access_token: res.token,
    refresh_token: '',
    expires_in: 86400,
    user: {
      id: 'user',
      email: body.email,
      name: body.email.split('@')[0],
      company: 'Dubicolt',
      role: 'buyer',
    },
  };
}

export async function apiRegister(body: RegisterRequest): Promise<AuthTokensResponse> {
  await apiRequest<string | { message?: string }>(API_PATHS.auth.register, {
    method: 'POST',
    body: { name: body.name, email: body.email, password: body.password },
  });
  return apiLogin({ email: body.email, password: body.password });
}

export async function apiLogout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dubicolt_session');
    localStorage.removeItem('dubiken_session');
  }
}

export async function apiAuthMe(): Promise<AuthUser> {
  try {
    const res = await apiRequest<{ id?: string; name?: string; email?: string }>(
      API_PATHS.auth.me,
      { token: token() },
    );
    return {
      id: res.id || 'user',
      name: res.name || 'User',
      email: res.email || '',
      company: 'Dubicolt Customer',
      role: 'buyer',
    };
  } catch {
    return {
      id: 'user',
      name: 'User',
      email: '',
      company: 'Dubicolt Customer',
      role: 'buyer',
    };
  }
}

// ——— Products / Parts ———

export async function apiSearchParts(query?: {
  page?: number;
  pageSize?: number;
  search?: string;
  model?: string;
  supplier?: string;
  sortBy?: string;
  sortDirection?: string;
}): Promise<RecordResponse> {
  return apiRequest<RecordResponse>(API_PATHS.parts.list, { query });
}

export async function apiSearchProducts(query?: Record<string, string | number>): Promise<MarketplaceProduct[]> {
  const params: Record<string, string | number> = {
    page: Number(query?.page) || 1,
    pageSize: Number(query?.pageSize || query?.page_size) || 48,
  };
  if (query?.keyword || query?.search) params.search = String(query.keyword || query.search);
  if (query?.model) params.model = String(query.model);
  if (query?.supplier || query?.brand) params.supplier = String(query.supplier || query.brand);
  if (query?.sortBy) params.sortBy = String(query.sortBy);
  if (query?.sortDirection) params.sortDirection = String(query.sortDirection);

  const res = await apiRequest<RecordResponse>(API_PATHS.parts.list, { query: params });
  return (res.items || []).map(mapPartRecordToMarketplaceProduct);
}

export async function apiListProducts(): Promise<MarketplaceProduct[]> {
  const res = await apiRequest<RecordResponse>(API_PATHS.parts.list, { query: { page: 1, pageSize: 50 } });
  return (res.items || []).map(mapPartRecordToMarketplaceProduct);
}

export async function apiGetProduct(id: string): Promise<Product | null> {
  try {
    const dto = await apiRequest<PartRecord>(API_PATHS.parts.byId(id));
    return mapPartRecordToProduct(dto);
  } catch {
    return null;
  }
}

export async function apiGetRelatedProducts(id: string, limit = 4): Promise<MarketplaceProduct[]> {
  const all = await apiSearchProducts({ pageSize: limit + 1 });
  return all.filter((p) => p.id !== id).slice(0, limit);
}

export async function apiGetMarketplaceProducts(query?: Record<string, string | number>) {
  const page = Math.max(1, Number(query?.page) || 1);
  const pageSize = Number(query?.pageSize || query?.page_size) || 48;
  const params: Record<string, string | number> = { page, pageSize };
  if (query?.search) params.search = String(query.search);
  if (query?.model) params.model = String(query.model);
  if (query?.brand || query?.supplier) params.supplier = String(query.brand || query.supplier);
  if (query?.make) params.search = params.search ? `${query.make} ${params.search}` : String(query.make);
  if (query?.sortBy) params.sortBy = String(query.sortBy);
  if (query?.sortDirection) params.sortDirection = String(query.sortDirection);

  const res = await apiRequest<RecordResponse>(API_PATHS.parts.list, { query: params });
  const rows = (res.items || []).map(mapPartRecordToMarketplaceProduct);
  const total = res.totalCount ?? rows.length;
  const totalPages = res.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  return {
    data: rows,
    meta: {
      page: res.page || page,
      page_size: res.pageSize || pageSize,
      total,
      totalPages,
    },
  };
}

// ——— Home Feed ———

export async function apiGetHomeFeed() {
  const res = await apiRequest<RecordResponse>(API_PATHS.parts.list, { query: { page: 1, pageSize: 50 } });
  const items = res.items || [];
  const products = items.map(mapPartRecordToMarketplaceProduct);

  const makes = new Set<string>();
  const modelsByMake = new Map<string, Set<string>>();
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

  for (const part of items) {
    if (part.applicableModel) {
      const parts = part.applicableModel.split(' ');
      const make = parts[0];
      const model = parts.slice(1).join(' ') || part.applicableModel;
      if (make) {
        makes.add(make);
        if (!modelsByMake.has(make)) modelsByMake.set(make, new Set());
        if (model) modelsByMake.get(make)!.add(model);
      }
    }
  }

  const categoryNames = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Body', 'EV Systems'];
  const categories = categoryNames.map((name, i) => ({
    id: `cat-${i + 1}`,
    name,
    description: `OEM & Aftermarket ${name} components`,
    origin: 'KE',
    product_count: 5000,
    image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    sample_products: [],
  }));

  return {
    categories,
    products: products.slice(0, 8),
    vehicleFilter: {
      makes: Array.from(makes).sort(),
      modelsByMake: Object.fromEntries(
        Array.from(modelsByMake.entries()).map(([make, models]) => [make, Array.from(models).sort()]),
      ),
      years,
    },
    meta: { page: 1, page_size: 8, total: res.totalCount || products.length },
  };
}

export async function apiListCategories() {
  return [
    { id: '1', name: 'Engine Parts', slug: 'engine', description: 'Engine components', origins: ['KE', 'AE', 'CN'], productCount: 1200, imageUrl: '', status: 'published' as const },
    { id: '2', name: 'Brake Systems', slug: 'brakes', description: 'Brake discs, pads & rotors', origins: ['KE', 'AE'], productCount: 850, imageUrl: '', status: 'published' as const },
    { id: '3', name: 'Suspension', slug: 'suspension', description: 'Struts, shocks & springs', origins: ['KE', 'CN'], productCount: 940, imageUrl: '', status: 'published' as const },
    { id: '4', name: 'Electrical', slug: 'electrical', description: 'Alternators, sensors & wiring', origins: ['KE', 'AE', 'CN'], productCount: 620, imageUrl: '', status: 'published' as const },
  ];
}

export async function apiGetCategories(query?: { page?: number; page_size?: number }) {
  const all = await apiListCategories();
  return {
    data: all.map((c) => ({
      id: c.id,
      name: c.name,
      origin: c.origins[0] ?? 'KE',
      product_count: c.productCount,
      image_url: c.imageUrl || '',
      sample_products: [],
    })),
    meta: { page: 1, page_size: 10, total: all.length },
  };
}

// ——— Cart & checkout ———

export async function apiGetCart(): Promise<CartResponse> {
  const authToken = token();
  if (!authToken) {
    return { items: [], item_count: 0, subtotal: 0 };
  }
  try {
    const rawItems = await apiRequest<NetCartItem[]>(API_PATHS.cart.root, { token: authToken });
    const items = (rawItems || []).map((i) => {
      const price = i.product?.price && i.product.price > 0 ? i.product.price : 4500;
      return {
        id: i.id,
        product_id: i.productId,
        name: i.product?.partName || 'Automotive Replacement Part',
        sku: i.product?.partCode || i.productId.slice(0, 8).toUpperCase(),
        quantity: i.quantity,
        unit_price: price,
        unit_price_kes: price,
        origin: i.product?.supplier || 'OEM Supplier',
        image_url: i.product?.imageUrl || '',
      };
    });
    const item_count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.unit_price_kes * i.quantity, 0);
    return { items, item_count, subtotal };
  } catch {
    return { items: [], item_count: 0, subtotal: 0 };
  }
}

export async function apiAddCartItem(productId: string, quantity: number): Promise<CartResponse> {
  const authToken = token();
  if (authToken) {
    try {
      await apiRequest<void>(API_PATHS.cart.items, {
        method: 'POST',
        body: { productId, quantity },
        token: authToken,
      });
    } catch {
      // ignore
    }
  }
  return apiGetCart();
}

export async function apiUpdateCartItem(productId: string, body: UpdateCartItemRequest): Promise<CartResponse> {
  const authToken = token();
  if (authToken) {
    try {
      await apiRequest<void>(API_PATHS.cart.root, {
        method: 'PUT',
        body: { productId, quantity: body.quantity },
        token: authToken,
      });
    } catch {
      // ignore
    }
  }
  return apiGetCart();
}

export async function apiRemoveCartItem(cartItemId: string): Promise<CartResponse> {
  const authToken = token();
  if (authToken) {
    try {
      await apiRequest<void>(API_PATHS.cart.item(cartItemId), {
        method: 'DELETE',
        token: authToken,
      });
    } catch {
      // ignore
    }
  }
  return apiGetCart();
}

export async function apiCheckout(
  body: DubicoltCheckoutRequest | { deliveryMethod?: string; deliveryAddress?: string; shipping?: { address?: string } },
) {
  const address =
    ('deliveryAddress' in body && body.deliveryAddress)
      ? body.deliveryAddress
      : (('shipping' in body && body.shipping?.address) ? body.shipping.address : 'Nairobi, Kenya');
  const orderId = await apiRequest<string>(API_PATHS.orders.create, {
    method: 'POST',
    body: { deliveryAddress: address },
    token: token(),
  });
  const idStr = String(orderId);
  return {
    orderId: idStr,
    order_id: idStr,
    orderNumber: idStr.slice(0, 8).toUpperCase(),
    order_number: idStr.slice(0, 8).toUpperCase(),
    payment_url: undefined,
  };
}

export async function apiMpesaStkPush(orderId: string, phone: string) {
  const query = { phoneNumber: phone, Id: orderId };
  const res = await apiRequest<StkPushResponseDto>(API_PATHS.payments.stkPush, {
    method: 'POST',
    query,
    token: token(),
  });
  return {
    ...res,
    orderId,
    order_id: orderId,
    message:
      res.customerMessage ||
      res.responseDescription ||
      'STK push prompt sent to your mobile device. Enter M-Pesa PIN to complete payment.',
  };
}

// ——— Orders ———

export async function apiGetUserMarketplaceOrders(): Promise<UserMarketplaceOrder[]> {
  const authToken = token();
  if (!authToken) return [];
  try {
    const orders = await apiRequest<NetOrderResponseDto[]>(API_PATHS.orders.userOrders, {
      token: authToken,
    });
    return (orders || []).map(mapNetOrderResponseToUserMarketplaceOrder);
  } catch {
    return [];
  }
}

export async function apiGetUserMarketplaceOrder(
  id: string,
): Promise<UserMarketplaceOrderDetail | null> {
  const authToken = token();
  if (!authToken) return null;
  try {
    const orderDto = await apiRequest<NetOrderResponseDto>(API_PATHS.orders.byId(id), {
      token: authToken,
    });
    const order = mapNetOrderResponseToUserMarketplaceOrder(orderDto);
    return {
      order,
      shipment: {
        id: orderDto.id,
        tracking_id: orderDto.id,
        current_status: order.status,
        origin_city: 'Warehouse Hub',
        destination_city: orderDto.deliveryAddress || 'Nairobi',
        vessel: 'Dubicolt Logistics Express',
        proof_url: undefined,
        milestones: [
          { label: 'Order Placed', detail: 'Order received', date: '', done: true },
          { label: 'Processing', detail: 'Preparing items', date: '', done: orderDto.orderStatus >= 2, active: orderDto.orderStatus === 2 },
          { label: 'In Transit', detail: 'Dispatched to courier', date: '', done: orderDto.orderStatus >= 3, active: orderDto.orderStatus === 3 },
          { label: 'Delivered', detail: 'Delivered to client', date: '', done: orderDto.orderStatus >= 4, active: orderDto.orderStatus === 4 },
        ],
      },
    };
  } catch {
    return null;
  }
}


// ——— Part requests & quotations ———

export async function apiGetPartRequests() {
  return apiRequest<DubicoltPartRequest[]>(API_PATHS.partRequests.root, { token: token() });
}

export async function apiGetPartRequest(id: string) {
  try {
    return await apiRequest<DubicoltPartRequestDetail>(API_PATHS.partRequests.byId(id), {
      token: token(),
    });
  } catch {
    return null;
  }
}

export async function apiCreatePartRequest(body: DubicoltPartRequestInput) {
  return apiRequest<DubicoltPartRequest>(API_PATHS.partRequests.root, {
    method: 'POST',
    body,
    token: token(),
  });
}

export async function apiAcceptQuotation(id: string) {
  return apiRequest<{ orderId: string; amount: number }>(API_PATHS.quotations.accept(id), {
    method: 'POST',
    token: token(),
  });
}

export async function apiRejectQuotation(id: string) {
  return apiRequest<DubicoltQuotation>(API_PATHS.quotations.reject(id), {
    method: 'POST',
    token: token(),
  });
}

export async function apiCreateQuotation(body: {
  requestId: string;
  price: number;
  leadTimeDays: number;
  validUntil: string;
  supplierId?: string;
}) {
  return apiRequest<DubicoltQuotation>(API_PATHS.quotations.root, {
    method: 'POST',
    body,
    token: token(),
  });
}

// ——— Vehicles ———

export async function apiListVehicles() {
  return apiRequest<DubicoltVehicle[]>(API_PATHS.vehicles.root, { token: token() });
}

export async function apiCreateVehicle(body: Omit<DubicoltVehicle, 'id'>) {
  return apiRequest<DubicoltVehicle>(API_PATHS.vehicles.root, {
    method: 'POST',
    body,
    token: token(),
  });
}

// ——— Admin / reports ———

export async function apiGetReportsDashboard(): Promise<DubicoltDashboard> {
  return apiRequest<DubicoltDashboard>(API_PATHS.reports.dashboard, { token: token() });
}

export async function apiGetAdminDashboard(): Promise<{
  kpis: AdminDashboardKpis;
  sourcing_rows: DashboardSourcingRow[];
  logistics: LogisticsPipelineCard[];
}> {
  const [dash, partRequests, orders] = await Promise.all([
    apiGetReportsDashboard(),
    apiGetPartRequests(),
    apiRequest<DubicoltOrderSummary[]>(API_PATHS.orders.root, { token: token() }),
  ]);
  const delivered = orders.filter((o) => o.status.toUpperCase() === 'DELIVERED').length;
  const fulfilled = orders.filter((o) =>
    ['PAID', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(o.status.toUpperCase()),
  ).length;
  const otd = fulfilled > 0 ? Math.round((delivered / fulfilled) * 100) : 0;
  const delayed = orders.filter((o) =>
    ['PROCESSING', 'DISPATCHED', 'IN_TRANSIT'].includes(o.status.toUpperCase()),
  ).length;

  return {
    kpis: {
      global_sales_usd: dash.salesToday,
      global_sales_change: dash.ordersToday > 0 ? `${dash.ordersToday} orders today` : 'No orders today',
      active_requests: partRequests.filter((r) => r.status !== 'CLOSED').length,
      pending_quotes: dash.pendingQuotes,
      otd_percent: otd,
      delayed_shipments: delayed,
    },
    sourcing_rows: partRequests.slice(0, 5).map((r) => ({
      id: r.id,
      origin: 'KE' as const,
      destination: 'KE' as const,
      product_title: r.partName,
      quantity: '1',
      vendor: r.customerName ?? `${r.vehicle.make} ${r.vehicle.model}`,
      status_tags: [
        {
          label: r.status.replace(/_/g, ' '),
          variant: (r.status === 'SUBMITTED' ? 'orange' : 'blue') as 'orange' | 'blue',
        },
      ],
      time_ago: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString('en-KE')
        : 'Recently',
      primary_action: { label: 'View', style: 'solid' as const },
    })),
    logistics: [],
  };
}

export async function apiGetAdminSourcingRequests() {
  const rows = await apiGetPartRequests();
  return {
    data: rows.map((r) => ({
      id: r.id,
      request_number: r.id,
      client_name: r.customerName ?? 'Customer',
      client_initials: (r.customerName ?? 'C').slice(0, 2).toUpperCase(),
      product_title: r.partName,
      description: r.description,
      status: r.status.toLowerCase() as 'pending' | 'quoted' | 'shipping' | 'delivered',
      market: 'KE',
      destination: `${r.vehicle.make} ${r.vehicle.model} (${r.vehicle.year})`,
      reference_images: r.photoUrls ?? [],
      reference_extra: 0,
      has_document: false,
      created_at: r.createdAt ?? new Date().toISOString(),
    })),
    meta: { page: 1, page_size: rows.length, total: rows.length },
  };
}

export async function apiGetAdminSourcingDetail(id: string) {
  const detail = await apiGetPartRequest(id);
  if (!detail) return null;
  return {
    ...detail,
    request_number: detail.requestId?.slice(0, 8) ?? detail.id.slice(0, 8),
    client_name: 'Customer',
    product_title: detail.partName,
    quotes: (detail.quotations ?? []).map((q) => ({
      id: q.id,
      unit_price: String(q.price),
      lead_time: `${q.leadTimeDays} days`,
      shipment: 'Dubicolt',
      notes: `Valid until ${q.validUntil}`,
      official: true,
    })),
  };
}

const ORIGIN_LABELS: Record<string, string> = { KE: 'Kenya', AE: 'Dubai', CN: 'China' };

function mapCategoryCard(c: import('@/lib/dubicolt/types').DubicoltCategory) {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    origins: c.origins,
    trend: `${c.productCount} SKUs`,
    trend_variant: 'stable' as const,
    total_skus: c.productCount,
    vendors: 0,
    image_url: c.imageUrl || '',
    status: c.status,
  };
}

export async function apiListAdminInventory() {
  const rows = await apiRequest<DubicoltInventoryItem[]>(API_PATHS.inventory.root, {
    token: token(),
  });
  return {
    data: rows.map((r) => {
      const origin = (r.origin ?? 'KE') as 'KE' | 'AE' | 'CN';
      const price = r.sellingPrice ?? 0;
      return {
        id: r.productId,
        sku: r.sku,
        name: r.title,
        category: r.category ?? 'Uncategorized',
        origin,
        origin_label: ORIGIN_LABELS[origin] ?? origin,
        image_url: r.imageUrl ?? '',
        stock: r.quantity,
        low_stock: r.lowStock,
        status: (r.status ?? 'published') as 'draft' | 'published',
        value: price > 0 ? `KSh ${(price * r.quantity).toLocaleString()}` : 'N/A',
        marketplace_price: price > 0 ? `KSh ${price.toLocaleString()}` : 'N/A',
        stock_levels: [{ hub: origin, percent: Math.min(100, r.quantity) }],
      };
    }),
    meta: { page: 1, page_size: rows.length, total: rows.length },
  };
}

export async function apiGetAdminInventoryKpis(): Promise<AdminInventoryKpis> {
  const rows = await apiRequest<DubicoltInventoryItem[]>(API_PATHS.inventory.root, {
    token: token(),
  });
  const low = rows.filter((r) => r.lowStock).length;
  const published = rows.filter((r) => r.status === 'published').length;
  const totalValue = rows.reduce((sum, r) => sum + (r.sellingPrice ?? 0) * r.quantity, 0);
  const origins = Array.from(new Set(rows.map((r) => r.origin ?? 'KE')));
  const hubCounts = origins.map((code) => {
    const hubRows = rows.filter((r) => (r.origin ?? 'KE') === code);
    const publishedInHub = hubRows.filter((r) => r.status === 'published').length;
    return {
      hub: code as 'KE' | 'AE' | 'CN',
      label: ORIGIN_LABELS[code] ?? code,
      flag: code === 'KE' ? '🇰🇪' : code === 'AE' ? '🇦🇪' : '🇨🇳',
      product_count: hubRows.length,
      published_count: publishedInHub,
      stock_units: hubRows.reduce((s, r) => s + r.quantity, 0),
    };
  });

  return {
    total_active_products: published,
    new_this_week: 0,
    total_inventory_value: totalValue > 0 ? `KSh ${totalValue.toLocaleString()}` : 'KSh 0',
    hubs_label: origins.map((o) => ORIGIN_LABELS[o] ?? o).join(', ') || 'Kenya',
    low_stock_count: low,
    hub_counts: hubCounts,
  };
}

export async function apiGetAdminMarketplaceOrders(): Promise<AdminMarketplaceOrderRow[]> {
  const rows = await apiRequest<DubicoltOrderSummary[]>(API_PATHS.orders.root, {
    token: token(),
  });
  return rows.map((o) => ({
    id: o.id,
    order_number: o.id,
    title: o.itemTitle ?? 'Spare parts order',
    vendor: 'Dubicolt',
    origin_flag: 'KE',
    image_url: o.itemImageUrl ?? '',
    status: o.status,
    status_icon: 'processing' as const,
    price_kes: `KSh ${o.total.toLocaleString()}`,
    customer_name: o.customerName ?? 'Customer',
    customer_detail: o.customerEmail ?? 'Kenya',
    date_value: o.createdAt
      ? new Date(o.createdAt).toLocaleDateString('en-KE')
      : new Date().toISOString().slice(0, 10),
    primary_action: 'View',
    secondary_action: 'Update status',
    delivery_id: o.deliveryId,
  }));
}

export async function apiGetAdminAnalytics() {
  const data = await apiRequest<{
    weeklySales: { week: string; revenue: number; orders: number }[];
    topCategories: { name: string; value: number; pct: number }[];
  }>(API_PATHS.reports.analytics, { token: token() });

  return {
    weekly_volume: data.weeklySales.map((w) => ({
      week: w.week,
      kenya: w.revenue,
      dubai: 0,
      china: 0,
    })),
    top_categories: data.topCategories.map((c) => ({
      name: c.name,
      value: c.value,
      value_usd: c.value,
      percent: c.pct,
      pct: c.pct,
    })),
  };
}

export async function apiGetUserSourcingDashboard() {
  const rows = await apiGetPartRequests();
  return mapPartRequestDashboard(rows);
}

export async function apiCreateSourcingRequest(body: DubicoltPartRequestInput) {
  const created = await apiCreatePartRequest(body);
  return mapPartRequestDashboard([created]).requests[0];
}

export async function apiGetUserSourcingDetail(id: string) {
  const detail = await apiGetPartRequest(id);
  if (!detail) return null;
  return mapPartRequestDetail(detail);
}

export async function apiSaveOfficialQuote() {
  throw new Error('Use apiCreateQuotation instead');
}

export async function apiGetAdminCategories() {
  const rows = await apiListCategories();
  return rows.map(mapCategoryCard);
}

export async function apiGetAdminCategory(id: string) {
  try {
    const row = await apiRequest<import('@/lib/dubicolt/types').DubicoltCategory>(
      API_PATHS.categories.byId(id),
    );
    return mapCategoryCard(row);
  } catch {
    return null;
  }
}

export async function apiSaveAdminCategory(input: {
  id?: string;
  name: string;
  description?: string;
  image_url?: string;
  status?: 'draft' | 'published';
  origins?: string[];
}) {
  const body = {
    name: input.name,
    description: input.description,
    imageUrl: input.image_url,
    status: input.status,
    origins: input.origins,
  };
  const row = input.id
    ? await apiRequest<import('@/lib/dubicolt/types').DubicoltCategory>(
        API_PATHS.categories.byId(input.id),
        { method: 'PUT', body, token: token() },
      )
    : await apiRequest<import('@/lib/dubicolt/types').DubicoltCategory>(API_PATHS.categories.root, {
        method: 'POST',
        body,
        token: token(),
      });
  return mapCategoryCard(row);
}

export async function apiGetAdminInventoryProduct(id: string) {
  try {
    const p = await apiRequest<DubicoltProduct>(API_PATHS.products.byId(id), { token: token() });
    return {
      id: p.id,
      name: p.title,
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      description: p.description,
      primary_origin: 'KE' as const,
      price_kes: p.sellingPrice,
      compare_at_price_kes: null,
      stock: p.stock,
      min_order: 1,
      image_url: p.imageUrl,
      images: p.imageUrl ? [p.imageUrl] : [],
      gallery_images: p.imageUrl ? [p.imageUrl] : [],
      attributes: [
        { feature: 'OEM', value: p.oemNumber ?? '' },
        { feature: 'Brand', value: p.brand },
      ],
      status: 'published' as const,
      on_marketplace: true,
      marketplace_cta: 'cart' as const,
    };
  } catch {
    return null;
  }
}

export async function apiCreateInventoryProduct(
  body: import('@/lib/contracts').CreateInventoryProductRequest,
) {
  return apiRequest<DubicoltProduct>('/products', {
    method: 'POST',
    body: {
      title: body.name,
      sku: body.sku,
      description: body.description,
      category: body.category,
      brand: body.brand ?? 'Generic',
      sellingPrice: body.price_kes,
      imageUrl: body.image_url,
    },
    token: token(),
  });
}

export async function apiUpdateInventoryProduct(
  id: string,
  body: Partial<{
    title: string;
    sku: string;
    description: string;
    category: string;
    brand: string;
    sellingPrice: number;
    imageUrl: string;
  }>,
) {
  return apiRequest<DubicoltProduct>(API_PATHS.products.byId(id), {
    method: 'PUT',
    body,
    token: token(),
  });
}

export async function apiUpdateMarketplaceOrderStatus(id: string, status: string) {
  return apiRequest<DubicoltOrderDetail>(API_PATHS.orders.status(id), {
    method: 'PUT',
    body: { status },
    token: token(),
  });
}

export async function apiGetOrderInvoice(id: string) {
  return apiRequest<{
    orderNumber: string;
    status: string;
    paid: boolean;
    customerName?: string;
    customerEmail?: string;
    deliveryMethod?: string;
    deliveryAddress?: string;
    createdAt?: string;
    items: { title: string; quantity: number; unitPrice: number }[];
    total: number;
    currency: string;
  }>(API_PATHS.orders.invoice(id), { token: token() });
}

export async function apiUpdateDeliveryStatus(id: string, status: string, proofUrl?: string) {
  return apiRequest<{ id: string; status: string; proofUrl?: string }>(
    API_PATHS.deliveries.status(id),
    { method: 'POST', body: { status, proofUrl }, token: token() },
  );
}

export async function apiListShipments() {
  return [];
}

export async function apiGetShipment() {
  return null;
}

export async function apiGetMyShipment() {
  return null;
}

export async function apiGetMyShipments() {
  return [];
}

export async function apiCheckoutShipping() {
  throw new Error('Use apiCheckout');
}

export async function apiCheckoutComplete() {
  throw new Error('Use apiCheckout + apiMpesaStkPush');
}

export async function apiGuestCheckout() {
  throw new Error('Guest checkout requires sign-in for Dubicolt MVP');
}

// ——— Uploads ———

export async function apiUploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const accessToken = token();
  const res = await fetch(buildApiUrl(API_PATHS.uploads.image), {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: form,
  });
  const json = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      clearAuthSessionOnUnauthorized(API_PATHS.uploads.image, !!accessToken);
    }
    throw new Error(json?.error?.message ?? 'Upload failed');
  }
  return json as { url: string };
}
