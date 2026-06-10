import Link from 'next/link';
import { Globe, Headphones } from 'lucide-react';

interface FooterProps {
  variant?: 'simple' | 'full';
}

export default function Footer({ variant = 'full' }: FooterProps) {
  if (variant === 'simple') {
    return (
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold text-[#1a3a6b]">Dubiken</p>
              <p className="text-xs text-gray-500">© 2024 Dubiken Global. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-[#1a3a6b]">Sourcing Guide</Link>
              <Link href="#" className="hover:text-[#1a3a6b]">Shipping Policy</Link>
              <Link href="#" className="hover:text-[#1a3a6b]">Tracking</Link>
              <Link href="#" className="hover:text-[#1a3a6b]">Contact Support</Link>
              <Link href="#" className="hover:text-[#1a3a6b]">Terms of Service</Link>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-500" />
              <Headphones className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#0d1f3c] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <p className="text-xl font-bold mb-2">Dubiken</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your bridge to global manufacturing and sourcing excellence.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 uppercase">Company</p>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white">Sourcing Guide</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 uppercase">Logistics</p>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white">Shipping Policy</Link></li>
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white">Tracking</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 uppercase">Support</p>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white">Contact Support</Link></li>
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2024 Dubiken Global. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gray-500" />
            <Headphones className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
