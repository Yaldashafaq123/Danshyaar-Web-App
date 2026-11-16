// app/student/downloads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Loader2,
  AlertCircle,
  FileText,
  Printer,
  BookOpen,
  Calendar,
  Award,
  FileCheck,
  File,
  CheckCircle,
} from 'lucide-react';
import {
  studentGradesAPI,
  studentTimetableAPI,
  studentProfileAPI,
} from '@/lib/api/student-portal';
import type { Term, TimetableData } from '@/types/student-portal';

interface DownloadableItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  action: 'download' | 'print' | 'navigate';
  href?: string;
  available: boolean;
}

export default function DownloadsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [termsRes, timetableRes] = await Promise.all([
          studentGradesAPI.getTerms().catch(() => []),
          studentTimetableAPI.getWeekly().catch(() => null),
        ]);
        setTerms(termsRes);
        if (timetableRes) setTimetable(timetableRes);
      } catch (err) {
        console.error(err);
        setError('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  const items: DownloadableItem[] = [
    {
      id: 'id-card',
      title: 'کارت شناسایی',
      description: 'مشاهده و چاپ کارت شناسایی شاگرد',
      icon: FileCheck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      action: 'navigate',
      href: '/student/profile/id-card',
      available: true,
    },
    {
      id: 'timetable',
      title: 'تقسیم اوقات',
      description: 'برنامه هفتگی صنف شما',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: 'navigate',
      href: '/student/timetable',
      available: !!timetable && timetable.entries.length > 0,
    },
    {
      id: 'attendance-report',
      title: 'گزارش حضور',
      description: 'گزارش تفصیلی حضور و غیاب',
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      action: 'navigate',
      href: '/student/attendance/report',
      available: true,
    },
    ...terms.map((term) => ({
      id: `report-${term.id}`,
      title: `کارنامه — ${term.name}`,
      description: 'کارنامه تحصیلی با قابلیت چاپ',
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      action: 'navigate' as const,
      href: `/student/reports/${term.id}`,
      available: true,
    })),
  ];

  const availableItems = items.filter((i) => i.available);
  const unavailableItems = items.filter((i) => !i.available);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Download className="text-indigo-500" size={26} />
          مرکز دانلود
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          دسترسی به کارنامه‌ها، گواهی‌نامه‌ها و اسناد مهم
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <File size={16} className="text-indigo-600" />
            <p className="text-xs text-gray-600">اسناد موجود</p>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {availableItems.length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-purple-600" />
            <p className="text-xs text-gray-600">کارنامه‌ها</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{terms.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-emerald-600" />
            <p className="text-xs text-gray-600">آماده چاپ</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {availableItems.filter((i) => i.action === 'navigate').length}
          </p>
        </div>
      </div>

      {/* Available items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          اسناد موجود
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableItems.map((item) => (
            <DownloadCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Unavailable items */}
      {unavailableItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            در دسترس نیست
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unavailableItems.map((item) => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">یادداشت</p>
          <p>
            برای ذخیره اسناد به‌صورت PDF، از گزینه «چاپ» استفاده کنید و در
            تنظیمات چاپ، گزینه «ذخیره به‌عنوان PDF» را انتخاب نمایید.
          </p>
        </div>
      </div>
    </div>
  );
}

function DownloadCard({ item }: { item: DownloadableItem }) {
  const Icon = item.icon;

  const content = (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 ${
        !item.available ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}
        >
          <Icon size={22} className={item.color} />
        </div>
        <div className="text-gray-300">
          {item.available ? (
            <Download size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
        </div>
      </div>

      <h4 className="font-bold text-gray-900 text-sm mb-1">
        {item.title}
      </h4>
      <p className="text-xs text-gray-500 mb-3">{item.description}</p>

      <div
        className={`text-xs font-medium inline-flex items-center gap-1 ${
          item.available ? item.color : 'text-gray-400'
        }`}
      >
        {item.available ? (
          <>
            {item.action === 'navigate' ? (
              <>
                <FileText size={12} />
                مشاهده و چاپ
              </>
            ) : item.action === 'print' ? (
              <>
                <Printer size={12} />
                چاپ
              </>
            ) : (
              <>
                <Download size={12} />
                دانلود
              </>
            )}
          </>
        ) : (
          'در دسترس نیست'
        )}
      </div>
    </div>
  );

  if (item.available && item.href) {
    return <Link href={item.href}>{content}</Link>;
  }

  return content;
}