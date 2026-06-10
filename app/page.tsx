'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bolt,
  Car,
  ChevronDown,
  ClipboardList,
  Cog,
  Cpu,
  Package,
  Search,
  Shield,
  Truck,
  Zap,
} from 'lucide-react';
import { MarketingShell } from '@/components/dubicolt/marketing-shell';
import { LandingPartCard } from '@/components/dubicolt/landing-part-card';
import { useCart } from '@/hooks/use-cart';
import { useHomePageData } from '@/lib/api/hooks';
import { parseKsh } from '@/lib/currency';
import type { MarketplaceProduct, VehicleFilterOptions } from '@/lib/domain-types';
import { BRAND } from '@/lib/dubicolt/brand';
import { cn } from '@/lib/utils';
import type { PartCardData } from '@/components/dubicolt/part-card';

type SearchTab = 'part' | 'vehicle' | 'vin';

const PROTOCOL_STEPS = [
  {
    title: 'Identification',
    body: 'Search via OEM number, VIN, or vehicle specifications to pinpoint the exact part required.',
  },
  {
    title: 'Verification',
    body: 'Our AI system cross-references stock across hundreds of verified regional and global suppliers.',
  },
  {
    title: 'Procurement',
    body: "Checkout and track your delivery in real-time. If it's not in stock, we'll source it for you instantly.",
  },
];

const VALUE_FEATURES = [
  {
    icon: Shield,
    title: 'Real-Time Integrity',
    body: 'Every part is verified for authenticity and compatibility before shipping.',
  },
  {
    icon: Cpu,
    title: 'Compatibility AI',
    body: 'Proprietary logic mapping parts to over 48,000 vehicle configurations.',
  },
  {
    icon: Package,
    title: 'Live Inventory',
    body: "Direct API links to the world's leading automotive spare parts warehouses.",
  },
];

const VALUE_TAGS = [
  '99.9% Fitment Accuracy',
  'Regional, Fast-Track Delivery',
  'OEM Guaranteed Authenticity',
];

const COMPONENT_GROUPS = [
  {
    title: 'Engine Parts',
    description: 'Pistons, valves, and timing kits for performance.',
    href: '/marketplace?category=Engine',
    icon: Cog,
    variant: 'light' as const,
    wide: true,
    gridClass: 'col-span-2 lg:col-span-2 lg:col-start-1 lg:row-start-1',
  },
  {
    title: 'EV Systems',
    description: 'Battery modules & motors.',
    href: '/marketplace?category=EV',
    icon: Zap,
    variant: 'dark' as const,
    gridClass: 'lg:col-start-3 lg:row-start-1',
  },
  {
    title: 'Suspension',
    description: 'Struts and shocks.',
    href: '/marketplace?category=Suspension',
    icon: Car,
    variant: 'light' as const,
    gridClass: 'lg:col-start-4 lg:row-start-1',
  },
  {
    title: 'Electrical',
    description: 'Sensors & wiring.',
    href: '/marketplace?category=Electrical',
    icon: Bolt,
    variant: 'light' as const,
    gridClass: 'lg:col-start-1 lg:row-start-2',
  },
  {
    title: 'Fleet Solutions',
    description: 'Bulk procurement tools for logistics companies and transport networks.',
    href: '/dashboard/sourcing/new',
    icon: Truck,
    variant: 'featured' as const,
    wide: true,
    gridClass: 'col-span-2 lg:col-span-2 lg:col-start-2 lg:row-start-2',
  },
  {
    title: 'Body',
    description: 'OEM panels & glass.',
    href: '/marketplace?category=Body',
    icon: Car,
    variant: 'light' as const,
    gridClass: 'lg:col-start-4 lg:row-start-2',
  },
];

function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<SearchTab>('part');
  const [q, setQ] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (tab === 'vin' && term) {
      router.push(`/marketplace?search=${encodeURIComponent(term)}`);
      return;
    }
    router.push(term ? `/marketplace?search=${encodeURIComponent(term)}` : '/marketplace');
  }

  const tabs: { id: SearchTab; label: string }[] = [
    { id: 'part', label: 'Search by Part' },
    { id: 'vehicle', label: 'Search by Vehicle' },
    { id: 'vin', label: 'VIN Lookup' },
  ];

  const placeholders: Record<SearchTab, string> = {
    part: 'Enter Part Number, OEM Code or Keyword (e.g. Brake Pads)',
    vehicle: 'Enter make, model and year (e.g. Toyota Hilux 2019)',
    vin: 'Enter 17-character VIN for exact fitment lookup',
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_48px_rgba(0,0,0,0.35)]">
        <div className="flex border-b border-[#E5E7EB]">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex-1 border-b-2 px-2 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors sm:px-4 sm:text-[11px]',
                tab === item.id
                  ? 'border-[#00BC94] bg-white text-[#081F3F]'
                  : 'border-transparent bg-[#FAFAFA] text-[#5A6B7D] hover:text-[#081F3F]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
          <div className="relative flex-1 border-b border-[#E5E7EB] sm:border-b-0 sm:border-r">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholders[tab]}
              className="w-full bg-transparent py-4 pl-14 pr-4 text-sm text-[#243247] placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 px-8 py-4 text-sm font-bold text-[#081F3F] transition-all hover:brightness-105 sm:px-10"
            style={{ backgroundColor: BRAND.coldGreen }}
          >
            Find Parts
          </button>
        </form>
      </div>
      <div className="mt-5 flex justify-center">
        <Link
          href="/dashboard/sourcing/new"
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND.deepBlue }}
        >
          <ClipboardList className="h-4 w-4" />
          Request a Part
        </Link>
      </div>
    </div>
  );
}

function VehicleFilterBar({ filter }: { filter: VehicleFilterOptions }) {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');

  const models = make ? filter.modelsByMake[make] ?? [] : [];

  function apply(next: { make?: string; model?: string; year?: string }) {
    const params = new URLSearchParams();
    const m = next.make ?? make;
    const mo = next.model ?? model;
    const y = next.year ?? year;
    if (m) params.set('make', m);
    if (mo) params.set('model', mo);
    if (y) params.set('year', y);
    router.push(params.toString() ? `/marketplace?${params}` : '/marketplace');
  }

  const selectClass =
    'w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 pr-10 text-sm text-[#243247] focus:border-[#00BC94] focus:outline-none focus:ring-2 focus:ring-[#00BC94]/15';

  if (filter.makes.length === 0) {
    return (
      <div className="rounded-xl bg-[#F3F4F6] px-4 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {['Make', 'Model', 'Year', 'Engine'].map((label) => (
            <div key={label}>
              <label className="mb-2 block text-xs font-bold text-[#081F3F]">{label}</label>
              <div className="relative">
                <select disabled className={cn(selectClass, 'opacity-60')}>
                  <option value="">
                    {label === 'Make'
                      ? 'Select Manufacturer'
                      : label === 'Model'
                        ? 'Select Model'
                        : label === 'Year'
                          ? 'Year'
                          : 'Engine Spec'}
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#F3F4F6] px-4 py-5 sm:px-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-[#081F3F]">Make</label>
          <div className="relative">
            <select
              value={make}
              onChange={(e) => {
                const nextMake = e.target.value;
                setMake(nextMake);
                setModel('');
                setYear('');
                if (nextMake) apply({ make: nextMake, model: '', year: '' });
              }}
              className={selectClass}
            >
              <option value="">Select Manufacturer</option>
              {filter.makes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-[#081F3F]">Model</label>
          <div className="relative">
            <select
              value={model}
              disabled={!make}
              onChange={(e) => {
                const nextModel = e.target.value;
                setModel(nextModel);
                setYear('');
                if (nextModel) apply({ model: nextModel, year: '' });
              }}
              className={cn(selectClass, !make && 'opacity-50')}
            >
              <option value="">Select Model</option>
              {models.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-[#081F3F]">Year</label>
          <div className="relative">
            <select
              value={year}
              disabled={!model}
              onChange={(e) => {
                const nextYear = e.target.value;
                setYear(nextYear);
                if (nextYear) apply({ year: nextYear });
              }}
              className={cn(selectClass, !model && 'opacity-50')}
            >
              <option value="">Year</option>
              {filter.years.map((item) => (
                <option key={item} value={String(item)}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-[#081F3F]">Engine</label>
          <div className="relative">
            <select disabled className={cn(selectClass, 'opacity-60')}>
              <option value="">Engine Spec</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentGroupCard({
  title,
  description,
  href,
  icon: Icon,
  variant,
  wide,
  gridClass,
}: (typeof COMPONENT_GROUPS)[number]) {
  if (variant === 'featured') {
    return (
      <Link
        href={href}
        className={cn(
          'group relative flex min-h-[160px] flex-col justify-end overflow-hidden rounded-2xl p-5 text-white sm:min-h-[180px] sm:p-6',
          gridClass,
        )}
        style={{ backgroundColor: BRAND.coldGreen }}
      >
        <Truck
          className={cn(
            'absolute bottom-2 right-2 text-white/15 transition-transform duration-500 group-hover:scale-105',
            wide ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-24 w-24',
          )}
        />
        <div className="relative z-10 max-w-[70%]">
          <div className="mb-3 inline-flex rounded-xl bg-white/20 p-2.5">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold sm:text-xl">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{description}</p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#081F3F]">
            Learn More
          </span>
        </div>
      </Link>
    );
  }

  const isDark = variant === 'dark';

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex min-h-[160px] flex-col overflow-hidden rounded-2xl p-5 sm:min-h-[180px] sm:p-6',
        isDark ? 'text-white' : 'border border-[#E5E7EB]/60 bg-white text-[#081F3F]',
        gridClass,
      )}
      style={isDark ? { backgroundColor: BRAND.deepBlue } : undefined}
    >
      <Icon
        className={cn(
          'absolute -bottom-1 -right-1 text-[#00BC94] opacity-[0.07] transition-transform duration-500 group-hover:scale-105',
          wide ? 'h-32 w-32 opacity-[0.1]' : 'h-24 w-24',
        )}
      />
      <div className={cn('relative z-10', wide && 'max-w-[70%]')}>
        <div
          className={cn(
            'mb-3 inline-flex rounded-xl p-2.5',
            isDark ? 'bg-[#00BC94]/20 text-[#00BC94]' : 'bg-[#00BC94]/12 text-[#00BC94]',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold sm:text-lg">{title}</h3>
        <p className={cn('mt-1.5 text-xs leading-relaxed sm:text-sm', isDark ? 'text-white/75' : 'text-[#5A6B7D]')}>
          {description}
        </p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { data, isLoading } = useHomePageData();
  const { addItem } = useCart();

  const products: PartCardData[] = useMemo(
    () =>
      (data?.products ?? [])
        .filter((p: MarketplaceProduct) => p.stock > 0)
        .slice(0, 4)
        .map((p: MarketplaceProduct) => ({
          productId: p.productId,
          name: p.name,
          image_url: p.image_url,
          category: p.origin,
          price_kes: p.price_kes,
          stock: p.stock,
          brand: p.vendor,
        })),
    [data?.products],
  );

  const vehicleFilter = data?.vehicleFilter ?? { makes: [], modelsByMake: {}, years: [] };

  return (
    <MarketingShell heroOverlay>
      {/* Hero */}
      <section className="relative min-h-[680px] overflow-hidden lg:min-h-[720px]">
        <img
          src="/hero-car.jpg"
          alt=""
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center"
        />
        <div className="absolute inset-0 backdrop-blur-[3px]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081F3F]/70 via-[#081F3F]/20 to-[#081F3F]/65" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              Kenya&apos;s Smartest
              <span className="block text-[#00BC94]">Spare Parts Marketplace</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
              Search, Buy, Source and Track Spare Parts Across All Vehicle Categories.
              Professional-grade logistics for enterprise and individual car owners.
            </p>
            <div className="mt-10">
              <HeroSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle filter */}
      <section className="bg-white py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-xl font-bold text-[#081F3F] sm:text-2xl">Filter by Vehicle Profile</h2>
            <p className="max-w-lg text-sm text-[#5A6B7D] sm:text-right">
              Ensure 100% compatibility by defining your vehicle&apos;s specific engineering parameters.
            </p>
          </div>
          <VehicleFilterBar filter={vehicleFilter} />
        </div>
      </section>

      {/* Component groups — design mock */}
      <section className="pb-14 pt-4 lg:pb-20" style={{ backgroundColor: BRAND.lightIce }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-xl font-bold text-[#081F3F] sm:text-2xl">
            Engineered Component Groups
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
            {COMPONENT_GROUPS.map((group) => (
              <ComponentGroupCard key={group.title} {...group} />
            ))}
          </div>
        </div>
      </section>

      {/* In-stock parts from API */}
      <section className="bg-white py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold text-[#081F3F] sm:text-2xl">In-Stock OEM Parts</h2>
            <Link
              href="/marketplace"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#081F3F] hover:text-[#00BC94]"
            >
              View All Parts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-white" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center text-[#5A6B7D]">
              No in-stock parts right now.{' '}
              <Link href="/marketplace" className="font-bold text-[#00BC94]">
                Browse catalog
              </Link>{' '}
              or{' '}
              <Link href="/dashboard/sourcing/new" className="font-bold text-[#00BC94]">
                request a part
              </Link>
              .
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {products.map((p) => (
                <LandingPartCard
                  key={p.productId}
                  part={p}
                  onAdd={() =>
                    addItem({
                      productId: p.productId,
                      id: p.productId,
                      name: p.name,
                      sku: p.productId,
                      unitPriceKes: parseKsh(String(p.price_kes)),
                      origin: p.category ?? '',
                      imageUrl: p.image_url ?? '',
                      quantity: 1,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dubicolt Protocol */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: BRAND.deepBlue }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#00BC94]">
            Simple Logic
          </p>
          <h2 className="mb-14 text-center text-xl font-bold text-white sm:text-2xl">The Dubicolt Protocol</h2>
          <div className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {PROTOCOL_STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div
                  className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-[#081F3F]"
                  style={{ backgroundColor: BRAND.coldGreen }}
                >
                  {i + 1}
                </div>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-white/75">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why professionals choose */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              {VALUE_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-2xl border border-[#E5E7EB]/80 bg-white p-5 shadow-[0_4px_24px_rgba(8,31,63,0.06)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00BC94]/12 text-[#00BC94]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#081F3F]">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#5A6B7D]">{feature.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#00BC94]">Advanced Logistics</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-[#081F3F] sm:text-3xl lg:text-4xl">
                Why Professionals Choose Dubicolt
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#5A6B7D] sm:text-base">
                We bridge the gap between high-precision manufacturing and the local marketplace,
                ensuring that every bolt, piston, and sensor is engineered to fit.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {VALUE_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#E0F2FE] px-3 py-1.5 text-xs font-semibold text-[#0369A1]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-sm font-bold text-[#081F3F] transition-opacity hover:opacity-90"
                style={{ backgroundColor: BRAND.coldGreen }}
              >
                Upgrade Your Fleet Management
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
