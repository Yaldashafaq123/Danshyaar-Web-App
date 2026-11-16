// app/student/attendance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Heart,
  TrendingUp,
  Calendar,
  FileText,
  Info,
  Award,
} from 'lucide-react';
import { studentAttendanceAPI } from '@/lib/api/student-portal';
import type { AttendanceOverview, AttendanceAnalytics } from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
  attendanceStatusLabels,
  attendanceStatusColors,
} from '@/lib/utils/student-helpers';

export default function AttendanceOverviewPage() {
  const [data, setData] = useState<AttendanceOverview | null>(null);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, analyticsRes] = await Promise.all([
        studentAttendanceAPI.getOverview(),
        studentAttendanceAPI.getAnalytics().catch(() => null),
      ]);

      setData(overviewRes);
      if (analyticsRes) setAnalytics(analyticsRes);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات حضور';
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

  const stats = data?.stats;
  const currentDate = data?.currentAfghanDate;

  // Find max rate for scale
  const maxRate = Math.max(
    100,
    ...(data?.monthlySummaries.map((m) => m.attendanceRate) || [100])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-indigo-500" size={26} />
            حضور و غیاب من
          </h1>
          {currentDate && (
            <p className="text-gray-500 text-sm mt-1">
              امروز: {currentDate.weekday} — {currentDate.date}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/attendance/report"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText size={16} />
            گزارش تفصیلی
          </Link>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Hero Attendance Rate */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-yellow-300" size={20} />
              <span className="text-yellow-100 text-sm font-semibold">
                نرخ حضور کلی
              </span>
            </div>
            <p className="text-6xl font-bold">
              {formatPercentage(stats?.averageRate ?? 0)}
            </p>
            <p className="text-indigo-100 text-sm mt-2">
              از {formatNumber(stats?.totalDays ?? 0)} روز ثبت شده
            </p>

            {/* Performance badge */}
            {(stats?.averageRate ?? 0) >= 90 && (
              <span className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full">
                <Award size={14} className="text-yellow-300" />
                <span className="text-sm font-medium">
                  عملکرد عالی! ادامه بده
                </span>
              </span>
            )}
          </div>

          {/* Circular progress mockup */}
          <div className="relative w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
            <svg className="transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${((stats?.averageRate ?? 0) / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {stats?.averageRate ?? 0}%
                </p>
                <p className="text-xs opacity-80">حضور</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="حاضر"
          value={stats?.totalPresent ?? 0}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatsCard
          label="غایب"
          value={stats?.totalAbsent ?? 0}
          icon={XCircle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatsCard
          label="تأخیر"
          value={stats?.totalLate ?? 0}
          icon={AlertTriangle}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <StatsCard
          label="معذور"
          value={stats?.totalExcused ?? 0}
          icon={Heart}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Insights from analytics */}
      {analytics && analytics.insights.length > 0 && (
        <div className="space-y-3">
          {analytics.insights.map((insight, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                insight.type === 'positive'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : insight.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <Info size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{insight.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comparison with class average */}
      {analytics && analytics.comparison && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            مقایسه با میانگین صنف
          </h3>

          <div className="space-y-4">
            <ComparisonBar
              label="حضور شما"
              value={analytics.comparison.studentAverage}
              max={100}
              color="bg-indigo-500"
              isPrimary
            />
            <ComparisonBar
              label="میانگین صنف"
              value={analytics.comparison.classAverage}
              max={100}
              color="bg-gray-400"
            />
          </div>
        </div>
      )}

      {/* Monthly summaries */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-500" />
          خلاصه ماهانه
        </h3>

        {!data?.monthlySummaries || data.monthlySummaries.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-sm text-gray-500">
              داده‌ای برای ماه‌های اخیر موجود نیست
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.monthlySummaries.map((summary, i) => {
              const totalDays =
                summary.presentDays +
                summary.absentDays +
                summary.lateDays +
                summary.excusedDays;

              return (
                <div
                  key={i}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-500">
                          {summary.year}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {summary.month}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatNumber(totalDays)} روز
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={10} />
                            {formatNumber(summary.presentDays)}
                          </span>
                          <span className="text-red-600 flex items-center gap-1">
                            <XCircle size={10} />
                            {formatNumber(summary.absentDays)}
                          </span>
                          <span className="text-yellow-600 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            {formatNumber(summary.lateDays)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          summary.attendanceRate >= 90
                            ? 'text-green-600'
                            : summary.attendanceRate >= 70
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {summary.attendanceRate}%
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        summary.attendanceRate >= 90
                          ? 'bg-green-500'
                          : summary.attendanceRate >= 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(summary.attendanceRate, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent daily records */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-indigo-500" />
            آخرین ثبت‌ها
          </h3>
          <Link
            href="/student/attendance/report"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            مشاهده همه →
          </Link>
        </div>

        {!data?.dailyAttendance || data.dailyAttendance.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto text-gray-300" size={40} />
            <p className="mt-3 text-sm text-gray-500">
              هنوز ثبت حضوری وجود ندارد
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.dailyAttendance.slice(0, 10).map((record, i) => (
              <div
                key={i}
                className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      record.status === 'present'
                        ? 'bg-green-100 text-green-600'
                        : record.status === 'absent'
                        ? 'bg-red-100 text-red-600'
                        : record.status === 'late'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {record.status === 'present' ? (
                      <CheckCircle size={18} />
                    ) : record.status === 'absent' ? (
                      <XCircle size={18} />
                    ) : record.status === 'late' ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Heart size={18} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {record.date}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.dayOfWeek}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    attendanceStatusColors[record.status] ||
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  {attendanceStatusLabels[record.status] || record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{formatNumber(value)}</p>
    </div>
  );
}

function ComparisonBar({
  label,
  value,
  max,
  color,
  isPrimary = false,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  isPrimary?: boolean;
}) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 flex items-center gap-2">
          {isPrimary && <Award size={14} className="text-indigo-500" />}
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {formatPercentage(value)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}