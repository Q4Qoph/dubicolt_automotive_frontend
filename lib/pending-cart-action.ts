const STORAGE_KEY = 'dubiken_pending_cart';

export interface PendingCartAction {
  productId: string;
  name: string;
  sku: string;
  unitPriceKes: number;
  origin: string;
  imageUrl: string;
  quantity: number;
  buyNow?: boolean;
}

export function setPendingCartAction(action: PendingCartAction): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
  } catch {
    /* ignore */
  }
}

export function takePendingCartAction(): PendingCartAction | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingCartAction;
  } catch {
    return null;
  }
}
