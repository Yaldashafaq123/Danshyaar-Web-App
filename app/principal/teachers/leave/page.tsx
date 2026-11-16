// app/admin/academic/teachers/leave/page.tsx
'use client';

import Link from 'next/link';
import {
  Clock,
  Calendar,
  Info,
  ArrowLeft,
  Heart,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export default function TeacherLeavePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="text-orange-500" size={26} />
          درخواست‌های رخصتی معلمان
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          مدیریت و بررسی درخواست‌های رخصتی
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
        <Info className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-orange-800">
          <p className="font-medium mb-1">بخش مرتبط با منابع بشری</p>
          <p>
            درخواست‌های رخصتی معلمان در بخش HR مدیریت می‌شود. برای مشاهده و
            تأیید درخواست‌ها به بخش منابع بشری مراجعه کنید.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CategoryCard
          title="رخصتی سالانه"
          description="مدیریت رخصتی‌های سالانه"
          icon={Calendar}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <CategoryCard
          title="رخصتی مریضی"
          description="ثبت و پیگیری"
          icon={Heart}
          color="text-red-600"
          bg="bg-red-50"
        />
        <CategoryCard
          title="رخصتی اضطراری"
          description="موارد اضطراری"
          icon={AlertCircle}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      <div className="pt-4 flex items-center gap-4">
        <Link
          href="/admin/hr/leave"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Briefcase size={16} />
          رفتن به بخش منابع بشری
        </Link>
        <Link
          href="/admin/academic/teachers"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          بازگشت به لیست معلمان
        </Link>
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  description,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mb-3`}>
        <Icon className={color} size={24} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}