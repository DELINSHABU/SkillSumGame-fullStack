import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccount = request.cookies.has('sid');
  // Guest mode plays fully offline from local data — no server session exists.
  // Guests still may open login/signup to upgrade to a real account.
  const isGuest = request.cookies.has('skillsum-guest');
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasAccount && !isGuest && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (hasAccount && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except api proxy, static assets, and files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
