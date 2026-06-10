'use client';

import { Package, UserCircle } from 'lucide-react';
import { DcButton } from '@/components/dubicolt/ui';
import { BRAND } from '@/lib/dubicolt/brand';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface GuestCartPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
  onSignIn: () => void;
  onSignUp: () => void;
  onContinueGuest: () => void;
  continuing?: boolean;
}

export function GuestCartPromptDialog({
  open,
  onOpenChange,
  productName,
  onSignIn,
  onSignUp,
  onContinueGuest,
  continuing = false,
}: GuestCartPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#C5D4DC] bg-white p-0 overflow-hidden gap-0 sm:rounded-xl">
        <div
          className="px-6 pt-8 pb-6 text-center"
          style={{
            background: `linear-gradient(165deg, ${BRAND.lightIce} 0%, #f5fbfc 45%, ${BRAND.white} 100%)`,
          }}
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md"
            style={{ backgroundColor: BRAND.deepBlue }}
          >
            <Package className="h-7 w-7" strokeWidth={2} />
          </div>
          <DialogHeader className="space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl font-bold text-[#081F3F]">
              {productName ? `Add ${productName}?` : 'Add to your cart?'}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5A6B7D] leading-relaxed">
              {productName ? (
                <>
                  Sign in to save your cart, pay with M-Pesa, and track your order from your
                  dashboard.
                </>
              ) : (
                <>
                  Sign in to sync your cart and checkout. Or continue browsing. Items stay in this
                  browser only.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <DcButton
            variant="secondary"
            className="w-full py-3"
            onClick={onSignIn}
          >
            <UserCircle className="h-4 w-4" />
            Sign in
          </DcButton>
          <DcButton
            variant="outline"
            className="w-full py-3"
            onClick={onSignUp}
          >
            Create account
          </DcButton>
          <button
            type="button"
            onClick={onContinueGuest}
            disabled={continuing}
            className="w-full rounded-lg py-3 text-sm font-semibold text-[#243247] bg-[#EFF8F9] border border-[#C5D4DC] hover:bg-[#e0f2f4] disabled:opacity-60 transition-colors"
          >
            {continuing ? 'Adding…' : 'Add to cart without signing in'}
          </button>
          <p className="text-center text-[11px] text-[#5A6B7D] pt-1">
            Checkout requires a Dubicolt account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
