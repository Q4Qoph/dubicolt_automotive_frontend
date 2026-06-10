'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CartItem } from '@/lib/cart-storage';
import { getAccessToken } from '@/lib/api/client';
import {
  useAddCartItemMutation,
  useCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '@/lib/api/hooks';
import { apiAddCartItem } from '@/lib/api/services';
import { queryKeys } from '@/lib/api/query-keys';
import {
  addGuestCartLine,
  clearGuestCart,
  loadGuestCart,
  removeGuestCartLine,
  updateGuestCartQuantity,
  type GuestCartLine,
} from '@/lib/guest-cart';
import { useMounted } from '@/hooks/use-mounted';
import { toast } from 'sonner';

export type AddItemInput = Omit<CartItem, 'quantity'> & { quantity?: number };

export type AddItemOptions = {
  silent?: boolean;
  buyNow?: boolean;
};

type CartContextValue = {
  ready: boolean;
  isLoggedIn: boolean;
  items: CartItem[];
  itemCount: number;
  addItem: (item: AddItemInput) => void;
  addItemAsync: (item: AddItemInput, options?: AddItemOptions) => Promise<void>;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isPending: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function mapApiCart(
  items:
    | {
        id: string;
        product_id: string;
        name: string;
        sku: string;
        quantity: number;
        unit_price: number;
        unit_price_kes: number;
        origin: string;
        image_url: string;
      }[]
    | undefined
    | null,
): CartItem[] {
  return (items ?? []).map((i) => ({
    id: i.id,
    productId: i.product_id,
    name: i.name,
    sku: i.sku,
    quantity: i.quantity,
    unitPrice: i.unit_price,
    unitPriceKes: i.unit_price_kes,
    origin: i.origin,
    imageUrl: i.image_url,
  }));
}

function mapGuestCart(items: GuestCartLine[]): CartItem[] {
  return items.map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.name,
    sku: i.sku,
    quantity: i.quantity,
    unitPrice: 0,
    unitPriceKes: i.unitPriceKes,
    origin: i.origin,
    imageUrl: i.imageUrl,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const isLoggedIn = mounted && !!getAccessToken();
  const qc = useQueryClient();
  const { data: apiCart, isLoading, isFetching } = useCartQuery();
  const addMutation = useAddCartItemMutation();
  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();
  const [guestLines, setGuestLines] = useState<GuestCartLine[]>([]);
  const [guestLoaded, setGuestLoaded] = useState(false);
  const mergedGuestRef = useRef(false);

  useEffect(() => {
    if (!mounted) return;
    if (isLoggedIn) {
      setGuestLines([]);
      setGuestLoaded(true);
      return;
    }
    setGuestLines(loadGuestCart());
    setGuestLoaded(true);
  }, [mounted, isLoggedIn]);

  useEffect(() => {
    if (!mounted || !isLoggedIn || mergedGuestRef.current) return;
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) return;

    mergedGuestRef.current = true;
    void (async () => {
      for (const item of guestItems) {
        try {
          await apiAddCartItem(item.productId, item.quantity);
        } catch {
          /* best-effort merge */
        }
      }
      clearGuestCart();
      setGuestLines([]);
      await qc.invalidateQueries({ queryKey: queryKeys.cart });
    })();
  }, [mounted, isLoggedIn, qc]);

  useEffect(() => {
    if (isLoggedIn) mergedGuestRef.current = false;
  }, [isLoggedIn]);

  const items = useMemo(
    () => (isLoggedIn ? mapApiCart(apiCart?.items) : mapGuestCart(guestLines)),
    [isLoggedIn, apiCart?.items, guestLines],
  );

  const itemCount = useMemo(
    () =>
      isLoggedIn
        ? (apiCart?.item_count ?? 0)
        : guestLines.reduce((s, i) => s + i.quantity, 0),
    [isLoggedIn, apiCart?.item_count, guestLines],
  );

  const ready = isLoggedIn ? !isLoading : mounted && guestLoaded;

  const addItemAsync = useCallback(
    (item: AddItemInput, options?: AddItemOptions): Promise<void> => {
      const qty = item.quantity ?? 1;
      const productId = item.productId ?? item.id;
      const description = qty > 1 ? `${item.name} · qty ${qty}` : item.name;

      if (isLoggedIn) {
        return new Promise((resolve, reject) => {
          addMutation.mutate(
            { productId, quantity: qty },
            {
              onSuccess: () => {
                if (!options?.silent) {
                  toast.success('Added to cart', { description });
                }
                resolve();
              },
              onError: () => {
                toast.error('Could not add to cart', {
                  description: 'Please try again.',
                });
                reject(new Error('add_failed'));
              },
            },
          );
        });
      }

      const next = addGuestCartLine({
        productId,
        name: item.name,
        sku: item.sku,
        unitPriceKes: item.unitPriceKes ?? 0,
        origin: item.origin,
        imageUrl: item.imageUrl,
        quantity: qty,
      });
      setGuestLines(next);
      if (!options?.silent) {
        toast.success('Added to cart', { description });
      }
      return Promise.resolve();
    },
    [isLoggedIn, addMutation],
  );

  const addItem = useCallback(
    (item: AddItemInput) => {
      void addItemAsync(item);
    },
    [addItemAsync],
  );

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      const line = items.find((i) => i.id === id);
      if (!line) return;
      const nextQty = Math.max(1, line.quantity + delta);
      if (isLoggedIn) {
        updateMutation.mutate({ lineId: id, quantity: nextQty });
        return;
      }
      setGuestLines(updateGuestCartQuantity(id, nextQty));
    },
    [items, isLoggedIn, updateMutation],
  );

  const removeItem = useCallback(
    (id: string) => {
      if (isLoggedIn) {
        removeMutation.mutate(id);
        return;
      }
      setGuestLines(removeGuestCartLine(id));
    },
    [isLoggedIn, removeMutation],
  );

  const clearCart = useCallback(() => {
    if (!isLoggedIn) {
      clearGuestCart();
      setGuestLines([]);
    }
  }, [isLoggedIn]);

  const value = useMemo<CartContextValue>(
    () => ({
      ready,
      isLoggedIn,
      items,
      itemCount,
      addItem,
      addItemAsync,
      updateQuantity,
      removeItem,
      clearCart,
      isPending:
        isFetching ||
        addMutation.isPending ||
        updateMutation.isPending ||
        removeMutation.isPending,
    }),
    [
      ready,
      isLoggedIn,
      items,
      itemCount,
      addItem,
      addItemAsync,
      updateQuantity,
      removeItem,
      clearCart,
      isFetching,
      addMutation.isPending,
      updateMutation.isPending,
      removeMutation.isPending,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}

export function useIsLoggedIn(): boolean {
  const mounted = useMounted();
  return mounted && !!getAccessToken();
}
