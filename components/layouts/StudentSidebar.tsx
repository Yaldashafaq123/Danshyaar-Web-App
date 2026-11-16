// components/layouts/StudentSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  User,
  BookOpen,
  Calendar,
  ClipboardList,
  Video,
  Clock,
  Award,
  FileText,
  Star,
  Trophy,
  Library,
  MessageSquare,
  Target,
  DollarSign,
  Download,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { label: 'داشبورد', href: '/students', icon: LayoutDashboard },
  {
    label: 'پروفایل من',
    icon: User,
    children: [
      { label: 'اطلاعات شخصی', href: '/students/profile', icon: User },
      { label: 'کارت شناسایی', href: '/students/profile/id-card', icon: FileText },
    ],
  },
  { label: 'مضامین من', href: '/students/subjects', icon: BookOpen },
  { label: 'دوره‌های من', href: '/students/courses', icon: Video },
  {
    label: 'تقسیم اوقات',
    icon: Calendar,
    children: [
      { label: 'هفتگی', href: '/students/timetable', icon: Calendar },
      { label: 'امروز', href: '/students/timetable/today', icon: Clock },
    ],
  },
  { label: 'کارخانگی', href: '/students/assignments', icon: ClipboardList },
  { label: 'آموزش آنلاین', href: '/students/learning', icon: Video },
  {
    label: 'حضور و غیاب',
    icon: Clock,
    children: [
      { label: 'خلاصه', href: '/students/attendance', icon: Clock },
      { label: 'گزارش تفصیلی', href: '/students/attendance/report', icon: FileText },
    ],
  },
  {
    label: 'امتحانات',
    icon: ClipboardList,
    children: [
      { label: 'برنامه امتحانات', href: '/students/exams', icon: Calendar },
      { label: 'نتایج', href: '/students/exams/results', icon: Award },
    ],
  },
  { label: 'کارنامه', href: '/students/reports', icon: FileText },
  {
    label: 'ارزیابی من',
    icon: Star,
    children: [
      { label: 'ارزیابی تحصیلی', href: '/students/evaluation', icon: Star },
      { label: 'بازخورد معلمان', href: '/students/feedback', icon: MessageSquare },
    ],
  },
  { label: 'دستاوردها', href: '/students/achievements', icon: Trophy },
  { label: 'کتابخانه', href: '/students/library', icon: Library },
  { label: 'پیام‌ها', href: '/students/messages', icon: MessageSquare },
  {
    label: 'اهداف و پیشرفت',
    icon: Target,
    children: [
      { label: 'اهداف من', href: '/students/goals', icon: Target },
      { label: 'تحلیل عملکرد', href: '/students/analytics', icon: TrendingUp },
      { label: 'سفر تحصیلی', href: '/students/journey', icon: Sparkles },
    ],
  },
  { label: 'مالی (فقط مشاهده)', href: '/students/finance', icon: DollarSign },
  { label: 'دانلودها', href: '/students/downloads', icon: Download },
  { label: 'اطلاعیه‌ها', href: '/students/notifications', icon: Bell },
  { label: 'تنظیمات', href: '/students/settings', icon: Settings },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'پروفایل من': true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/students') return pathname === '/students';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-500" size={20} />
          <h2 className="text-lg font-bold text-gray-900">
            پورتال شاگرد
          </h2>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          مکتب عصرا — یادگیری هوشمند
        </p>
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
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
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
                              ? 'bg-indigo-100 text-indigo-700 font-medium'
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
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
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