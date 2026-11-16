// app/admin/hr/evaluations/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  Search,
  User,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { hrEvaluationsAPI } from '@/lib/api/hr';
import type { Evaluation } from '@/types/hr';
import {
  formatNumber,
  formatPercentage,
  formatShamsiDate,
} from '@/lib/utils/hr-helpers';

function getScoreColor(score: number | null | undefined): {
  text: string;
  bg: string;
  label: string;
} {
  if (score === null || score === undefined)
    return { text: 'text-gray-500', bg: 'bg-gray-50', label: '—' };
  if (score >= 90)
    return { text: 'text-green-600', bg: 'bg-green-50', label: 'عالی' };
  if (score >= 80)
    return { text: 'text-blue-600', bg: 'bg-blue-50', label: 'خیلی خوب' };
  if (score >= 70)
    return { text: 'text-yellow-600', bg: 'bg-yellow-50', label: 'خوب' };
  if (score >= 60)
    return { text: 'text-orange-600', bg: 'bg-orange-50', label: 'قابل قبول' };
  return { text: 'text-red-600', bg: 'bg-red-50', label: 'نیاز به بهبود' };
}

export default function EvaluationsListPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrEvaluationsAPI.list({
        period: periodFilter || undefined,
        page,
        limit,
      });
      setEvaluations(res.evaluations);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      console.error('❌ [Evaluations] Error:', err);
      let message = 'خطا در دریافت ارزیابی‌ها';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, periodFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = evaluations.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.User.fullName.toLowerCase().includes(q) ||
      e.User.email.toLowerCase().includes(q) ||
      (e.Evaluator?.fullName || '').toLowerCase().includes(q)
    );
  });

  const avgScore =
    evaluations.length > 0
      ? Math.round(
          (evaluations.reduce(
            (sum, e) => sum + (Number(e.overallScore) || 0),
            0
          ) /
            evaluations.length) *
            10
        ) / 10
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-pink-500" size={26} />
            ارزیابی‌های عملکرد
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total > 0
              ? `${total.toLocaleString('fa-IR')} ارزیابی ثبت شده`
              : 'ارزیابی عملکرد کارمندان'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/hr/evaluations/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            ارزیابی جدید
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-pink-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-pink-600" />
            <p className="text-xs text-gray-600">مجموع ارزیابی‌ها</p>
          </div>
          <p className="text-2xl font-bold text-pink-600">
            {formatNumber(total)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-blue-600" />
            <p className="text-xs text-gray-600">میانگین امتیاز</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {avgScore.toFixed(1)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} className="text-emerald-600" />
            <p className="text-xs text-gray-600">ارزیابی‌های اخیر</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {formatNumber(evaluations.length)}
          </p>
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
              placeholder="جستجوی نام کارمند یا ارزیاب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <input
            type="text"
            placeholder="دوره (مثال: ماهانه)"
            value={periodFilter}
            onChange={(e) => {
              setPeriodFilter(e.target.value);
              setPage(1);
            }}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">هیچ ارزیابی یافت نشد</p>
            <Link
              href="/admin/hr/evaluations/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
            >
              <Plus size={16} />
              ایجاد اولین ارزیابی
            </Link>
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
                    دوره
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    ارزیاب
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    امتیاز کل
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تاریخ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((e) => {
                  const scoreColor = getScoreColor(e.overallScore);
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {e.User.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {e.User.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {e.period}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {e.Evaluator?.fullName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-bold ${scoreColor.text}`}
                        >
                          {e.overallScore
                            ? Number(e.overallScore).toFixed(1)
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatShamsiDate(e.date)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/hr/evaluations/${e.id}`}
                          className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm"
                        >
                          <Eye size={14} />
                          مشاهده
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              صفحه {page.toLocaleString('fa-IR')} از{' '}
              {totalPages.toLocaleString('fa-IR')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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