// app/admin/finance/expenses/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  Filter,
  DollarSign,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { financeExpensesAPI } from '@/lib/api/finance';
import type { Expense, ExpenseCategory } from '@/types/finance';
import { formatAFN, formatNumber, formatDate } from '@/lib/utils/finance-helpers';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [expenses, cats] = await Promise.all([
        financeExpensesAPI.list({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        categories.length === 0
          ? financeExpensesAPI.getCategories()
          : Promise.resolve(categories),
      ]);
      setExpenses(expenses);
      if (categories.length === 0) setCategories(cats);
    } catch (err: unknown) {
      console.error('❌ [Expenses] Error:', err);
      let message = 'خطا در دریافت مصارف';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, categories]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const filtered = expenses.filter((e) => {
    if (categoryFilter && String(e.categoryId) !== categoryFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.description || '').toLowerCase().includes(q) ||
      (e.categoryName || '').toLowerCase().includes(q)
    );
  });

  const totals = {
    count: filtered.length,
    amount: filtered.reduce((s, e) => s + Number(e.amount || 0), 0),
    average:
      filtered.length > 0
        ? filtered.reduce((s, e) => s + Number(e.amount || 0), 0) /
          filtered.length
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="text-orange-500" size={26} />
            مصارف
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ثبت و مدیریت مخارج مکتب
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
            href="/admin/finance/expenses/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText size={16} />
            دسته‌بندی‌ها
          </Link>
          <Link
            href="/admin/finance/expenses/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
          >
            <Plus size={16} />
            ثبت مصرف
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-orange-600" />
            <p className="text-xs text-gray-600">مجموع مصارف</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatAFN(totals.amount)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-blue-600" />
            <p className="text-xs text-gray-600">تعداد مصارف</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatNumber(totals.count)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-purple-600" />
            <p className="text-xs text-gray-600">میانگین</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatAFN(Math.round(totals.average))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی توضیحات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">همه دسته‌ها</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="از"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="تا"
            />
          </div>
        </div>

        {(search || categoryFilter || startDate || endDate) && (
          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('');
              setStartDate('');
              setEndDate('');
            }}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            پاک کردن فیلترها
          </button>
        )}
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
            <Loader2 className="animate-spin text-orange-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingDown className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              مصرفی یافت نشد
            </p>
            <Link
              href="/admin/finance/expenses/add"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              <Plus size={16} />
              ثبت اولین مصرف
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    دسته
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    توضیحات
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    مبلغ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تاریخ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                        <FileText size={12} />
                        {e.categoryName || `دسته #${e.categoryId}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {e.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600">
                      {formatAFN(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(e.date)}
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