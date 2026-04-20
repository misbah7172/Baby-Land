import { Response } from 'express';

function getCookieDomain(rawDomain: string | undefined) {
  if (!rawDomain) {
    return undefined;
  }

  const normalized = rawDomain.trim().replace(/^https?:\/\//, '').split('/')[0];
  if (!normalized || normalized === 'localhost') {
    return undefined;
  }

  return normalized;
}

export function setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
  const secure = process.env.COOKIE_SECURE === 'true';
  const domain = getCookieDomain(process.env.COOKIE_DOMAIN);
  const baseOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    domain,
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