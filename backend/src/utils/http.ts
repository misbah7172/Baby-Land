import { Response } from 'express';

export function setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
  const secure = process.env.COOKIE_SECURE === 'true';
  const baseOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/'
  };

  response.cookie('access_token', accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000
  });

  response.cookie('refresh_token', refreshToken, {
    ...baseOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookies(response: Response) {
  response.clearCookie('access_token', { path: '/' });
  response.clearCookie('refresh_token', { path: '/' });
}