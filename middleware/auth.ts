// middleware/auth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes (no auth required)
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/'];

// Protected routes by role
const roleRoutes: Record<string, string[]> = {
  super_admin: ['/super-admin'],
  admin: ['/admin'],
  teacher: ['/teacher'],
  student: ['/student'],
  parent: ['/parent'],
  finance: ['/finance'],
  hr: ['/hr'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based routing
  // In production, decode JWT to check role
  // For now, we'll use a simplified check

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};