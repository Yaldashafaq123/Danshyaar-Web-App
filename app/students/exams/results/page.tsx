// app/student/exams/results/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Trophy,
  FileText,
  Users,
  Percent,
} from 'lucide-react';
import { studentGradesAPI } from '@/lib/api/student-portal';
import type { GradesResponse, TermGrades, Term } from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
  getScoreColor,
  gradeLetterColors,
  gradeStatusColors,
} from '@/lib/utils/student-helpers';

export default function ExamResultsPage() {
  const [data, setData] = useState<GradesResponse | null>(null);
  const [activeTermId, setActiveTermId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentGradesAPI.getAll();
      setData(res);

      // Set active term to current
      if (res.currentTermGrades) {
        setActiveTermId(res.currentTermGrades.term.id);
      } else if (res.terms.length > 0) {
        setActiveTermId(res.terms[0].id);
      }
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت نتایج';
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
      <div className="space-y-4">
        <Link
          href="/student/exams"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          بازگشت
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.terms.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/student/exams"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="text-indigo-500" size={26} />
              نتایج امتحانات
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Award className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">
            هنوز نمره‌ای برای شما ثبت نشده است
          </p>
          <p className="text-xs text-gray-400 mt-2">
            وقتی معلم نمره‌ای ثبت کند، اینجا نمایش داده می‌شود
          </p>
        </div>
      </div>
    );
  }

  const activeGrades: TermGrades | null = activeTermId
    ? data.allTermsGrades[String(activeTermId)] ||
      data.currentTermGrades ||
      null
    : data.currentTermGrades;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/student/exams"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-indigo-500" size={26} />
            نتایج امتحانات
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            نمرات و کارنامه
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/reports"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText size={16} />
            کارنامه کامل
          </Link>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Term selector */}
      {data.terms.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
          {data.terms.map((term) => (
            <button
              key={String(term.id)}
              onClick={() => setActiveTermId(term.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTermId === term.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {term.name}
              {term.isCurrent && (
                <span className="inline-block mr-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              )}
            </button>
          ))}
        </div>
      )}

      {!activeGrades ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Award className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            نمره‌ای برای این ترم ثبت نشده
          </p>
        </div>
      ) : (
        <>
          {/* Overall summary */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Average */}
              <div>
                <p className="text-indigo-100 text-sm mb-2 flex items-center gap-2">
                  <TrendingUp size={16} />
                  معدل کل
                </p>
                <p className="text-5xl font-bold">
                  {activeGrades.overallAverage}
                </p>
                <p className="text-indigo-100 text-sm mt-2">
                  {activeGrades.overallLetter}
                </p>
              </div>

              {/* Rank */}
              <div>
                <p className="text-indigo-100 text-sm mb-2 flex items-center gap-2">
                  <Trophy size={16} />
                  رتبه در صنف
                </p>
                <p className="text-5xl font-bold">
                  {formatNumber(activeGrades.classRank)}
                </p>
                <p className="text-indigo-100 text-sm mt-2">
                  از {formatNumber(activeGrades.totalStudents)} نفر
                </p>
              </div>

              {/* Attendance */}
              <div>
                <p className="text-indigo-100 text-sm mb-2 flex items-center gap-2">
                  <Percent size={16} />
                  حضور
                </p>
                <p className="text-5xl font-bold">
                  {activeGrades.attendanceRate}%
                </p>
                <p className="text-indigo-100 text-sm mt-2">
                  نرخ حضور
                </p>
              </div>
            </div>
          </div>

          {/* Pass/fail summary */}
          {activeGrades.passedCount !== undefined && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={16} className="text-green-600" />
                  <p className="text-xs text-gray-600">قبول</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(activeGrades.passedCount || 0)}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle size={16} className="text-red-600" />
                  <p className="text-xs text-gray-600">ناکام</p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(activeGrades.failedCount || 0)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={16} className="text-blue-600" />
                  <p className="text-xs text-gray-600">مجموع مضامین</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(activeGrades.subjects.length)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-purple-600" />
                  <p className="text-xs text-gray-600">تعداد شاگردان</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(activeGrades.totalStudents)}
                </p>
              </div>
            </div>
          )}

          {/* Pending exams notice */}
          {activeGrades.hasPendingExams && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <Clock className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">در انتظار امتحان نهایی</p>
                <p>
                  برخی از نمرات هنوز کامل نیستند. پس از برگزاری همه امتحانات،
                  معدل نهایی محاسبه خواهد شد.
                </p>
              </div>
            </div>
          )}

          {/* Subject grades table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                نمرات به تفکیک مضمون
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                      مضمون
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                      ماهانه
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                      نیم‌سال
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                      سالانه
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                      مجموع
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                      درجه
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">
                      وضعیت
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeGrades.subjects.map((subject, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BookOpen
                            size={14}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {subject.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {subject.monthly !== null &&
                        subject.monthly !== undefined ? (
                          <span
                            className={`text-sm font-bold ${getScoreColor(
                              (subject.monthly /
                                (subject.monthlyMaxScore || 20)) *
                                100
                            )}`}
                          >
                            {subject.monthly}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {subject.halfYearly !== null &&
                        subject.halfYearly !== undefined ? (
                          <span
                            className={`text-sm font-bold ${getScoreColor(
                              (subject.halfYearly /
                                (subject.halfYearlyMaxScore || 40)) *
                                100
                            )}`}
                          >
                            {subject.halfYearly}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {subject.final !== null &&
                        subject.final !== undefined ? (
                          <span
                            className={`text-sm font-bold ${getScoreColor(
                              (subject.final /
                                (subject.finalMaxScore || 60)) *
                                100
                            )}`}
                          >
                            {subject.final}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {subject.total !== null &&
                        subject.total !== undefined ? (
                          <span
                            className={`text-base font-bold ${getScoreColor(
                              subject.total
                            )}`}
                          >
                            {subject.total}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {subject.totalLetter ? (
                          <span
                            className={`inline-block w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                              gradeLetterColors[subject.totalLetter] ||
                              'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {subject.totalLetter}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            gradeStatusColors[subject.status] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {subject.statusDisplay || subject.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}