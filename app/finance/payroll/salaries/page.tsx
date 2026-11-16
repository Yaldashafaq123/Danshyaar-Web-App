// app/admin/finance/payroll/salaries/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Save,
  Users,
  DollarSign,
  Calendar,
  ArrowLeft,
  CreditCard,
} from 'lucide-react';
import { financeSalariesAPI } from '@/lib/api/finance';
import type { Salary, PaymentMethod } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatDate,
  salaryStatusLabels,
  salaryStatusColors,
  paymentMethodLabels,
} from '@/lib/utils/finance-helpers';

export default function SalariesListPage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Payment modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [payForm, setPayForm] = useState({
    amount: '',
    paymentMethod: 'CASH' as PaymentMethod,
    notes: '',
  });
  const [paying, setPaying] = useState(false);

  const months = [
    'حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله',
    'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت',
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeSalariesAPI.list({
        month,
        year,
        status: statusFilter || undefined,
      });
      setSalaries(res);
    } catch (err: unknown) {
      console.error('❌ [Salaries] Error:', err);
      let message = 'خطا در دریافت معاشات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [month, year, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openPayModal = (s: Salary) => {
    const remaining =
      Number(s.finalAmount || s.amount) - Number(s.paidAmount || 0);
    setSelectedSalary(s);
    setPayForm({
      amount: String(remaining > 0 ? remaining : 0),
      paymentMethod: 'CASH',
      notes: '',
    });
    setPayModalOpen(true);
    setError(null);
  };

  const handlePayment = async () => {
    if (!selectedSalary) return;
    const amount = Number(payForm.amount);
    if (amount <= 0) {
      setError('مبلغ باید بزرگتر از صفر باشد');
      return;
    }

    try {
      setPaying(true);
      setError(null);
      await financeSalariesAPI.recordPayment({
        salaryId: selectedSalary.id,
        amount,
        paymentMethod: payForm.paymentMethod,
        notes: payForm.notes || undefined,
      });
      setSuccess(`پرداخت ${formatAFN(amount)} ثبت شد`);
      setPayModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ثبت پرداخت';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setPaying(false);
    }
  };

  const filtered = salaries.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (s.teacherName || '').toLowerCase();
    return name.includes(q);
  });

  const totals = {
    count: filtered.length,
    total: filtered.reduce(
      (s, x) => s + Number(x.finalAmount || x.amount || 0),
      0
    ),
    paid: filtered.reduce((s, x) => s + Number(x.paidAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/finance/payroll"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-purple-500" size={26} />
            لیست معاشات
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {months[month - 1]} {year}
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
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

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
              placeholder="جستجوی نام معلم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="PENDING">در انتظار</option>
            <option value="PAID">پرداخت شده</option>
            <option value="PARTIAL">ناقص</option>
            <option value="CANCELLED">لغو شده</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 mb-1">تعداد</p>
          <p className="text-xl font-bold text-purple-600">
            {formatNumber(totals.count)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 mb-1">مجموع</p>
          <p className="text-xl font-bold text-blue-600">
            {formatAFN(totals.total)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 mb-1">پرداخت شده</p>
          <p className="text-xl font-bold text-emerald-600">
            {formatAFN(totals.paid)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-purple-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              معاشی برای این ماه ثبت نشده
            </p>
            <Link
              href="/admin/finance/payroll/process"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              <CreditCard size={16} />
              پردازش معاشات
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    معلم
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    پایه
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    پاداش
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    کسر
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    نهایی
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    وضعیت
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const remaining =
                    Number(s.finalAmount || s.amount) -
                    Number(s.paidAmount || 0);
                  const canPay = remaining > 0 && s.status !== 'CANCELLED';
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                            <Users size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {s.teacherName || `معلم #${s.teacherId}`}
                            </p>
                            {s.paidAt && (
                              <p className="text-xs text-gray-500">
                                پرداخت: {formatDate(s.paidAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatAFN(s.baseSalary)}
                      </td>
                      <td className="px-4 py-3 text-sm text-emerald-600">
                        {s.bonusAmount
                          ? `+${formatAFN(s.bonusAmount)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {s.deductionAmount
                          ? `-${formatAFN(s.deductionAmount)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {formatAFN(s.finalAmount || s.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            salaryStatusColors[s.status] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {salaryStatusLabels[s.status] || s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canPay ? (
                          <button
                            onClick={() => openPayModal(s)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs hover:bg-emerald-100"
                          >
                            <CreditCard size={12} />
                            پرداخت
                          </button>
                        ) : s.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle size={12} />
                            پرداخت شده
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment modal */}
      {payModalOpen && selectedSalary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  پرداخت معاش
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedSalary.teacherName}
                </p>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">معاش کل:</span>
                <span className="font-bold text-gray-900">
                  {formatAFN(
                    selectedSalary.finalAmount || selectedSalary.amount
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">قبلاً پرداخت شده:</span>
                <span className="font-bold text-emerald-600">
                  {formatAFN(selectedSalary.paidAmount || 0)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  مبلغ پرداخت *
                </label>
                <input
                  type="number"
                  value={payForm.amount}
                  onChange={(e) =>
                    setPayForm({ ...payForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  روش پرداخت
                </label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(paymentMethodLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  یادداشت
                </label>
                <textarea
                  value={payForm.notes}
                  onChange={(e) =>
                    setPayForm({ ...payForm, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPayModalOpen(false)}
                disabled={paying}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handlePayment}
                disabled={paying}
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {paying ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                ثبت پرداخت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}