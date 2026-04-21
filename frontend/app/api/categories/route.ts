import { NextResponse } from 'next/server';

import { getBackendApiBase } from '@/lib/backend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Keep category reads fresh so product counts update immediately after admin changes.

  const backendBase = getBackendApiBase();
  const response = await fetch(new URL('/api/categories', backendBase));
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(payload || { message: 'Unable to load categories' }, { status: response.status });
  }

  return NextResponse.json(payload);
}