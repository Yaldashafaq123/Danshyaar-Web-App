// app/student/exams/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  BookOpen,
  User,
  TrendingUp,
  CheckCircle,
  Award,
  Info,
  ClipboardList,
} from 'lucide-react';
import { studentDashboardAPI } from '@/lib/api/student-portal';
import type { UpcomingExam } from '@/types/student-portal';
import { formatShamsiDate } from '@/lib/utils/student-helpers';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);

  const [exam, setExam] = useState<UpcomingExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isNaN(examId)) {
        setError('شناسه نامعتبر');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await studentDashboardAPI.getUpcomingExams();
        const found = (res as UpcomingExam[]).find((e) => e.id === examId);
        if (!found) throw new Error('امتحان یافت نشد');
        setExam(found);
      } catch (err: unknown) {
        console.error(err);
        let msg = 'خطا در دریافت اطلاعات';
        if (err && typeof err === 'object' && 'message' in err) {
          msg = (err as { message?: string }).message || msg;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error || 'یافت نشد'}</p>
        </div>
      </div>
    );
  }

  const examDate = new Date(exam.date);
  const now = new Date();
  const diffDays = Math.ceil(
    (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isPast = diffDays < 0;
  const isToday = diffDays === 0;
  const isNear = diffDays > 0 && diffDays <= 3;

  const typeColors: Record<string, string> = {
    'ماهانه': 'from-blue-500 to-indigo-600',
    'نیم‌سال': 'from-amber-500 to-orange-600',
    'سالانه': 'from-purple-500 to-pink-600',
    'کوییز': 'from-cyan-500 to-blue-600',
  };
  const gradient = typeColors[exam.type] || 'from-indigo-500 to-purple-600';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            جزئیات امتحان
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {formatShamsiDate(exam.date)}
          </p>
        </div>
      </div>

      {/* Hero */}
      <div
        className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 text-white shadow-xl ${
          isPast ? 'opacity-75' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={20} />
              <span className="text-sm font-medium opacity-90">
                امتحان {exam.type}
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-3">{exam.title}</h2>
            {exam.subject && (
              <p className="text-sm opacity-90 flex items-center gap-2">
                <BookOpen size={14} />
                {exam.subject}
              </p>
            )}
          </div>

          <div className="text-right">
            {isToday && (
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur border border-white/30 rounded-full">
                <span className="text-sm font-bold">امروز!</span>
              </div>
            )}
            {isNear && !isToday && (
              <div className="px-3 py-1.5 bg-red-500 rounded-full">
                <span className="text-sm font-bold">{diffDays} روز دیگر</span>
              </div>
            )}
            {isPast && (
              <div className="px-3 py-1.5 bg-black/30 backdrop-blur rounded-full flex items-center gap-1">
                <CheckCircle size={14} />
                <span className="text-sm font-bold">انجام شده</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-indigo-500" />
            <p className="text-xs text-gray-600">تاریخ امتحان</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatShamsiDate(exam.date)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-500" />
            <p className="text-xs text-gray-600">زمان شروع</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{exam.time}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-purple-500" />
            <p className="text-xs text-gray-600">نوع</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{exam.type}</p>
        </div>
      </div>

      {/* Preparation tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-blue-900 mb-3">
              نکات آماده‌سازی
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                />
                حداقل یک هفته قبل از امتحان شروع به مطالعه کنید
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                />
                خلاصه‌های خود را یادداشت کنید و آنها را مرور کنید
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                />
                خواب کافی و تغذیه مناسب در شب قبل از امتحان
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                />
                به موقع در جلسه امتحان حاضر شوید
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/student/exams"
          className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          بازگشت به لیست
        </Link>
        {isPast && (
          <Link
            href="/student/exams/results"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Award size={16} />
            مشاهده نتیجه
          </Link>
        )}
      </div>
    </div>
  );
}