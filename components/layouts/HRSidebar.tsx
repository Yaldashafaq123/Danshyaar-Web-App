// components/layouts/HRSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Calendar,
  DollarSign,
  Award,
  FileText,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Bell,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  Building2,
  Briefcase,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { label: 'داشبورد منابع بشری', href: '/hr', icon: LayoutDashboard },
  {
    label: 'کارمندان',
    icon: Users,
    children: [
      { label: 'لیست کارمندان', href: '/hr/staff', icon: Users },
      { label: 'ثبت کارمند جدید', href: '/hr/staff/new', icon: UserPlus },
      { label: 'اسناد کارمندان', href: '/hr/documents', icon: FileText },
      { label: 'کارت‌های شناسایی', href: '/hr/id-cards', icon: CreditCard },
    ],
  },
  { label: 'بخش‌ها و پست‌ها', href: '/hr/departments', icon: Building2 },
  { label: 'استخدام', href: '/hr/recruitment', icon: Briefcase },
  {
    label: 'حضور و غیاب',
    icon: Clock,
    children: [
      { label: 'داشبورد حضور', href: '/hr/attendance', icon: Clock },
      { label: 'حضور امروز', href: '/hr/attendance/today', icon: Clock },
      { label: 'گزارش ماهانه', href: '/hr/attendance/report', icon: BarChart3 },
      { label: 'تاریخ مشخص', href: '/hr/attendance/by-date', icon: Calendar },
    ],
  },
  {
    label: 'رخصتی‌ها',
    icon: Calendar,
    children: [
      { label: 'درخواست‌ها', href: '/hr/leaves', icon: Calendar },
      { label: 'بیلانس رخصتی', href: '/hr/leaves/balance', icon: FileText },
    ],
  },
  {
    label: 'معاشات',
    icon: DollarSign,
    children: [
      { label: 'لیست معاشات', href: '/hr/salaries', icon: DollarSign },
      { label: 'ایجاد معاشات', href: '/hr/salaries/generate', icon: CreditCard },
    ],
  },
  {
    label: 'ارزیابی عملکرد',
    icon: Award,
    children: [
      { label: 'لیست ارزیابی‌ها', href: '/hr/evaluations', icon: Award },
      { label: 'ارزیابی جدید', href: '/hr/evaluations/new', icon: FileText },
    ],
  },
  { label: 'اخطارها و انتظام', href: '/hr/warnings', icon: AlertTriangle },
  {
    label: 'گزارشات',
    icon: BarChart3,
    children: [
      { label: 'داشبورد گزارشات', href: '/hr/reports', icon: BarChart3 },
      { label: 'گزارش حضور', href: '/hr/reports/attendance', icon: Clock },
    ],
  },
  { label: 'اطلاعیه‌ها', href: '/hr/notifications', icon: Bell },
  { label: 'تنظیمات', href: '/hr/settings', icon: Settings },
  { label: 'پروفایل', href: '/hr/profile', icon: User },
];

export default function HRSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    کارمندان: true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/hr') return pathname === '/hr';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Link
          href="/hr"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronRight size={16} />
          بازگشت به داشبورد منابع بشری
        </Link>
        <h2 className="mt-3 text-lg font-bold text-gray-900">
          منابع بشری
        </h2>
        <p className="text-xs text-gray-400">مدیریت کارمندان و پرسنل</p>
      </div>

      {/* Menu */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openGroups[item.label] ?? false;
          const active = isActive(item.href);

          if (hasChildren) {
            const groupActive = item.children!.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    groupActive
                      ? 'bg-pink-50 text-pink-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={18} />
                    {item.label}
                  </span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isOpen && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href!}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            childActive
                              ? 'bg-pink-100 text-pink-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <ChildIcon size={15} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}