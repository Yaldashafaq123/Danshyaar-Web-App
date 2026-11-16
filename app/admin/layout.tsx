'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { getUserRole } from '@/lib/auth/roles';
import { 
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCog,
  DollarSign,
  BookOpen,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Building2
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const { user, token, hasHydrated, logout } = useAuthStore();
  const hasAccess =
    hasHydrated &&
    !!token &&
    user?.isActive === true &&
    getUserRole(user) === 'admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (hasHydrated && !hasAccess) {
      router.replace('/login');
    }
  }, [hasAccess, hasHydrated, router]);

  if (!hasAccess) return null;

  const navItems = [
    { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
    { href: '/principal', label: 'آکادمیک', icon: BookOpen },
    // { href: '/admin/students', label: 'دانش‌آموزان', icon: GraduationCap },
    // { href: '/admin/teachers', label: 'معلمان', icon: Users },
    { href: '/finance', label: 'مالی', icon: DollarSign },
    { href: '/hr', label: 'منابع انسانی', icon: UserCog },
    { href: '/admin/settings', label: 'تنظیمات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="fixed top-0 right-0 left-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-2">
            <Building2 className="text-blue-600" size={28} />
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              مدیریت مکتب
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="جستجو..."
                className="bg-transparent border-none outline-none text-sm w-40 px-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {user?.fullName?.[0] || 'A'}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.fullName || 'مدیر'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-16 right-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="h-full overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = typeof window !== 'undefined' && 
              (window.location.pathname === item.href || 
               window.location.pathname.startsWith(item.href + '/'));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
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

          <div className="border-t my-4"></div>

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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:mr-64 mt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;