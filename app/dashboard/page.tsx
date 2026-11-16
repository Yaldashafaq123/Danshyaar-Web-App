'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardRoute, getUserRole } from '@/lib/auth/roles';
import { useAuthStore } from '@/lib/store/authStore';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, token, hasHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    const role =
      token && user?.isActive === true ? getUserRole(user) : null;
    if (role) {
      router.replace(getDashboardRoute(role));
      return;
    }
    if (token || user) logout();
    router.replace('/login');
  }, [hasHydrated, logout, router, token, user]);

  return (
    <main className="flex min-h-screen items-center justify-center" dir="rtl">
      <p className="text-gray-600">در حال انتقال به داشبورد شما...</p>
    </main>
  );
}