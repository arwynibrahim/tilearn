import { type NextRequest, NextResponse } from 'next/server';

// Next.js 16: `middleware.ts` is replaced by `proxy.ts` (Node.js runtime).
// Keep this thin - redirects/rewrites only, no heavy DB or JWT verification.
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/super-admin', '/learn'];
const AUTH_ONLY_PATHS = ['/login', '/register'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read token from cookie (set on login) - client-side Zustand handles the rest
  const token = req.cookies.get('accessToken')?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
