// app/admin/finance/defaulters/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  User,
  Eye,
  Phone,
  MessageSquare,
  DollarSign,
  Home,
  ChevronDown,
  ChevronUp,
  TrendingDown,
} from 'lucide-react';
import {
  financeStudentsAPI,
  financeBulkAPI,
} from '@/lib/api/finance';
import type { StudentPendingFee } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  getAfghanMonthName,
} from '@/lib/utils/finance-helpers';

interface ClassOption {
  id: number;
  name: string;
  section: string;
  studentCount: number;
}

export default function DefaultersPage() {
  const [students, setStudents] = useState<StudentPendingFee[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalStudents: number;
    studentsWithPending: number;
    totalPendingAmount: number;
    averagePending: number;
  } | null>(null);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeStudentsAPI.getPendingFees(
        classFilter ? Number(classFilter) : undefined
      );
      setStudents(res.data);
      if (res.summary) setSummary(res.summary);
    } catch (err: unknown) {
      console.error('❌ [Defaulters] Error:', err);
      let message = 'خطا در دریافت لیست معوقات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [classFilter]);

  useEffect(() => {
    financeBulkAPI
      .getClasses()
      .then(setClasses)
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q))
    );
  });

  const totals = {
    students: filtered.length,
    amount: filtered.reduce((s, x) => s + x.totalPending, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={26} />
            شاگردان معوق
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            پیگیری شاگردان با فیس پرداخت‌نشده
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

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={16} className="text-red-600" />
              <p className="text-xs text-gray-600">مجموع معوقات</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatAFN(summary.totalPendingAmount)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className="text-orange-600" />
              <p className="text-xs text-gray-600">شاگردان معوق</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {formatNumber(summary.studentsWithPending)}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="text-yellow-600" />
              <p className="text-xs text-gray-600">میانگین معوق</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {formatAFN(summary.averagePending)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Home size={16} className="text-blue-600" />
              <p className="text-xs text-gray-600">کل شاگردان</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(summary.totalStudents)}
            </p>
          </div>
        </div>
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
              placeholder="جستجوی نام یا شماره تلفن..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">همه صنوف</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-red-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <AlertTriangle className="mx-auto text-green-300" size={48} />
          <p className="mt-3 text-gray-500">
            هیچ شاگرد معوقی یافت نشد 🎉
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {formatNumber(totals.students)} شاگرد
            </span>
            <span className="text-red-600 font-bold">
              مجموع: {formatAFN(totals.amount)}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filtered.map((s) => {
                const isExpanded = expandedId === s.id;
                return (
                  <div key={s.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 text-right"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                        <User size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span>
                            {s.className}
                            {s.classSection && ` - ${s.classSection}`}
                          </span>
                          {s.phone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone size={10} />
                                {s.phone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-left flex-shrink-0">
                        <p className="text-xs text-gray-500">معوق</p>
                        <p className="text-base font-bold text-red-600">
                          {formatAFN(s.totalPending)}
                        </p>
                      </div>

                      <div className="text-gray-400 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                        <div className="pt-4 space-y-2">
                          <p className="text-xs text-gray-500 font-medium mb-2">
                            جزئیات معوقات ({s.pendingCount} مورد):
                          </p>
                          {s.pendingFees.map((fee) => (
                            <div
                              key={`${fee.type}-${fee.id}`}
                              className="flex items-center justify-between p-2 bg-white rounded text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    fee.type === 'monthly'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-purple-100 text-purple-700'
                                  }`}
                                >
                                  {fee.type === 'monthly'
                                    ? 'ماهانه'
                                    : 'یک‌باره'}
                                </span>
                                <span className="text-gray-700">
                                  {fee.type === 'monthly'
                                    ? `${getAfghanMonthName(fee.month || '')} ${fee.year}`
                                    : fee.name}
                                </span>
                              </div>
                              <span className="text-red-600 font-semibold">
                                {formatAFN(fee.balanceAmount)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                          <Link
                            href={`/admin/finance/fee-collection/student/${s.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                          >
                            <DollarSign size={12} />
                            وصول فیس
                          </Link>
                          {s.phone && (
                            <>
                              <a
                                href={`tel:${s.phone}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100"
                              >
                                <Phone size={12} />
                                تماس
                              </a>
                              <a
                                href={`https://wa.me/${s.phone.replace(/[^\d]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100"
                              >
                                <MessageSquare size={12} />
                                واتساپ
                              </a>
                            </>
                          )}
                          <Link
                            href={`/admin/finance/fee-assignments?studentId=${s.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 ml-auto"
                          >
                            <Eye size={12} />
                            مشاهده تخصیص‌ها
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}