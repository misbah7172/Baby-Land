import { Router } from 'express';
import { z } from 'zod';

import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';

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
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    response.json({ reviews });
  } catch (error) {
    next(error);
  }
});

reviewRouter.get('/product/:productId', async (request, response, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: request.params.productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    response.json({ reviews });
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

    response.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});