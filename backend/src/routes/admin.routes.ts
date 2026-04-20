import { Router } from 'express';
import { z } from 'zod';
import { Role, OrderStatus, SizeOption } from '@prisma/client';

import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { deleteByPattern } from '../utils/cache';
import { validate } from '../middleware/validate';
import { env } from '../lib/env';
import { getSettingsGroup, upsertSettingsGroup } from '../services/site-settings';

export const adminRouter = Router();

function normalizePublicUrl(value: string) {
  if (value.startsWith('http://') && value.includes('.up.railway.app')) {
    return value.replace('http://', 'https://');
  }

  return value;
}

function hasEnvAdminCredentials(request: AuthenticatedRequest) {
  const adminEmail = request.header('x-admin-email');
  const adminPassword = request.header('x-admin-password');
  const validEmails = new Set([env.ADMIN_EMAIL, process.env.NEXT_PUBLIC_ADMIN_EMAIL].filter(Boolean));
  const validPasswords = new Set([env.ADMIN_PASSWORD, process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH].filter(Boolean));

  return Boolean(adminEmail && adminPassword && validEmails.has(adminEmail) && validPasswords.has(adminPassword));
}

function adminAccessRequired(request: AuthenticatedRequest, response: import('express').Response, next: import('express').NextFunction) {
  if (hasEnvAdminCredentials(request)) {
    next();
    return;
  }

  authRequired(request, response, () => {
    if (request.user?.role !== Role.ADMIN) {
      response.status(403).json({ message: 'Admin access required' });
      return;
    }

    next();
  });
}

adminRouter.use(adminAccessRequired);

const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2)
  })
});

const productSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().min(10),
    price: z.number().positive(),
    discountPrice: z.number().positive().optional().nullable(),
    categoryId: z.string().min(1),
    stock: z.number().int().min(0),
    sku: z.string().min(2),
    material: z.string().min(2),
    featured: z.boolean().default(false),
    imageUrls: z.array(z.string().url()).default([]),
    sizes: z.array(z.nativeEnum(SizeOption)).default([])
  })
});

const statusSchema = z.object({
  body: z.object({
    orderStatus: z.nativeEnum(OrderStatus),
    note: z.string().optional()
  })
});

const userRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role)
  })
});

const homepageSettingsSchema = z.object({
  body: z.object({
    heroBadge: z.string().min(2),
    heroTitle: z.string().min(2),
    heroSubtitle: z.string().min(2),
    primaryCtaLabel: z.string().min(2),
    secondaryCtaLabel: z.string().min(2),
    heroImageUrl: z.string().url().or(z.literal('')).default('')
  })
});

adminRouter.get('/analytics', async (_request, response, next) => {
  try {
    const [totalOrders, salesAgg, topProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      })
    ]);

    response.json({
      totalOrders,
      totalSales: salesAgg._sum.totalPrice?.toString() ?? '0.00',
      topProducts
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/orders', async (_request, response, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, user: { select: { name: true, email: true } }, statusLog: true },
      orderBy: { createdAt: 'desc' }
    });

    response.json({ orders });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/orders/:id', async (request, response, next) => {
  try {
    const orderId = request.params.id as string;

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } }
          }
        },
        user: { select: { id: true, name: true, email: true } },
        statusLog: { orderBy: { createdAt: 'desc' } }
      }
    });

    response.json({ order });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/orders/:id/status', validate(statusSchema), async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof statusSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const orderId = request.params.id as string;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: body.orderStatus,
        statusLog: { create: { status: body.orderStatus, note: body.note ?? null } }
      }
    });

    response.json({ order });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/categories', async (_request, response, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    response.json({ categories });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/categories', validate(categorySchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof categorySchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const category = await prisma.category.create({ data: body });
    await deleteByPattern('categories:*');
    await deleteByPattern('products:*');
    response.status(201).json({ category });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/categories/:id', validate(categorySchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof categorySchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const categoryId = request.params.id as string;

    const category = await prisma.category.update({ where: { id: categoryId }, data: body });
    await deleteByPattern('categories:*');
    await deleteByPattern('products:*');
    response.json({ category });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/categories/:id', async (request, response, next) => {
  try {
    await prisma.category.delete({ where: { id: request.params.id as string } });
    await deleteByPattern('categories:*');
    await deleteByPattern('products:*');
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/products', async (_request, response, next) => {
  try {
    const products = await prisma.product.findMany({ include: { images: true, sizes: true, category: true }, orderBy: { createdAt: 'desc' } });
    response.json({ products });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/products', validate(productSchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof productSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        discountPrice: body.discountPrice ?? null,
        categoryId: body.categoryId,
        stock: body.stock,
        sku: body.sku,
        material: body.material,
        featured: body.featured,
        images: { create: body.imageUrls.map((url, index) => ({ url: normalizePublicUrl(url), sortOrder: index })) },
        sizes: { create: body.sizes.map(size => ({ size })) }
      }
    });

    await deleteByPattern('products:*');
    response.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/products/:id', validate(productSchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof productSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const productId = request.params.id as string;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        discountPrice: body.discountPrice ?? null,
        categoryId: body.categoryId,
        stock: body.stock,
        sku: body.sku,
        material: body.material,
        featured: body.featured
      }
    });

    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.productSizeOption.deleteMany({ where: { productId } });
    await prisma.productImage.createMany({
      data: body.imageUrls.map((url, index) => ({ productId, url: normalizePublicUrl(url), sortOrder: index }))
    });
    await prisma.productSizeOption.createMany({
      data: body.sizes.map(size => ({ productId, size }))
    });

    await deleteByPattern('products:*');
    response.json({ product });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/products/:id', async (request, response, next) => {
  try {
    await prisma.product.delete({ where: { id: request.params.id as string } });
    await deleteByPattern('products:*');
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/users', async (_request, response, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    response.json({ users });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/users/:id/role', validate(userRoleSchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof userRoleSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: request.params.id as string },
      data: { role: body.role },
      select: { id: true, name: true, email: true, role: true }
    });

    response.json({ user });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/reviews', async (_request, response, next) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    response.json({ reviews });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/reviews/:id', async (request, response, next) => {
  try {
    await prisma.review.delete({ where: { id: request.params.id as string } });
    await deleteByPattern('reviews:*');
    await deleteByPattern('products:*');
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/settings/homepage', async (_request, response, next) => {
  try {
    const settings = await getSettingsGroup('homepage');
    response.json({ settings });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/settings/homepage', validate(homepageSettingsSchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof homepageSettingsSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const settings = await upsertSettingsGroup('homepage', {
      ...body,
      heroImageUrl: normalizePublicUrl(body.heroImageUrl)
    });
    await deleteByPattern('settings:*');
    response.json({ settings });
  } catch (error) {
    next(error);
  }
});