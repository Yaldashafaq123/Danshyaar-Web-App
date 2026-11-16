// app/admin/hr/attendance/today/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
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
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { hrAttendanceAPI } from '@/lib/api/hr';
import type { AttendanceResponse, AttendanceRow } from '@/types/hr';
import {
  formatNumber,
  attendanceStatusLabels,
  attendanceStatusColors,
} from '@/lib/utils/hr-helpers';

export default function TodayAttendancePage() {
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'late' | 'absent'>(
    'all'
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrAttendanceAPI.getToday();
      setData(res);
    } catch (err: unknown) {
      console.error('❌ [Today Attendance] Error:', err);
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
            <Clock className="text-pink-500" size={26} />
            حضور امروز
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data?.dateShamsi || 'در حال بارگذاری...'}
            {data?.shamsiWeekday && ` — ${data.shamsiWeekday}`}
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {data && (
        <>
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

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            ساعت شروع مکتب: <strong>{data.schoolStartTime}</strong> —
            مجموع {formatNumber(data.summary.totalPunches)} ثبت حضور در سیستم
          </div>
        </>
      )}

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
              placeholder="جستجوی نام یا ایمیل..."
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
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">کارمندی یافت نشد</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((row) => (
              <AttendanceRowItem
                key={row.id}
                row={row}
                expanded={expandedId === row.id}
                onToggle={() =>
                  setExpandedId(expandedId === row.id ? null : row.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceRowItem({
  row,
  expanded,
  onToggle,
}: {
  row: AttendanceRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 text-right"
      >
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
          <User size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>

        {/* Check-in */}
        <div className="text-center hidden md:block flex-shrink-0">
          <p className="text-xs text-gray-500">ورود</p>
          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
            <LogIn size={12} className="text-green-500" />
            {row.firstCheckIn?.time || '—'}
          </p>
        </div>

        {/* Check-out */}
        <div className="text-center hidden md:block flex-shrink-0">
          <p className="text-xs text-gray-500">آخرین ثبت</p>
          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
            <LogOut size={12} className="text-red-500" />
            {row.lastPunch?.time || '—'}
          </p>
        </div>

        {/* Status */}
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
            attendanceStatusColors[row.status] ||
            'bg-gray-100 text-gray-600'
          }`}
        >
          {attendanceStatusLabels[row.status] || row.status}
        </span>

        {/* Punch count */}
        <span className="text-xs text-gray-500 flex-shrink-0 hidden lg:block">
          {row.totalPunches} ثبت
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
          <div className="pt-4">
            {row.records.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                هیچ ثبتی برای این کارمند در امروز وجود ندارد
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {row.records.map((r, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-center border ${
                      r.label === 'IN'
                        ? 'bg-green-50 border-green-200'
                        : r.label === 'OUT'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-700">
                      {r.labelFa}
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {r.time}
                    </p>
                    <p className="text-[10px] text-gray-500">{r.device}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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