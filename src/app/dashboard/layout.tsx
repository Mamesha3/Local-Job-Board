'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Role-based route mapping
const roleRoutes: Record<string, string> = {
  '/dashboard/seeker': 'seeker',
  '/dashboard/company': 'company',
  '/dashboard/admin': 'admin',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't check while auth is loading
    if (isLoading) return;

    // If no role, redirect to login
    if (!role) {
      router.push('/login');
      return;
    }

    // Check if current route matches user role
    for (const [route, requiredRole] of Object.entries(roleRoutes)) {
      if (pathname?.startsWith(route) && role !== requiredRole) {
        console.log(`[DashboardLayout] Role mismatch: user=${role}, required=${requiredRole}`);
        
        // Redirect to user's own dashboard
        const redirectUrl = 
          role === 'seeker' ? '/dashboard/seeker' :
          role === 'company' ? '/dashboard/company' :
          role === 'admin' ? '/dashboard/admin' : '/login';
        
        router.push(redirectUrl);
        return;
      }
    }
  }, [role, isLoading, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
