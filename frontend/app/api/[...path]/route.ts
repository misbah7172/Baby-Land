import { NextRequest, NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getForwardHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.delete('connection');
  return headers;
}

async function proxyToBackend(request: NextRequest, path: string[]) {
  try {
    // Anything outside the lightweight Next routes is forwarded to the Express backend.
    const backendBase = getBackendApiBase();
    const targetUrl = new URL(`/api/${path.join('/')}`, backendBase);
    targetUrl.search = request.nextUrl.search;

    const requestBody = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: getForwardHeaders(request),
      ...(requestBody ? { body: requestBody } : {})
    });

    const body = await response.arrayBuffer();
    const proxied = new NextResponse(body, {
      status: response.status
    });

    // Preserve key backend headers (including auth/cart cookie updates).
    const contentType = response.headers.get('content-type');
    if (contentType) {
      proxied.headers.set('content-type', contentType);
    }
    const setCookies = (response.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() || [];
    if (setCookies.length > 0) {
      for (const cookie of setCookies) {
        proxied.headers.append('set-cookie', cookie);
      }
    } else {
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        proxied.headers.set('set-cookie', setCookie);
      }
    }

    return proxied;
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { message: 'Backend API unavailable or misconfigured' },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return proxyToBackend(request, params.path || []);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return proxyToBackend(request, params.path || []);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return proxyToBackend(request, params.path || []);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return proxyToBackend(request, params.path || []);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return proxyToBackend(request, params.path || []);
}
