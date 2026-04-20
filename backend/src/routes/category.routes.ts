import { Router } from 'express';

import { prisma } from '../lib/prisma';
import { getCachedJson, setCachedJson } from '../utils/cache';

export const categoryRouter = Router();

categoryRouter.get('/', async (_request, response, next) => {
  try {
    const cacheKey = 'categories:list';
    const cached = await getCachedJson<{ categories: unknown[] }>(cacheKey);
    if (cached) {
      response.setHeader('x-cache', 'HIT');
      response.json(cached);
      return;
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } }
    });

    const payload = { categories };
    await setCachedJson(cacheKey, payload, 600);

    response.setHeader('x-cache', 'MISS');
    response.json(payload);
  } catch (error) {
    next(error);
  }
});