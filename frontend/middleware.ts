import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/admin'];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Keep protected routes behind the JWT cookie that the backend sets.
  const accessToken = request.cookies.get('access_token')?.value;
  if (!accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};