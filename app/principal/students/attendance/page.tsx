// app/admin/academic/students/attendance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
} from 'lucide-react';
import { principalReportsAPI, principalClassesAPI } from '@/lib/api/principal';
import type { AttendanceReport, Class } from '@/types/principal';
import { formatNumber, formatPercentage } from '@/lib/utils/principal-helpers';

export default function AttendanceReportPage() {
  const [data, setData] = useState<AttendanceReport | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [report, cls] = await Promise.all([
        principalReportsAPI.attendance({ month, year }),
        principalClassesAPI.list(),
      ]);
      setData(report);
      setClasses(cls);
    } catch (err: unknown) {
      console.error('❌ [Attendance] Error:', err);
      let message = 'خطا در دریافت گزارش حضور';
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            گزارش حضور و غیاب شاگردان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            بررسی حضور و غیاب ماهانه صنوف
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Calendar
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="سال"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat
            label="حاضر"
            value={formatNumber(data.summary.totalPresent)}
            icon={CheckCircle}
            color="text-green-600"
            bg="bg-green-50"
          />
          <MiniStat
            label="غایب"
            value={formatNumber(data.summary.totalAbsent)}
            icon={XCircle}
            color="text-red-600"
            bg="bg-red-50"
          />
          <MiniStat
            label="تأخیر"
            value={formatNumber(data.summary.totalLate)}
            icon={Clock}
            color="text-yellow-600"
            bg="bg-yellow-50"
          />
          <MiniStat
            label="نرخ حضور"
            value={formatPercentage(data.summary.overallRate)}
            icon={FileCheck}
            color="text-blue-600"
            bg="bg-blue-50"
          />
        </div>
      )}

      {/* Class breakdown */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            تفکیک به تفکیک صنف
          </h3>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          </div>
        ) : !data || data.classAttendance.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500 text-sm">
              داده‌ای برای این ماه وجود ندارد
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    صنف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شاگردان
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    حاضر
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    غایب
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تأخیر
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    نرخ حضور
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.classAttendance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {row.className} {row.section || ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatNumber(row.studentCount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">
                      {formatNumber(row.present)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      {formatNumber(row.absent)}
                    </td>
                    <td className="px-4 py-3 text-sm text-yellow-600 font-medium">
                      {formatNumber(row.late)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px] bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              row.rate >= 80
                                ? 'bg-green-500'
                                : row.rate >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {row.rate}%
                        </span>
                      </div>
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

function MiniStat({
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