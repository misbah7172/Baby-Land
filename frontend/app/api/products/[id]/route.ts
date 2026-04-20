import { NextRequest, NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';
import { getCachedJson, setCachedJson } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Product details are fetched from the backend and cached here for faster repeat reads.
  const params = await context.params;
  const cacheKey = `products:detail:${params.id}`;
  const cached = await getCachedJson<{ product: unknown }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const backendBase = getBackendApiBase();
  const response = await fetch(new URL(`/api/products/${encodeURIComponent(params.id)}`, backendBase));
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(payload || { message: 'Product not found' }, { status: response.status });
  }

  await setCachedJson(cacheKey, payload, 300);
  return NextResponse.json(payload);
}