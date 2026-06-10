import type { UpsertCategoryRequest, UpsertOfficialQuoteRequest } from '@/lib/contracts';
import { mapMarketplaceProduct, mapRelatedProduct } from '@/lib/dubicolt/mappers';
import type {
  AdminCategoryCard,
  AdminDashboardKpis,
  AdminInventoryItem,
  AdminInventoryKpis,
  DashboardSourcingRow,
  ExploreCategory,
  HomeFeed,
  LogisticsPipelineCard,
  MarketplaceProduct,
  Order,
  Product,
  RelatedProduct,
  Shipment,
  AdminMarketplaceOrderRow,
  SourcingRequest,
  SourcingRequestDetail,
  UserMarketplaceOrder,
  UserMarketplaceOrderDetail,
  UserSourcingRequestDetail,
  UserSourcingRequestItem,
} from '@/lib/types';
import * as api from '@/lib/api/services';
import type { DubicoltPartRequestInput } from '@/lib/dubicolt/types';

export type { SourcingRequestFilters } from '@/lib/api/query-keys';
import type { SourcingRequestFilters } from '@/lib/api/query-keys';

export async function getRecentOrders(limit = 5): Promise<
  (Order & { tracking_id?: string | null })[]
> {
  const orders = await api.apiGetUserMarketplaceOrders();
  return orders.slice(0, limit).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    tracking_id: o.tracking_id,
    customer_name: o.vendor,
    status: o.status.toLowerCase(),
    origin: 'Kenya',
    eta: o.date_value,
    created_at: new Date().toISOString(),
  }));
}

export async function getShipmentByTrackingId(_trackingId?: string): Promise<Shipment | null> {
  return null;
}

export async function getMyShipmentByTrackingId(_trackingId?: string): Promise<Shipment | null> {
  return null;
}

export async function listShipments(): Promise<Shipment[]> {
  return [];
}

export async function getProductById(id: string): Promise<Product | null> {
  return api.apiGetProduct(id);
}

export async function getRelatedProducts(excludeId: string, limit = 4): Promise<RelatedProduct[]> {
  const rows = await api.apiGetRelatedProducts(excludeId, limit);
  return rows.map(mapRelatedProduct);
}

export async function getSourcingRequests(
  _filters: SourcingRequestFilters = {},
): Promise<SourcingRequest[]> {
  const res = await api.apiGetAdminSourcingRequests();
  return res.data as unknown as SourcingRequest[];
}

export async function getSourcingRequestById(
  id: string,
): Promise<SourcingRequestDetail | null> {
  return (await api.apiGetAdminSourcingDetail(id)) as SourcingRequestDetail | null;
}

export type AdminOfficialQuoteInput = UpsertOfficialQuoteRequest;

export async function saveAdminOfficialQuote(
  requestId: string,
  input: AdminOfficialQuoteInput,
): Promise<SourcingRequestDetail | null> {
  await api.apiCreateQuotation({
    requestId,
    price: Number(input.unit_price) || 0,
    leadTimeDays: Number(input.lead_time_days?.replace(/\D/g, '')) || 7,
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });
  return getSourcingRequestById(requestId);
}

export async function getUserSourcingRequestById(
  id: string,
): Promise<UserSourcingRequestDetail | null> {
  return (await api.apiGetUserSourcingDetail(id)) as UserSourcingRequestDetail | null;
}

export async function getAdminMarketplaceOrders(): Promise<AdminMarketplaceOrderRow[]> {
  return api.apiGetAdminMarketplaceOrders();
}

export async function getUserSourcingDashboard(): Promise<{
  summary: { active: number; pending_quotes: number; procured_total: string };
  requests: UserSourcingRequestItem[];
}> {
  return api.apiGetUserSourcingDashboard();
}

export interface CreateSourcingRequestInput {
  vehicle: { make: string; model: string; year: number };
  partName: string;
  description: string;
  vin?: string;
  photoUrls?: string[];
}

export async function createUserSourcingRequest(
  input: CreateSourcingRequestInput,
): Promise<UserSourcingRequestItem> {
  const body: DubicoltPartRequestInput = {
    vehicle: input.vehicle,
    partName: input.partName,
    description: input.description,
    vin: input.vin,
    photoUrls: input.photoUrls,
  };
  return api.apiCreateSourcingRequest(body) as Promise<UserSourcingRequestItem>;
}

export async function getUserMarketplaceOrders(): Promise<UserMarketplaceOrder[]> {
  return api.apiGetUserMarketplaceOrders();
}

export async function getUserMarketplaceOrder(
  id: string,
): Promise<UserMarketplaceOrderDetail | null> {
  return api.apiGetUserMarketplaceOrder(id);
}

export type AdminCategoryFormInput = UpsertCategoryRequest & { id?: string };

export async function saveAdminCategory(input: AdminCategoryFormInput): Promise<AdminCategoryCard> {
  return api.apiSaveAdminCategory({
    id: input.id,
    name: input.name,
    description: input.description,
    image_url: input.image_url ?? undefined,
    status: input.status,
    origins: input.origins,
  });
}

const EMPTY_HOME_FEED = {
  categories: [] as ExploreCategory[],
  products: [] as MarketplaceProduct[],
  vehicleFilter: { makes: [], modelsByMake: {}, years: [] },
};

export async function getHomeFeed(): Promise<HomeFeed> {
  try {
    const res = await api.apiGetHomeFeed();
    return {
      categories: (res?.categories ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        origin: c.origin,
        product_count: c.product_count,
        image_url: c.image_url,
        sample_products: (c.sample_products ?? []).map((p) => ({
          id: p.id,
          name: p.title,
          image_url: p.imageUrl,
          price: String(p.sellingPrice),
        })),
      })),
      products: (res?.products ?? []).map((p) => mapMarketplaceProduct(p)),
      vehicleFilter: res?.vehicleFilter ?? { makes: [], modelsByMake: {}, years: [] },
    };
  } catch {
    return EMPTY_HOME_FEED;
  }
}

export async function getExploreCategories(page = 1, pageSize = 12): Promise<{
  categories: ExploreCategory[];
  meta: { page: number; page_size: number; total: number };
}> {
  const res = await api.apiGetCategories({ page, page_size: pageSize });
  return {
    categories: res.data.map((c) => ({
      id: c.id,
      name: c.name,
      origin: c.origin,
      product_count: c.product_count,
      image_url: c.image_url,
      sample_products: c.sample_products ?? [],
    })),
    meta: res.meta,
  };
}

export async function getAdminAnalytics() {
  return api.apiGetAdminAnalytics();
}

export async function listMyShipments(): Promise<Shipment[]> {
  return [];
}

export async function getMarketplaceProducts(
  _hub?: string,
  category?: string,
  search?: string,
  vehicle?: { make?: string; model?: string; year?: string },
): Promise<MarketplaceProduct[]> {
  const query: Record<string, string | number> = {};
  if (category) query.category = category;
  if (search?.trim()) query.search = search.trim();
  if (vehicle?.make) query.make = vehicle.make;
  if (vehicle?.model) query.model = vehicle.model;
  if (vehicle?.year) query.year = Number(vehicle.year);
  const res = await api.apiGetMarketplaceProducts(query);
  return (res?.data ?? []).map((p) => mapMarketplaceProduct(p));
}

export async function getAdminCategoryCards(): Promise<AdminCategoryCard[]> {
  return api.apiGetAdminCategories() as Promise<AdminCategoryCard[]>;
}

export async function getAdminCategoryById(id: string): Promise<AdminCategoryCard | null> {
  return api.apiGetAdminCategory(id) as Promise<AdminCategoryCard | null>;
}

export async function getAdminInventoryItems(_search?: string): Promise<AdminInventoryItem[]> {
  const res = await api.apiListAdminInventory();
  return res.data as AdminInventoryItem[];
}

export async function getAdminInventoryProduct(id: string) {
  return api.apiGetAdminInventoryProduct(id);
}

export async function getAdminInventoryKpis(): Promise<AdminInventoryKpis> {
  return api.apiGetAdminInventoryKpis() as Promise<AdminInventoryKpis>;
}

export async function getAdminDashboard(): Promise<{
  kpis: AdminDashboardKpis;
  sourcingRows: DashboardSourcingRow[];
  logistics: LogisticsPipelineCard[];
}> {
  const data = await api.apiGetAdminDashboard();
  return {
    kpis: data.kpis,
    sourcingRows: data.sourcing_rows,
    logistics: data.logistics,
  };
}
