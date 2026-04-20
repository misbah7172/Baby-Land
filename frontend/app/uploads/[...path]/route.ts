import { NextRequest, NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  const filePath = params.path.join('/');
  const backendBase = getBackendApiBase();
  const targetUrl = new URL(`/uploads/${filePath}`, backendBase);

  const response = await fetch(targetUrl, { method: 'GET' });
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
