import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';

import { Router } from 'express';
import { IncomingForm, type Fields, type Files, type File } from 'formidable';

import { env } from '../lib/env';
import { prisma } from '../lib/prisma';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

export const uploadRouter = Router();

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

function hasEnvAdminCredentials(request: AuthenticatedRequest) {
  const adminEmail = request.header('x-admin-email');
  const adminPassword = request.header('x-admin-password');
  const validEmails = new Set([env.ADMIN_EMAIL, process.env.NEXT_PUBLIC_ADMIN_EMAIL].filter(Boolean));
  const validPasswords = new Set([env.ADMIN_PASSWORD, process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH].filter(Boolean));

  return Boolean(adminEmail && adminPassword && validEmails.has(adminEmail) && validPasswords.has(adminPassword));
}

function adminAccessRequired(request: AuthenticatedRequest, response: import('express').Response, next: import('express').NextFunction) {
  if (hasEnvAdminCredentials(request)) {
    next();
    return;
  }

  authRequired(request, response, () => {
    if (request.user?.role !== Role.ADMIN) {
      response.status(403).json({ message: 'Admin access required' });
      return;
    }

    next();
  });
}

uploadRouter.post('/image', adminAccessRequired, async (request: AuthenticatedRequest, response, next) => {
  try {
    const form = new IncomingForm({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024
    });

    form.parse(request, async (error: Error | null, _fields: Fields, files: Files) => {
      if (error) {
        next(error);
        return;
      }

      const file = files.file;
      const selectedFile = (Array.isArray(file) ? file[0] : file) as File | undefined;

      if (!selectedFile) {
        response.status(400).json({ message: 'Image file is required' });
        return;
      }

      const fileName = `${randomUUID()}-${selectedFile.originalFilename || 'upload.jpg'}`;
      const mimeType = selectedFile.mimetype || 'image/jpeg';
      const data = await readFile(selectedFile.filepath);
      const assetId = randomUUID();

      await ensureImageAssetTable();
      await prisma.$executeRawUnsafe(
        'INSERT INTO ImageAsset (id, fileName, mimeType, data, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3))',
        assetId,
        fileName,
        mimeType,
        data
      );

      response.status(201).json({ assetId, url: `/api/product-images/${assetId}` });
    });
  } catch (error) {
    next(error);
  }
});