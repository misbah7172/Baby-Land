import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { env } from './env';

export type JwtUser = {
  id: string;
  role: 'CUSTOMER' | 'ADMIN';
  email: string;
};

export function signAccessToken(user: JwtUser) {
  return jwt.sign(user, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(user: JwtUser) {
  return jwt.sign(user, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUser;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUser;
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}