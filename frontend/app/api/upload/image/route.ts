import { NextRequest, NextResponse } from 'next/server';

import { dispatchApiRequest, requireAdminAccess } from '@/lib/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAdminAccess(request);
    return dispatchApiRequest(request, ['upload', 'image']);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    const status = typeof (error as { status?: number } | null)?.status === 'number' ? (error as { status: number }).status : 500;
    return NextResponse.json({ message }, { status });
  }
}