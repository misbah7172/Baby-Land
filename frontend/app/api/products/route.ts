import { NextRequest, NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Product queries stay in the backend; avoid extra proxy-layer cache to keep admin edits visible immediately.

  const backendBase = getBackendApiBase();
  const backendUrl = new URL('/api/products', backendBase);
  request.nextUrl.searchParams.forEach((value, key) => backendUrl.searchParams.append(key, value));

  const response = await fetch(backendUrl);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(payload || { message: 'Unable to load products' }, { status: response.status });
  }

  return NextResponse.json(payload);
}