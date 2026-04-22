import { getCategories, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { SectionTitle } from '@/components/ui';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { getCopy, normalizeLanguage } from '@/lib/i18n';

export const revalidate = 120;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop Baby Products | ArtSoul By Nishita',
  description: 'Browse the full ArtSoul By Nishita catalog and filter by category, price, and size.',
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get('babyland-lang')?.value);
  const text = getCopy(language);
  const resolvedSearchParams = await searchParams;
  let productsResponse: Awaited<ReturnType<typeof getProducts>> = {
    products: [],
    total: 0,
    page: 1,
    limit: 12
  };
  let categoriesResponse: Awaited<ReturnType<typeof getCategories>> = { categories: [] };

  try {
    [productsResponse, categoriesResponse] = await Promise.all([
      getProducts({
        q: first(resolvedSearchParams.q),
        category: first(resolvedSearchParams.category),
        minPrice: first(resolvedSearchParams.minPrice),
        maxPrice: first(resolvedSearchParams.maxPrice),
        size: first(resolvedSearchParams.size),
        page: first(resolvedSearchParams.page) || '1',
        limit: first(resolvedSearchParams.limit) || '12'
      }),
      getCategories()
    ]);
  } catch {
    // Keep the products page available during API outages.
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <SectionTitle eyebrow={text.home.featuredEyebrow} title={text.home.featuredTitle} description={text.home.featuredDescription} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-soft">
          <p className="text-sm font-semibold text-rosewood">{text.home.categoriesTitle}</p>
          <div className="mt-4 space-y-2">
            {categoriesResponse.categories.map(category => (
              <a key={category.id} href={`/products?category=${category.slug}`} className="block rounded-2xl bg-blush-50 px-4 py-3 text-sm text-stone-700 transition hover:bg-blush-100">
                {category.name}
              </a>
            ))}
          </div>
        </aside>
        <div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {productsResponse.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="mt-8 text-sm text-stone-500">
            {productsResponse.products.length} / {productsResponse.total}
          </p>
        </div>
      </div>
    </div>
  );
}