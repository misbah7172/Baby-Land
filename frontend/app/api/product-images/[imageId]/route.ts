import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: Promise<{ imageId: string }> }) {
  const params = await context.params;
  const asset = await prisma.imageAsset.findUnique({ where: { id: params.imageId } });

  if (!asset) {
    return NextResponse.json({ message: 'Image not found' }, { status: 404 });
  }

  return new NextResponse(asset.data, {
    headers: {
      'Content-Type': asset.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${asset.fileName}"`
    }
  });
}
