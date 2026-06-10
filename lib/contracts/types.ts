import type {
  AdminSourcingStatus,
  AttachmentType,
  CategoryStatus,
  ProductStatus,
  HubCode,
  MarketFilter,
  MarketplaceCta,
  SourcingShippingMethod,
  SourcingUnit,
  StatusVariant,
  TrendVariant,
  UserRole,
  UserSourcingStatus,
} from './enums';

/** Standard paginated list wrapper */
export interface PaginatedMeta {
  page: number;
  page_size: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ——— Auth ———

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  company: string;
  role: UserRole;
}

export interface AuthTokensResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// ——— Cart ———

export interface CartItemDto {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  unit_price_kes: number;
  origin: string;
  image_url: string;
}

export interface CartResponse {
  items: CartItemDto[];
  item_count: number;
  subtotal: number;
}

export interface AddCartItemRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ——— Checkout ———

export interface CheckoutShippingRequest {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
}

export interface GuestCheckoutRequest {
  items: { product_id: string; quantity: number }[];
  shipping: CheckoutShippingRequest;
  payment_method?: 'card' | 'bank_transfer' | 'wallet';
}

export interface GuestCheckoutResponse {
  order_id: string;
  order_number: string;
  orders: { order_id: string; order_number: string }[];
}

export interface CheckoutSummary {
  subtotal: number;
  shipping: number;
  customs: number;
  insurance: number;
  total: number;
  currency: 'KES';
}

export interface CheckoutShippingResponse {
  checkout_id: string;
  shipping: CheckoutShippingRequest;
  summary: CheckoutSummary;
}

export interface CheckoutCompleteRequest {
  checkout_id: string;
  payment_method: 'card' | 'bank_transfer' | 'wallet';
}

export interface CheckoutCompleteResponse {
  order_id: string;
  order_number: string;
}

// ——— User sourcing ———

export interface CreateSourcingRequestBody {
  product_name: string;
  description: string;
  origin: HubCode;
  county: string;
  delivery_address: string;
  quantity: string;
  unit: SourcingUnit;
  target_date: string;
  shipping_method: SourcingShippingMethod;
  budget: string;
  accept_terms: boolean;
}

export interface SourcingAttachmentDto {
  name: string;
  size: string;
  type: AttachmentType;
  url?: string;
}

export interface OfficialQuoteDto {
  id: string;
  unit_price: string;
  shipping_cost?: string;
  lead_time: string;
  shipment: string;
  notes: string;
  official: boolean;
}

export interface UserSourcingRequestListItem {
  id: string;
  request_number: string;
  title: string;
  origin: HubCode | string;
  price: string;
  status: UserSourcingStatus | string;
  status_label?: string;
  status_variant: StatusVariant;
}

export interface UserSourcingDashboardResponse {
  summary: {
    active: number;
    pending_quotes: number;
    procured_total: string;
  };
  requests: UserSourcingRequestListItem[];
}

export interface UserSourcingRequestDetailDto {
  id: string;
  request_number: string;
  title: string;
  origin: string;
  status: string;
  status_variant: StatusVariant;
  description: string;
  quantity: string;
  voltage_range?: string;
  budget_total: string;
  budget_subtitle: string;
  regional_targets: { code: string; label: string }[];
  attachments: SourcingAttachmentDto[];
  quotes: OfficialQuoteDto[];
  quote_date?: string;
  destination_port?: string;
  estimated_budget_range?: string;
  delivery_county?: string;
  delivery_address?: string;
}

// ——— Admin sourcing ———

export interface AdminSourcingListFilters {
  market?: MarketFilter;
  status?: AdminSourcingStatus[];
  page?: number;
  page_size?: number;
}

export interface AdminSourcingRequestListItem {
  id: string;
  request_number: string;
  client_name: string;
  client_initials: string;
  product_title: string;
  description: string;
  destination: string;
  destination_label: string;
  status: AdminSourcingStatus;
  market: HubCode;
  reference_images: string[];
  reference_extra?: number;
  has_document?: boolean;
  created_at: string;
}

export interface AdminSourcingRequestDetailDto extends AdminSourcingRequestListItem {
  quantity: string;
  material_grade?: string;
  voltage_range?: string;
  budget_total: string;
  budget_subtitle: string;
  regional_targets: { code: HubCode; label: string }[];
  attachments: SourcingAttachmentDto[];
  quotes: OfficialQuoteDto[];
  quote_date?: string;
  destination_port?: string;
  estimated_budget_range?: string;
  requester_location?: string;
  product_image_url?: string;
}

export interface UpsertOfficialQuoteRequest {
  unit_price: string;
  shipping_cost?: string;
  transport: string;
  lead_time_days: string;
  notes?: string;
  draft?: boolean;
}

export interface UpsertOfficialQuoteResponse {
  quote: OfficialQuoteDto;
  request_status: AdminSourcingStatus;
}

// ——— Admin categories ———

export interface UpsertCategoryRequest {
  name: string;
  description: string;
  origins: HubCode[];
  image_url: string;
  status: CategoryStatus;
}

export interface AdminCategoryDto {
  id: string;
  name: string;
  description: string;
  origins: string[];
  trend: string;
  trend_variant: TrendVariant;
  total_skus: number;
  vendors: number;
  image_url: string;
  status: CategoryStatus;
}

// ——— Admin inventory product ———

export interface ProductAttributeDto {
  feature: string;
  value: string;
}

export interface CreateInventoryProductRequest {
  name: string;
  sku: string;
  category: string;
  brand?: string;
  description: string;
  primary_origin: HubCode;
  price_kes: number;
  compare_at_price_kes?: number | null;
  stock: number;
  min_order?: number;
  image_url: string;
  images: string[];
  attributes: ProductAttributeDto[];
  status?: ProductStatus;
  on_marketplace?: boolean;
  marketplace_cta?: MarketplaceCta;
}

export interface AdminInventoryProductDetail extends CreateInventoryProductRequest {
  id: string;
  gallery_images: string[];
  status: ProductStatus;
  on_marketplace: boolean;
  marketplace_cta: MarketplaceCta;
  min_order: number;
}

export interface AdminInventoryListItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  origin: HubCode;
  origin_label: string;
  image_url: string;
  stock: number;
  low_stock: boolean;
  status: ProductStatus;
  value: string;
  marketplace_price: string;
  stock_levels: { hub: HubCode; percent: number; low?: boolean }[];
}

export interface AdminInventoryHubCountDto {
  hub: HubCode;
  label: string;
  flag: string;
  product_count: number;
  published_count: number;
  stock_units: number;
}

export interface AdminInventoryKpisDto {
  total_active_products: number;
  new_this_week: number;
  total_inventory_value: string;
  hubs_label: string;
  low_stock_count: number;
  hub_counts?: AdminInventoryHubCountDto[];
}

// ——— Marketplace / storefront ———

export interface MarketplaceProductDto {
  id: string;
  product_id: string;
  name: string;
  vendor: string;
  origin: string;
  price_usd: number;
  price_kes: string;
  price_aed: string;
  image_url: string;
  cta: MarketplaceCta;
  stock: number;
  min_order?: number;
}

export interface CategorySampleProductDto {
  id: string;
  name: string;
  image_url: string;
  price: string;
}

export interface ExploreCategoryDto {
  id: string;
  name: string;
  origin: HubCode | string;
  product_count: number;
  image_url: string;
  sample_products?: CategorySampleProductDto[];
}

export interface ProductDetailDto {
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

export interface RelatedProductDto {
  id: string;
  name: string;
  price: number;
  price_kes: string;
  origin: string;
  image_url: string;
  stock: number;
}

export interface AdminAnalyticsDto {
  weekly_volume: { week: string; kenya: number; dubai: number; china: number }[];
  top_categories: { name: string; value_usd: number; pct: number }[];
}
