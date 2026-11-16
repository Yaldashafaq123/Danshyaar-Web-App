// app/admin/academic/timetable/approval/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  RefreshCw,
  Loader2,
  AlertCircle,
  Home,
  Users,
  CheckCircle,
  Clock,
  ArrowLeft,
  XCircle,
  Info,
} from 'lucide-react';
import { principalClassesAPI, principalTimetableAPI } from '@/lib/api/principal';
import type { Class } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

interface ClassApprovalState {
  cls: Class;
  filledPeriods: number;
  totalPeriods: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
}

export default function TimetableApprovalPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [approvals, setApprovals] = useState<ClassApprovalState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState<Record<number, boolean>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const cls = await principalClassesAPI.list();
      setClasses(cls);

      // Analyze each class's timetable completeness
      const states: ClassApprovalState[] = [];
      for (const c of cls) {
        let filled = 0;
        let total = 0;
        // Check first 6 days only (weekdays)
        for (let day = 0; day < 6; day++) {
          try {
            const res = await principalTimetableAPI.get(c.id, day);
            const periods = res.periods || [];
            total += periods.length;
            filled += periods.filter((p) => !p.isEmpty && p.subjectId).length;
          } catch {
            // class has no timetable for this day
          }
        }
        let status: ClassApprovalState['status'] = 'NOT_STARTED';
        if (filled === 0) status = 'NOT_STARTED';
        else if (filled < total) status = 'IN_PROGRESS';
        else status = 'COMPLETE';

        states.push({
          cls: c,
          filledPeriods: filled,
          totalPeriods: total,
          status,
        });
      }

      setApprovals(states);
    } catch (err: unknown) {
      console.error('❌ [Timetable Approval] Error:', err);
      let message = 'خطا در دریافت اطلاعات';
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

  const completeCount = approvals.filter((a) => a.status === 'COMPLETE').length;
  const inProgressCount = approvals.filter((a) => a.status === 'IN_PROGRESS').length;
  const notStartedCount = approvals.filter((a) => a.status === 'NOT_STARTED').length;
  const approvedCount = Object.values(approved).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/academic/timetable"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="text-blue-500" size={26} />
              تصویب تقسیم اوقات
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              بررسی و تأیید جدول زمانی صنوف
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بررسی مجدد
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">راهنمای تصویب</p>
          <p>
            جدول زمانی هر صنف باید کامل باشد تا قابل تصویب شود. صنوف با وضعیت
            «کامل» آماده تأیید نهایی هستند.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          label="کامل"
          value={completeCount}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
        <MiniStat
          label="در جریان"
          value={inProgressCount}
          icon={Clock}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <MiniStat
          label="شروع نشده"
          value={notStartedCount}
          icon={XCircle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <MiniStat
          label="تصویب شده"
          value={approvedCount}
          icon={ClipboardList}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Approvals list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
            <p className="mt-3 text-gray-500 text-sm">
              در حال بررسی صنوف...
            </p>
          </div>
        ) : approvals.length === 0 ? (
          <div className="p-12 text-center">
            <Home className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">هیچ صنفی یافت نشد</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {approvals.map((a) => {
              const percent =
                a.totalPeriods > 0
                  ? Math.round((a.filledPeriods / a.totalPeriods) * 100)
                  : 0;
              const isApproved = approved[a.cls.id];

              return (
                <div key={a.cls.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Class info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Home size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {a.cls.name} {a.cls.section || ''}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users size={10} />
                            {formatNumber(a.cls.studentCount)} شاگرد
                          </span>
                          <span>{a.cls.teacherName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          a.status === 'COMPLETE'
                            ? 'bg-green-100 text-green-700'
                            : a.status === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {a.status === 'COMPLETE' ? (
                          <CheckCircle size={12} />
                        ) : a.status === 'IN_PROGRESS' ? (
                          <Clock size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {a.status === 'COMPLETE'
                          ? 'کامل'
                          : a.status === 'IN_PROGRESS'
                          ? 'در جریان'
                          : 'شروع نشده'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full md:w-40 flex-shrink-0">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>
                          {a.filledPeriods}/{a.totalPeriods}
                        </span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percent === 100
                              ? 'bg-green-500'
                              : percent >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/admin/academic/timetable/${a.cls.id}`}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        مشاهده
                      </Link>
                      {isApproved ? (
                        <button
                          onClick={() =>
                            setApproved({ ...approved, [a.cls.id]: false })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          <CheckCircle size={12} />
                          تأیید شد
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setApproved({ ...approved, [a.cls.id]: true })
                          }
                          disabled={a.status !== 'COMPLETE'}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle size={12} />
                          تأیید
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}