import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/'];

// Role-based route protection
const roleRoutes: Record<string, string> = {
  '/dashboard/seeker': 'seeker',
  '/dashboard/company': 'company',
  '/dashboard/admin': 'admin',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const sessionCookie = request.cookies.get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT);
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role-based access
  const userRole = request.cookies.get('user_role')?.value;
  
  // If accessing a protected role route without proper role cookie, redirect
  for (const [route, requiredRole] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      // No role cookie set - can't determine access, allow but warn
      if (!userRole) {
        console.warn(`[Middleware] No user_role cookie for ${pathname}`);
        return NextResponse.next();
      }
      
      // Wrong role - redirect to appropriate dashboard
      if (userRole !== requiredRole) {
        console.log(`[Middleware] Role mismatch: user=${userRole}, required=${requiredRole}`);
        const redirectUrl = userRole === 'seeker' ? '/dashboard/seeker' : 
                           userRole === 'company' ? '/dashboard/company' : 
                           userRole === 'admin' ? '/dashboard/admin' : '/login';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/jobs/:path*'],
};
