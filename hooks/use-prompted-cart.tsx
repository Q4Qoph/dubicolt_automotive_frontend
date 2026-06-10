'use client';

import { useCallback, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GuestCartPromptDialog } from '@/components/cart/guest-cart-prompt-dialog';
import { useCart, type AddItemInput, type AddItemOptions } from '@/hooks/use-cart';
import { hasGuestCartAck, setGuestCartAck } from '@/lib/guest-cart-preference';
import { setPendingCartAction, type PendingCartAction } from '@/lib/pending-cart-action';

type PendingAdd = {
  item: AddItemInput;
  options?: AddItemOptions;
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

function toPendingAction(item: AddItemInput, buyNow?: boolean): PendingCartAction {
  const productId = item.productId ?? item.id;
  return {
    productId,
    name: item.name,
    sku: item.sku,
    unitPriceKes: item.unitPriceKes ?? 0,
    origin: item.origin,
    imageUrl: item.imageUrl,
    quantity: item.quantity ?? 1,
    buyNow,
  };
}

export function usePromptedCart() {
  const router = useRouter();
  const pathname = usePathname();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [promptProductName, setPromptProductName] = useState<string | undefined>();
  const pendingRef = useRef<PendingAdd | null>(null);

  const runAdd = useCallback(
    async (item: AddItemInput, options?: AddItemOptions) => {
      await cart.addItemAsync(item, options);
      if (options?.buyNow) {
        router.push('/checkout');
      }
    },
    [cart, router],
  );

  const requestAdd = useCallback(
    (item: AddItemInput, options?: AddItemOptions): Promise<void> => {
      if (cart.isLoggedIn || hasGuestCartAck()) {
        return runAdd(item, options);
      }

      return new Promise<void>((resolve, reject) => {
        pendingRef.current = { item, options, resolve, reject };
        setPromptProductName(item.name);
        setOpen(true);
      });
    },
    [cart.isLoggedIn, runAdd],
  );

  const clearPending = useCallback(() => {
    pendingRef.current = null;
    setOpen(false);
    setContinuing(false);
  }, []);

  const handleSignIn = useCallback(() => {
    const pending = pendingRef.current;
    if (pending) {
      setPendingCartAction(toPendingAction(pending.item, pending.options?.buyNow));
    }
    clearPending();
    const redirect = encodeURIComponent(pathname || '/marketplace');
    router.push(`/auth/login?redirect=${redirect}`);
    pending?.resolve();
  }, [clearPending, pathname, router]);

  const handleSignUp = useCallback(() => {
    const pending = pendingRef.current;
    if (pending) {
      setPendingCartAction(toPendingAction(pending.item, pending.options?.buyNow));
    }
    clearPending();
    const redirect = encodeURIComponent(pathname || '/marketplace');
    router.push(`/auth/register?redirect=${redirect}`);
    pending?.resolve();
  }, [clearPending, pathname, router]);

  const handleContinueGuest = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    setContinuing(true);
    setGuestCartAck();
    try {
      await runAdd(pending.item, pending.options);
      pending.resolve();
      clearPending();
    } catch (err) {
      pending.reject(err);
      setContinuing(false);
    }
  }, [clearPending, runAdd]);

  const handleOpenChange = useCallback((next: boolean) => {
    if (!next && pendingRef.current) {
      pendingRef.current.reject(new Error('cancelled'));
      clearPending();
    } else {
      setOpen(next);
    }
  }, [clearPending]);

  const addToCart = useCallback(
    (item: AddItemInput) => requestAdd(item),
    [requestAdd],
  );

  const buyNow = useCallback(
    (item: AddItemInput) => requestAdd(item, { buyNow: true, silent: true }),
    [requestAdd],
  );

  function GuestCartPrompt() {
    return (
      <GuestCartPromptDialog
        open={open}
        onOpenChange={handleOpenChange}
        productName={promptProductName}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onContinueGuest={handleContinueGuest}
        continuing={continuing}
      />
    );
  }

  return {
    ...cart,
    addToCart,
    buyNow,
    GuestCartPrompt,
  };
}
