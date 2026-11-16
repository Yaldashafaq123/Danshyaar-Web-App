// app/admin/finance/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FinanceSidebar from '@/components/layouts/FinanceSidebar';
import RoleLogoutButton from '@/components/RoleLogoutButton';
import { useAuthStore } from '@/lib/store/authStore';
import { getUserRole } from '@/lib/auth/roles';
import { Bell, Search, User as UserIcon, DollarSign } from 'lucide-react';

interface FinanceLayoutProps {
  children: ReactNode;
}

export default function FinanceLayout({ children }: FinanceLayoutProps) {
  const router = useRouter();
  const { user, token, hasHydrated } = useAuthStore();
  const role = getUserRole(user);
  const hasAccess =
    hasHydrated &&
    !!token &&
    user?.isActive === true &&
    (role === 'finance' || role === 'admin');

  useEffect(() => {
    if (hasHydrated && !hasAccess) {
      router.replace('/login');
    }
  }, [hasAccess, hasHydrated, router]);

  if (!hasAccess) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <FinanceSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={22} />
              <span className="font-semibold text-gray-900 hidden sm:block">
                مدیریت مالی
              </span>
            </div>
            <div className="relative hidden md:block ml-6">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="جستجوی سریع..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <Link
              href="/finance/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || 'کاربر'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'ADMIN' ? 'مدیر سیستم' : 'مسئول مالی'}
                </p>
              </div>
            </Link>
            <RoleLogoutButton />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}