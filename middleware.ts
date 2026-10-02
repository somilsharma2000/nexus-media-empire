import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight middleware — no auth import to avoid Edge Runtime conflicts.
// Auth is enforced at the route level via auth() in each protected API handler.
// The login redirect is handled here with a simple cookie check.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect the admin dashboard root — public frontends stay open
  if (pathname === '/' || pathname === '/dashboard') {
    const sessionToken =
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('__Secure-authjs.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static, _next/image, favicon.ico
     * - public frontends: /news, /crypto, /finance
     * - api routes (protected at handler level)
     * - admin login page
     */
    '/((?!_next/static|_next/image|favicon.ico|news|crypto|finance|admin/login|api|go).*)',
  ],
};
