'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function RoleLogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <button
      type="button"
      onClick={() => {
        logout();
        router.replace('/login');
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
    >
      <LogOut size={16} />
      خروج
    </button>
  );
}
