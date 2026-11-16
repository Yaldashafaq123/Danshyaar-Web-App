// app/super-admin/layout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { getUserRole } from '@/lib/auth/roles';
import { 
  LayoutDashboard,
  School,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  Database,
  Activity,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  UserCog,
  FileText
} from 'lucide-react';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  const router = useRouter();
  const { user, token, hasHydrated, logout } = useAuthStore();
  const hasAccess =
    hasHydrated &&
    !!token &&
    user?.isActive === true &&
    getUserRole(user) === 'super_admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is super admin
  useEffect(() => {
    if (hasHydrated && !hasAccess) {
      router.replace('/login');
    }
  }, [hasAccess, hasHydrated, router]);

  if (!hasAccess) return null;

  const navItems = [
    { href: '/super-admin', label: 'داشبورد', icon: LayoutDashboard },
    { href: '/super-admin/schools', label: 'مدیریت مدارس', icon: School },
    { href: '/super-admin/users', label: 'مدیریت کاربران', icon: Users },
    { href: '/super-admin/subscriptions', label: 'اشتراک‌ها', icon: CreditCard },
    { href: '/super-admin/analytics', label: 'تحلیل‌ها', icon: BarChart3 },
    { href: '/super-admin/audit-logs', label: 'لاگ‌های سیستم', icon: FileText },
    { href: '/super-admin/system', label: 'مانیتورینگ', icon: Activity },
    { href: '/super-admin/settings', label: 'تنظیمات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left side - Mobile menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Center - Logo */}
          <div className="flex items-center gap-2">
            <School className="text-blue-600" size={28} />
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              ERP کنترل مرکزی
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در سیستم..."
                className="bg-transparent border-none outline-none text-sm w-48 px-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {user?.fullName?.[0] || 'S'}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.fullName || 'Super Admin'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 right-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="h-full overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  window.location.pathname === item.href
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="border-t my-4"></div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">خروج</span>
          </button>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:mr-64 mt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;