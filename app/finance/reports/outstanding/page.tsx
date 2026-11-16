// app/admin/finance/reports/outstanding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  User,
  Phone,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { financeOutstandingAPI } from '@/lib/api/finance';
import type { OutstandingFees } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  getAfghanMonthName,
} from '@/lib/utils/finance-helpers';

export default function OutstandingReportPage() {
  const [data, setData] = useState<OutstandingFees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeOutstandingAPI.list();
      setData(res);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت گزارش معوقات';
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
            <AlertTriangle className="text-red-500" size={26} />
            گزارش معوقات
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            شاگردان با فیس پرداخت‌نشده
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
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
          <div className="bg-red-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={20} className="text-red-600" />
              <p className="text-sm text-gray-600">مجموع معوقات</p>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {formatAFN(data.totalOutstanding)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <User size={20} className="text-orange-600" />
              <p className="text-sm text-gray-600">شاگردان با معوق</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {formatNumber(data.totalStudents)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            لیست شاگردان
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-red-500 mx-auto" size={32} />
          </div>
        ) : !data || data.students.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto text-green-300" size={48} />
            <p className="mt-3 text-gray-500">
              هیچ معوقی وجود ندارد 🎉
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
                    صنف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    سال تحصیلی
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تعداد
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    معوق
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.students.map((s) => (
                  <tr key={s.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {s.studentName}
                          </p>
                          {s.studentPhone && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone size={10} />
                              {s.studentPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {s.className || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.AcademicYear}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatNumber(s.pendingItems.length)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600">
                      {formatAFN(s.totalBalance)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/finance/fee-collection/student/${s.studentId}`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100"
                      >
                        <DollarSign size={12} />
                        وصول
                      </Link>
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