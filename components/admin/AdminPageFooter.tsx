import Link from 'next/link';
import DubicoltLogo from '@/components/DubicoltLogo';

export default function AdminPageFooter() {
  return (
    <footer className="mt-auto border-t border-[#EFF8F9] bg-white/60">
      <div className="flex flex-col items-center justify-between gap-3 px-6 py-5 text-xs sm:flex-row">
        <DubicoltLogo href="/admin" size="sm" />
        <div className="flex flex-wrap justify-center gap-4 text-[#5A6B7D]">
          <Link href="#" className="hover:text-[#00BC94]">
            Sourcing guide
          </Link>
          <Link href="#" className="hover:text-[#00BC94]">
            Shipping policy
          </Link>
          <Link href="#" className="hover:text-[#00BC94]">
            Support
          </Link>
        </div>
        <p className="text-[#5A6B7D]">© {new Date().getFullYear()} Dubicolt</p>
      </div>
    </footer>
  );
}
