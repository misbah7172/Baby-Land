import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';

import { authRequired, optionalAuth, refreshTokenUser, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { createTokenPair, registerUser, revokeRefreshToken, rotateRefreshToken, validateStoredRefreshToken, verifyPassword } from '../services/auth.service';
import { clearAuthCookies, setAuthCookies } from '../utils/http';
import { validate } from '../middleware/validate';

export const authRouter = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

const firebaseSessionSchema = z.object({
  body: z.object({
    idToken: z.string().min(20)
  })
});

type FirebaseLookupResponse = {
  users?: Array<{
    localId?: string;
    email?: string;
    displayName?: string;
  }>;
};

async function lookupFirebaseUser(idToken: string) {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Firebase API key not configured');
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  if (!response.ok) {
    throw new Error('Invalid Firebase token');
  }

  const data = (await response.json()) as FirebaseLookupResponse;
  const user = data.users?.[0];
  if (!user?.localId || !user.email) {
    throw new Error('Firebase user profile incomplete');
  }

  return {
    uid: user.localId,
    email: user.email,
    name: user.displayName || user.email.split('@')[0] || 'Google User'
  };
}

authRouter.post('/register', validate(registerSchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof registerSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const user = await registerUser(body);
    const tokenPair = await createTokenPair({ id: user.id, email: user.email, role: user.role });
    setAuthCookies(response, tokenPair.accessToken, tokenPair.refreshToken);

    response.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', validate(loginSchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof loginSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const user = await verifyPassword(body.email, body.password);
    if (!user) {
      response.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const tokenPair = await createTokenPair({ id: user.id, email: user.email, role: user.role });
    setAuthCookies(response, tokenPair.accessToken, tokenPair.refreshToken);

    response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/refresh', async (request, response, next) => {
  try {
    const refreshToken = request.cookies.refresh_token as string | undefined;
    if (!refreshToken) {
      response.status(401).json({ message: 'Refresh token missing' });
      return;
    }

    const user = refreshTokenUser(refreshToken);
    const storedUser = await validateStoredRefreshToken(refreshToken);
    if (!storedUser || storedUser.id !== user.id) {
      response.status(401).json({ message: 'Refresh token revoked or expired' });
      return;
    }

    const tokenPair = await rotateRefreshToken(user, refreshToken);
    setAuthCookies(response, tokenPair.accessToken, tokenPair.refreshToken);

    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', async (request, response, next) => {
  try {
    const refreshToken = request.cookies.refresh_token as string | undefined;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    clearAuthCookies(response);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/firebase-session', validate(firebaseSessionSchema), async (request, response, next) => {
  try {
    const body = (request as import('express').Request & { validated?: z.infer<typeof firebaseSessionSchema> }).validated?.body;
    if (!body) {
      response.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const firebaseUser = await lookupFirebaseUser(body.idToken);

    const generatedPasswordHash = await bcrypt.hash(`firebase:${firebaseUser.uid}`, 10);
    const user = await prisma.user.upsert({
      where: { email: firebaseUser.email },
      update: { name: firebaseUser.name },
      create: {
        name: firebaseUser.name,
        email: firebaseUser.email,
        passwordHash: generatedPasswordHash,
        role: Role.CUSTOMER
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    const tokenPair = await createTokenPair({ id: user.id, email: user.email, role: user.role });
    setAuthCookies(response, tokenPair.accessToken, tokenPair.refreshToken);

    response.json({ user });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', optionalAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    if (!request.user) {
      response.json({ user: null });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true, updatedAt: true }
    });

    response.json({ user });
  } catch (error) {
    next(error);
  }
});