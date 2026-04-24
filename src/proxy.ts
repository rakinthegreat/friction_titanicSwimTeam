import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session');
  console.log(session)
  const path = request.nextUrl.pathname;

  const isAuthRoute = path.startsWith('/login');

  // Only /profile is strictly protected
  const isProtectedRoute = path.startsWith('/profile');

  // If trying to access a protected route without being logged in
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If already logged in and trying to access the login page
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on these specific routes
  matcher: ['/', '/profile/:path*', '/login/:path*'],
};
