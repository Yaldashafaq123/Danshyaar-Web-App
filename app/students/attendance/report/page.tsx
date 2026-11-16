// app/student/attendance/report/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Heart,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import { studentAttendanceAPI } from '@/lib/api/student-portal';
import type { AttendanceRecord } from '@/types/student-portal';
import {
  formatNumber,
  attendanceStatusLabels,
  attendanceStatusColors,
  AFGHAN_MONTHS,
} from '@/lib/utils/student-helpers';

type StatusFilter = 'all' | 'present' | 'absent' | 'late' | 'excused';

export default function AttendanceReportPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Default: last 30 days
      const res = await studentAttendanceAPI.getDaily();
      setRecords(res);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت گزارش';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter records
  const filtered = records.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (monthFilter && r.month !== monthFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.date.toLowerCase().includes(q) ||
        r.dayOfWeek.toLowerCase().includes(q) ||
        r.month.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Counts
  const counts = {
    all: records.length,
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    excused: records.filter((r) => r.status === 'excused').length,
  };

  // Export CSV
  const handleExport = () => {
    if (filtered.length === 0) return;

    const headers = ['تاریخ', 'روز هفته', 'ماه', 'سال', 'وضعیت'];
    const rows = filtered.map((r) => [
      r.date,
      r.dayOfWeek,
      r.month,
      String(r.year),
      attendanceStatusLabels[r.status] || r.status,
    ]);

    const csv = [
      '\uFEFF' + headers.join(','),
      ...rows.map((row) => row.map((v) => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/student/attendance"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileTextIcon className="text-indigo-500" size={26} />
            گزارش تفصیلی حضور
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {formatNumber(filtered.length)} رکورد از {formatNumber(records.length)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50"
          >
            <Download size={16} />
            خروجی CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو در تاریخ یا روز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">همه ماه‌ها</option>
            {AFGHAN_MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
        {(
          [
            { key: 'all', label: 'همه', count: counts.all, icon: Filter },
            { key: 'present', label: 'حاضر', count: counts.present, icon: CheckCircle },
            { key: 'absent', label: 'غایب', count: counts.absent, icon: XCircle },
            { key: 'late', label: 'تأخیر', count: counts.late, icon: AlertTriangle },
            { key: 'excused', label: 'معذور', count: counts.excused, icon: Heart },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                statusFilter === t.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={14} />
              {t.label}
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === t.key
                    ? 'bg-white/20'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              رکوردی برای این فیلتر یافت نشد
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تاریخ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    روز هفته
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    ماه
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    سال
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {r.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.dayOfWeek}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.year}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          attendanceStatusColors[r.status] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {attendanceStatusLabels[r.status] || r.status}
                      </span>
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

// Icon helper since we used FileTextIcon but didn't import it
function FileTextIcon({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}