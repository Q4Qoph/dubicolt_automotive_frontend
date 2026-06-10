import Link from 'next/link';
import { ArrowRight, Shield, Smartphone, Truck } from 'lucide-react';
import DubicoltLogo from '@/components/DubicoltLogo';
import { BRAND } from '@/lib/dubicolt/brand';

const PILLARS = [
  { icon: Smartphone, label: 'M-Pesa checkout' },
  { icon: Truck, label: 'Live delivery tracking' },
  { icon: Shield, label: 'Verified parts catalog' },
];

export default function AuthMarketingPanel() {
  return (
    <div
      className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden xl:w-[46%]"
      style={{ backgroundColor: BRAND.deepBlue }}
    >
      <div className="absolute inset-0 dc-grid-bg opacity-[0.1]" />
      <div
        className="absolute -left-32 top-1/4 h-96 w-96 rounded-full opacity-[0.15]"
        style={{ background: `radial-gradient(circle, ${BRAND.coldGreen}, transparent 65%)` }}
      />
      <div
        className="absolute bottom-0 right-0 h-64 w-64 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${BRAND.coldGreen}, transparent 70%)` }}
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
        <div>
          <DubicoltLogo href="/" size="lg" />
          <p className="dc-label mt-12">Dubicolt Automotive</p>
          <h1 className="mt-3 text-[2rem] font-bold leading-[1.12] text-white xl:text-[2.75rem]">
            Parts commerce built for
            <span className="block text-[#00BC94]">Kenya&apos;s automotive market</span>
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/65">
            Shop in-stock spare parts, request hard-to-find items, pay securely and follow every order
            from warehouse to your door.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {PILLARS.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm"
              >
                <p.icon className="h-3.5 w-3.5 text-[#00BC94]" />
                {p.label}
              </span>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <p className="text-sm font-bold text-white">Two ways to get your part</p>
            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00BC94] text-[10px] font-bold text-[#081F3F]">
                  1
                </span>
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-white">Buy in stock:</span> search catalog, add to cart, pay with M-Pesa.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00BC94] text-[10px] font-bold text-[#081F3F]">
                  2
                </span>
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-white">Request unavailable:</span> submit vehicle details, get a quote, track sourcing.
                </p>
              </div>
            </div>
            <Link
              href="/marketplace"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#00BC94] hover:underline"
            >
              Explore catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 h-1" style={{ backgroundColor: BRAND.coldGreen }} />
    </div>
  );
}
