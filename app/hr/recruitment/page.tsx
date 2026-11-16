// app/admin/hr/recruitment/page.tsx
'use client';

import Link from 'next/link';
import {
  Briefcase,
  ArrowLeft,
  UserPlus,
  FileText,
  Calendar,
  Users,
  Info,
  ChevronLeft,
} from 'lucide-react';

const RECRUITMENT_CARDS = [
  {
    title: 'موقعیت‌های شغلی',
    description: 'مدیریت آگهی‌های استخدام',
    icon: Briefcase,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'متقاضیان',
    description: 'بانک متقاضیان کار',
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'مصاحبه‌ها',
    description: 'برنامه‌ریزی جلسات مصاحبه',
    icon: Calendar,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    title: 'درخواست‌های استخدام',
    description: 'درخواست‌های در حال بررسی',
    icon: FileText,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
];

export default function RecruitmentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/hr"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="text-pink-500" size={26} />
            استخدام و جذب
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            مدیریت استخدام و جذب کارمندان جدید
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">ماژول در حال توسعه</p>
          <p>
            این بخش در انتظار اتصال به سیستم استخدام است. در حال حاضر
            می‌توانید از بخش «ثبت کارمند» برای افزودن مستقیم کارمندان
            استفاده کنید.
          </p>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {RECRUITMENT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 border-2 border-transparent hover:border-pink-200 transition-colors"
            >
              <div
                className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <Icon className={card.color} size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500">{card.description}</p>
              <div className="mt-3 text-xs text-gray-400">به زودی</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/admin/hr/staff/new"
            className="flex items-center justify-between p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-600 text-white flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">ثبت کارمند جدید</p>
                <p className="text-xs text-gray-500">
                  افزودن مستقیم کارمند به سیستم
                </p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-pink-600" />
          </Link>

          <Link
            href="/admin/hr/staff"
            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">لیست کارمندان</p>
                <p className="text-xs text-gray-500">
                  مشاهده و مدیریت کارمندان موجود
                </p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-blue-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}