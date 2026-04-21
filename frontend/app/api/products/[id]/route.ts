import { NextRequest, NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Keep product details fresh so admin edits appear immediately.
  const params = await context.params;

  const backendBase = getBackendApiBase();
  const response = await fetch(new URL(`/api/products/${encodeURIComponent(params.id)}`, backendBase));
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(payload || { message: 'Product not found' }, { status: response.status });
  }

  return NextResponse.json(payload);
}