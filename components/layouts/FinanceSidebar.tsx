// components/layouts/FinanceSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Users,
  Receipt,
  Percent,
  AlertTriangle,
  Briefcase,
  TrendingDown,
  BarChart3,
  Wallet,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  CreditCard,
  ClipboardList,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { label: 'داشبورد مالی', href: '/finance', icon: LayoutDashboard },
  { label: 'وصول فیس', href: '/finance/fee-collection', icon: DollarSign },
  {
    label: 'فیس شاگردان',
    icon: Users,
    children: [
      { label: 'تخصیص فیس', href: '/finance/fee-assignments', icon: ClipboardList },
      { label: 'قالب‌های فیس', href: '/finance/fee-templates', icon: FileText },
      { label: 'شاگردان', href: '/finance/students', icon: Users },
    ],
  },
  { label: 'تاریخ پرداخت‌ها', href: '/finance/payment-history', icon: Receipt },
  { label: 'رسیدها', href: '/finance/receipts', icon: Receipt },
  { label: 'تخفیف و بورسیه', href: '/finance/discounts', icon: Percent },
  { label: 'شاگردان معوق', href: '/finance/defaulters', icon: AlertTriangle },
  {
    label: 'معاشات',
    icon: Briefcase,
    children: [
      { label: 'نمای کلی', href: '/finance/payroll', icon: Briefcase },
      { label: 'معاش‌ها', href: '/finance/payroll/salaries', icon: Wallet },
      { label: 'پردازش معاش', href: '/finance/payroll/process', icon: CreditCard },
    ],
  },
  {
    label: 'مصارف',
    icon: TrendingDown,
    children: [
      { label: 'لیست مصارف', href: '/finance/expenses', icon: TrendingDown },
      { label: 'ثبت مصرف', href: '/finance/expenses/add', icon: DollarSign },
      { label: 'دسته‌بندی‌ها', href: '/finance/expenses/categories', icon: FileText },
    ],
  },
  {
    label: 'گزارشات',
    icon: BarChart3,
    children: [
      { label: 'داشبورد گزارشات', href: '/finance/reports', icon: BarChart3 },
      { label: 'وصول روزانه', href: '/finance/reports/daily', icon: FileText },
      { label: 'وصول ماهانه', href: '/finance/reports/monthly', icon: FileText },
      { label: 'شاگردان معوق', href: '/finance/reports/outstanding', icon: AlertTriangle },
      { label: 'عواید و مصارف', href: '/finance/reports/income-vs-expense', icon: BarChart3 },
      { label: 'سالانه', href: '/finance/reports/annual', icon: FileText },
    ],
  },
  { label: 'بودجه', href: '/finance/budget', icon: Wallet },
  { label: 'تنظیمات مالی', href: '/finance/settings', icon: Settings },
  { label: 'پروفایل', href: '/finance/profile', icon: User },
];

export default function FinanceSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'فیس شاگردان': true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href?: string) => {
    if (!href || typeof window === 'undefined') return false;
    if (href === '/finance') return pathname === '/finance';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <Link
          href="/finance"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronRight size={16} />
          بازگشت به داشبورد مالی
        </Link>
        <h2 className="mt-3 text-lg font-bold text-gray-900">
          داشبورد مالی
        </h2>
        <p className="text-xs text-gray-400">مدیریت مالی مکتب</p>
      </div>

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
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
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
                              ? 'bg-emerald-100 text-emerald-700 font-medium'
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
                  ? 'bg-emerald-100 text-emerald-700 font-medium'
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