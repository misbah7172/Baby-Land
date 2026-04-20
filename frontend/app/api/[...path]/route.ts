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

  const contentType = response.headers.get('content-type') || 'application/json';
  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'content-type': contentType }
  });
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
