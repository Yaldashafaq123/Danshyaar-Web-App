// app/admin/finance/payment-history/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  TrendingUp,
} from 'lucide-react';
import { financePaymentsAPI } from '@/lib/api/finance';
import type { Payment, PaymentMethod } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatDateTime,
  paymentMethodLabels,
} from '@/lib/utils/finance-helpers';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    monthlyCount: 0,
    oneTimeCount: 0,
    totalAmount: 0,
  });
  const limit = 20;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financePaymentsAPI.getHistory({
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit,
        paymentMethod: (methodFilter as PaymentMethod) || undefined,
      });
      setPayments(res.payments);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setSummary(res.summary);
    } catch (err: unknown) {
      console.error('❌ [Payment History] Error:', err);
      let message = 'خطا در دریافت تاریخ پرداخت‌ها';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, methodFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setMethodFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="text-blue-500" size={26} />
            تاریخ پرداخت‌ها
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total > 0
              ? `${total.toLocaleString('fa-IR')} پرداخت ثبت شده`
              : 'همه پرداخت‌های فیس'}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-emerald-600" />
            <p className="text-xs text-gray-600">مجموع (این صفحه)</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {formatAFN(summary.totalAmount)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 mb-1">پرداخت‌های ماهانه</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatNumber(summary.monthlyCount)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 mb-1">پرداخت‌های یک‌باره</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatNumber(summary.oneTimeCount)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی نام، شماره تلفن یا رسید..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            placeholder="از تاریخ"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            placeholder="تا تاریخ"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">همه روش‌ها</option>
            {Object.entries(paymentMethodLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          {(search || startDate || endDate || methodFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              پاک کردن فیلترها
            </button>
          )}
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
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">پرداختی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شاگرد
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    صنف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    نوع فیس
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    مبلغ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    روش
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تاریخ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    ثبت کننده
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={`${p.type}-${p.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {p.studentName}
                          </p>
                          {p.studentPhone && (
                            <p className="text-xs text-gray-500">
                              {p.studentPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.className}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            p.type === 'monthly'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {p.type === 'monthly' ? 'ماهانه' : 'یک‌باره'}
                        </span>
                        <span className="text-sm text-gray-700 truncate max-w-[180px]">
                          {p.feeTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                      {formatAFN(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {paymentMethodLabels[p.paymentMethod] || p.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {formatDateTime(p.date)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.confirmedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && payments.length > 0 && totalPages > 1 && (
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