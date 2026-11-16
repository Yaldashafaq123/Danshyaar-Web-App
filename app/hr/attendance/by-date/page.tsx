// app/admin/hr/attendance/by-date/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Search,
  CheckCircle,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';
import { hrAttendanceAPI } from '@/lib/api/hr';
import type { AttendanceResponse } from '@/types/hr';
import {
  formatNumber,
  attendanceStatusLabels,
  attendanceStatusColors,
} from '@/lib/utils/hr-helpers';

export default function AttendanceByDatePage() {
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'late' | 'absent'>(
    'all'
  );

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const fetchData = async () => {
    if (!date) return;
    try {
      setLoading(true);
      setError(null);
      const res = await hrAttendanceAPI.getByDate(date);
      setData(res);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filtered = (data?.attendance || []).filter((row) => {
    if (filter !== 'all' && row.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q)
    );
  });

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
            <Calendar className="text-pink-500" size={26} />
            حضور در تاریخ مشخص
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data?.dateShamsi
              ? `${data.dateShamsi} — ${data.shamsiWeekday}`
              : 'یک تاریخ انتخاب کنید'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          تاریخ (گرگوری)
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <p className="mt-2 text-xs text-gray-500">
          تاریخ میلادی را انتخاب کنید؛ معادل شمسی نمایش داده می‌شود
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
          <p className="mt-3 text-gray-500 text-sm">در حال بارگذاری...</p>
        </div>
      )}

      {!loading && !data && !error && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            برای مشاهده گزارش، تاریخ را انتخاب کنید
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              label="حاضر"
              value={formatNumber(data.summary.present)}
              icon={UserCheck}
              color="text-green-600"
              bg="bg-green-50"
            />
            <SummaryCard
              label="تأخیر"
              value={formatNumber(data.summary.late)}
              icon={AlertTriangle}
              color="text-yellow-600"
              bg="bg-yellow-50"
            />
            <SummaryCard
              label="غایب"
              value={formatNumber(data.summary.absent)}
              icon={UserX}
              color="text-red-600"
              bg="bg-red-50"
            />
            <SummaryCard
              label="به وقت"
              value={formatNumber(data.summary.onTime)}
              icon={CheckCircle}
              color="text-cyan-600"
              bg="bg-cyan-50"
            />
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
                  placeholder="جستجوی نام..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'present', 'late', 'absent'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      filter === f
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all'
                      ? 'همه'
                      : f === 'present'
                      ? 'حاضر'
                      : f === 'late'
                      ? 'تأخیر'
                      : 'غایب'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto text-gray-300" size={48} />
                <p className="mt-3 text-gray-500">کارمندی یافت نشد</p>
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
                        ورود
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                        آخرین ثبت
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                        ثبت‌ها
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                        وضعیت
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {row.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {row.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 flex items-center gap-1">
                            <LogIn size={12} className="text-green-500" />
                            {row.firstCheckIn?.time || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 flex items-center gap-1">
                            <LogOut size={12} className="text-red-500" />
                            {row.lastPunch?.time || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.totalPunches}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              attendanceStatusColors[row.status] ||
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {attendanceStatusLabels[row.status] || row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
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