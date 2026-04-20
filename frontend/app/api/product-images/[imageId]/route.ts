import { NextRequest, NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'bom1';

export async function GET(request: NextRequest, context: { params: Promise<{ imageId: string }> }) {
  const params = await context.params;
  const backendBase = getBackendApiBase();
  const targetUrl = new URL(`/api/product-images/${params.imageId}`, backendBase);
  const response = await fetch(targetUrl, { method: request.method });
  const body = await response.arrayBuffer();

  const proxied = new NextResponse(body, { status: response.status });
  const contentType = response.headers.get('content-type');
  if (contentType) {
    proxied.headers.set('content-type', contentType);
  }
  const cacheControl = response.headers.get('cache-control');
  if (cacheControl) {
    proxied.headers.set('cache-control', cacheControl);
  }

  return proxied;
}
