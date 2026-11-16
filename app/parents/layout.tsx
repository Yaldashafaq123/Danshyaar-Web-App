'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/auth/roles';
import { useAuthStore } from '@/lib/store/authStore';

export default function ParentLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, token, hasHydrated } = useAuthStore();
  const hasAccess =
    hasHydrated &&
    !!token &&
    user?.isActive === true &&
    getUserRole(user) === 'parent';

  useEffect(() => {
    if (hasHydrated && !hasAccess) router.replace('/login');
  }, [hasAccess, hasHydrated, router]);

  if (!hasAccess) return null;

  return children;
}
