import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                      path === '/' || 
                      path === '/forgot-password' || 
                      path === '/verify-otp' || 
                      path === '/reset-password';

  // Get the session token from the cookies
  const token = request.cookies.get('auth-token')?.value || 
                request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  // Remove console log statements for production builds
  // console.log("Path:", path, "Token:", token ? "exists" : "missing");

  // Redirect logic
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public|models).*)'],
};