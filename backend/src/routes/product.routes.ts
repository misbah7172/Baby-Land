import { createHash } from 'crypto';
import { Router } from 'express';
import { Prisma, SizeOption } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { getCachedJson, setCachedJson, deleteByPattern } from '../utils/cache';

export const productRouter = Router();

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
  sizes: true,
  reviews: { select: { rating: true }, orderBy: { createdAt: 'desc' as const } }
} satisfies Prisma.ProductInclude;

function serializeProduct(product: Awaited<ReturnType<typeof prisma.product.findUnique>> & { reviews?: { rating: number }[] } | null) {
  if (!product) {
    return null;
  }

  const ratings = product.reviews ?? [];
  const averageRating = ratings.length === 0 ? 0 : ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;

  return {
    ...product,
    price: product.price.toString(),
    discountPrice: product.discountPrice?.toString() ?? null,
    averageRating: Number(averageRating.toFixed(1))
  };
}

productRouter.get('/', async (request, response, next) => {
  try {
    const query = {
      q: request.query.q as string | undefined,
      category: request.query.category as string | undefined,
      minPrice: request.query.minPrice as string | undefined,
      maxPrice: request.query.maxPrice as string | undefined,
      size: request.query.size as SizeOption | undefined,
      page: Number(request.query.page || 1),
      limit: Number(request.query.limit || 12),
      featured: request.query.featured === 'true'
    };

    const cacheKey = `products:list:${createHash('md5').update(JSON.stringify(query)).digest('hex')}`;
    const cached = await getCachedJson<{ products: unknown[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) {
      response.setHeader('x-cache', 'HIT');
      response.json(cached);
      return;
    }

    const priceFilter: Prisma.DecimalFilter<'Product'> = {};
    if (query.minPrice) {
      priceFilter.gte = new Prisma.Decimal(query.minPrice);
    }
    if (query.maxPrice) {
      priceFilter.lte = new Prisma.Decimal(query.maxPrice);
    }

    const where: Prisma.ProductWhereInput = {
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q } },
              { description: { contains: query.q } },
              { sku: { contains: query.q } }
            ]
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...((query.minPrice || query.maxPrice) ? { price: priceFilter } : {}),
      ...(query.size ? { sizes: { some: { size: query.size } } } : {}),
      ...(query.featured ? { featured: true } : {})
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit
      })
    ]);

    const payload = {
      products: products.map(item => serializeProduct(item)),
      total,
      page: query.page,
      limit: query.limit
    };

    await setCachedJson(cacheKey, payload, 300);
    response.setHeader('x-cache', 'MISS');
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

productRouter.get('/:slug', async (request, response, next) => {
  try {
    const identifier = request.params.slug;
    const cacheKey = `products:detail:${identifier}`;
    const cached = await getCachedJson<{ product: unknown }>(cacheKey);
    if (cached) {
      response.setHeader('x-cache', 'HIT');
      response.json(cached);
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: identifier }, { id: identifier }]
      },
      include: productInclude
    });

    if (!product) {
      response.status(404).json({ message: 'Product not found' });
      return;
    }

    const payload = { product: serializeProduct(product) };
    await setCachedJson(cacheKey, payload, 300);
    response.setHeader('x-cache', 'MISS');
    response.json(payload);
  } catch (error) {
    next(error);
  }
});
