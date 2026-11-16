// app/student/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  ChevronLeft,
  Download,
  Trophy,
  Star,
} from 'lucide-react';
import { studentGradesAPI } from '@/lib/api/student-portal';
import type { GradesResponse, TermGrades } from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
  getScoreColor,
  getScoreBg,
  gradeLetterColors,
} from '@/lib/utils/student-helpers';

export default function ReportCardsPage() {
  const [data, setData] = useState<GradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentGradesAPI.getAll();
      setData(res);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت کارنامه‌ها';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-700">
            خطا در بارگذاری
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw size={16} />
          تلاش مجدد
        </button>
      </div>
    );
  }

  // Get all term grades as array
  const termGrades: TermGrades[] = data
    ? Object.values(data.allTermsGrades).sort((a, b) => {
        // Sort by startDate descending (most recent first)
        const dateA = a.term.startDate ? new Date(a.term.startDate).getTime() : 0;
        const dateB = b.term.startDate ? new Date(b.term.startDate).getTime() : 0;
        return dateB - dateA;
      })
    : [];

  // Best term
  const bestTerm = termGrades.reduce(
    (best, t) =>
      !best || t.overallAverage > best.overallAverage ? t : best,
    null as TermGrades | null
  );

  // Growth (compare first vs last term)
  const firstTerm = termGrades[termGrades.length - 1];
  const latestTerm = termGrades[0];
  const growth =
    firstTerm && latestTerm && firstTerm.overallAverage > 0
      ? latestTerm.overallAverage - firstTerm.overallAverage
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-indigo-500" size={26} />
            کارنامه من
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            کارنامه‌های تحصیلی در ترم‌های مختلف
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {/* Empty state */}
      {termGrades.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">
            هنوز کارنامه‌ای برای شما صادر نشده
          </p>
          <p className="text-xs text-gray-400 mt-2">
            پس از ثبت نمرات توسط معلمان، کارنامه شما اینجا نمایش داده می‌شود
          </p>
        </div>
      )}

      {/* Summary cards */}
      {termGrades.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Latest average */}
            {latestTerm && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-indigo-100" />
                  <p className="text-xs text-indigo-100">
                    آخرین معدل
                  </p>
                </div>
                <p className="text-4xl font-bold">
                  {latestTerm.overallAverage}
                </p>
                <p className="text-xs text-indigo-100 mt-2">
                  {latestTerm.term.name}
                </p>
              </div>
            )}

            {/* Best term */}
            {bestTerm && (
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={18} className="text-amber-100" />
                  <p className="text-xs text-amber-100">
                    بهترین معدل
                  </p>
                </div>
                <p className="text-4xl font-bold">
                  {bestTerm.overallAverage}
                </p>
                <p className="text-xs text-amber-100 mt-2">
                  {bestTerm.term.name}
                </p>
              </div>
            )}

            {/* Growth */}
            <div
              className={`rounded-xl p-6 text-white shadow-lg ${
                growth >= 0
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-red-500 to-rose-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="opacity-90" />
                <p className="text-xs opacity-90">
                  {growth >= 0 ? 'رشد' : 'کاهش'}
                </p>
              </div>
              <p className="text-4xl font-bold">
                {growth >= 0 ? '+' : ''}
                {growth.toFixed(1)}
              </p>
              <p className="text-xs opacity-90 mt-2">
                {growth >= 0 ? 'پیشرفت' : 'افت'} نسبت به اولین ترم
              </p>
            </div>
          </div>

          {/* Report cards list */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              کارنامه‌ها به تفکیک ترم
            </h3>
            <div className="space-y-4">
              {termGrades.map((tg) => (
                <ReportCardRow key={String(tg.term.id)} grades={tg} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// REPORT CARD ROW
// ============================================

function ReportCardRow({ grades }: { grades: TermGrades }) {
  const term = grades.term;
  const subjects = grades.subjects || [];
  const passedCount = grades.passedCount ?? 0;
  const failedCount = grades.failedCount ?? 0;
  const totalSubjects = subjects.length;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 border-indigo-500">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                term.isCurrent
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 text-lg">
                  {term.name}
                </h4>
                {term.isCurrent && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                    جاری
                  </span>
                )}
              </div>
              {term.startDate && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar size={11} />
                  {term.startDate}
                  {term.endDate && ` تا ${term.endDate}`}
                </p>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p
              className={`text-3xl font-bold ${getScoreColor(
                grades.overallAverage
              )}`}
            >
              {grades.overallAverage}
            </p>
            {grades.overallLetter && (
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                  gradeLetterColors[grades.overallLetter] ||
                  'bg-gray-100 text-gray-600'
                }`}
              >
                {grades.overallLetter}
              </span>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={12} className="text-blue-600" />
              <p className="text-xs text-gray-600">رتبه</p>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {formatNumber(grades.classRank)}
              <span className="text-xs text-gray-500 font-normal">
                {' '}
                / {formatNumber(grades.totalStudents)}
              </span>
            </p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText size={12} className="text-purple-600" />
              <p className="text-xs text-gray-600">مضامین</p>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {formatNumber(totalSubjects)}
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle size={12} className="text-green-600" />
              <p className="text-xs text-gray-600">قبول</p>
            </div>
            <p className="text-lg font-bold text-green-600">
              {formatNumber(passedCount)}
            </p>
          </div>

          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Award size={12} className="text-red-600" />
              <p className="text-xs text-gray-600">ناکام</p>
            </div>
            <p className="text-lg font-bold text-red-600">
              {formatNumber(failedCount)}
            </p>
          </div>
        </div>

        {/* Subject preview */}
        {subjects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">مضامین:</p>
            <div className="flex flex-wrap gap-1.5">
              {subjects.slice(0, 6).map((subj, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getScoreBg(
                    subj.average
                  )} text-white`}
                >
                  {subj.subject}: {subj.average}
                </span>
              ))}
              {subjects.length > 6 && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                  +{subjects.length - 6} مضمون دیگر
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
          <Link
            href={`/student/reports/${term.id}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
          >
            مشاهده کارنامه کامل
            <ChevronLeft size={14} className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}