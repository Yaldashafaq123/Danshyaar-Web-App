// app/admin/hr/attendance/report/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  User,
  Users,
  TrendingUp,
  Download,
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { hrAttendanceAPI } from '@/lib/api/hr';
import type { AttendanceReport, AttendanceReportRow } from '@/types/hr';
import {
  formatNumber,
  formatPercentage,
  attendanceRateColor,
  staffTypeLabels,
} from '@/lib/utils/hr-helpers';

export default function AttendanceReportPage() {
  const searchParams = useSearchParams();
  const initialStaffId = searchParams.get('staffId');

  const [data, setData] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [staffType, setStaffType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrAttendanceAPI.getReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        staffType: staffType || undefined,
        staffId: initialStaffId ? Number(initialStaffId) : undefined,
        page,
        limit: 20,
      });
      setData(res);
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
  }, [startDate, endDate, staffType, page, initialStaffId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await hrAttendanceAPI.exportReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        staffType: staffType || undefined,
      });

      // Convert to CSV
      if (res.data && res.data.length > 0) {
        const headers = Object.keys(res.data[0]);
        const csvRows = [
          headers.join(','),
          ...res.data.map((row) =>
            headers
              .map((h) => {
                const v = (row as Record<string, unknown>)[h];
                const str = String(v ?? '');
                return `"${str.replace(/"/g, '""')}"`;
              })
              .join(',')
          ),
        ];
        const csv = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      setError('خطا در خروجی گرفتن');
    } finally {
      setExporting(false);
    }
  };

  const filtered = (data?.report || []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.fullName.toLowerCase().includes(q);
  });

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStaffType('');
    setSearch('');
    setPage(1);
  };

  const hasFilters = startDate || endDate || staffType || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/hr/attendance"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-pink-500" size={26} />
            گزارش حضور و غیاب
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            گزارش تحلیلی حضور کارمندان
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
            disabled={exporting || !data || data.report.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            خروجی CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی نام..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              placeholder="از"
              className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              placeholder="تا"
              className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <select
            value={staffType}
            onChange={(e) => {
              setStaffType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">همه انواع</option>
            {Object.entries(staffTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              پاک کردن فیلترها
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="کل کارمندان"
            value={formatNumber(data.summary.totalStaff)}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <SummaryCard
            label="فعال"
            value={formatNumber(data.summary.activeStaff)}
            color="text-green-600"
            bg="bg-green-50"
          />
          <SummaryCard
            label="مجموع حضور"
            value={formatNumber(data.summary.totalPresent)}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <SummaryCard
            label="میانگین نرخ"
            value={formatPercentage(data.summary.averageAttendance)}
            color="text-cyan-600"
            bg="bg-cyan-50"
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">داده‌ای یافت نشد</p>
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
                    نوع
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    سمت
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    روزهای حاضر
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    ثبت‌ها
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
                {filtered.map((r) => (
                  <tr key={r.staffId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {r.fullName}
                          </p>
                          {r.teacherCode && (
                            <p className="text-xs text-gray-500">
                              {r.teacherCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {staffTypeLabels[r.staffType] || r.staffType}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {r.position || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {formatNumber(r.stats.presentDays)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatNumber(r.stats.totalRecords)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              r.stats.attendanceRate >= 90
                                ? 'bg-green-500'
                                : r.stats.attendanceRate >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(r.stats.attendanceRate, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${attendanceRateColor(
                            r.stats.attendanceRate
                          )}`}
                        >
                          {r.stats.attendanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/hr/attendance/report?staffId=${r.staffId}`}
                        className="text-xs text-pink-600 hover:text-pink-700"
                      >
                        جزئیات
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && data && data.pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              صفحه {data.pagination.page.toLocaleString('fa-IR')} از{' '}
              {data.pagination.totalPages.toLocaleString('fa-IR')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.pagination.page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(data.pagination.totalPages, p + 1)
                  )
                }
                disabled={data.pagination.page === data.pagination.totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}