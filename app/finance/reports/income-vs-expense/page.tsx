// app/admin/finance/reports/income-vs-expense/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
} from 'lucide-react';
import { financeReportsAPI } from '@/lib/api/finance';
import type { IncomeStatement } from '@/types/finance';
import {
  formatAFN,
  formatAFNCompact,
  formatPercentage,
} from '@/lib/utils/finance-helpers';

export default function IncomeVsExpensePage() {
  const [data, setData] = useState<IncomeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeReportsAPI.getIncomeStatement({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const totalIncome = data?.income?.total || 0;
  const totalExpense = data?.expenses?.total || 0;
  const netIncome = data?.netIncome || 0;
  const maxValue = Math.max(totalIncome, totalExpense, 1);

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
            <BarChart3 className="text-purple-500" size={26} />
            عواید و مصارف
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            مقایسه درآمد و هزینه‌های مکتب
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Date filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              از تاریخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              تا تاریخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {(startDate || endDate) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                پاک کردن فیلتر
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-purple-500 mx-auto" size={32} />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-emerald-600" />
                <p className="text-sm text-gray-600">مجموع عواید</p>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {formatAFN(totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={20} className="text-red-600" />
                <p className="text-sm text-gray-600">مجموع مصارف</p>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {formatAFN(totalExpense)}
              </p>
            </div>
            <div
              className={`rounded-xl p-6 ${
                netIncome >= 0 ? 'bg-purple-50' : 'bg-orange-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Wallet
                  size={20}
                  className={netIncome >= 0 ? 'text-purple-600' : 'text-orange-600'}
                />
                <p className="text-sm text-gray-600">
                  {netIncome >= 0 ? 'سود خالص' : 'زیان'}
                </p>
              </div>
              <p
                className={`text-3xl font-bold ${
                  netIncome >= 0 ? 'text-purple-600' : 'text-orange-600'
                }`}
              >
                {formatAFN(Math.abs(netIncome))}
              </p>
            </div>
          </div>

          {/* Comparison bars */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-6">
              مقایسه تصویری
            </h3>

            <div className="space-y-6">
              <BarRow
                label="عواید"
                value={totalIncome}
                max={maxValue}
                color="bg-gradient-to-r from-emerald-400 to-emerald-600"
                textColor="text-emerald-600"
              />
              <BarRow
                label="مصارف"
                value={totalExpense}
                max={maxValue}
                color="bg-gradient-to-r from-red-400 to-red-600"
                textColor="text-red-600"
              />
              <BarRow
                label={netIncome >= 0 ? 'سود' : 'زیان'}
                value={Math.abs(netIncome)}
                max={maxValue}
                color={
                  netIncome >= 0
                    ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                    : 'bg-gradient-to-r from-orange-400 to-orange-600'
                }
                textColor={netIncome >= 0 ? 'text-purple-600' : 'text-orange-600'}
              />
            </div>

            {totalIncome > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">نسبت مصارف به عواید:</span>
                  <span
                    className={`font-bold ${
                      totalExpense / totalIncome > 1
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {formatPercentage((totalExpense / totalIncome) * 100, 1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
  textColor,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  textColor: string;
}) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-lg font-bold ${textColor}`}>
          {formatAFN(value)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className={`${color} h-4 rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">
        {formatAFNCompact(value)} • {Math.round(percent)}% از بیشترین
      </p>
    </div>
  );
}