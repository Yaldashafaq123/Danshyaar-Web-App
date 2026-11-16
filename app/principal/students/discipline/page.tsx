// app/admin/academic/students/discipline/page.tsx
'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Shield,
  FileWarning,
  Heart,
  Info,
  ArrowLeft,
} from 'lucide-react';

export default function DisciplinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          انتظامی شاگردان
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          پیگیری موارد انتظامی و رفتاری
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">ماژول در حال توسعه</p>
          <p>
            این بخش در انتظار اتصال به سیستم انتظامی مکتب است. برای
            پیگیری فعلی، به پروفایل هر شاگرد مراجعه کنید.
          </p>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CategoryCard
          title="موارد انتظامی"
          description="ثبت و پیگیری تخلفات"
          icon={AlertTriangle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <CategoryCard
          title="اخطارها"
          description="ارسال اخطار به شاگرد"
          icon={FileWarning}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <CategoryCard
          title="مشاوره"
          description="جلسات مشاوره"
          icon={Heart}
          color="text-pink-600"
          bg="bg-pink-50"
        />
      </div>

      {/* Back link */}
      <div className="pt-4">
        <Link
          href="/admin/academic/students"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          بازگشت به لیست شاگردان
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
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mb-3`}>
        <Icon className={color} size={24} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="mt-4">
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <Shield size={12} />
          به زودی
        </span>
      </div>
    </div>
  );
}