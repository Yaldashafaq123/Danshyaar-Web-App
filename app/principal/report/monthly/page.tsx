// app/admin/academic/reports/monthly/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Home,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  ClipboardList,
} from 'lucide-react';
import {
  principalDashboardAPI,
  principalReportsAPI,
} from '@/lib/api/principal';
import type { DashboardSummary } from '@/types/principal';
import { formatNumber, formatPercentage } from '@/lib/utils/principal-helpers';

export default function MonthlyReportPage() {
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [attendanceData, setAttendanceData] = useState<{
    summary: { totalPresent: number; totalAbsent: number; overallRate: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, attRes] = await Promise.all([
        principalDashboardAPI.getDashboard(),
        principalReportsAPI.attendance({ month, year }),
      ]);
      setStats(statsRes);
      setAttendanceData(attRes);
    } catch (err: unknown) {
      console.error('❌ [Monthly Report] Error:', err);
      let message = 'خطا در دریافت گزارش';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const months = [
    'حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله',
    'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/academic/reports"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-cyan-500" size={26} />
              گزارش ماهانه
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              خلاصه عملکرد در {months[month - 1]} {year}
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
        </div>
      ) : (
        <>
          {/* Report header */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm">گزارش ماه</p>
                <p className="text-3xl font-bold mt-1">
                  {months[month - 1]} {year}
                </p>
              </div>
              <Calendar size={64} className="text-cyan-200 opacity-40" />
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="شاگردان فعال"
              value={stats?.activeStudents ?? 0}
              icon={Users}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <MetricCard
              label="معلمان فعال"
              value={stats?.activeTeachers ?? 0}
              icon={Users}
              color="text-green-600"
              bg="bg-green-50"
            />
            <MetricCard
              label="صنوف"
              value={stats?.totalClasses ?? 0}
              icon={Home}
              color="text-purple-600"
              bg="bg-purple-50"
            />
            <MetricCard
              label="حضور امروز"
              value={Math.round(stats?.attendanceRate ?? 0)}
              suffix="%"
              icon={TrendingUp}
              color="text-cyan-600"
              bg="bg-cyan-50"
            />
          </div>

          {/* Attendance summary */}
          {attendanceData && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-green-500" />
                خلاصه حضور و غیاب {months[month - 1]}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-green-600" />
                    <p className="text-xs text-gray-600">حاضر</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(attendanceData.summary.totalPresent)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle size={16} className="text-red-600" />
                    <p className="text-xs text-gray-600">غایب</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatNumber(attendanceData.summary.totalAbsent)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 md:col-span-2">
                  <p className="text-xs text-gray-600 mb-1">نرخ حضور کلی</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPercentage(attendanceData.summary.overallRate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightCard
              title="ارزیابی‌ها"
              value="بخش ارزیابی معلمان"
              description="برای مشاهده کارنامه‌ها"
              icon={Award}
              href="/admin/academic/evaluations"
              color="text-pink-600"
              bg="bg-pink-50"
            />
            <HighlightCard
              title="امتحانات"
              value="مدیریت امتحانات"
              description="ثبت و مشاهده نتایج"
              icon={ClipboardList}
              href="/admin/academic/exams"
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
            <HighlightCard
              title="عملکرد"
              value="گزارش عملکرد"
              description="تحلیل جامع تحصیلی"
              icon={TrendingUp}
              href="/admin/academic/reports/performance"
              color="text-blue-600"
              bg="bg-blue-50"
            />
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix = '',
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  suffix?: string;
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
      <p className={`text-2xl font-bold ${color}`}>
        {formatNumber(value)}
        {suffix}
      </p>
    </div>
  );
}

function HighlightCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  color,
  bg,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bg: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
    >
      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-2`}>
        <Icon size={18} className={color} />
      </div>
      <p className={`text-sm font-bold ${color}`}>{title}</p>
      <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </Link>
  );
}