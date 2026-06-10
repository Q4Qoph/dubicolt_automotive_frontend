/**
 * Canonical enums for Dubiken API + UI.
 * Backend: validate request/response against these string values.
 * UI: import constants + types; avoid hardcoded duplicate literals.
 */

/** Trade hub / origin market (ISO-style region codes used in UI) */
export const HUB_CODES = ['KE', 'AE', 'CN'] as const;
export type HubCode = (typeof HUB_CODES)[number];

export const HUB_LABELS: Record<HubCode, string> = {
  KE: 'Kenya',
  AE: 'Dubai (UAE)',
  CN: 'China',
};

/** UI select/chip options (admin inventory, user sourcing forms) */
export const HUB_OPTIONS: { code: HubCode; label: string; flag: string }[] = [
  { code: 'KE', label: 'Kenya', flag: '🇰🇪' },
  { code: 'AE', label: 'Dubai (UAE)', flag: '🇦🇪' },
  { code: 'CN', label: 'China', flag: '🇨🇳' },
];

/** Filter sentinel for admin sourcing list */
export const MARKET_FILTER_ALL = 'all' as const;
export type MarketFilter = typeof MARKET_FILTER_ALL | HubCode;

// ——— Admin sourcing request (B2B procurement workflow) ———

export const ADMIN_SOURCING_STATUSES = [
  'pending',
  'quoted',
  'shipping',
  'delivered',
] as const;
export type AdminSourcingStatus = (typeof ADMIN_SOURCING_STATUSES)[number];

export const ADMIN_SOURCING_STATUS_LABELS: Record<AdminSourcingStatus, string> = {
  pending: 'Pending Quote',
  quoted: 'Quoted',
  shipping: 'Shipping',
  delivered: 'Delivered',
};

/** Admin detail page badge (uppercase display) */
export const ADMIN_SOURCING_STATUS_BADGE: Record<AdminSourcingStatus, string> = {
  pending: 'ACTIVE REQUEST',
  quoted: 'QUOTED',
  shipping: 'IN TRANSIT',
  delivered: 'DELIVERED',
};

// ——— User dashboard sourcing ———

/** API canonical (recommended for backend) */
export const USER_SOURCING_STATUSES = [
  'pending',
  'pending_quote',
  'quoted',
  'processing',
  'active',
] as const;
export type UserSourcingStatus = (typeof USER_SOURCING_STATUSES)[number];

/** UI list/detail display strings in mock data today — map from API or return as `status_label` */
export const USER_SOURCING_STATUS_LABELS: Record<string, string> = {
  pending: 'PENDING',
  pending_quote: 'PENDING QUOTE',
  quoted: 'QUOTED',
  processing: 'PROCESSING',
  active: 'ACTIVE REQUEST',
};

export const STATUS_VARIANTS = ['orange', 'blue', 'gray', 'red'] as const;
export type StatusVariant = (typeof STATUS_VARIANTS)[number];

/** Badge dot color on user sourcing list/detail */
export const USER_SOURCING_STATUS_VARIANT: Record<string, StatusVariant> = {
  pending: 'gray',
  pending_quote: 'gray',
  quoted: 'orange',
  processing: 'blue',
  active: 'blue',
};

// ——— User create sourcing request form ———

export const SOURCING_URGENCIES = ['standard', 'express'] as const;
export type SourcingUrgency = (typeof SOURCING_URGENCIES)[number];

export const SOURCING_SHIPPING_METHODS = ['air', 'sea', 'flexible'] as const;
export type SourcingShippingMethod = (typeof SOURCING_SHIPPING_METHODS)[number];

export const SOURCING_UNITS = [
  'units',
  'pieces',
  'kg',
  'tons',
  'containers',
  'pallets',
] as const;
export type SourcingUnit = (typeof SOURCING_UNITS)[number];

// ——— Admin official quote form ———

export const TRANSPORT_TYPES = [
  'FOB Ningbo',
  'CIF Mombasa',
  'EXW Shenzhen',
  'DAP Nairobi',
] as const;
export type TransportType = (typeof TRANSPORT_TYPES)[number];

// ——— Categories ———

export const CATEGORY_STATUSES = ['draft', 'published'] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export const PRODUCT_STATUSES = ['draft', 'published'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

export const TREND_VARIANTS = ['up', 'stable', 'down'] as const;
export type TrendVariant = (typeof TREND_VARIANTS)[number];

// ——— Marketplace ———

export const MARKETPLACE_CTA = ['cart', 'quote'] as const;
export type MarketplaceCta = (typeof MARKETPLACE_CTA)[number];

// ——— Cart & checkout ———

export const CHECKOUT_STEPS = [1, 2, 3] as const;
export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export const CHECKOUT_STEP_LABELS: Record<CheckoutStep, string> = {
  1: 'Shipping Info',
  2: 'Payment',
  3: 'Review',
};

/** All 47 Kenyan counties — checkout region & sourcing delivery. */
export const KENYA_REGIONS = [
  'Baringo County',
  'Bomet County',
  'Bungoma County',
  'Busia County',
  'Elgeyo-Marakwet County',
  'Embu County',
  'Garissa County',
  'Homa Bay County',
  'Isiolo County',
  'Kajiado County',
  'Kakamega County',
  'Kericho County',
  'Kiambu County',
  'Kilifi County',
  'Kirinyaga County',
  'Kisii County',
  'Kisumu County',
  'Kitui County',
  'Kwale County',
  'Laikipia County',
  'Lamu County',
  'Machakos County',
  'Makueni County',
  'Mandera County',
  'Marsabit County',
  'Meru County',
  'Migori County',
  'Mombasa County',
  'Murang\'a County',
  'Nairobi County',
  'Nakuru County',
  'Nandi County',
  'Narok County',
  'Nyamira County',
  'Nyandarua County',
  'Nyeri County',
  'Samburu County',
  'Siaya County',
  'Taita-Taveta County',
  'Tana River County',
  'Tharaka-Nithi County',
  'Trans Nzoia County',
  'Turkana County',
  'Uasin Gishu County',
  'Vihiga County',
  'Wajir County',
  'West Pokot County',
] as const;
export type KenyaRegion = (typeof KENYA_REGIONS)[number];

/** @deprecated use KENYA_REGIONS */
export const KENYAN_COUNTIES = KENYA_REGIONS;

// ——— Attachments ———

export const ATTACHMENT_TYPES = ['pdf', 'zip'] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

// ——— Auth ———

export const USER_ROLES = ['buyer', 'admin', 'vendor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ——— Admin dashboard / logistics ———

export const DASHBOARD_TAG_VARIANTS = ['orange', 'blue', 'red'] as const;
export type DashboardTagVariant = (typeof DASHBOARD_TAG_VARIANTS)[number];

export const ACTION_BUTTON_STYLES = ['solid', 'outline'] as const;
export type ActionButtonStyle = (typeof ACTION_BUTTON_STYLES)[number];

export const LOGISTICS_MODES = ['Sea', 'Air', 'Land'] as const;
export type LogisticsMode = (typeof LOGISTICS_MODES)[number];

export const LOGISTICS_PIPELINE_STATUSES = [
  'TRANSIT',
  'CUSTOMS',
  'PREPARING',
] as const;
export type LogisticsPipelineStatus = (typeof LOGISTICS_PIPELINE_STATUSES)[number];

// ——— User marketplace orders ———

export const MARKETPLACE_ORDER_STATUSES = [
  'PROCESSING',
  'IN TRANSIT',
  'DELIVERED',
  'CANCELLED',
] as const;
export type MarketplaceOrderStatus = (typeof MARKETPLACE_ORDER_STATUSES)[number];

export const MARKETPLACE_ORDER_STATUS_LABELS: Record<MarketplaceOrderStatus, string> = {
  PROCESSING: 'Processing',
  'IN TRANSIT': 'In transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const MARKETPLACE_ORDER_STATUS_ICONS = [
  'transit',
  'delivered',
  'processing',
] as const;
export type MarketplaceOrderStatusIcon = (typeof MARKETPLACE_ORDER_STATUS_ICONS)[number];

export const ORDER_PRIMARY_STYLES = ['navy', 'red'] as const;
export type OrderPrimaryStyle = (typeof ORDER_PRIMARY_STYLES)[number];

// ——— Legacy dashboard orders (tracking widget) ———

export const LEGACY_ORDER_STATUSES = [
  'in_port',
  'processing',
  'dispatched',
  'delivered',
  'confirmed',
] as const;
export type LegacyOrderStatus = (typeof LEGACY_ORDER_STATUSES)[number];

// ——— Admin orders (sourcing tab) ———

export const ADMIN_SOURCING_ORDER_VARIANTS = ['blue', 'orange'] as const;
export type AdminSourcingOrderVariant = (typeof ADMIN_SOURCING_ORDER_VARIANTS)[number];

// ——— Product PDP (UI-only today) ———

export const PDP_TABS = ['specs', 'logistics', 'reviews'] as const;
export type PdpTab = (typeof PDP_TABS)[number];

export const PDP_SHIPPING_DESTINATIONS = ['mombasa', 'jebel'] as const;
export type PdpShippingDestination = (typeof PDP_SHIPPING_DESTINATIONS)[number];

// ——— Admin inventory product wizard categories (form dropdown) ———

export const INVENTORY_CATEGORY_OPTIONS = [
  'Renewable Energy',
  'Consumer Electronics',
  'Industrial Parts',
  'Textiles & Apparel',
  'Agri-Exports',
  'Home & Kitchen',
  'Industrial Machinery',
  'Construction',
] as const;
export type InventoryCategoryOption = (typeof INVENTORY_CATEGORY_OPTIONS)[number];

export const USER_SOURCING_CATEGORY_OPTIONS = [
  'Consumer Electronics',
  'Industrial Machinery',
  'Energy Systems',
  'Textiles',
  'Construction Materials',
  'Agri-Business',
] as const;
export type UserSourcingCategoryOption = (typeof USER_SOURCING_CATEGORY_OPTIONS)[number];

export const USER_SOURCING_DESTINATIONS = [
  'Nairobi, Kenya',
  'Mombasa, Kenya',
  'Kisumu, Kenya',
  'Dubai, UAE',
  'Other (specify in notes)',
] as const;
