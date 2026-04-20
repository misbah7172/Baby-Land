import { NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';
import { getCachedJson, setCachedJson } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Categories are read-only data, so Next can safely cache the backend response in Redis.
  const cacheKey = 'categories:list';
  const cached = await getCachedJson<{ categories: unknown[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const backendBase = getBackendApiBase();
  const response = await fetch(new URL('/api/categories', backendBase));
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(payload || { message: 'Unable to load categories' }, { status: response.status });
  }

  await setCachedJson(cacheKey, payload, 300);
  return NextResponse.json(payload);
}