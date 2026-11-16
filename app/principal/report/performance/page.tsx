// app/admin/academic/reports/performance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  GraduationCap,
  Home,
  Trophy,
  Award,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  principalReportsAPI,
  principalAcademicYearsAPI,
} from '@/lib/api/principal';
import type { PerformanceReport, AcademicYear } from '@/types/principal';
import { formatNumber, formatPercentage } from '@/lib/utils/principal-helpers';

export default function PerformanceReportPage() {
  const [data, setData] = useState<PerformanceReport | null>(null);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [report, yearsList] = await Promise.all([
        principalReportsAPI.performance(
          selectedYear ? Number(selectedYear) : undefined
        ),
        principalAcademicYearsAPI.list(),
      ]);
      setData(report);
      if (years.length === 0) {
        setYears(yearsList);
        const active = yearsList.find((y) => y.isActive);
        if (active && !selectedYear) setSelectedYear(String(active.id));
      }
    } catch (err: unknown) {
      console.error('❌ [Performance] Error:', err);
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
  }, [selectedYear]);

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
              <TrendingUp className="text-blue-500" size={26} />
              گزارش عملکرد
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              تحلیل کلی عملکرد تحصیلی مکتب
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
      ) : !data ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <TrendingUp className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
        </div>
      ) : (
        <>
          {/* Main stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="شاگردان"
              value={data.summary.totalStudents}
              icon={GraduationCap}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatBox
              label="معلمان"
              value={data.summary.totalTeachers}
              icon={Users}
              color="text-green-600"
              bg="bg-green-50"
            />
            <StatBox
              label="صنوف"
              value={data.summary.totalClasses}
              icon={Home}
              color="text-purple-600"
              bg="bg-purple-50"
            />
            <StatBox
              label="میانگین نمره"
              value={Math.round(data.summary.averageScore)}
              icon={Trophy}
              color="text-orange-600"
              bg="bg-orange-50"
            />
          </div>

          {/* Pass/Fail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-400">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={28} />
                <div>
                  <p className="text-xs text-gray-500">قبول</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(data.summary.totalPassed)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-400">
              <div className="flex items-center gap-3">
                <XCircle className="text-red-600" size={28} />
                <div>
                  <p className="text-xs text-gray-500">ناکام</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatNumber(data.summary.totalFailed)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-400">
              <div className="flex items-center gap-3">
                <Award className="text-blue-600" size={28} />
                <div>
                  <p className="text-xs text-gray-500">نرخ قبولی</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPercentage(data.summary.passRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top student/class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="text-yellow-500" size={20} />
                <h3 className="text-base font-semibold text-gray-900">
                  شاگرد برتر
                </h3>
              </div>
              {data.topStudent ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Trophy size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {data.topStudent.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.topStudent.className}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">داده‌ای نیست</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <Home className="text-purple-500" size={20} />
                <h3 className="text-base font-semibold text-gray-900">
                  صنف برتر
                </h3>
              </div>
              {data.topClass ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Home size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {data.topClass.name} {data.topClass.section || ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(data.topClass.studentCount)} شاگرد
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">داده‌ای نیست</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({
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