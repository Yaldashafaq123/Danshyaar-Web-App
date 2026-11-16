// app/admin/academic/teachers/attendance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Loader2,
} from 'lucide-react';
import { principalReportsAPI } from '@/lib/api/principal';
import type { AttendanceReport } from '@/types/principal';
import { formatNumber, formatPercentage } from '@/lib/utils/principal-helpers';

export default function TeacherAttendancePage() {
  const [data, setData] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await principalReportsAPI.attendance({ month, year });
      setData(res);
    } catch (err: unknown) {
      console.error('❌ [Teacher Attendance] Error:', err);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="text-green-500" size={26} />
            حضور و غیاب معلمان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            گزارش حضور کارمندان و معلمان
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
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="سال"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        این گزارش شامل حضور و غیاب کارمندان از سیستم StaffAttendance است. برای
        جزئیات بیشتر به بخش HR مراجعه کنید.
      </div>

      {/* Summary */}
      {!loading && data && (
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
            icon={UserCheck}
            color="text-blue-600"
            bg="bg-blue-50"
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          <p className="mt-3 text-gray-500 text-sm">در حال بارگذاری...</p>
        </div>
      )}

      {/* Placeholder table */}
      {!loading && !data && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">اطلاعاتی برای این ماه وجود ندارد</p>
        </div>
      )}
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