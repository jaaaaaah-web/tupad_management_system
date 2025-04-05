import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';

export async function GET(request) {
  const session = await auth();
  
  // Get all cookies from the request
  const cookies = request.cookies.getAll();
  
  return NextResponse.json({
    message: 'Cookie debug information',
    cookiesPresent: cookies.length > 0,
    cookies: cookies.map(c => ({ name: c.name, value: c.name.includes('next-auth') ? '[REDACTED]' : c.value })),
    isAuthenticated: !!session,
    session: session ? { 
      user: session.user,
      expires: session.expires 
    } : null
  });
}