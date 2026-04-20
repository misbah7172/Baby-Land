import { Router } from 'express';

import { prisma } from '../lib/prisma';

export const categoryRouter = Router();

categoryRouter.get('/', async (_request, response, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } }
    });

    response.json({ categories });
  } catch (error) {
    next(error);
  }
});