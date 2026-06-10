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
