import { Router } from 'express';
import { z } from 'zod';

import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import { deleteByPattern, getCachedJson, setCachedJson } from '../utils/cache';

export const reviewRouter = Router();

const reviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional()
  })
});

reviewRouter.get('/', async (request, response, next) => {
  try {
    const limit = Math.max(1, Math.min(12, Number(request.query.limit || 6)));
    const cacheKey = `reviews:list:${limit}`;
    const cached = await getCachedJson<{ reviews: unknown[] }>(cacheKey);
    if (cached) {
      response.setHeader('x-cache', 'HIT');
      response.json(cached);
      return;
    }

    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const payload = { reviews };
    await setCachedJson(cacheKey, payload, 300);

    response.setHeader('x-cache', 'MISS');
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

reviewRouter.get('/product/:productId', async (request, response, next) => {
  try {
    const cacheKey = `reviews:product:${request.params.productId}`;
    const cached = await getCachedJson<{ reviews: unknown[] }>(cacheKey);
    if (cached) {
      response.setHeader('x-cache', 'HIT');
      response.json(cached);
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { productId: request.params.productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const payload = { reviews };
    await setCachedJson(cacheKey, payload, 300);

    response.setHeader('x-cache', 'MISS');
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

reviewRouter.get('/eligible', authRequired, async (request: AuthenticatedRequest, response, next) => {
  try {
    const userId = request.user!.id;

    const deliveredItems = await prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          orderStatus: 'DELIVERED'
        },
        product: {
          reviews: {
            none: {
              userId
            }
          }
        }
      },
      select: {
        orderId: true,
        productId: true,
        productName: true,
        order: {
          select: {
            createdAt: true
          }
        }
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    });

    const byProduct = new Map<string, { orderId: string; productId: string; productName: string }>();
    for (const item of deliveredItems) {
      if (!byProduct.has(item.productId)) {
        byProduct.set(item.productId, {
          orderId: item.orderId,
          productId: item.productId,
          productName: item.productName
        });
      }
    }

    response.json({
      eligible: Array.from(byProduct.values())
    });
  } catch (error) {
    next(error);
  }
});

reviewRouter.post('/product/:productId', authRequired, validate(reviewSchema), async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof reviewSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const productId = request.params.productId as string;

    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: request.user!.id, orderStatus: { not: 'CANCELLED' } }
      }
    });

    if (!purchased) {
      response.status(403).json({ message: 'You can only review purchased products' });
      return;
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: request.user!.id, productId } },
      update: { rating: body.rating, comment: body.comment ?? null },
      create: { userId: request.user!.id, productId, rating: body.rating, comment: body.comment ?? null }
    });

    await deleteByPattern('reviews:*');
    await deleteByPattern('products:*');

    response.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});