import { randomUUID } from 'crypto';
import { mkdir, rename } from 'fs/promises';
import path from 'path';

import { Router } from 'express';
import { IncomingForm, type Fields, type Files, type File } from 'formidable';

import { env } from '../lib/env';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

export const uploadRouter = Router();

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

const uploadDirectory = path.resolve(process.cwd(), 'backend/public/uploads');

async function ensureUploadDirectory() {
  await mkdir(uploadDirectory, { recursive: true });
}

uploadRouter.post('/image', adminAccessRequired, async (request: AuthenticatedRequest, response, next) => {
  try {
    await ensureUploadDirectory();

    const form = new IncomingForm({
      multiples: false,
      keepExtensions: true,
      uploadDir: uploadDirectory,
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

      const fileName = `${randomUUID()}${selectedFile.originalFilename && path.extname(selectedFile.originalFilename) ? path.extname(selectedFile.originalFilename) : '.jpg'}`;
      const destinationPath = path.join(uploadDirectory, fileName);

      await rename(selectedFile.filepath, destinationPath);

      const publicUrl = `${env.BACKEND_URL}/uploads/${fileName}`;
      response.status(201).json({ url: publicUrl });
    });
  } catch (error) {
    next(error);
  }
});