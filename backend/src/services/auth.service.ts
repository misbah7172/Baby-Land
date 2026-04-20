import bcrypt from 'bcryptjs';

import { prisma } from '../lib/prisma';
import { hashToken, signAccessToken, signRefreshToken, JwtUser } from '../lib/jwt';

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
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
}

export async function verifyPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

export async function createTokenPair(user: JwtUser) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(user: JwtUser, token: string) {
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() }
  });

  return createTokenPair(user);
}

export async function validateStoredRefreshToken(token: string) {
  const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: storedToken.userId },
    select: { id: true, email: true, role: true }
  });
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() }
  });
}