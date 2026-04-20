import { createHash } from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';
import { getCachedJson, setCachedJson } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildCacheKey(query: URLSearchParams) {
  const entries = Array.from(query.entries()).sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    if (leftKey === rightKey) {
      return leftValue.localeCompare(rightValue);
    }

    return leftKey.localeCompare(rightKey);
  });

  return `products:list:${createHash('md5').update(JSON.stringify(entries)).digest('hex')}`;
}

export async function GET(request: NextRequest) {
  // Product queries stay in the backend; Next only adds read-through Redis caching.
  const cacheKey = buildCacheKey(request.nextUrl.searchParams);
  const cached = await getCachedJson<{ products: unknown[]; total: number; page: number; limit: number }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const backendBase = getBackendApiBase();
  const backendUrl = new URL('/api/products', backendBase);
  request.nextUrl.searchParams.forEach((value, key) => backendUrl.searchParams.append(key, value));

  const response = await fetch(backendUrl);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(payload || { message: 'Unable to load products' }, { status: response.status });
  }

  await setCachedJson(cacheKey, payload, 300);
  return NextResponse.json(payload);
}