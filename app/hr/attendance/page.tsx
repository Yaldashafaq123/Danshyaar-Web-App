// app/admin/hr/attendance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Users,
  UserCheck,
  UserX,
  Calendar,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  FileText,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { hrAttendanceAPI } from '@/lib/api/hr';
import {
  formatNumber,
  formatPercentage,
  getShamsiMonthName,
  getCurrentShamsiYear,
} from '@/lib/utils/hr-helpers';

interface SummaryData {
  shamsiMonth: number;
  shamsiYear: number;
  shamsiMonthName: string;
  summary: {
    totalStaff: number;
    totalPresent: number;
    totalLate: number;
    averageAttendance: number;
    totalPunches: number;
  };
  staff: {
    staffId: number;
    name: string;
    role: string;
    daysPresent: number;
    lateDays: number;
    totalDays: number;
    attendanceRate: number;
  }[];
}

export default function AttendanceDashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = getCurrentShamsiYear();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(currentYear);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrAttendanceAPI.getSummary({ month, year });
      setData(res);
    } catch (err: unknown) {
      console.error('❌ [Attendance Dashboard] Error:', err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-pink-500" size={26} />
            حضور و غیاب کارمندان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            مدیریت و نظارت بر حضور کارمندان از دستگاه ZKTeco
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md">
          <div className="relative">
            <Calendar
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getShamsiMonthName(m)}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="کل کارمندان"
          value={formatNumber(data?.summary.totalStaff ?? 0)}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <SummaryCard
          label="حاضر"
          value={formatNumber(data?.summary.totalPresent ?? 0)}
          icon={UserCheck}
          color="text-green-600"
          bg="bg-green-50"
        />
        <SummaryCard
          label="تأخیر"
          value={formatNumber(data?.summary.totalLate ?? 0)}
          icon={AlertTriangle}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <SummaryCard
          label="میانگین حضور"
          value={formatPercentage(data?.summary.averageAttendance ?? 0)}
          icon={TrendingUp}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NavCard
          title="حضور امروز"
          description="مشاهده حضور و غیاب امروز"
          icon={Clock}
          href="/admin/hr/attendance/today"
          gradient="from-pink-500 to-rose-600"
        />
        <NavCard
          title="گزارش ماهانه"
          description="خلاصه ماهانه همه کارمندان"
          icon={BarChart3}
          href="/admin/hr/attendance/report"
          gradient="from-blue-500 to-indigo-600"
        />
        <NavCard
          title="تاریخ مشخص"
          description="حضور در یک تاریخ خاص"
          icon={Calendar}
          href="/admin/hr/attendance/by-date"
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      {/* Staff Attendance Summary */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              خلاصه حضور کارمندان
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {data?.shamsiMonthName} {data?.shamsiYear}
            </p>
          </div>
          <Link
            href="/admin/hr/attendance/report"
            className="text-sm text-pink-600 hover:text-pink-700"
          >
            گزارش کامل →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
          </div>
        ) : !data || data.staff.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              داده‌ای برای این ماه وجود ندارد
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    کارمند
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    روزهای حاضر
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    روزهای تأخیر
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    نرخ حضور
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.staff.slice(0, 15).map((s) => (
                  <tr key={s.staffId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                          <Users size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-500">{s.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatNumber(s.daysPresent)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-yellow-600">
                      {formatNumber(s.lateDays)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              s.attendanceRate >= 90
                                ? 'bg-green-500'
                                : s.attendanceRate >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(s.attendanceRate, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {s.attendanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/hr/attendance/report?staffId=${s.staffId}`}
                        className="text-xs text-pink-600 hover:text-pink-700"
                      >
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
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
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function NavCard({
  title,
  description,
  icon: Icon,
  href,
  gradient,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow group"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}
      >
        <Icon className="text-white" size={22} />
      </div>
      <h3 className="text-base font-bold text-gray-900 group-hover:text-pink-600">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}