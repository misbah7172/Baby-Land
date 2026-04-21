import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { getProduct, getReviews } from '@/lib/api';
import { Card, Price, SectionTitle } from '@/components/ui';
import { ProductPurchasePanel } from '@/components/product-purchase-panel';
import { getCopy, normalizeLanguage } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${slug.replace(/-/g, ' ')} | Baby Land`,
    description: 'Browse premium baby essentials.'
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const cookieStore = await cookies();
    const language = normalizeLanguage(cookieStore.get('babyland-lang')?.value);
    const text = getCopy(language);
    const { slug } = await params;
    const { product } = await getProduct(slug);
    const reviewPayload = await getReviews(product.id);
    const image = product.images[0]?.url || '/images/blanket.svg';

    return (
      <div className="mx-auto max-w-7xl bg-[#FFF8F0] px-4 py-10 md:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden border border-[#FADADD] p-0">
            <div className="relative aspect-square bg-gradient-to-br from-[#FFF8F0] via-white to-[#FADADD]">
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Card>
          <div className="space-y-6">
            <SectionTitle eyebrow={product.category.name} title={product.name} description={product.description} />
            <Price price={product.price} discountPrice={product.discountPrice} />
            <div className="flex flex-wrap gap-2 text-sm text-stone-500">
              {product.sizes.map(size => (
                <span key={size.id} className="rounded-full bg-white px-3 py-2 shadow-sm">{size.size}</span>
              ))}
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              <p>Material: {product.material}</p>
              <p>Stock: {product.stock}</p>
              <p>{language === 'bn' ? 'রেটিং' : 'Rating'}: {product.averageRating.toFixed(1)}</p>
            </div>
            <ProductPurchasePanel productId={product.id} stock={product.stock} sizes={product.sizes} />
          </div>
        </div>

        <section className="mt-16">
          <Card className="border border-[#FADADD] bg-white">
            <h2 className="font-display text-2xl text-[#333333]">{text.product.reviews}</h2>
            <div className="mt-5 space-y-4">
              {reviewPayload.reviews.length === 0 ? <p className="text-sm text-[#777777]">{text.product.noReviews}</p> : null}
              {reviewPayload.reviews.map(review => (
                <div key={review.id} className="rounded-2xl bg-[#FFF8F0] p-4 text-sm border border-[#FADADD]">
                  <p className="font-semibold text-[#333333]">{review.user.name}</p>
                  <p>{language === 'bn' ? 'রেটিং' : 'Rating'}: {review.rating}/5</p>
                  <p className="mt-2 text-[#777777]">{review.comment || (language === 'bn' ? 'কোনো মন্তব্য নেই।' : 'No comment provided.')}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}