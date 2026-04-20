import { NextRequest } from 'next/server';

import { dispatchApiRequest } from '@/lib/server';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'bom1';

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return dispatchApiRequest(request, params.path || []);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return dispatchApiRequest(request, params.path || []);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return dispatchApiRequest(request, params.path || []);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return dispatchApiRequest(request, params.path || []);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return dispatchApiRequest(request, params.path || []);
}
