import Link from 'next/link';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { getCategories, getHomepageSettings, getProducts, getPublicReviews } from '@/lib/api';
import { getCopy, normalizeLanguage } from '@/lib/i18n';
import { ProductCard } from '@/components/product-card';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Baby Land',
  description: 'Premium baby essentials in a soft, parent-friendly storefront.'
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get('babyland-lang')?.value);
  const text = getCopy(language);
  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  let categories: Awaited<ReturnType<typeof getCategories>>['categories'] = [];
  let settings: Record<string, unknown> = {};
  let reviews: Awaited<ReturnType<typeof getPublicReviews>>['reviews'] = [];

  try {
    const [productsResponse, categoriesResponse, homepageSettingsResponse, reviewsResponse] = await Promise.all([
      getProducts({ featured: 'true', limit: '6' }),
      getCategories(),
      getHomepageSettings(),
      getPublicReviews(3)
    ]);

    products = productsResponse.products;
    categories = categoriesResponse.categories;
    settings = homepageSettingsResponse.settings;
    reviews = reviewsResponse.reviews;
  } catch {
    // Render the storefront shell even if the API is temporarily unavailable.
  }

  const heroBadge = typeof settings.heroBadge === 'string' ? settings.heroBadge : text.home.badge;
  const heroTitle = typeof settings.heroTitle === 'string' ? settings.heroTitle : text.home.title;
  const heroSubtitle = typeof settings.heroSubtitle === 'string' ? settings.heroSubtitle : text.home.subtitle;
  const primaryCtaLabel = typeof settings.primaryCtaLabel === 'string' ? settings.primaryCtaLabel : text.home.primaryCta;
  const secondaryCtaLabel = typeof settings.secondaryCtaLabel === 'string' ? settings.secondaryCtaLabel : text.home.secondaryCta;
  const heroImageUrl = typeof settings.heroImageUrl === 'string' ? settings.heroImageUrl : '';

  return (
    <div className="bg-[#FFF8F0]">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-8">
            <div>
              <span className="inline-block bg-[#FADADD] text-[#333333] px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
                {heroBadge}
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-[#333333] leading-tight">
                {heroTitle}
              </h1>
            </div>
            
            <p className="text-lg text-[#777777] leading-relaxed max-w-lg">
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/products"
                className="bg-[#FFB6A3] text-white px-8 py-3 rounded-2xl font-semibold hover:opacity-90 transition shadow-sm"
              >
                {primaryCtaLabel}
              </Link>
              <Link
                href="/products"
                className="border-2 border-[#D6EAF8] text-[#333333] px-8 py-3 rounded-2xl font-semibold hover:bg-[#D6EAF8] transition"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#D6EAF8] to-[#D5F5E3] rounded-3xl h-96 md:h-[500px] overflow-hidden">
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt="Homepage hero"
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-[#777777]">
                  <div className="text-6xl mb-3">👶</div>
                  <p>Baby Product Image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-12">{text.home.categoriesTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="p-6 rounded-2xl bg-[#FFF8F0] border border-[#FADADD] hover:shadow-md transition text-center group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition">📦</div>
                <h3 className="font-semibold text-[#333333]">{category.name}</h3>
                <p className="text-sm text-[#777777] mt-2">{category._count?.products ?? 0} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-12">
          <span className="text-sm font-semibold text-[#FFB6A3] tracking-wide">{text.home.featuredEyebrow}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mt-2">{text.home.featuredTitle}</h2>
          <p className="text-[#777777] mt-3 max-w-2xl">
            {text.home.featuredDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-block bg-[#D6EAF8] text-[#333333] px-8 py-3 rounded-2xl font-semibold hover:bg-opacity-80 transition"
            >
              View All Products
            </Link>
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#E8DAEF]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-12 text-center">{text.home.testimonialsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => <span key={i} className="text-[#FFB6A3]">★</span>)}
                </div>
                <p className="text-[#777777] italic mb-4">"{review.comment || review.product.name}"</p>
                <div>
                  <p className="font-semibold text-[#333333]">{review.user.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-12 text-center">{text.home.whyTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: "✓", title: "Safe & Certified", desc: "All products meet international safety standards" },
            { icon: "♻", title: "Eco-Friendly", desc: "Sustainable materials and ethical sourcing" },
            { icon: "⚡", title: "Fast Delivery", desc: "Quick shipping to your doorstep" },
            { icon: "💬", title: "24/7 Support", desc: "Friendly customer service always available" }
          ].map((item, idx) => (
            <div key={idx} className="text-center p-6 rounded-2xl bg-[#FFF8F0]">
              <p className="text-4xl mb-3">{item.icon}</p>
              <h3 className="font-semibold text-[#333333] mb-2">{item.title}</h3>
              <p className="text-sm text-[#777777]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#FADADD] to-[#D5F5E3]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">{text.home.ctaTitle}</h2>
          <p className="text-[#777777] mb-8 max-w-2xl mx-auto">
            {text.home.ctaDescription}
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#FFB6A3] text-white px-8 py-3 rounded-2xl font-semibold hover:opacity-90 transition shadow-sm"
          >
            {text.home.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}