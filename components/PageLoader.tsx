'use client';

export default function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#EFF8F9]"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-[#C5D4DC] border-t-[#00BC94]" />
      <p className="text-sm font-bold text-[#081F3F]">{label}</p>
    </div>
  );
}
