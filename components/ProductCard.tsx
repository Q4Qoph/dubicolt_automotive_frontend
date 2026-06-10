'use client';

import { PartCard, type PartCardData } from '@/components/dubicolt/part-card';
import type { ReactNode } from 'react';

/** Legacy shape used across older pages */
export interface ProductCardItem {
  productId: string;
  name: string;
  image_url: string;
  origin: string;
  price_kes: string;
  stock: number;
}

export default function ProductCard({
  product,
  href,
  className,
  footer,
}: {
  product: ProductCardItem;
  href?: string;
  className?: string;
  footer?: ReactNode;
}) {
  const part: PartCardData = {
    productId: product.productId,
    name: product.name,
    image_url: product.image_url,
    category: product.origin,
    price_kes: product.price_kes,
    stock: product.stock,
  };
  return <PartCard part={part} href={href} footer={footer} className={className} />;
}
