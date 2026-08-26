import type { CartResponse } from '@/lib/contracts';
import type {
  MarketplaceProduct,
  Product,
  RelatedProduct,
  UserMarketplaceOrder,
  UserMarketplaceOrderDetail,
  UserSourcingRequestItem,
} from '@/lib/types';
import type {
  DubicoltCart,
  DubicoltOrderDetail,
  DubicoltOrderSummary,
  DubicoltPartRequest,
  DubicoltPartRequestDetail,
  DubicoltProduct,
} from './types';

export const BRAND = {
  deepBlue: '#081F3F',
  coldGreen: '#00BC94',
  lightIce: '#EFF8F9',
  slate: '#243247',
} as const;

export function mapProduct(p: DubicoltProduct): Product {
  return {
    id: p.id,
    name: p.title,
    sku: p.sku,
    price_kes: p.sellingPrice,
    compare_at_price_kes: null,
    save_percent: null,
    origin: p.brand,
    image_url: p.imageUrl,
    images: p.imageUrl ? [p.imageUrl] : [],
    specs: {
      Category: p.category,
      Brand: p.brand,
      'OEM Number': p.oemNumber ?? 'N/A',
      Stock: String(p.stock),
    },
    currency_ke: 'KES',
    currency_ae: '',
    description: p.description,
    vendor: p.brand,
    category: p.category,
    review_count: 0,
    logistics_note:
      p.stock > 0
        ? 'In stock. Delivery 1-3 business days in Nairobi'
        : 'Out of stock. Request a part for sourcing',
  };
}

export function mapMarketplaceProduct(p: DubicoltProduct): MarketplaceProduct {
  return {
    id: p.id,
    productId: p.id,
    name: p.title,
    vendor: p.brand,
    origin: p.category,
    category: p.category,
    sku: p.sku,
    oemNumber: p.oemNumber,
    price_usd: 0,
    price_kes: String(p.sellingPrice),
    price_aed: '',
    image_url: p.imageUrl,
    cta: p.stock > 0 ? 'cart' : 'quote',
    stock: p.stock,
    min_order: 1,
    compatibleVehicles: p.compatibleVehicles,
  };
}

export function mapRelatedProduct(p: DubicoltProduct): RelatedProduct {
  return {
    id: p.id,
    name: p.title,
    price: p.sellingPrice,
    price_kes: String(p.sellingPrice),
    origin: p.category,
    image_url: p.imageUrl,
    stock: p.stock,
  };
}

export function mapCart(cart: DubicoltCart): CartResponse {
  const items = cart.items.map((i) => ({
    id: i.id,
    product_id: i.productId,
    name: i.title,
    sku: '',
    quantity: i.quantity,
    unit_price: i.unitPrice,
    unit_price_kes: i.unitPrice,
    origin: '',
    image_url: '',
  }));
  const item_count = items.reduce((s, i) => s + i.quantity, 0);
  return { items, item_count, subtotal: cart.total };
}

function orderProgress(status: string): {
  step: number;
  icon: UserMarketplaceOrder['status_icon'];
  label: string;
} {
  const s = status.toUpperCase();
  if (s === 'DELIVERED') return { step: 4, icon: 'delivered', label: 'Delivered' };
  if (s === 'IN_TRANSIT' || s === 'DISPATCHED')
    return { step: 3, icon: 'transit', label: formatOrderStatus(s) };
  if (s === 'PAID' || s === 'PROCESSING' || s === 'PENDING_PAYMENT')
    return { step: 2, icon: 'processing', label: formatOrderStatus(s) };
  return { step: 1, icon: 'processing', label: formatOrderStatus(s) };
}

export function formatOrderStatus(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function mapOrderSummary(o: DubicoltOrderSummary): UserMarketplaceOrder {
  const statusForProgress = o.deliveryStatus ?? o.status;
  const { step, icon, label } = orderProgress(statusForProgress);
  const created = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-KE') : '';
  return {
    id: o.id,
    order_number: o.id,
    tracking_id: o.deliveryId ?? o.id,
    title: o.itemTitle ?? 'Spare parts order',
    vendor: 'Dubicolt',
    origin_flag: 'KE',
    image_url: o.itemImageUrl ?? 'https://placehold.co/200x200?text=Part',
    status: label,
    status_icon: icon,
    progress_step: step,
    price_kes: String(o.total),
    price_secondary: '',
    date_label: created ? 'Ordered' : 'Total',
    date_value: created || `KSh ${o.total.toLocaleString()}`,
    primary_action: 'View details',
    secondary_action: 'Track delivery',
    primary_style: 'navy',
  };
}

export function mapOrderDetail(detail: DubicoltOrderDetail): UserMarketplaceOrderDetail {
  const firstItem = detail.items[0];
  const order = mapOrderSummary(detail);
  if (firstItem) {
    order.title = firstItem.title;
    order.price_kes = String(detail.total);
  }
  const delivery = detail.deliveries[0];
  const deliveryStatus = (delivery?.status ?? detail.status).toUpperCase();
  const paid = !['PENDING_PAYMENT', 'CANCELLED'].includes(detail.status.toUpperCase());
  const milestones = [
    {
      label: 'Paid',
      detail: 'Payment confirmed',
      date: '',
      done: paid,
      active: detail.status.toUpperCase() === 'PENDING_PAYMENT',
    },
    {
      label: 'Processing',
      detail: 'Warehouse preparing order',
      date: '',
      done: ['PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(deliveryStatus),
      active: deliveryStatus === 'PROCESSING',
    },
    {
      label: 'Dispatched',
      detail: 'Handed to courier',
      date: '',
      done: ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(deliveryStatus),
      active: deliveryStatus === 'DISPATCHED',
    },
    {
      label: 'In transit',
      detail: 'On the way to you',
      date: '',
      done: ['IN_TRANSIT', 'DELIVERED'].includes(deliveryStatus),
      active: deliveryStatus === 'IN_TRANSIT',
    },
    {
      label: 'Delivered',
      detail: 'Order complete',
      date: '',
      done: deliveryStatus === 'DELIVERED',
      active: deliveryStatus === 'DELIVERED',
    },
  ];
  return {
    order,
    shipment: delivery
      ? {
          id: delivery.id,
          tracking_id: detail.id,
          current_status: delivery.status,
          origin_city: 'Nairobi',
          destination_city: detail.deliveryAddress,
          vessel: 'Dubicolt Logistics',
          proof_url: delivery.proofUrl,
          milestones,
        }
      : null,
  };
}

function partRequestVariant(
  status: DubicoltPartRequest['status'],
): UserSourcingRequestItem['status_variant'] {
  if (status === 'QUOTED') return 'blue';
  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') return 'orange';
  return 'gray';
}

export function mapPartRequest(r: DubicoltPartRequest): UserSourcingRequestItem {
  return {
    id: r.id,
    request_number: r.requestId?.slice(0, 8) ?? r.id.slice(0, 8),
    title: r.partName,
    origin: `${r.vehicle.make} ${r.vehicle.model} ${r.vehicle.year}`,
    price: r.status === 'QUOTED' ? 'Quote ready' : 'Pending quote',
    status: r.status.replace(/_/g, ' '),
    status_variant: partRequestVariant(r.status),
  };
}

export function mapPartRequestDashboard(requests: DubicoltPartRequest[]) {
  const active = requests.filter((r) => r.status !== 'CLOSED').length;
  const pending_quotes = requests.filter((r) => r.status === 'QUOTED').length;
  return {
    summary: {
      active,
      pending_quotes,
      procured_total: 'KSh 0',
    },
    requests: requests.map(mapPartRequest),
  };
}

export function mapPartRequestDetail(r: DubicoltPartRequestDetail) {
  const quotes = (r.quotations ?? []).map((q) => ({
    id: q.id,
    unit_price: `KSh ${q.price.toLocaleString()}`,
    lead_time: `${q.leadTimeDays} days`,
    shipment: 'Dubicolt delivery',
    notes: `Valid until ${q.validUntil}`,
    official: true,
    status: q.status,
  }));
  return {
    id: r.id,
    request_number: r.requestId?.slice(0, 8) ?? r.id.slice(0, 8),
    title: r.partName,
    origin: `${r.vehicle.make} ${r.vehicle.model}`,
    status: r.status.replace(/_/g, ' '),
    status_variant: partRequestVariant(r.status),
    description: r.description,
    quantity: '1',
    budget_total: 'N/A',
    budget_subtitle: 'Awaiting quotation',
    regional_targets: [{ code: 'KE', label: 'Kenya' }],
    attachments: (r.photoUrls ?? []).map((url, i) => ({
      name: `Photo ${i + 1}`,
      size: 'Image',
      type: 'pdf' as const,
      url,
    })),
    quotes,
    delivery_county: 'Kenya',
    delivery_address: r.vin ? `VIN: ${r.vin}` : undefined,
  };
}

// ——— .NET v2 Mappings ———
import type { PartRecord, NetOrderResponseDto } from '@/lib/contracts';

export function mapPartRecordToMarketplaceProduct(p: PartRecord): MarketplaceProduct {
  const priceKes = p.price && p.price > 0 ? p.price : 4500;
  const title = p.partName || 'Automotive Replacement Part';
  const applicable = p.applicableModel || '';
  const make = applicable.split(' ')[0] || 'Universal';
  const model = applicable.split(' ').slice(1).join(' ') || applicable || 'All Models';

  return {
    id: p.id,
    productId: p.id,
    name: title,
    vendor: p.supplier || 'Partsouq',
    origin: p.supplier || 'OEM Global',
    category: p.partName?.toUpperCase().includes('ENGINE')
      ? 'Engine'
      : p.partName?.toUpperCase().includes('BRAKE')
        ? 'Brakes'
        : p.partName?.toUpperCase().includes('SUSPENSION')
          ? 'Suspension'
          : p.partName?.toUpperCase().includes('ELECTRICAL')
            ? 'Electrical'
            : 'Body',
    sku: p.partCode || p.id.slice(0, 8).toUpperCase(),
    oemNumber: p.partCode || undefined,
    price_usd: Math.round(priceKes / 130),
    price_kes: String(priceKes),
    price_aed: String(Math.round(priceKes / 35)),
    image_url:
      p.imageUrl ||
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    cta: 'cart',
    stock: 15,
    min_order: 1,
    compatibleVehicles: applicable ? [{ make, model, yearFrom: 2015, yearTo: 2024 }] : undefined,
  };
}

export function mapPartRecordToProduct(p: PartRecord): Product {
  const mp = mapPartRecordToMarketplaceProduct(p);
  return {
    id: p.id,
    name: mp.name,
    sku: mp.sku,
    price_kes: Number(mp.price_kes),
    compare_at_price_kes: null,
    save_percent: null,
    origin: p.supplier || 'OEM Supplier',
    image_url: mp.image_url,
    images: p.imageUrl ? [p.imageUrl] : [mp.image_url],
    specs: {
      'Applicable Model': p.applicableModel || 'Multi-model',
      Supplier: p.supplier || 'Partsouq',
      'Part Code': p.partCode || p.id.slice(0, 8).toUpperCase(),
      Stock: 'Available',
    },
    currency_ke: 'KES',
    currency_ae: 'AED',
    description: `${mp.name} engineered for ${p.applicableModel || 'standard specifications'}. Verified OEM replacement component.`,
    vendor: p.supplier || 'Dubicolt',
    category: mp.category,
    review_count: 5,
    logistics_note: 'Verified Genuine OEM Stock. Fast regional delivery.',
  };
}

export function mapNetOrderResponseToUserMarketplaceOrder(
  o: NetOrderResponseDto,
): UserMarketplaceOrder {
  const statusLabels: Record<number, string> = {
    0: 'Pending',
    1: 'Confirmed',
    2: 'Processing',
    3: 'In Transit',
    4: 'Delivered',
    5: 'Cancelled',
    6: 'Refunded',
  };
  const status = statusLabels[o.orderStatus] || 'Processing';
  const { step, icon } = orderProgress(status);
  const firstItem = o.orderItems?.[0];
  const title = firstItem?.product?.partName || `Order #${o.id.slice(0, 8).toUpperCase()}`;
  const imageUrl = firstItem?.product?.imageUrl || 'https://placehold.co/200x200?text=Part';

  return {
    id: o.id,
    order_number: o.id.slice(0, 8).toUpperCase(),
    tracking_id: o.id,
    title,
    vendor: firstItem?.product?.supplier || 'Dubicolt',
    origin_flag: 'KE',
    image_url: imageUrl,
    status,
    status_icon: icon,
    progress_step: step,
    price_kes: String(o.total),
    price_secondary: '',
    date_label: 'Status',
    date_value: `KSh ${o.total.toLocaleString()}`,
    primary_action: 'View details',
    secondary_action: 'Track delivery',
    primary_style: 'navy',
  };
}

