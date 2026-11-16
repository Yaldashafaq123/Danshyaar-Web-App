// app/admin/finance/reports/monthly/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { financeReportsAPI } from '@/lib/api/finance';
import type { MonthlyCollectionRow } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatPercentage,
} from '@/lib/utils/finance-helpers';

export default function MonthlyCollectionPage() {
  const [rows, setRows] = useState<MonthlyCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear() - 621);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeReportsAPI.getMonthlyCollection(year);
      setRows(res.monthly || []);
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
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const totalCollected = rows.reduce((s, r) => s + r.collected, 0);
  const totalExpected = rows.reduce((s, r) => s + r.expected, 0);
  const overallRate =
    totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

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
            <Calendar className="text-blue-500" size={26} />
            وصول ماهانه
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            تحلیل درآمد به تفکیک ماه
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Year filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          سال
        </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">مجموع مورد انتظار</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatAFN(totalExpected)}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">مجموع وصول</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatAFN(totalCollected)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">نرخ وصول کلی</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatPercentage(overallRate)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              داده‌ای برای این سال وجود ندارد
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    ماه
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    مورد انتظار
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    وصول شده
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    نرخ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {r.monthName || r.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatAFN(r.expected)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                      {formatAFN(r.collected)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              r.rate >= 80
                                ? 'bg-green-500'
                                : r.rate >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(r.rate, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {r.rate}%
                        </span>
                      </div>
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