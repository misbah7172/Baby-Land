import { NextFunction, Response } from 'express';

import { JwtUser, verifyAccessToken, verifyRefreshToken } from '../lib/jwt';

export type AuthenticatedRequest = import('express').Request & { user?: JwtUser };

export function authRequired(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const bearer = request.header('authorization');
  const cookieToken = request.cookies.access_token as string | undefined;
  const token = cookieToken ?? (bearer?.startsWith('Bearer ') ? bearer.slice(7) : undefined);

  if (!token) {
    return response.status(401).json({ message: 'Authentication required' });
  }

  try {
    request.user = verifyAccessToken(token);
    return next();
  } catch {
    return response.status(401).json({ message: 'Invalid or expired access token' });
  }
}

export function optionalAuth(request: AuthenticatedRequest, _response: Response, next: NextFunction) {
  const token = request.cookies.access_token as string | undefined;

  if (!token) {
    return next();
  }

  try {
    request.user = verifyAccessToken(token);
  } catch {
    delete request.user;
  }

  return next();
}

export function refreshTokenUser(token: string) {
  return verifyRefreshToken(token);
}