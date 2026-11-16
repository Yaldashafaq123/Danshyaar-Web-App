// app/student/exams/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  BookOpen,
  User,
  Award,
  CheckCircle,
  TrendingUp,
  ChevronLeft,
  FileText,
} from 'lucide-react';
import { studentDashboardAPI } from '@/lib/api/student-portal';
import type { UpcomingExam } from '@/types/student-portal';
import {
  formatNumber,
  formatShamsiDate,
} from '@/lib/utils/student-helpers';

export default function ExamsSchedulePage() {
  const [exams, setExams] = useState<UpcomingExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentDashboardAPI.getUpcomingExams();
      setExams(res as UpcomingExam[]);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت برنامه امتحانات';
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Categorize exams
  const upcoming = exams.filter((e) => new Date(e.date) >= today);
  const past = exams.filter((e) => new Date(e.date) < today);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-indigo-500" size={26} />
            برنامه امتحانات
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {formatNumber(exams.length)} امتحان ثبت شده
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/exams/results"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Award size={16} />
            نتایج
          </Link>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Summary */}
      {!loading && exams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-indigo-600" />
              <p className="text-xs text-gray-600">کل امتحانات</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(exams.length)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-amber-600" />
              <p className="text-xs text-gray-600">پیش‌رو</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {formatNumber(upcoming.length)}
            </p>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-gray-600" />
              <p className="text-xs text-gray-600">گذشته</p>
            </div>
            <p className="text-2xl font-bold text-gray-600">
              {formatNumber(past.length)}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Upcoming exams */}
      {!loading && upcoming.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="text-amber-500" size={20} />
            امتحانات پیش‌رو
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((exam) => (
              <ExamCard key={exam.id} exam={exam} isPast={false} />
            ))}
          </div>
        </div>
      )}

      {/* Past exams */}
      {!loading && past.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            امتحانات گذشته
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {past.map((exam) => (
              <ExamCard key={exam.id} exam={exam} isPast={true} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && exams.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            هیچ امتحانی برای شما ثبت نشده
          </p>
          <p className="text-xs text-gray-400 mt-2">
            وقتی معلم امتحان جدید ثبت کند، اینجا نمایش داده می‌شود
          </p>
        </div>
      )}
    </div>
  );
}

function ExamCard({
  exam,
  isPast,
}: {
  exam: UpcomingExam;
  isPast: boolean;
}) {
  const examDate = new Date(exam.date);
  const now = new Date();
  const diffDays = Math.ceil(
    (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isNear = !isPast && diffDays <= 3 && diffDays >= 0;
  const isToday = !isPast && diffDays === 0;

  // Color by type
  const typeColors: Record<string, string> = {
    'ماهانه': 'from-blue-500 to-indigo-600',
    'نیم‌سال': 'from-amber-500 to-orange-600',
    'سالانه': 'from-purple-500 to-pink-600',
    'کوییز': 'from-cyan-500 to-blue-600',
  };
  const gradient =
    typeColors[exam.type] || 'from-indigo-500 to-purple-600';

  return (
    <Link
      href={`/student/exams/${exam.id}`}
      className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden block ${
        isPast ? 'opacity-75' : ''
      }`}
    >
      <div
        className={`bg-gradient-to-br ${gradient} p-4 text-white ${
          isPast ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <FileText size={22} />
          </div>
          {isToday && (
            <span className="px-2 py-0.5 bg-white/30 backdrop-blur rounded-full text-xs font-medium">
              امروز
            </span>
          )}
          {isNear && !isToday && (
            <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-medium">
              {diffDays} روز دیگر
            </span>
          )}
          {isPast && (
            <span className="px-2 py-0.5 bg-black/30 backdrop-blur rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle size={10} />
              انجام شده
            </span>
          )}
        </div>

        <h4 className="text-lg font-bold mb-1 line-clamp-1">{exam.title}</h4>
        {exam.subject && (
          <p className="text-xs opacity-90 flex items-center gap-1">
            <BookOpen size={12} />
            {exam.subject}
          </p>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">تاریخ</p>
            <p className="text-sm font-bold text-gray-900">
              {formatShamsiDate(exam.date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">زمان</p>
            <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              {exam.time}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {exam.type}
          </span>
          <span className="text-xs text-indigo-600 font-medium group-hover:text-indigo-700 flex items-center gap-1">
            جزئیات
            <ChevronLeft size={12} className="rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
}