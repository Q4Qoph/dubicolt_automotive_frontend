/** UI/domain types for API-backed screens (see `lib/data.ts`). */

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  origin: string;
  eta: string;
  created_at: string;
}

export interface ShipmentMilestone {
  label: string;
  detail: string;
  date: string;
  done: boolean;
  active?: boolean;
}

export interface Shipment {
  id: string;
  tracking_id: string;
  current_status: string;
  origin_city: string;
  destination_city: string;
  vessel: string;
  proof_url?: string;
  milestones: ShipmentMilestone[];
}

export interface SourcingRequest {
  id: string;
  request_number: string;
  client_name: string;
  client_initials: string;
  product_title: string;
  description: string;
  destination: string;
  destination_label: string;
  status: 'pending' | 'quoted' | 'shipping' | 'delivered';
  market: 'KE' | 'AE' | 'CN';
  reference_images: string[];
  reference_extra?: number;
  has_document?: boolean;
  created_at: string;
}

export interface SourcingAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'zip';
  url?: string;
}

export interface SourcingQuoteReceived {
  id: string;
  unit_price: string;
  shipping_cost?: string;
  lead_time: string;
  shipment: string;
  notes: string;
  official?: boolean;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

export interface SourcingRequestDetail extends SourcingRequest {
  quantity: string;
  material_grade?: string;
  voltage_range?: string;
  budget_total: string;
  budget_subtitle: string;
  regional_targets: { code: 'KE' | 'AE' | 'CN'; label: string }[];
  attachments: SourcingAttachment[];
  quotes: SourcingQuoteReceived[];
  quote_date?: string;
  destination_port?: string;
  estimated_budget_range?: string;
  requester_location?: string;
  product_image_url?: string;
}

export interface UserSourcingRequestDetail {
  id: string;
  request_number: string;
  title: string;
  origin: string;
  status: string;
  status_variant: 'orange' | 'blue' | 'gray';
  description: string;
  quantity: string;
  voltage_range?: string;
  budget_total: string;
  budget_subtitle: string;
  regional_targets: { code: string; label: string }[];
  attachments: SourcingAttachment[];
  quotes: SourcingQuoteReceived[];
  quote_date?: string;
  destination_port?: string;
  estimated_budget_range?: string;
  delivery_county?: string;
  delivery_address?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price_kes: number;
  compare_at_price_kes: number | null;
  save_percent: number | null;
  origin: string;
  image_url: string;
  images: string[];
  specs: Record<string, string>;
  currency_ke: string;
  currency_ae: string;
  description: string;
  vendor: string;
  category: string;
  review_count: number;
  logistics_note: string;
}

export interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  price_kes: string;
  origin: string;
  image_url: string;
  stock: number;
}

export interface AdminDashboardKpis {
  global_sales_usd: number;
  global_sales_change: string;
  active_requests: number;
  pending_quotes: number;
  otd_percent: number;
  delayed_shipments: number;
}

export type DashboardTagVariant = 'orange' | 'blue' | 'red';

export interface DashboardSourcingRow {
  id: string;
  origin: 'CN' | 'AE' | 'KE';
  destination: 'CN' | 'AE' | 'KE';
  product_title: string;
  quantity: string;
  vendor: string;
  status_tags: { label: string; variant: DashboardTagVariant }[];
  time_ago: string;
  primary_action: { label: string; style: 'solid' | 'outline' };
  secondary_action?: { label: string; style: 'solid' | 'outline' };
}

export interface LogisticsPipelineCard {
  tracking_id: string;
  mode: 'Sea' | 'Air' | 'Land';
  status: string;
  status_variant: 'orange' | 'blue' | 'gray';
  route_from: string;
  route_to: string;
  eta: string;
}

export interface InventoryStockHub {
  hub: string;
  qty: number;
  max: number;
  low?: boolean;
}

export interface InventoryCatalogItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  image_url: string;
  price: number;
  price_label: string;
  stock: InventoryStockHub[];
}

export interface SourcingOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_detail: string;
  route: string;
  estimated_value: number;
  status: string;
  status_variant: 'blue' | 'orange';
  primary_action: string;
  secondary_action: string;
}

export interface UserSourcingRequestItem {
  id: string;
  request_number: string;
  title: string;
  origin: string;
  price: string;
  status: string;
  status_variant: 'orange' | 'blue' | 'gray';
}

export interface AdminMarketplaceOrderRow {
  id: string;
  order_number: string;
  title: string;
  vendor: string;
  origin_flag: string;
  image_url: string;
  status: string;
  status_icon: 'transit' | 'delivered' | 'processing';
  price_kes: string;
  customer_name: string;
  customer_detail: string;
  date_value: string;
  primary_action: string;
  secondary_action: string;
}

export interface UserMarketplaceOrderDetail {
  order: UserMarketplaceOrder;
  shipment: Shipment | null;
}

export interface UserMarketplaceOrder {
  id: string;
  order_number: string;
  tracking_id?: string | null;
  title: string;
  vendor: string;
  origin_flag: string;
  image_url: string;
  status: string;
  status_icon: 'transit' | 'delivered' | 'processing';
  progress_step: number;
  price_kes: string;
  price_secondary: string;
  date_label: string;
  date_value: string;
  primary_action: string;
  secondary_action: string;
  primary_style: 'navy' | 'red';
}

export interface CategorySampleProduct {
  id: string;
  name: string;
  image_url: string;
  price: string;
}

export interface ExploreCategory {
  id: string;
  name: string;
  origin: string;
  product_count: number;
  image_url: string;
  description?: string;
  sample_products?: CategorySampleProduct[];
}

export interface VehicleFilterOptions {
  makes: string[];
  modelsByMake: Record<string, string[]>;
  years: number[];
}

export interface HomeFeed {
  categories: ExploreCategory[];
  products: MarketplaceProduct[];
  vehicleFilter: VehicleFilterOptions;
}

export interface MarketplaceProduct {
  id: string;
  productId: string;
  name: string;
  vendor: string;
  origin: string;
  category: string;
  sku: string;
  oemNumber?: string;
  price_usd: number;
  price_kes: string;
  price_aed: string;
  image_url: string;
  cta: 'cart' | 'quote';
  stock: number;
  min_order?: number;
  compatibleVehicles?: {
    make: string;
    model: string;
    yearFrom: number;
    yearTo: number;
  }[];
}

export interface AdminCategoryCard {
  id: string;
  name: string;
  description: string;
  origins: string[];
  trend: string;
  trend_variant: 'up' | 'stable' | 'down';
  total_skus: number;
  vendors: number;
  image_url: string;
  status: 'published' | 'draft';
}

export interface AdminInventoryStockLevel {
  hub: 'CN' | 'AE' | 'KE';
  percent: number;
  low?: boolean;
}

export interface AdminInventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  origin: 'CN' | 'AE' | 'KE';
  origin_label: string;
  image_url: string;
  stock: number;
  low_stock: boolean;
  status: 'draft' | 'published';
  value: string;
  marketplace_price: string;
  stock_levels: AdminInventoryStockLevel[];
}

export interface AdminInventoryHubCount {
  hub: 'CN' | 'AE' | 'KE';
  label: string;
  flag: string;
  product_count: number;
  published_count: number;
  stock_units: number;
}

export interface AdminInventoryKpis {
  total_active_products: number;
  new_this_week: number;
  total_inventory_value: string;
  hubs_label: string;
  low_stock_count: number;
  hub_counts?: AdminInventoryHubCount[];
}
