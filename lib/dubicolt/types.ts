/** Dubicolt Automotive API DTOs (camelCase, matches backend openapi). */

export interface DubicoltProduct {
  id: string;
  title: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  oemNumber?: string;
  sellingPrice: number;
  imageUrl: string;
  origin?: string;
  status?: 'draft' | 'published';
  compatibleVehicles?: {
    make: string;
    model: string;
    yearFrom: number;
    yearTo: number;
  }[];
  stock: number;
}

export interface DubicoltCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: 'draft' | 'published';
  origins: string[];
  productCount: number;
}

export interface DubicoltCartItem {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface DubicoltCart {
  items: DubicoltCartItem[];
  total: number;
}

export interface DubicoltCheckoutRequest {
  deliveryMethod: 'DELIVERY' | 'PICKUP';
  deliveryAddress: string;
}

export interface DubicoltCheckoutResponse {
  orderId: string;
  amount: number;
}

export interface DubicoltOrderSummary {
  id: string;
  status: string;
  total: number;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
  itemTitle?: string;
  itemImageUrl?: string;
  deliveryId?: string;
  deliveryStatus?: string;
}

export interface DubicoltOrderDetail extends DubicoltOrderSummary {
  deliveryMethod: string;
  deliveryAddress: string;
  items: {
    title: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
    productId?: string;
  }[];
  deliveries: { id: string; status: string; notes?: string; proofUrl?: string }[];
}

export interface DubicoltStkPushRequest {
  orderId: string;
  phone: string;
}

export interface DubicoltStkPushResponse {
  checkoutRequestId: string;
  orderId: string;
  amount: number;
  phone: string;
  message: string;
}

export interface DubicoltPartRequest {
  id: string;
  requestId: string;
  vehicle: { make: string; model: string; year: number };
  partName: string;
  description: string;
  vin?: string;
  photoUrls?: string[];
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'QUOTED' | 'CLOSED';
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface DubicoltPartRequestInput {
  vehicle: { make: string; model: string; year: number; engine?: string; vin?: string };
  partName: string;
  description: string;
  vin?: string;
  photoUrls?: string[];
}

export interface DubicoltQuotation {
  id: string;
  requestId: string;
  price: number;
  leadTimeDays: number;
  validUntil: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

export interface DubicoltPartRequestDetail extends DubicoltPartRequest {
  quotations?: DubicoltQuotation[];
}

export interface DubicoltDashboard {
  salesToday: number;
  ordersToday: number;
  pendingQuotes: number;
  lowStockProducts: number;
}

export interface DubicoltInventoryItem {
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  lowStock: boolean;
  category?: string;
  origin?: string;
  imageUrl?: string;
  sellingPrice?: number;
  status?: 'draft' | 'published';
}

export interface DubicoltVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  vin?: string;
}
