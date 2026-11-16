

// components/layouts/AcademicSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  Award,
  BarChart3,
  MessageSquare,
  User,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Trophy,
  Clock,
  FileText,
  UserCheck,
  Briefcase,
  Send,
  Home,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'داشبورد',
    href: '/principal',
    icon: LayoutDashboard,
  },
  {
    label: 'شاگردان',
    icon: GraduationCap,
    children: [
      { label: 'لیست شاگردان', href: '/principal/students', icon: Users },
      { label: 'ارتقاء صنوف', href: '/principal/students/promotion', icon: Award },
      { label: 'حضور و غیاب', href: '/principal/students/attendance', icon: Calendar },
      { label: 'انتظامی', href: '/principal/students/discipline', icon: AlertTriangle },
      { label: 'شاگردان در خطر', href: '/principal/students/at-risk', icon: AlertTriangle },
      { label: 'شاگردان برتر', href: '/principal/students/top-performers', icon: Trophy },
    ],
  },
  {
    label: 'معلمان',
    icon: Users,
    children: [
      { label: 'لیست معلمان', href: '/principal/teachers', icon: Users },
      { label: 'حضور معلمان', href: '/principal/teachers/attendance', icon: UserCheck },
      { label: 'درخواست‌های رخصتی', href: '/principal/teachers/leave', icon: Clock },
      { label: 'بار کاری', href: '/principal/teachers/workload', icon: Briefcase },
      { label: 'مقایسه معلمان', href: '/principal/teachers/comparison', icon: BarChart3 },
    ],
  },
  {
    label: 'امور اکادمیک',
    icon: BookOpen,
    children: [
      { label: 'سال تحصیلی', href: '/principal/academics/years', icon: Calendar },
      { label: 'مضامین', href: '/principal/academics/subjects', icon: BookOpen },
      { label: 'صنوف', href: '/principal/academics/classes', icon: Home },
    ],
  },
  {
    label: 'تقسیم اوقات',
    icon: Calendar,
    children: [
      { label: 'جدول زمانی', href: '/principal/timetable', icon: Calendar },
      { label: 'تقسیم صنوف', href: '/principal/academics/timetable/approval', icon: ClipboardList },
    ],
  },
  {
    label: 'امتحانات',
    icon: ClipboardList,
    children: [
      { label: 'لیست امتحانات', href: '/principal/exams', icon: ClipboardList },
      { label: 'نتایج', href: '/principal/exams/results', icon: FileText },
    ],
  },
  {
    label: 'ارزیابی معلمان',
    icon: Award,
    children: [
      { label: 'داشبورد ارزیابی', href: '/principal/evaluations', icon: Award },
      { label: 'قالب‌ها', href: '/principal/evaluations/templates', icon: FileText },
      { label: 'ارزیابی معلم', href: '/principal/evaluations/teachers', icon: UserCheck },
    ],
  },
  {
    label: 'گزارشات',
    icon: BarChart3,
    children: [
      { label: 'داشبورد گزارشات', href: '/principal/report', icon: BarChart3 },
      { label: 'عملکرد', href: '/principal/report/performance', icon: BarChart3 },
      { label: 'مقایسه صنوف', href: '/principal/report/classes', icon: Home },
      { label: 'حضور و غیاب', href: '/principal/report/attendance', icon: Calendar },
      { label: 'گزارش ماهانه', href: '/principal/report/monthly', icon: FileText },
      { label: 'گزارش سالانه', href: '/principal/report/annual', icon: FileText },
    ],
  },
  {
    label: 'ارتباطات',
    icon: MessageSquare,
    children: [
      { label: 'ارتباط با والدین', href: '/principal/communication/parents', icon: MessageSquare },
      { label: 'پیامک', href: '/principal/communication/sms', icon: Send },
    ],
  },
  {
    label: 'پروفایل',
    href: '/principal/profile',
    icon: User,
  },
];

export default function AcademicSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    شاگردان: true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/principal') return pathname === '/principal';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Link
          href="/principal"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronRight size={16} />
          بازگشت به داشبورد اکادمیک
        </Link>
        <h2 className="mt-3 text-lg font-bold text-gray-900">
          داشبورد اکادمیک
        </h2>
        <p className="text-xs text-gray-400">نظارت و مدیریت آموزشی</p>
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
                      ? 'bg-blue-50 text-blue-700 font-medium'
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
                              ? 'bg-blue-100 text-blue-700 font-medium'
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
                  ? 'bg-blue-100 text-blue-700 font-medium'
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