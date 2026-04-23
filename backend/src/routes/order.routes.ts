import { Router } from 'express';
import { z } from 'zod';
import { PaymentMethod, OrderStatus, SizeOption } from '@prisma/client';

import { authRequired, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { validate } from '../middleware/validate';

export const orderRouter = Router();

const checkoutSchema = z.object({
  body: z.object({
    shippingName: z.string().min(2),
    shippingPhone: z.string().min(7),
    shippingLine1: z.string().min(5),
    shippingLine2: z.string().optional(),
    shippingCity: z.string().min(2),
    shippingState: z.string().optional(),
    shippingPostalCode: z.string().min(2),
    shippingCountry: z.string().default('Bangladesh'),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.COD),
    note: z.string().optional()
  })
});

const trackOrderQuerySchema = z.object({
  query: z.object({
    orderId: z.string().min(3),
    phone: z.string().min(7)
  })
});

async function getCartItems(request: AuthenticatedRequest) {
  if (request.user) {
    const cart = await prisma.cart.findUnique({
      where: { userId: request.user.id },
      include: { items: { include: { product: { include: { images: true } } } } }
    });

    return cart?.items ?? [];
  }

  const guestId = request.cookies.guest_cart_id as string | undefined;
  if (!guestId) {
    return [];
  }

  const raw = await redis.get(`guest-cart:${guestId}`);
  const payload = raw ? (JSON.parse(raw) as { items: Array<{ productId: string; quantity: number; size: SizeOption }> }) : { items: [] };

  const products = await prisma.product.findMany({ where: { id: { in: payload.items.map(item => item.productId) } }, include: { images: true } });
  return payload.items.map(item => {
    const product = products.find(entry => entry.id === item.productId);
    if (!product) {
      return null;
    }

    return {
      product,
      quantity: item.quantity,
      size: item.size,
      unitPrice: product.discountPrice ?? product.price
    };
  }).filter(Boolean) as Array<{ product: Awaited<ReturnType<typeof prisma.product.findMany>>[number] & { images: { url: string }[] }; quantity: number; size: SizeOption; unitPrice: typeof products[number]['price'] }>;
}

orderRouter.post('/', optionalAuth, validate(checkoutSchema), async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof checkoutSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const cartItems = await getCartItems(request);
    if (cartItems.length === 0) {
      response.status(400).json({ message: 'Cart is empty' });
      return;
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

    const order = await prisma.$transaction(async transaction => {
      const createdOrder = await transaction.order.create({
        data: {
          ...(request.user ? { userId: request.user.id } : {}),
          totalPrice,
          paymentMethod: body.paymentMethod,
          orderStatus: OrderStatus.PENDING,
          shippingName: body.shippingName,
          shippingPhone: body.shippingPhone,
          shippingLine1: body.shippingLine1,
          shippingLine2: body.shippingLine2 ?? null,
          shippingCity: body.shippingCity,
          shippingState: body.shippingState ?? null,
          shippingPostalCode: body.shippingPostalCode,
          shippingCountry: body.shippingCountry,
          note: body.note ?? null,
          items: {
            create: cartItems.map(item => ({
              productId: item.product.id,
              productName: item.product.name,
              productSku: item.product.sku,
              imageUrl: item.product.images[0]?.url ?? null,
              size: item.size,
              quantity: item.quantity,
              price: item.unitPrice
            }))
          },
          statusLog: {
            create: { status: OrderStatus.PENDING, note: 'Order created' }
          }
        },
        include: { items: true }
      });

      for (const item of cartItems) {
        await transaction.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      if (request.user) {
        await transaction.cartItem.deleteMany({ where: { cart: { userId: request.user.id } } });
      } else {
        const guestId = request.cookies.guest_cart_id as string | undefined;
        if (guestId) {
          await redis.del(`guest-cart:${guestId}`);
        }
      }

      return createdOrder;
    });

    response.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

orderRouter.get('/track', validate(trackOrderQuerySchema), async (request, response, next) => {
  try {
    const query = (request as import('express').Request & { validated?: z.infer<typeof trackOrderQuerySchema> }).validated?.query;
    if (!query) {
      response.status(400).json({ message: 'Invalid query' });
      return;
    }

    const normalizedPhone = query.phone.trim();
    const order = await prisma.order.findFirst({
      where: {
        id: query.orderId,
        shippingPhone: normalizedPhone
      },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            price: true,
            size: true
          }
        },
        statusLog: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!order) {
      response.status(404).json({ message: 'Order not found for the provided details' });
      return;
    }

    response.json({ order });
  } catch (error) {
    next(error);
  }
});

orderRouter.get('/me', authRequired, async (request: AuthenticatedRequest, response, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: request.user!.id },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            quantity: true,
            price: true,
            imageUrl: true,
            size: true
          }
        },
        statusLog: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    response.json({ orders });
  } catch (error) {
    next(error);
  }
});