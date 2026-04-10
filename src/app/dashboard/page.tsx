'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Redirect to role-specific dashboard
    if (role === 'seeker') {
      router.replace('/dashboard/seeker');
    } else if (role === 'company') {
      router.replace('/dashboard/company');
    } else if (role === 'admin') {
      router.replace('/dashboard/admin');
    } else {
      router.replace('/login');
    }
  }, [role, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full" />
    </div>
  );
}
