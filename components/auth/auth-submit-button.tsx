'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { DcButton } from '@/components/dubicolt/ui';
import { useLoginMutation, useRegisterMutation } from '@/lib/api/hooks';
import { queryKeys } from '@/lib/api/query-keys';
import { ApiError } from '@/lib/api/client';
import { apiAddCartItem } from '@/lib/api/services';
import { setAuthSessionFromTokens } from '@/lib/auth-session';
import type { LoginRequest, RegisterRequest } from '@/lib/contracts';
import { takePendingCartAction } from '@/lib/pending-cart-action';
import { safeRedirectPath } from '@/lib/safe-redirect';

type Mode = 'login' | 'register';

export function AuthSubmitButton({
  mode,
  label,
}: {
  mode: Mode;
  label: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const loading = loginMutation.isPending || registerMutation.isPending;

  async function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    setError(null);

    const form = (e.currentTarget as HTMLButtonElement).closest('form');
    if (!form) return;

    const fd = new FormData(form);
    const email = String(fd.get('email') ?? '').trim();
    const password = String(fd.get('password') ?? '');

    try {
      if (mode === 'login') {
        const body: LoginRequest = { email, password };
        const res = await loginMutation.mutateAsync(body);
        setAuthSessionFromTokens(res);

        const pending = takePendingCartAction();
        if (pending) {
          try {
            await apiAddCartItem(pending.productId, pending.quantity);
            await qc.invalidateQueries({ queryKey: queryKeys.cart });
          } catch {
            /* cart merge is best-effort */
          }
          if (pending.buyNow) {
            router.push('/checkout');
            return;
          }
        }

        const redirect = safeRedirectPath(searchParams.get('redirect'));
        if (redirect) {
          router.push(redirect);
          return;
        }
        router.push(res.user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        const name = String(fd.get('name') ?? '').trim();
        const body: RegisterRequest = { name, email, password };
        await registerMutation.mutateAsync(body);
        const params = new URLSearchParams({ registered: '1' });
        if (email) params.set('email', email);
        const redirectAfterRegister = safeRedirectPath(searchParams.get('redirect'));
        if (redirectAfterRegister) params.set('redirect', redirectAfterRegister);
        router.push(`/auth/login?${params.toString()}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Could not reach the API. Is the backend running on port 3001?');
      }
    }
  }

  return (
    <div className="pt-1">
      {error ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <DcButton
        type="button"
        variant="primary"
        className="w-full py-3.5"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Please wait…' : label}
        {!loading ? <ArrowRight className="h-4 w-4" /> : null}
      </DcButton>
    </div>
  );
}
