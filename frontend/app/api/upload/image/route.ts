import { NextRequest, NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const backendBase = getBackendApiBase();
    const targetUrl = new URL('/api/upload/image', backendBase);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: request.headers,
      body: await request.arrayBuffer()
    });

    const body = await response.arrayBuffer();
    const proxied = new NextResponse(body, { status: response.status });
    const contentType = response.headers.get('content-type');
    if (contentType) {
      proxied.headers.set('content-type', contentType);
    }

    return proxied;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}