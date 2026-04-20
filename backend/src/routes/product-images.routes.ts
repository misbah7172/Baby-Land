import { Router } from 'express';

import { prisma } from '../lib/prisma';

export const productImagesRouter = Router();

let imageAssetTableReady: Promise<void> | null = null;

async function ensureImageAssetTable() {
  if (!imageAssetTableReady) {
    imageAssetTableReady = prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ImageAsset (
        id VARCHAR(191) PRIMARY KEY,
        fileName VARCHAR(255) NOT NULL,
        mimeType VARCHAR(255) NOT NULL,
        data LONGBLOB NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
      )
    `).then(() => undefined);
  }

  return imageAssetTableReady;
}

productImagesRouter.get('/:imageId', async (request, response, next) => {
  try {
    await ensureImageAssetTable();

    const rows = await prisma.$queryRawUnsafe<Array<{ fileName: string; mimeType: string; data: Buffer }>>(
      'SELECT fileName, mimeType, data FROM ImageAsset WHERE id = ? LIMIT 1',
      request.params.imageId
    );

    const asset = rows[0];
    if (!asset) {
      response.status(404).json({ message: 'Image not found' });
      return;
    }

    response.setHeader('Content-Type', asset.mimeType);
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    response.setHeader('Content-Disposition', `inline; filename="${asset.fileName}"`);
    response.send(Buffer.isBuffer(asset.data) ? asset.data : Buffer.from(asset.data));
  } catch (error) {
    next(error);
  }
});
