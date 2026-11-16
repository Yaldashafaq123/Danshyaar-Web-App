// app/admin/hr/salaries/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Search,
  User,
  TrendingUp,
  CreditCard,
  Wallet,
  Calendar,
  Plus,
} from 'lucide-react';
import { hrSalariesAPI } from '@/lib/api/hr';
import type { Salary, SalaryStats } from '@/types/hr';
import {
  formatAFN,
  formatNumber,
  formatShamsiDate,
  getShamsiMonthName,
  getCurrentShamsiYear,
  salaryStatusLabels,
  salaryStatusColors,
  paymentMethodLabels,
} from '@/lib/utils/hr-helpers';

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [stats, setStats] = useState<SalaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentYear = getCurrentShamsiYear();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(currentYear);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Payment modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [payForm, setPayForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    referenceNo: '',
    notes: '',
  });
  const [paying, setPaying] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [salRes, statsRes] = await Promise.all([
        hrSalariesAPI.list({
          month,
          year,
          status: statusFilter || undefined,
          limit: 200,
        }),
        hrSalariesAPI.getStats({ month, year }).catch(() => null),
      ]);
      setSalaries(salRes.salaries);
      if (statsRes) setStats(statsRes);
    } catch (err: unknown) {
      console.error(err);
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
    const remaining = Number(s.finalAmount) - Number(s.payments?.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    ) || 0);
    setSelectedSalary(s);
    setPayForm({
      amount: String(remaining > 0 ? remaining : 0),
      paymentMethod: 'CASH',
      referenceNo: '',
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
      await hrSalariesAPI.pay({
        salaryId: selectedSalary.id,
        amount,
        paymentMethod: payForm.paymentMethod,
        referenceNo: payForm.referenceNo || undefined,
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
    return s.teacherName.toLowerCase().includes(q);
  });

  const totals = filtered.reduce(
    (acc, s) => {
      const paid =
        s.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return {
        total: acc.total + Number(s.finalAmount),
        paid: acc.paid + paid,
        remaining: acc.remaining + (Number(s.finalAmount) - paid),
      };
    },
    { total: 0, paid: 0, remaining: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-pink-500" size={26} />
            معاشات کارمندان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} معاش ثبت شده
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
            href="/admin/hr/salaries/generate"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            ایجاد معاشات
          </Link>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          label="مجموع معاشات"
          value={formatAFN(totals.total)}
          icon={Wallet}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <SummaryCard
          label="پرداخت شده"
          value={formatAFN(totals.paid)}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
        <SummaryCard
          label="باقی‌مانده"
          value={formatAFN(totals.remaining)}
          icon={AlertCircle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <SummaryCard
          label="درصد پرداخت"
          value={`${
            totals.total > 0
              ? Math.round((totals.paid / totals.total) * 100)
              : 0
          }%`}
          icon={TrendingUp}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Stats from backend */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-gray-600">پرداخت شده:</span>
            <span className="font-bold text-gray-900">
              {formatNumber(stats.summary.paidSalaries)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-gray-600">در انتظار:</span>
            <span className="font-bold text-gray-900">
              {formatNumber(stats.summary.pendingSalaries)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-blue-500" />
            <span className="text-gray-600">مجموع معاش:</span>
            <span className="font-bold text-gray-900">
              {formatAFN(stats.summary.totalAmount)}
            </span>
          </div>
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
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="relative">
            <Calendar
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getShamsiMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="PENDING">در انتظار</option>
            <option value="PAID">پرداخت شده</option>
            <option value="PARTIAL">ناقص</option>
            <option value="CANCELLED">لغو شده</option>
          </select>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <span className="text-xs text-gray-500">سال شمسی</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              معاشی برای این ماه ثبت نشده
            </p>
            <Link
              href="/admin/hr/salaries/generate"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
            >
              <Plus size={16} />
              ایجاد معاشات
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
                    معاش پایه
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
                    پرداخت شده
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
                  const paidAmount =
                    s.payments?.reduce(
                      (sum, p) => sum + Number(p.amount),
                      0
                    ) || 0;
                  const remaining = Number(s.finalAmount) - paidAmount;
                  const canPay = remaining > 0 && s.status !== 'CANCELLED';
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {s.teacherName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {s.teacherRole}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatAFN(s.baseSalary)}
                      </td>
                      <td className="px-4 py-3 text-sm text-emerald-600">
                        {s.bonusAmount ? `+${formatAFN(s.bonusAmount)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {s.deductionAmount
                          ? `-${formatAFN(s.deductionAmount)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {formatAFN(s.finalAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={
                            remaining > 0
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }
                        >
                          {formatAFN(paidAmount)}
                        </span>
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
                          <span className="text-xs text-green-600 flex items-center gap-1">
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

      {/* Payment Modal */}
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

            <div className="bg-pink-50 rounded-lg p-3 mb-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">معاش نهایی:</span>
                <span className="font-bold text-gray-900">
                  {formatAFN(selectedSalary.finalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">قبلاً پرداخت شده:</span>
                <span className="font-bold text-emerald-600">
                  {formatAFN(
                    selectedSalary.payments?.reduce(
                      (sum, p) => sum + Number(p.amount),
                      0
                    ) || 0
                  )}
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                  شماره مرجع
                </label>
                <input
                  type="text"
                  value={payForm.referenceNo}
                  onChange={(e) =>
                    setPayForm({ ...payForm, referenceNo: e.target.value })
                  }
                  placeholder="اختیاری"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                className="inline-flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 text-sm"
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
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
      <p className={`text-xl font-bold ${color} truncate`}>{value}</p>
    </div>
  );
}