// app/admin/finance/reports/daily/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Receipt,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  TrendingUp,
} from 'lucide-react';
import { financeReportsAPI } from '@/lib/api/finance';
import type { DailyCollection, Payment } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatDateTime,
  paymentMethodLabels,
} from '@/lib/utils/finance-helpers';

export default function DailyCollectionPage() {
  const [data, setData] = useState<DailyCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeReportsAPI.getDailyCollection(date);
      setData(res);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت گزارش روزانه';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/finance/reports"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="text-emerald-500" size={26} />
            وصول روزانه
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            گزارش پرداخت‌های یک روز
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Date picker */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          تاریخ
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary */}
      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-emerald-600" />
              <p className="text-sm text-gray-600">مجموع وصول</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {formatAFN(data.totalAmount)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-blue-600" />
              <p className="text-sm text-gray-600">تعداد پرداخت‌ها</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {formatNumber(data.totalPayments)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-emerald-500 mx-auto" size={32} />
          </div>
        ) : !data || data.payments.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              پرداختی در این تاریخ ثبت نشده
            </p>
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
                    فیس
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    مبلغ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    روش
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    زمان
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.payments.map((p) => (
                  <tr key={`${p.type}-${p.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {p.studentName}
                          </p>
                          <p className="text-xs text-gray-500">{p.className}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {p.feeTitle}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                      {formatAFN(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {paymentMethodLabels[p.paymentMethod] || p.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDateTime(p.date)}
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