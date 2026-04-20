import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma, PrismaClient, PaymentMethod, OrderStatus, Role, SizeOption } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const GUEST_CART_COOKIE = 'babyland_guest_id';
const ACCESS_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/'
};

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';
const adminPasswordHash = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || '';

const sizeOptions = new Set<SizeOption>(['NEWBORN', 'M0_3', 'M3_6', 'M6_12', 'M12_18', 'M18_24', 'ONE_SIZE']);
const paymentMethodOptions = new Set<PaymentMethod>(['COD', 'BKASH', 'NAGAD']);
const orderStatusOptions = new Set<OrderStatus>(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __babyLandPrisma: PrismaClient | undefined;
}

export const prisma = globalThis.__babyLandPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__babyLandPrisma = prisma;
}

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
};

type ProductDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string | null;
  stock: number;
  sku: string;
  material: string;
  featured: boolean;
  averageRating: number;
  category: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string; sortOrder: number }>;
  sizes: Array<{ id: string; size: SizeOption }>;
};

type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
};

type CartDto = {
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    imageUrl: string | null;
    quantity: number;
    unitPrice: string;
    size: SizeOption | null;
  }>;
  subtotal: string;
  itemCount: number;
};

type OrderDto = {
  id: string;
  totalPrice: string;
  orderStatus: OrderStatus;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: string;
    imageUrl: string | null;
    productId?: string;
    product?: { id: string; name: string; slug: string };
    size?: SizeOption;
  }>;
  statusLog: Array<{
    id: string;
    status: OrderStatus;
    note: string | null;
    createdAt: string;
  }>;
};

type CartOwner =
  | { userId: string; isGuest?: false }
  | { guestId: string; isGuest: true };

function toDecimalString(value: Prisma.Decimal | number | string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return value instanceof Prisma.Decimal ? value.toString() : String(value);
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function isAdminHeaderAuthorized(request: NextRequest) {
  return request.headers.get('x-admin-email') === adminEmail && request.headers.get('x-admin-password') === adminPasswordHash;
}

function setCookie(response: NextResponse, name: string, value: string, maxAgeSeconds: number) {
  response.cookies.set({
    name,
    value,
    ...cookieBase,
    maxAge: maxAgeSeconds
  });
}

function clearCookie(response: NextResponse, name: string) {
  response.cookies.set({
    name,
    value: '',
    ...cookieBase,
    expires: new Date(0),
    maxAge: 0
  });
}

function signAccessToken(user: SessionUser) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new ApiError(500, 'JWT_ACCESS_SECRET is not configured on the server');
  }

  return jwt.sign(
    { name: user.name, email: user.email, role: user.role, phone: user.phone },
    secret,
    { subject: user.id, expiresIn: ACCESS_TOKEN_TTL }
  );
}

function signRefreshToken(user: SessionUser) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new ApiError(500, 'JWT_REFRESH_SECRET is not configured on the server');
  }

  return jwt.sign(
    { name: user.name, email: user.email, role: user.role, phone: user.phone },
    secret,
    { subject: user.id, expiresIn: REFRESH_TOKEN_TTL_MS / 1000 }
  );
}

function getAccessTokenPayload(token: string) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new ApiError(500, 'JWT_ACCESS_SECRET is not configured on the server');
  }

  return jwt.verify(token, secret) as jwt.JwtPayload;
}

function getRefreshTokenPayload(token: string) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new ApiError(500, 'JWT_REFRESH_SECRET is not configured on the server');
  }

  return jwt.verify(token, secret) as jwt.JwtPayload;
}

function normalizeSize(value?: string | null) {
  const candidate = (value || 'ONE_SIZE').toUpperCase() as SizeOption;
  return sizeOptions.has(candidate) ? candidate : 'ONE_SIZE';
}

function normalizePaymentMethod(value?: string | null) {
  const candidate = (value || 'COD').toUpperCase() as PaymentMethod;
  return paymentMethodOptions.has(candidate) ? candidate : 'COD';
}

function normalizeOrderStatus(value?: string | null) {
  const candidate = (value || 'PENDING').toUpperCase() as OrderStatus;
  return orderStatusOptions.has(candidate) ? candidate : 'PENDING';
}

async function readJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json() as T;
  } catch {
    throw new ApiError(400, 'Invalid JSON payload');
  }
}

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

async function handleUpload(request: NextRequest) {
  if (request.method !== 'POST') {
    throw new ApiError(405, 'Method not allowed');
  }

  const formData = await request.formData();
  const fileEntry = formData.get('file');

  if (!(fileEntry instanceof File)) {
    throw new ApiError(400, 'No file was uploaded');
  }

  const file = fileEntry;
  if (file.size > 4 * 1024 * 1024) {
    throw new ApiError(413, 'Image is too large. Use files up to 4 MB.');
  }

  const imageData = {
    fileName: file.name || 'upload.jpg',
    mimeType: file.type || 'image/jpeg',
    data: Buffer.from(await file.arrayBuffer())
  };

  let image;
  try {
    image = await prisma.imageAsset.create({ data: imageData });
  } catch (error) {
    // Self-heal when the new table has not been created in production yet.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2021'
    ) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ImageAsset" (
          "id" TEXT PRIMARY KEY,
          "fileName" TEXT NOT NULL,
          "mimeType" TEXT NOT NULL,
          "data" BYTEA NOT NULL,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      image = await prisma.imageAsset.create({ data: imageData });
    } else {
      throw error;
    }
  }

  return NextResponse.json({
    assetId: image.id,
    url: `/api/product-images/${image.id}`
  });
}

export async function dispatchApiRequest(request: NextRequest, segments: string[]) {
  try {
    if (segments[0] === 'auth') {
      return await handleAuth(request, segments);
    }

    if (segments[0] === 'products') {
      return await handleProducts(request, segments);
    }

    if (segments[0] === 'categories') {
      return await handleCategories(request, segments);
    }

    if (segments[0] === 'cart') {
      return await handleCart(request, segments);
    }

    if (segments[0] === 'orders') {
      return await handleOrders(request, segments);
    }

    if (segments[0] === 'reviews') {
      return await handleReviews(request, segments);
    }

    if (segments[0] === 'settings') {
      return await handleSettings(request, segments);
    }

    if (segments[0] === 'admin') {
      return await handleAdmin(request, segments);
    }

    if (segments[0] === 'upload' && segments[1] === 'image') {
      return await handleUpload(request);
    }

    throw new ApiError(404, 'API route not found');
  } catch (error) {
    if (error instanceof ApiError) {
      return json({ message: error.message }, { status: error.status });
    }

    if (segments[0] === 'admin' && (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientValidationError || error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Error)) {
      if (segments[1] === 'analytics') {
        return json({ totalOrders: 0, totalSales: '0.00', topProducts: [] });
      }
      if (segments[1] === 'products' && request.method === 'GET') {
        return json({ products: [] });
      }
      if (segments[1] === 'categories' && request.method === 'GET') {
        return json({ categories: [] });
      }
      if (segments[1] === 'orders' && request.method === 'GET') {
        return json({ orders: [] });
      }
      if (segments[1] === 'users' && request.method === 'GET') {
        return json({ users: [] });
      }
      if (segments[1] === 'reviews' && request.method === 'GET') {
        return json({ reviews: [] });
      }
      if (segments[1] === 'settings' && segments[2] === 'homepage') {
        return json({ settings: {} });
      }
    }

    if (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientValidationError) {
      if (segments[0] === 'cart' && request.method === 'GET') {
        return json({ cart: { items: [], subtotal: '0.00', itemCount: 0 } });
      }

      if (!process.env.DATABASE_URL) {
        return json({ message: 'DATABASE_URL is missing on the server. Set it in Vercel Environment Variables and redeploy.' }, { status: 503 });
      }

      return json({ message: 'Database connection failed. Verify DATABASE_URL points to your Supabase Postgres and redeploy.' }, { status: 503 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return json({ message: 'Database request failed. Please try again.' }, { status: 500 });
    }

    console.error(error);
    return json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function resolveSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : null;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || bearerToken;

  if (!accessToken) {
    return null;
  }

  try {
    const payload = getAccessTokenPayload(accessToken);
    const userId = payload.sub;
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, phone: true }
    });

    return user ? { ...user, phone: user.phone ?? null } : null;
  } catch {
    return null;
  }
}

async function requireSessionUser(request: NextRequest) {
  const user = await resolveSessionUser(request);
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }

  return user;
}

async function resolveAdminAccess(request: NextRequest) {
  if (isAdminHeaderAuthorized(request)) {
    return true;
  }

  const user = await resolveSessionUser(request);
  return Boolean(user && user.role === 'ADMIN');
}

async function requireAdminAccess(request: NextRequest) {
  if (!(await resolveAdminAccess(request))) {
    throw new ApiError(403, 'Admin access required');
  }
}

async function createSessionResponse(user: SessionUser) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });

  const response = json({ user });
  setCookie(response, ACCESS_TOKEN_COOKIE, accessToken, 60 * 60 * 24 * 7);
  setCookie(response, REFRESH_TOKEN_COOKIE, refreshToken, 60 * 60 * 24 * 30);
  return response;
}

async function clearSessionResponse(userId?: string | null) {
  if (userId) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  const response = json({ ok: true });
  clearCookie(response, ACCESS_TOKEN_COOKIE);
  clearCookie(response, REFRESH_TOKEN_COOKIE);
  return response;
}

async function loadUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, name: true, email: true, role: true, phone: true, passwordHash: true }
  });
}

async function verifyFirebaseIdToken(idToken: string) {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, 'Firebase API key is not configured on the server');
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ idToken })
  });

  if (!response.ok) {
    throw new ApiError(401, 'Invalid Firebase session');
  }

  const payload = await response.json() as {
    users?: Array<{
      localId: string;
      email?: string;
      displayName?: string;
      phoneNumber?: string;
      emailVerified?: boolean;
    }>;
  };

  const firebaseUser = payload.users?.[0];
  if (!firebaseUser?.email) {
    throw new ApiError(401, 'Firebase user email is missing');
  }

  const displayName = (firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'Google User').trim();

  return {
    uid: firebaseUser.localId,
    email: firebaseUser.email.toLowerCase(),
    displayName,
    phoneNumber: firebaseUser.phoneNumber || null,
    emailVerified: Boolean(firebaseUser.emailVerified)
  };
}

function serializeSessionUser(user: { id: string; name: string; email: string; role: Role; phone: string | null }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone
  };
}

function serializeCategory(category: { id: string; name: string; slug: string; _count?: { products: number } }) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    _count: category._count ? { products: category._count.products } : undefined
  };
}

function serializeProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: Prisma.Decimal;
  discountPrice: Prisma.Decimal | null;
  stock: number;
  sku: string;
  material: string;
  featured: boolean;
  category: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string; sortOrder: number }>;
  sizes: Array<{ id: string; size: SizeOption }>;
  reviews?: Array<{ rating: number }>;
}): ProductDto {
  const ratings = product.reviews || [];
  const averageRating = ratings.length ? ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
    stock: product.stock,
    sku: product.sku,
    material: product.material,
    featured: product.featured,
    averageRating,
    category: product.category,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      sortOrder: image.sortOrder
    })),
    sizes: product.sizes.map((size) => ({
      id: size.id,
      size: size.size
    }))
  };
}

function serializeCart(cart: {
  items: Array<{
    id: string;
    productId: string;
    product: { name: string; slug: string; images: Array<{ url: string }> };
    quantity: number;
    unitPrice: Prisma.Decimal;
    size: SizeOption;
  }>;
}) {
  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    imageUrl: item.product.images[0]?.url || null,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    size: item.size
  }));

  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal: subtotal.toFixed(2),
    itemCount
  } satisfies CartDto;
}

function serializeOrder(order: {
  id: string;
  totalPrice: Prisma.Decimal;
  orderStatus: OrderStatus;
  createdAt: Date;
  user: { id: string; name: string; email: string } | null;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: Prisma.Decimal;
    imageUrl: string | null;
    productId: string;
    product: { id: string; name: string; slug: string };
    size: SizeOption;
  }>;
  statusLog: Array<{
    id: string;
    status: OrderStatus;
    note: string | null;
    createdAt: Date;
  }>;
}): OrderDto {
  return {
    id: order.id,
    totalPrice: order.totalPrice.toString(),
    orderStatus: order.orderStatus,
    createdAt: order.createdAt.toISOString(),
    user: order.user,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price.toString(),
      imageUrl: item.imageUrl,
      productId: item.productId,
      product: item.product,
      size: item.size
    })),
    statusLog: order.statusLog.map((entry) => ({
      id: entry.id,
      status: entry.status,
      note: entry.note,
      createdAt: entry.createdAt.toISOString()
    }))
  };
}

async function getOrCreateCart(owner: CartOwner) {
  const where = 'userId' in owner ? { userId: owner.userId } : { guestId: owner.guestId };
  const cart = await prisma.cart.findFirst({ where });

  if (cart) {
    return cart;
  }

  return prisma.cart.create({ data: where });
}

async function loadCart(owner: CartOwner) {
  const cart = await getOrCreateCart(owner);
  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' } }
            }
          }
        }
      }
    }
  });
}

async function resolveCartOwner(request: NextRequest): Promise<CartOwner> {
  const user = await resolveSessionUser(request);
  if (user) {
    return { userId: user.id };
  }

  return { guestId: request.cookies.get(GUEST_CART_COOKIE)?.value || crypto.randomUUID(), isGuest: true };
}

function attachGuestCookie(response: NextResponse, owner: { guestId?: string; isGuest?: boolean }) {
  if (owner.isGuest && owner.guestId) {
    setCookie(response, GUEST_CART_COOKIE, owner.guestId, 60 * 60 * 24 * 365);
  }
}

async function handleAuth(request: NextRequest, segments: string[]) {
  const action = segments[1] || '';

  if (request.method === 'POST' && action === 'register') {
    const body = await readJsonBody<{ name: string; email: string; password: string }>(request);
    if (!body.name || !body.email || !body.password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) {
      throw new ApiError(409, 'Email already in use');
    }

    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(body.password, 12),
        role: 'CUSTOMER'
      },
      select: { id: true, name: true, email: true, role: true, phone: true }
    });

    return createSessionResponse(serializeSessionUser(user));
  }

  if (request.method === 'POST' && action === 'login') {
    const body = await readJsonBody<{ email: string; password: string }>(request);
    if (!body.email || !body.password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await loadUserByEmail(body.email);
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    return createSessionResponse(serializeSessionUser(user));
  }

  if (request.method === 'POST' && action === 'firebase-session') {
    const body = await readJsonBody<{ idToken?: string }>(request);
    if (!body.idToken) {
      throw new ApiError(400, 'Firebase token is required');
    }

    const firebaseIdentity = await verifyFirebaseIdToken(body.idToken);
    const generatedPassword = `${crypto.randomUUID()}${crypto.randomUUID()}`;

    const user = await prisma.user.upsert({
      where: { email: firebaseIdentity.email },
      update: {
        name: firebaseIdentity.displayName,
        phone: firebaseIdentity.phoneNumber
      },
      create: {
        name: firebaseIdentity.displayName,
        email: firebaseIdentity.email,
        phone: firebaseIdentity.phoneNumber,
        passwordHash: await bcrypt.hash(generatedPassword, 12),
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true
      }
    });

    return createSessionResponse(user);
  }

  if (request.method === 'POST' && action === 'logout') {
    const user = await resolveSessionUser(request);
    return clearSessionResponse(user?.id);
  }

  if (request.method === 'GET' && action === 'me') {
    const response = json({ user: null });
    const user = await resolveSessionUser(request);
    if (user) {
      return json({ user });
    }

    return response;
  }

  if (request.method === 'POST' && action === 'refresh') {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token missing');
    }

    try {
      const payload = getRefreshTokenPayload(refreshToken);
      if (!payload.sub) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const tokenHash = hashToken(refreshToken);
      const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });
      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt.getTime() < Date.now()) {
        throw new ApiError(401, 'Refresh token expired');
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true, phone: true }
      });
      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      await prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revokedAt: new Date() } });
      return createSessionResponse(user);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  throw new ApiError(404, 'Auth route not found');
}

async function handleProducts(request: NextRequest, segments: string[]) {
  if (request.method === 'GET' && segments.length === 1) {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, asNumber(searchParams.get('page'), 1));
    const limit = Math.min(100, Math.max(1, asNumber(searchParams.get('limit'), 12)));
    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const size = searchParams.get('size');
    const featured = searchParams.get('featured');

    const where: Prisma.ProductWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {} as any;
      if (minPrice) {
        (where.price as any).gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice) {
        (where.price as any).lte = new Prisma.Decimal(maxPrice);
      }
    }

    if (size && sizeOptions.has(size as SizeOption)) {
      where.sizes = { some: { size: size as SizeOption } };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          sizes: true,
          reviews: { select: { rating: true } }
        },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return json({
      products: products.map(serializeProduct),
      total,
      page,
      limit
    });
  }

  if (request.method === 'GET' && segments.length === 2 && segments[1]) {
    const slug = decodeURIComponent(segments[1]);
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        sizes: true,
        reviews: { select: { rating: true } }
      }
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return json({ product: serializeProduct(product) });
  }

  throw new ApiError(404, 'Product route not found');
}

async function handleCategories(request: NextRequest, segments: string[]) {
  if (request.method === 'GET' && segments.length === 1) {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } }
    });

    return json({ categories: categories.map(serializeCategory) });
  }

  if (request.method === 'GET' && segments[0] === 'admin' && segments[1] === 'categories') {
    await requireAdminAccess(request);
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } }
    });
    return json({ categories: categories.map(serializeCategory) });
  }

  throw new ApiError(404, 'Category route not found');
}

async function getCartResponse(request: NextRequest) {
  const owner = await resolveCartOwner(request);
  const cart = await loadCart(owner);
  if (!cart) {
    return json({ cart: { items: [], subtotal: '0.00', itemCount: 0 } satisfies CartDto });
  }

  const response = json({ cart: serializeCart(cart) });
  attachGuestCookie(response, owner);
  return response;
}

async function handleCart(request: NextRequest, segments: string[]) {
  const owner = await resolveCartOwner(request);
  const cart = await getOrCreateCart(owner);

  if (request.method === 'GET' && segments.length === 1) {
    const loaded = await loadCart(owner);
    const response = json({ cart: serializeCart(loaded || { items: [] }) });
    attachGuestCookie(response, owner);
    return response;
  }

  if (request.method === 'POST' && segments[1] === 'items') {
    const body = await readJsonBody<{ productId: string; quantity: number; size?: string }>(request);
    const quantity = Math.max(1, asNumber(body.quantity, 1));
    if (!body.productId) {
      throw new ApiError(400, 'Product is required');
    }

    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      include: { images: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const size = normalizeSize(body.size);
    await prisma.cartItem.upsert({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId: product.id,
          size
        }
      },
      update: { quantity: { increment: quantity }, unitPrice: product.discountPrice ?? product.price },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity,
        size,
        unitPrice: product.discountPrice ?? product.price
      }
    });

    const loaded = await loadCart(owner);
    const response = json({ cart: serializeCart(loaded || { items: [] }) });
    attachGuestCookie(response, owner);
    return response;
  }

  if ((request.method === 'PATCH' || request.method === 'DELETE') && segments[1] === 'items' && segments[2]) {
    const itemId = segments[2];
    const existingItem = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!existingItem) {
      throw new ApiError(404, 'Cart item not found');
    }

    if (request.method === 'PATCH') {
      const body = await readJsonBody<{ quantity: number }>(request);
      const quantity = Math.max(0, asNumber(body.quantity, existingItem.quantity));
      if (quantity === 0) {
        await prisma.cartItem.delete({ where: { id: itemId } });
      } else {
        await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
      }
    } else {
      await prisma.cartItem.delete({ where: { id: itemId } });
    }

    const loaded = await loadCart(owner);
    const response = json({ cart: serializeCart(loaded || { items: [] }) });
    attachGuestCookie(response, owner);
    return response;
  }

  throw new ApiError(404, 'Cart route not found');
}

async function handleOrders(request: NextRequest, segments: string[]) {
  if (request.method === 'POST' && segments.length === 1) {
    const body = await readJsonBody<{
      shippingName: string;
      shippingPhone: string;
      shippingLine1: string;
      shippingLine2?: string;
      shippingCity: string;
      shippingState?: string;
      shippingPostalCode: string;
      shippingCountry?: string;
      paymentMethod?: string;
      note?: string;
    }>(request);

    if (!body.shippingName || !body.shippingPhone || !body.shippingLine1 || !body.shippingCity || !body.shippingPostalCode) {
      throw new ApiError(400, 'Shipping information is incomplete');
    }

    const owner = await resolveCartOwner(request);
    const cart = await loadCart(owner);
    if (!cart || !cart.items.length) {
      throw new ApiError(400, 'Cart is empty');
    }

    const user = await resolveSessionUser(request);
    const createdOrder = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new ApiError(400, `Not enough stock for ${item.product.name}`);
        }
      }

      const totalPrice = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

      const order = await tx.order.create({
        data: {
          totalPrice,
          paymentMethod: normalizePaymentMethod(body.paymentMethod),
          orderStatus: 'PENDING',
          shippingName: body.shippingName.trim(),
          shippingPhone: body.shippingPhone.trim(),
          shippingLine1: body.shippingLine1.trim(),
          shippingLine2: body.shippingLine2?.trim() || null,
          shippingCity: body.shippingCity.trim(),
          shippingState: body.shippingState?.trim() || null,
          shippingPostalCode: body.shippingPostalCode.trim(),
          shippingCountry: body.shippingCountry?.trim() || 'Bangladesh',
          note: body.note?.trim() || null,
          ...(user ? { userId: user.id } : {}),
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productSku: item.product.sku,
              imageUrl: item.product.images[0]?.url || null,
              size: item.size,
              quantity: item.quantity,
              price: item.unitPrice
            }))
          },
          statusLog: {
            create: [{ status: 'PENDING', note: 'Order placed' }]
          }
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: { product: { select: { id: true, name: true, slug: true } } }
          },
          statusLog: true
        }
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });

    return json({ order: serializeOrder(createdOrder) });
  }

  if (request.method === 'GET' && segments[1] === 'me') {
    const user = await requireSessionUser(request);
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        statusLog: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return json({
      orders: orders.map((order) => ({
        id: order.id,
        totalPrice: order.totalPrice.toString(),
        orderStatus: order.orderStatus,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price.toString(),
          imageUrl: item.imageUrl,
          size: item.size
        })),
        statusLog: order.statusLog.map((entry) => ({
          id: entry.id,
          status: entry.status,
          note: entry.note,
          createdAt: entry.createdAt.toISOString()
        }))
      }))
    });
  }

  throw new ApiError(404, 'Order route not found');
}

async function handleReviews(request: NextRequest, segments: string[]) {
  if (request.method === 'GET' && segments.length === 1) {
    const limit = Math.min(50, Math.max(1, asNumber(request.nextUrl.searchParams.get('limit'), 3)));
    const reviews = await prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } }
      }
    });

    return json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: { name: review.user.name },
        product: { name: review.product.name, slug: review.product.slug }
      }))
    });
  }

  if (request.method === 'GET' && segments[1] === 'product' && segments[2]) {
    const productId = segments[2];
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: { name: review.user.name }
      }))
    });
  }

  if (request.method === 'POST' && segments[1] === 'product' && segments[2]) {
    const user = await requireSessionUser(request);
    const productId = segments[2];
    const body = await readJsonBody<{ rating: number; comment?: string }>(request);
    const rating = Math.min(5, Math.max(1, asNumber(body.rating, 5)));

    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: user.id }
      }
    });

    if (!purchased) {
      throw new ApiError(403, 'You can only review products you purchased');
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { rating, comment: body.comment?.trim() || null },
      create: { userId: user.id, productId, rating, comment: body.comment?.trim() || null }
    });

    return json({ review });
  }

  throw new ApiError(404, 'Review route not found');
}

async function getHomepageSettings() {
  const settings = await prisma.siteSetting.findMany({ where: { group: 'homepage' } });
  return Object.fromEntries(settings.map((setting) => [setting.key, JSON.parse(setting.value)]));
}

async function handleSettings(request: NextRequest, segments: string[]) {
  if (request.method === 'GET' && segments[1] === 'homepage') {
    return json({ settings: await getHomepageSettings() });
  }

  if (segments[0] === 'admin' && segments[1] === 'settings' && segments[2] === 'homepage') {
    await requireAdminAccess(request);

    if (request.method === 'GET') {
      return json({ settings: await getHomepageSettings() });
    }

    if (request.method === 'PUT') {
      const body = await readJsonBody<{
        heroBadge: string;
        heroTitle: string;
        heroSubtitle: string;
        primaryCtaLabel: string;
        secondaryCtaLabel: string;
      }>(request);

      const entries = Object.entries(body).filter(([, value]) => typeof value === 'string' && value.trim().length > 0);
      await prisma.$transaction(
        entries.map(([key, value]) =>
          prisma.siteSetting.upsert({
            where: { group_key: { group: 'homepage', key } },
            update: { value: JSON.stringify(value) },
            create: { group: 'homepage', key, value: JSON.stringify(value) }
          })
        )
      );

      return json({ settings: await getHomepageSettings() });
    }
  }

  throw new ApiError(404, 'Settings route not found');
}

async function collectProductInclude() {
  return {
    category: true,
    images: { orderBy: { sortOrder: 'asc' as const } },
    sizes: true,
    reviews: { select: { rating: true } }
  };
}

async function handleAdmin(request: NextRequest, segments: string[]) {
  await requireAdminAccess(request);

  if (request.method === 'GET' && segments[1] === 'analytics') {
    const [totalOrders, totalSalesAggregate, topProducts] = await prisma.$transaction([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true }, where: { orderStatus: { not: 'CANCELLED' } } }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10
      })
    ]);

    return json({
      totalOrders,
      totalSales: totalSalesAggregate._sum.totalPrice?.toString() || '0.00',
      topProducts: topProducts.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        _sum: { quantity: item._sum?.quantity ?? 0 }
      }))
    });
  }

  if (request.method === 'GET' && segments[1] === 'orders' && segments.length === 2) {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { id: true, productName: true, quantity: true, price: true } }
      }
    });

    return json({
      orders: orders.map((order) => ({
        id: order.id,
        orderStatus: order.orderStatus,
        totalPrice: order.totalPrice.toString(),
        createdAt: order.createdAt.toISOString(),
        user: order.user,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price.toString()
        }))
      }))
    });
  }

  if (request.method === 'GET' && segments[1] === 'orders' && segments[2]) {
    const order = await prisma.order.findUnique({
      where: { id: segments[2] },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { id: true, name: true, slug: true } } }
        },
        statusLog: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return json({ order: serializeOrder(order) });
  }

  if (request.method === 'PATCH' && segments[1] === 'orders' && segments[2] && segments[3] === 'status') {
    const body = await readJsonBody<{ orderStatus: OrderStatus; note?: string }>(request);
    const orderStatus = normalizeOrderStatus(body.orderStatus);
    const order = await prisma.order.update({
      where: { id: segments[2] },
      data: {
        orderStatus,
        statusLog: {
          create: [{ status: orderStatus, note: body.note?.trim() || null }]
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { id: true, name: true, slug: true } } }
        },
        statusLog: { orderBy: { createdAt: 'asc' } }
      }
    });

    return json({ order: serializeOrder(order) });
  }

  if (request.method === 'GET' && segments[1] === 'products' && segments.length === 2) {
    const products = await prisma.product.findMany({
      include: await collectProductInclude(),
      orderBy: { createdAt: 'desc' }
    });

    return json({ products: products.map(serializeProduct) });
  }

  if (request.method === 'POST' && segments[1] === 'products' && segments.length === 2) {
    const body = await readJsonBody<{
      name: string;
      slug: string;
      description: string;
      price: number;
      discountPrice: number | null;
      categoryId: string;
      stock: number;
      sku: string;
      material: string;
      featured: boolean;
      imageUrls: string[];
      sizes: SizeOption[];
    }>(request);

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
        description: body.description.trim(),
        price: new Prisma.Decimal(body.price),
        discountPrice: body.discountPrice !== null && body.discountPrice !== undefined ? new Prisma.Decimal(body.discountPrice) : null,
        categoryId: body.categoryId,
        stock: asNumber(body.stock, 0),
        sku: body.sku.trim(),
        material: body.material.trim(),
        featured: Boolean(body.featured),
        images: {
          create: body.imageUrls.filter(Boolean).map((url, index) => ({ url, sortOrder: index }))
        },
        sizes: {
          create: body.sizes.filter((size) => sizeOptions.has(size)).map((size) => ({ size }))
        }
      },
      include: await collectProductInclude()
    });

    return json({ product: serializeProduct(product) });
  }

  if (request.method === 'PATCH' && segments[1] === 'products' && segments[2]) {
    const body = await readJsonBody<{
      name: string;
      slug: string;
      description: string;
      price: number;
      discountPrice: number | null;
      categoryId: string;
      stock: number;
      sku: string;
      material: string;
      featured: boolean;
      imageUrls: string[];
      sizes: SizeOption[];
    }>(request);

    const productId = segments[2];
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
        description: body.description.trim(),
        price: new Prisma.Decimal(body.price),
        discountPrice: body.discountPrice !== null && body.discountPrice !== undefined ? new Prisma.Decimal(body.discountPrice) : null,
        categoryId: body.categoryId,
        stock: asNumber(body.stock, 0),
        sku: body.sku.trim(),
        material: body.material.trim(),
        featured: Boolean(body.featured),
        images: {
          deleteMany: {},
          create: body.imageUrls.filter(Boolean).map((url, index) => ({ url, sortOrder: index }))
        },
        sizes: {
          deleteMany: {},
          create: body.sizes.filter((size) => sizeOptions.has(size)).map((size) => ({ size }))
        }
      },
      include: await collectProductInclude()
    });

    return json({ product: serializeProduct(product) });
  }

  if (request.method === 'DELETE' && segments[1] === 'products' && segments[2]) {
    const productId = segments[2];
    const orderItemExists = await prisma.orderItem.findFirst({ where: { productId } });
    if (orderItemExists) {
      throw new ApiError(400, 'Cannot delete a product that already exists in an order');
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId } }),
      prisma.review.deleteMany({ where: { productId } }),
      prisma.wishlistItem.deleteMany({ where: { productId } }),
      prisma.productImage.deleteMany({ where: { productId } }),
      prisma.productSizeOption.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } })
    ]);

    return json({ ok: true });
  }

  if (request.method === 'GET' && segments[1] === 'categories' && segments.length === 2) {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } }
    });

    return json({ categories: categories.map(serializeCategory) });
  }

  if (request.method === 'POST' && segments[1] === 'categories' && segments.length === 2) {
    const body = await readJsonBody<{ name: string; slug: string }>(request);
    const category = await prisma.category.create({
      data: { name: body.name.trim(), slug: body.slug.trim() },
      include: { _count: { select: { products: true } } }
    });
    return json({ category: serializeCategory(category) });
  }

  if (request.method === 'PATCH' && segments[1] === 'categories' && segments[2]) {
    const body = await readJsonBody<{ name: string; slug: string }>(request);
    const category = await prisma.category.update({
      where: { id: segments[2] },
      data: { name: body.name.trim(), slug: body.slug.trim() },
      include: { _count: { select: { products: true } } }
    });
    return json({ category: serializeCategory(category) });
  }

  if (request.method === 'DELETE' && segments[1] === 'categories' && segments[2]) {
    const productExists = await prisma.product.findFirst({ where: { categoryId: segments[2] } });
    if (productExists) {
      throw new ApiError(400, 'Cannot delete a category that still has products');
    }

    await prisma.category.delete({ where: { id: segments[2] } });
    return json({ ok: true });
  }

  if (request.method === 'GET' && segments[1] === 'users' && segments.length === 2) {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true, reviews: true } } }
    });

    return json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        _count: { orders: user._count.orders, reviews: user._count.reviews }
      }))
    });
  }

  if (request.method === 'PATCH' && segments[1] === 'users' && segments[2] && segments[3] === 'role') {
    const body = await readJsonBody<{ role: Role }>(request);
    const role = body.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    const user = await prisma.user.update({ where: { id: segments[2] }, data: { role } });
    return json({ user: serializeSessionUser(user) });
  }

  if (request.method === 'GET' && segments[1] === 'reviews' && segments.length === 2) {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } }
      }
    });

    return json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: review.user,
        product: review.product
      }))
    });
  }

  if (request.method === 'DELETE' && segments[1] === 'reviews' && segments[2]) {
    await prisma.review.delete({ where: { id: segments[2] } });
    return json({ ok: true });
  }

  if (request.method === 'GET' && segments[1] === 'settings' && segments[2] === 'homepage') {
    return json({ settings: await getHomepageSettings() });
  }

  if (request.method === 'PUT' && segments[1] === 'settings' && segments[2] === 'homepage') {
    const body = await readJsonBody<Record<string, string>>(request);
    const entries = Object.entries(body).filter(([, value]) => typeof value === 'string');

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { group_key: { group: 'homepage', key } },
          update: { value: JSON.stringify(value) },
          create: { group: 'homepage', key, value: JSON.stringify(value) }
        })
      )
    );

    return json({ settings: await getHomepageSettings() });
  }

  if (request.method === 'DELETE' && segments[1] === 'reviews' && segments[2]) {
    await prisma.review.delete({ where: { id: segments[2] } });
    return json({ ok: true });
  }

  if (request.method === 'GET' && segments[1] === 'settings' && segments[2] === 'homepage') {
    return json({ settings: await getHomepageSettings() });
  }

  if (request.method === 'PUT' && segments[1] === 'settings' && segments[2] === 'homepage') {
    const body = await readJsonBody<Record<string, string>>(request);
    const entries = Object.entries(body).filter(([, value]) => typeof value === 'string');

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { group_key: { group: 'homepage', key } },
          update: { value: JSON.stringify(value) },
          create: { group: 'homepage', key, value: JSON.stringify(value) }
        })
      )
    );

    return json({ settings: await getHomepageSettings() });
  }

  throw new ApiError(404, 'Admin route not found');
}

