'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { safeRedirectPath } from '@/lib/safe-redirect';
import AuthModeTabs from '@/components/auth/auth-mode-tabs';
import PasswordField from '@/components/auth/password-field';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import { DcInput } from '@/components/dubicolt/ui';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';
  const prefilledEmail = searchParams.get('email') ?? '';
  const redirect = safeRedirectPath(searchParams.get('redirect'));
  const registerHref = redirect
    ? `/auth/register?redirect=${encodeURIComponent(redirect)}`
    : '/auth/register';

  return (
    <>
      <p className="dc-label">Account</p>
      <h1 className="dc-heading mt-2 text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5A6B7D]">
        Sign in to shop parts, manage requests and track deliveries.
      </p>

      <div className="mt-8">
        <AuthModeTabs />

        {justRegistered ? (
          <p
            className="mb-6 rounded-xl border border-[#00BC94]/30 bg-[#00BC94]/10 px-4 py-3 text-sm text-[#007a62]"
            role="status"
          >
            Account created. Sign in with your email and password.
          </p>
        ) : null}

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-[#243247]">
              Email address
            </label>
            <DcInput
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={prefilledEmail}
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-semibold text-[#243247]">
                Password
              </label>
            </div>
            <PasswordField id="login-password" name="password" />
          </div>
          <AuthSubmitButton mode="login" label="Sign in" />
        </form>

        <p className="mt-8 text-center text-sm text-[#5A6B7D]">
          New to Dubicolt?{' '}
          <Link href={registerHref} className="font-bold text-[#00BC94] hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    </>
  );
}
