import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  const isAdminPage = nextUrl.pathname.startsWith('/admin');
  const isStaffPage = nextUrl.pathname.startsWith('/staff');
  const isMemberPage = nextUrl.pathname.startsWith('/dashboard');

  if (isAuthPage) {
    if (isLoggedIn) {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', nextUrl));
      } else if (role === 'LIBRARIAN') {
        return NextResponse.redirect(new URL('/staff', nextUrl));
      } else {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
    }
    return NextResponse.next();
  }

  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  if (isStaffPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (role !== 'LIBRARIAN' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  if (isMemberPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password/:path*',
    '/dashboard/:path*',
    '/staff/:path*',
    '/admin/:path*',
  ],
};
