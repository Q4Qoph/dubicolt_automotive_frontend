const STORAGE_KEY = 'dubicolt_guest_cart';
const LEGACY_STORAGE_KEY = 'dubiken_guest_cart';

export interface GuestCartLine {
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPriceKes: number;
  origin: string;
  imageUrl: string;
}

function read(): GuestCartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: GuestCartLine[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function loadGuestCart(): GuestCartLine[] {
  return read();
}

export function clearGuestCart() {
  write([]);
}

export function addGuestCartLine(
  item: Omit<GuestCartLine, 'id' | 'quantity'> & { quantity?: number },
): GuestCartLine[] {
  const qty = Math.max(1, item.quantity ?? 1);
  const items = read();
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += qty;
    write(items);
    return items;
  }
  const line: GuestCartLine = {
    id: `guest-${item.productId}-${Date.now()}`,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: qty,
    unitPriceKes: item.unitPriceKes,
    origin: item.origin,
    imageUrl: item.imageUrl,
  };
  const next = [...items, line];
  write(next);
  return next;
}

export function updateGuestCartQuantity(lineId: string, quantity: number): GuestCartLine[] {
  const items = read();
  const next = items
    .map((i) => (i.id === lineId ? { ...i, quantity: Math.max(1, quantity) } : i))
    .filter((i) => i.quantity > 0);
  write(next);
  return next;
}

export function removeGuestCartLine(lineId: string): GuestCartLine[] {
  const next = read().filter((i) => i.id !== lineId);
  write(next);
  return next;
}
