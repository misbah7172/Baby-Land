import { Category, CartPayload, Product, SessionUser } from './types';

const isServerRuntime = !('window' in globalThis);

const apiBase =
  isServerRuntime
    ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type RequestWithCache = RequestInit & { cache?: 'default' | 'no-store' | 'force-cache' };

function getAdminHeaders() {
  return {
    'x-admin-email': process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
    'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || ''
  };
}

async function request<T>(path: string, init?: RequestWithCache): Promise<T> {
  const { cache, ...fetchInit } = { cache: 'no-store', ...init };
  
  const response = await fetch(`${apiBase}${path}`, {
    ...fetchInit,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(fetchInit?.headers || {})
    },
    cache
  } as any);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' })) as any;
    throw new Error(error.message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function getProducts(searchParams?: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const result = await request<{ products: Product[]; total: number; page: number; limit: number }>(`/api/products?${query.toString()}`, { cache: 'force-cache' });
  return result;
}

export async function getProduct(slug: string) {
  return request<{ product: Product }>(`/api/products/${slug}`, { cache: 'force-cache' });
}

export async function getCategories() {
  return request<{ categories: Category[] }>('/api/categories', { cache: 'force-cache' });
}

export async function getCart() {
  return request<{ cart: CartPayload }>('/api/cart');
}

export async function addToCart(payload: { productId: string; quantity: number; size?: string }) {
  return request<{ cart: CartPayload }>('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateCartItem(itemId: string, quantity: number) {
  return request<{ cart: CartPayload }>(`/api/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity })
  });
}

export async function removeCartItem(itemId: string) {
  return request<{ cart: CartPayload }>(`/api/cart/items/${itemId}`, { method: 'DELETE' });
}

export async function login(payload: { email: string; password: string }) {
  return request<{ user: SessionUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export async function register(payload: { name: string; email: string; password: string }) {
  return request<{ user: SessionUser }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function logout() {
  return request('/api/auth/logout', { method: 'POST' });
}

export async function getMe() {
  return request<{ user: SessionUser | null }>('/api/auth/me');
}

export async function checkout(payload: Record<string, string>) {
  return request('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getMyOrders() {
  return request<{
    orders: Array<{
      id: string;
      totalPrice: string;
      orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
      createdAt: string;
      items: Array<{
        id: string;
        productId: string;
        productName: string;
        quantity: number;
        price: string;
        imageUrl: string | null;
        size: string;
      }>;
      statusLog: Array<{
        id: string;
        status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
        note: string | null;
        createdAt: string;
      }>;
    }>;
  }>('/api/orders/me');
}

export async function getReviews(productId: string) {
  return request<{ reviews: Array<{ id: string; rating: number; comment: string | null; user: { name: string } }> }>(`/api/reviews/product/${productId}`);
}

export async function getPublicReviews(limit = 3) {
  return request<{ reviews: Array<{ id: string; rating: number; comment: string | null; user: { name: string }; product: { name: string; slug: string } }> }>(`/api/reviews?limit=${limit}`);
}

export async function addReview(productId: string, payload: { rating: number; comment?: string }) {
  return request(`/api/reviews/product/${productId}`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function getAdminAnalytics() {
  return request<{
    totalOrders: number;
    totalSales: string;
    topProducts: Array<{ productId: string; productName: string; _sum: { quantity: number | null } }>;
  }>('/api/admin/analytics', { headers: getAdminHeaders() });
}

export async function getHomepageSettings() {
  return request<{ settings: Record<string, unknown> }>('/api/settings/homepage');
}

export async function getAdminHomepageSettings() {
  return request<{ settings: Record<string, unknown> }>('/api/admin/settings/homepage', { headers: getAdminHeaders() });
}

export async function updateAdminHomepageSettings(payload: {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}) {
  return request<{ settings: Record<string, unknown> }>('/api/admin/settings/homepage', {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function getAdminOrders() {
  return request<{
    orders: Array<{
      id: string;
      orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
      totalPrice: string;
      createdAt: string;
      user: { name: string; email: string } | null;
      items: Array<{ id: string; productName: string; quantity: number; price: string }>;
    }>;
  }>('/api/admin/orders', { headers: getAdminHeaders() });
}

export async function getAdminProducts() {
  return request<{
    products: Product[];
  }>('/api/admin/products', { headers: getAdminHeaders() });
}

export async function updateAdminOrderStatus(orderId: string, payload: { orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; note?: string }) {
  return request(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function getAdminOrderDetail(orderId: string) {
  return request<{
    order: {
      id: string;
      orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
      totalPrice: string;
      createdAt: string;
      user: { id: string; name: string; email: string } | null;
      items: Array<{
        id: string;
        productName: string;
        quantity: number;
        price: string;
        product: { id: string; name: string; slug: string };
      }>;
      statusLog: Array<{
        id: string;
        status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
        note: string | null;
        createdAt: string;
      }>;
    };
  }>(`/api/admin/orders/${orderId}`, { headers: getAdminHeaders() });
}

export async function getAdminCategories() {
  return request<{ categories: Category[] }>('/api/admin/categories', { headers: getAdminHeaders() });
}

export async function createAdminCategory(payload: { name: string; slug: string }) {
  return request<{ category: Category }>('/api/admin/categories', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function deleteAdminCategory(categoryId: string) {
  return request(`/api/admin/categories/${categoryId}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
}

export async function createAdminProduct(payload: {
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
  sizes: Array<'NEWBORN' | 'M0_3' | 'M3_6' | 'M6_12' | 'M12_18' | 'M18_24' | 'ONE_SIZE'>;
}) {
  return request<{ product: Product }>('/api/admin/products', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function updateAdminProduct(productId: string, payload: {
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
  sizes: Array<'NEWBORN' | 'M0_3' | 'M3_6' | 'M6_12' | 'M12_18' | 'M18_24' | 'ONE_SIZE'>;
}) {
  return request<{ product: Product }>(`/api/admin/products/${productId}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function deleteAdminProduct(productId: string) {
  return request(`/api/admin/products/${productId}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
}

export async function uploadAdminImage(file: Blob, filename = 'upload.jpg') {
  const formData = new FormData();
  formData.append('file', file, filename);

  const response = await fetch(`${apiBase}/api/upload/image`, {
    method: 'POST',
    credentials: 'include',
    headers: getAdminHeaders(),
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' })) as { message?: string };
    throw new Error(error.message || 'Upload failed');
  }

  return response.json() as Promise<{ url: string }>;
}

export async function updateAdminCategory(categoryId: string, payload: { name: string; slug: string }) {
  return request<{ category: Category }>(`/api/admin/categories/${categoryId}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function getAdminUsers() {
  return request<{
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: 'CUSTOMER' | 'ADMIN';
      createdAt: string;
      _count: { orders: number; reviews: number };
    }>;
  }>('/api/admin/users', { headers: getAdminHeaders() });
}

export async function updateAdminUserRole(userId: string, role: 'CUSTOMER' | 'ADMIN') {
  return request(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ role })
  });
}

export async function getAdminReviews() {
  return request<{
    reviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      user: { id: string; name: string; email: string };
      product: { id: string; name: string; slug: string };
    }>;
  }>('/api/admin/reviews', { headers: getAdminHeaders() });
}

export async function deleteAdminReview(reviewId: string) {
  return request(`/api/admin/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
}