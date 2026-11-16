/* eslint-disable @typescript-eslint/no-explicit-any */
// components/layouts/DashboardLayout/index.tsx
'use client';

import { ReactNode, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  Users2, 
  Settings, 
  Menu, 
  X,
  LogOut,
  School,
  Calendar,
  MessageSquare,
  Bus,
  Library,
  BarChart,
  type LucideIcon
} from 'lucide-react';

// Define navigation item type
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items based on role
  const navItems = useMemo(() => {
    // Get the role from user, default to empty string if undefined
    const role = user?.userType || user?.role?.toLowerCase() || '';
    
    // Common items for all users
    const commonItems: NavItem[] = [
      { href: '/dashboard', label: 'داشبورد', icon: Home },
    ];

    // Role-specific items
    const roleItemsMap: Record<string, NavItem[]> = {
      super_admin: [
        { href: '/super-admin/schools', label: 'مدارس', icon: School },
        { href: '/super-admin/settings', label: 'تنظیمات سیستم', icon: Settings },
        { href: '/admin', label: 'مدیریت کاربران', icon: Users },
      ],
      admin: [
        { href: '/students', label: 'دانش‌آموزان', icon: GraduationCap },
        { href: '/teachers', label: 'معلمان', icon: Users2 },
        { href: '/academics', label: 'آکادمیک', icon: BookOpen },
        { href: '/finance', label: 'مالی', icon: DollarSign },
        { href: '/hr', label: 'منابع انسانی', icon: Users2 },
        { href: '/library', label: 'کتابخانه', icon: Library },
        { href: '/transport', label: 'ترانسپورت', icon: Bus },
        { href: '/communication', label: 'ارتباطات', icon: MessageSquare },
        { href: '/settings', label: 'تنظیمات', icon: Settings },
      ],
      teacher: [
        { href: '/teachers/attendance', label: 'حضور و غیاب', icon: Calendar },
        { href: '/teachers/grades', label: 'نمرات', icon: BarChart },
        { href: '/teachers/assignments', label: 'تکالیف', icon: BookOpen },
        { href: '/teachers/exams', label: 'امتحانات', icon: GraduationCap },
        { href: '/teachers/timetable', label: 'جدول زمانی', icon: Calendar },
      ],
      student: [
        { href: '/students/grades', label: 'نمرات', icon: BarChart },
        { href: '/students/attendance', label: 'حضور و غیاب', icon: Calendar },
        { href: '/students/assignments', label: 'تکالیف', icon: BookOpen },
        { href: '/students/timetable', label: 'جدول زمانی', icon: Calendar },
        { href: '/students/fees', label: 'شهریه', icon: DollarSign },
      ],
      parent: [
        { href: '/parents/children', label: 'فرزندان', icon: Users },
        { href: '/parents/fees', label: 'شهریه', icon: DollarSign },
        { href: '/parents/messages', label: 'پیام‌ها', icon: MessageSquare },
      ],
      finance: [
        { href: '/finance/fees', label: 'شهریه', icon: DollarSign },
        { href: '/finance/salaries', label: 'حقوق', icon: Users2 },
        { href: '/finance/expenses', label: 'مصارف', icon: BarChart },
        { href: '/finance/reports', label: 'گزارشات', icon: BookOpen },
      ],
      hr: [
        { href: '/hr/staff', label: 'کارمندان', icon: Users2 },
        { href: '/hr/attendance', label: 'حضور و غیاب', icon: Calendar },
        { href: '/hr/leave', label: 'مرخصی', icon: Calendar },
        { href: '/hr/evaluations', label: 'ارزیابی', icon: BarChart },
      ],
    };

    // Get role items or empty array if role not found
    const roleItems = roleItemsMap[role] || [];

    return [...commonItems, ...roleItems];
  }, [user]);

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">سیستم مدیریت مکاتب</h1>
            <p className="text-xs text-gray-500 mt-1">{user?.fullName || 'کاربر'}</p>
            <span className="text-xs text-gray-400">{user?.role || ''}</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:mr-64 min-h-screen">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;