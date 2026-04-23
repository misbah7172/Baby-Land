import { randomUUID } from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { Prisma, SizeOption } from '@prisma/client';

import { authRequired, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { validate } from '../middleware/validate';

export const cartRouter = Router();

const cartItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(20).default(1),
    size: z.nativeEnum(SizeOption).optional()
  })
});

const updateItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1).max(20)
  })
});

type CartPayload = {
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    imageUrl: string | null;
    quantity: number;
    unitPrice: string;
    size: SizeOption;
  }>;
  subtotal: string;
  itemCount: number;
};

async function serializeCartFromDb(userId: string): Promise<CartPayload> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } } }
      }
    }
  });

  if (!cart) {
    return { items: [], subtotal: '0.00', itemCount: 0 };
  }

  const items = cart.items.map(item => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    imageUrl: item.product.images[0]?.url ?? null,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    size: item.size
  }));

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  return { items, subtotal: subtotal.toFixed(2), itemCount: items.reduce((sum, item) => sum + item.quantity, 0) };
}

async function serializeCartFromRedis(guestId: string): Promise<CartPayload> {
  const raw = await redis.get(`guest-cart:${guestId}`);
  const parsed = raw ? (JSON.parse(raw) as { items: CartPayload['items'] }) : { items: [] };
  const subtotal = parsed.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

  return {
    items: parsed.items,
    subtotal: subtotal.toFixed(2),
    itemCount: parsed.items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

async function ensureGuestId(request: AuthenticatedRequest, response: import('express').Response) {
  let guestId = request.cookies.guest_cart_id as string | undefined;
  if (!guestId) {
    guestId = randomUUID();
    response.cookie('guest_cart_id', guestId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }

  return guestId;
}

async function resolveCart(request: AuthenticatedRequest, response: import('express').Response) {
  if (request.user) {
    return { type: 'db' as const, id: request.user.id, payload: await serializeCartFromDb(request.user.id) };
  }

  const guestId = await ensureGuestId(request, response);
  return { type: 'redis' as const, id: guestId, payload: await serializeCartFromRedis(guestId) };
}

cartRouter.get('/', optionalAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const cart = await resolveCart(request, response);
    response.json({ cart: cart.payload });
  } catch (error) {
    next(error);
  }
});

cartRouter.post('/items', optionalAuth, validate(cartItemSchema), async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof cartItemSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: body.productId }, include: { images: true } });
    if (!product) {
      response.status(404).json({ message: 'Product not found' });
      return;
    }

    const selectedSize = body.size ?? SizeOption.ONE_SIZE;

    if (request.user) {
      const cart = await prisma.cart.upsert({
        where: { userId: request.user.id },
        update: {},
        create: { userId: request.user.id }
      });

      await prisma.cartItem.upsert({
        where: { cartId_productId_size: { cartId: cart.id, productId: product.id, size: selectedSize } },
        update: { quantity: { increment: body.quantity } },
        create: {
          cartId: cart.id,
          productId: product.id,
          quantity: body.quantity,
          size: selectedSize,
          unitPrice: product.discountPrice ?? product.price
        }
      });

      const payload = await serializeCartFromDb(request.user.id);
      response.json({ cart: payload });
      return;
    }

    const guestId = await ensureGuestId(request, response);
    const payload = await serializeCartFromRedis(guestId);
    const existingIndex = payload.items.findIndex(item => item.productId === product.id && item.size === selectedSize);
    if (existingIndex >= 0) {
      const existingItem = payload.items[existingIndex]!;
      payload.items[existingIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + body.quantity,
        size: selectedSize
      };
    } else {
      payload.items.push({
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: product.images[0]?.url ?? null,
        quantity: body.quantity,
        unitPrice: (product.discountPrice ?? product.price).toString(),
        size: selectedSize
      });
    }

    await redis.set(`guest-cart:${guestId}`, JSON.stringify({ items: payload.items }), 'EX', 30 * 24 * 60 * 60);
    response.json({ cart: payload });
  } catch (error) {
    next(error);
  }
});

cartRouter.patch('/items/:itemId', optionalAuth, validate(updateItemSchema), async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof updateItemSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    if (request.user) {
      const itemId = request.params.itemId as string;
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: body.quantity } });
      response.json({ cart: await serializeCartFromDb(request.user.id) });
      return;
    }

    const guestId = await ensureGuestId(request, response);
    const raw = await redis.get(`guest-cart:${guestId}`);
    const payload = raw ? (JSON.parse(raw) as { items: CartPayload['items'] }) : { items: [] };
    const itemId = request.params.itemId as string;
    const item = payload.items.find(entry => entry.id === itemId);
    if (!item) {
      response.status(404).json({ message: 'Cart item not found' });
      return;
    }

    item.quantity = body.quantity;
    await redis.set(`guest-cart:${guestId}`, JSON.stringify(payload), 'EX', 30 * 24 * 60 * 60);
    response.json({ cart: await serializeCartFromRedis(guestId) });
  } catch (error) {
    next(error);
  }
});

cartRouter.delete('/items/:itemId', optionalAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const itemId = request.params.itemId as string;
    if (request.user) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      response.json({ cart: await serializeCartFromDb(request.user.id) });
      return;
    }

    const guestId = await ensureGuestId(request, response);
    const raw = await redis.get(`guest-cart:${guestId}`);
    const payload = raw ? (JSON.parse(raw) as { items: CartPayload['items'] }) : { items: [] };
    payload.items = payload.items.filter(item => item.id !== itemId);
    await redis.set(`guest-cart:${guestId}`, JSON.stringify(payload), 'EX', 30 * 24 * 60 * 60);
    response.json({ cart: await serializeCartFromRedis(guestId) });
  } catch (error) {
    next(error);
  }
});