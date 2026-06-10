import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppToaster } from '@/components/app-toaster';
import { CartProvider } from '@/providers/cart-provider';
import { QueryProvider } from '@/providers/query-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dubicolt | Spare Parts Commerce & Fulfilment',
  description:
    'Find the right automotive spare part, pay safely, and track fulfilment from stock shelf to your door. In-stock purchases and special-order sourcing for Kenya.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        <QueryProvider>
          <CartProvider>
            {children}
            <AppToaster />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
