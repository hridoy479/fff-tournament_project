import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('__session'); // Assuming Firebase ID token is stored in a cookie named __session
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication or email verification
  const publicPaths = ['/login', '/signup', '/verify-email', '/auth/action', '/']; // Add other public paths as needed

  // If the path is public, allow access
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let isEmailVerified = false;
  try {
    const response = await fetch(new URL('/api/user/status', request.url), {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      isEmailVerified = userData.emailVerified;
    } else {
      // If status API fails, assume not verified or error, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (error) {
    console.error('Middleware user status fetch error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!isEmailVerified) {
    // If email is not verified, redirect to verify-email page
    // unless they are already on the verify-email page to avoid infinite redirects
    if (pathname !== '/verify-email') {
      return NextResponse.redirect(new URL('/verify-email', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)]'],
};
