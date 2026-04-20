import Link from 'next/link';

import { Product } from '@/lib/types';
import { Card, Price, ProductImageTile } from './ui';
import { ProductQuickAdd } from './product-quick-add';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden border border-[#FADADD] p-4 transition hover:-translate-y-1 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <ProductImageTile src={product.images[0]?.url || '/images/blanket.svg'} alt={product.name} />
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-[#B77D73]">{product.category.name}</p>
          <h3 className="text-lg font-semibold text-[#333333] transition group-hover:text-[#FFB6A3]">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-[#777777]">{product.description}</p>
          <Price price={product.price} discountPrice={product.discountPrice} />
        </div>
      </Link>
      <ProductQuickAdd productId={product.id} size={product.sizes[0]?.size} />
    </Card>
  );
}