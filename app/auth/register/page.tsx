'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { safeRedirectPath } from '@/lib/safe-redirect';
import AuthModeTabs from '@/components/auth/auth-mode-tabs';
import PasswordField from '@/components/auth/password-field';
import { AuthSubmitButton } from '@/components/auth/auth-submit-button';
import { DcInput } from '@/components/dubicolt/ui';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get('redirect'));
  const loginHref = redirect
    ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
    : '/auth/login';

  return (
    <>
      <p className="dc-label">Get started</p>
      <h1 className="dc-heading mt-2 text-3xl">Create your account</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5A6B7D]">
        Join Dubicolt to save your cart, checkout with M-Pesa and track every order.
      </p>

      <div className="mt-8">
        <AuthModeTabs />

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold text-[#243247]">
              Full name
            </label>
            <DcInput
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Kamau"
              required
            />
          </div>
          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-[#243247]">
              Email address
            </label>
            <DcInput
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-[#243247]">
              Password
            </label>
            <PasswordField
              id="register-password"
              name="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
            />
          </div>
          <AuthSubmitButton mode="register" label="Create account" />
        </form>

        <p className="mt-8 text-center text-sm text-[#5A6B7D]">
          Already have an account?{' '}
          <Link href={loginHref} className="font-bold text-[#00BC94] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
