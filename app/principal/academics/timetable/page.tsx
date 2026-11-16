// app/admin/academic/timetable/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  RefreshCw,
  Home,
  Users,
  User,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Clock,
  BookOpen,
} from 'lucide-react';
import { principalClassesAPI } from '@/lib/api/principal';
import type { Class } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

export default function TimetableOverviewPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await principalClassesAPI.list();
      setClasses(data);
    } catch (err: unknown) {
      console.error('❌ [Timetable] Error:', err);
      let message = 'خطا در دریافت صنوف';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = classes.filter((c) =>
    `${c.name} ${c.section || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-500" size={26} />
            تقسیم اوقات
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            مدیریت جدول زمانی صنوف
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            بروزرسانی
          </button>
          <Link
            href="/admin/academic/timetable/teachers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <User size={16} />
            جدول معلمان
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <input
          type="text"
          placeholder="جستجوی صنف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          title="مشاهده تقسیم اوقات"
          description="روی هر صنف کلیک کنید تا جدول زمانی آن را ببینید یا ویرایش کنید"
          icon={Clock}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <InfoCard
          title="مدیریت مضامین"
          description="برای افزودن مضمون جدید یا تعیین معلم، به بخش مضامین بروید"
          icon={BookOpen}
          color="text-green-600"
          bg="bg-green-50"
          href="/admin/academic/academics/subjects"
        />
        <InfoCard
          title="تصویب جدول"
          description="پس از تکمیل، جدول را برای تأیید نهایی ارسال کنید"
          icon={Calendar}
          color="text-purple-600"
          bg="bg-purple-50"
          href="/admin/academic/timetable/approval"
        />
      </div>

      {/* Classes grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Home className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">هیچ صنفی یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/admin/academic/timetable/${c.id}`}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Home size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600">
                      {c.name} {c.section || ''}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {c.academicYear || 'بدون سال'}
                    </p>
                  </div>
                </div>
                <ChevronLeft
                  size={18}
                  className="text-gray-300 group-hover:text-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={14} className="text-gray-400" />
                  <span>{formatNumber(c.studentCount)} شاگرد</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 truncate">
                  <User size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{c.teacherName}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCard({
  title,
  description,
  icon: Icon,
  color,
  bg,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm p-5 flex gap-3">
      <div
        className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon size={18} className={color} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}