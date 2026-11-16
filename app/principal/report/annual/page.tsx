// app/admin/academic/reports/annual/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Home,
  TrendingUp,
  GraduationCap,
  ClipboardList,
  BookOpen,
} from 'lucide-react';
import {
  principalDashboardAPI,
  principalAcademicYearsAPI,
} from '@/lib/api/principal';
import type { DashboardSummary, AcademicYear } from '@/types/principal';
import { formatNumber, formatPercentage, formatDate } from '@/lib/utils/principal-helpers';

export default function AnnualReportPage() {
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, yearsList] = await Promise.all([
        principalDashboardAPI.getDashboard(),
        principalAcademicYearsAPI.list(),
      ]);
      setStats(statsRes);
      setYears(yearsList);
      const active = yearsList.find((y) => y.isActive);
      if (active && !selectedYear) setSelectedYear(String(active.id));
    } catch (err: unknown) {
      console.error('❌ [Annual Report] Error:', err);
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
  }, []);

  const selectedYearData = years.find((y) => String(y.id) === selectedYear);

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
              <Award className="text-orange-500" size={26} />
              گزارش سالانه
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              خلاصه کل سال تحصیلی
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

      {/* Year filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">همه سال‌ها</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name} {y.isActive ? '(فعال)' : ''}
            </option>
          ))}
        </select>
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
          {/* Year header */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">گزارش سال تحصیلی</p>
                <p className="text-3xl font-bold mt-1">
                  {selectedYearData?.name || 'همه سال‌ها'}
                </p>
                {selectedYearData && (
                  <p className="text-orange-100 text-sm mt-2">
                    {formatDate(selectedYearData.startDate)} تا{' '}
                    {formatDate(selectedYearData.endDate)}
                  </p>
                )}
              </div>
              <Award size={64} className="text-orange-200 opacity-40" />
            </div>
          </div>

          {/* Main stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="شاگردان"
              value={stats?.totalStudents ?? 0}
              icon={GraduationCap}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <MetricCard
              label="معلمان"
              value={stats?.totalTeachers ?? 0}
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
              label="امتحانات"
              value={stats?.totalExams ?? 0}
              icon={ClipboardList}
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
            <MetricCard
              label="مضامین"
              value={stats?.totalSubjects ?? 0}
              icon={BookOpen}
              color="text-orange-600"
              bg="bg-orange-50"
            />
            <MetricCard
              label="والدین"
              value={stats?.totalParents ?? 0}
              icon={Users}
              color="text-cyan-600"
              bg="bg-cyan-50"
            />
            <MetricCard
              label="کارخانگی"
              value={stats?.totalAssignments ?? 0}
              icon={BookOpen}
              color="text-pink-600"
              bg="bg-pink-50"
            />
            <MetricCard
              label="نرخ حضور"
              value={Math.round(stats?.attendanceRate ?? 0)}
              suffix="%"
              icon={TrendingUp}
              color="text-green-600"
              bg="bg-green-50"
            />
          </div>

          {/* Summary text */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              خلاصه سال
            </h3>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>
                در سال تحصیلی{' '}
                <strong>{selectedYearData?.name || 'جاری'}</strong>، مکتب دارای{' '}
                <strong>{formatNumber(stats?.totalStudents ?? 0)}</strong>{' '}
                شاگرد،{' '}
                <strong>{formatNumber(stats?.totalTeachers ?? 0)}</strong> معلم
                و{' '}
                <strong>{formatNumber(stats?.totalClasses ?? 0)}</strong> صنف
                فعال بوده است.
              </p>
              <p>
                مجموع{' '}
                <strong>{formatNumber(stats?.totalExams ?? 0)}</strong> امتحان
                برگزار شده و{' '}
                <strong>{formatNumber(stats?.totalSubjects ?? 0)}</strong>{' '}
                مضمون تدریس شده است.
              </p>
              <p>
                نرخ حضور عمومی در این دوره{' '}
                <strong>{formatPercentage(stats?.attendanceRate ?? 0)}</strong>{' '}
                بوده است.
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickLink
              title="گزارش عملکرد"
              description="تحلیل تحصیلی"
              icon={TrendingUp}
              href="/admin/academic/reports/performance"
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <QuickLink
              title="مقایسه صنوف"
              description="مقایسه عملکرد"
              icon={Home}
              href="/admin/academic/reports/classes"
              color="text-purple-600"
              bg="bg-purple-50"
            />
            <QuickLink
              title="حضور و غیاب"
              description="گزارش ماهانه"
              icon={Calendar}
              href="/admin/academic/reports/attendance"
              color="text-green-600"
              bg="bg-green-50"
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

function QuickLink({
  title,
  description,
  icon: Icon,
  href,
  color,
  bg,
}: {
  title: string;
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
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </Link>
  );
}