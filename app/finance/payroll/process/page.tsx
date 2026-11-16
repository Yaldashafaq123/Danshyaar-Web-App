// app/admin/finance/payroll/process/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Info,
  Users,
  DollarSign,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  financeSalariesAPI,
  financeMiscAPI,
} from '@/lib/api/finance';
import type { Salary, AfghanMonthOption } from '@/types/finance';
import { formatAFN, formatNumber, salaryStatusLabels, salaryStatusColors } from '@/lib/utils/finance-helpers';

export default function ProcessPayrollPage() {
  const router = useRouter();

  const [months, setMonths] = useState<AfghanMonthOption[]>([]);
  const [existing, setExisting] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear() - 621);

  useEffect(() => {
    financeMiscAPI
      .getAfghanMonths()
      .then((m) => {
        setMonths(m);
        const current = m.find((x) => x.isCurrent);
        if (current) setMonth(current.number);
      })
      .catch(() => {
        // Fallback static list
        setMonths([
          { key: 'HAMAL', name: 'حمل', number: 1, isCurrent: false },
          { key: 'SAWR', name: 'ثور', number: 2, isCurrent: false },
          { key: 'JAWZA', name: 'جوزا', number: 3, isCurrent: false },
          { key: 'SARATAN', name: 'سرطان', number: 4, isCurrent: false },
          { key: 'ASAD', name: 'اسد', number: 5, isCurrent: false },
          { key: 'SUNBULA', name: 'سنبله', number: 6, isCurrent: false },
          { key: 'MIZAN', name: 'میزان', number: 7, isCurrent: false },
          { key: 'AQRAB', name: 'عقرب', number: 8, isCurrent: false },
          { key: 'QAWS', name: 'قوس', number: 9, isCurrent: false },
          { key: 'JADI', name: 'جدی', number: 10, isCurrent: false },
          { key: 'DALWA', name: 'دلو', number: 11, isCurrent: false },
          { key: 'HOOT', name: 'حوت', number: 12, isCurrent: false },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Check existing salaries for chosen month
  const checkExisting = async () => {
    try {
      setChecking(true);
      setError(null);
      const res = await financeSalariesAPI.list({ month, year });
      setExisting(res);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در بررسی معاشات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!loading) checkExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, loading]);

  const handleGenerate = async () => {
    if (existing.length > 0) {
      const confirmed = window.confirm(
        `${existing.length} معاش قبلاً برای این ماه ثبت شده. آیا مطمئن هستید؟ (ممکن است معاشات موجود بازسازی شوند)`
      );
      if (!confirmed) return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);
      await financeSalariesAPI.generate({ month, year });
      setSuccess(
        `معاشات ماه ${months[month - 1]?.name || month} ${year} با موفقیت ایجاد شد`
      );
      await checkExisting();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در پردازش معاشات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/finance/payroll"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-purple-500" size={26} />
            پردازش معاشات
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ایجاد خودکار معاشات برای ماه انتخابی
          </p>
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

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">راهنمای پردازش</p>
          <p>
            سیستم بر اساس معاش پایه‌ی هر معلم/کارمند، معاشات ماه را ایجاد
            می‌کند. پس از ایجاد می‌توانید پرداخت را در لیست معاشات ثبت کنید.
          </p>
        </div>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-purple-500" />
          دوره معاش
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ماه
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {months.map((m) => (
                <option key={m.key} value={m.number}>
                  {m.name}
                  {m.isCurrent ? ' (فعلی)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              سال
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={checkExisting}
              disabled={checking}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              بررسی
            </button>
          </div>
        </div>
      </div>

      {/* Existing check */}
      {existing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-amber-800 flex-1">
            <p className="font-medium mb-1">
              {existing.length} معاش قبلاً ثبت شده
            </p>
            <p className="mb-2">
              برای این ماه معاشات از قبل ایجاد شده است. اگر دوباره پردازش کنید،
              ممکن است اطلاعات موجود به‌روزرسانی یا تکرار شود.
            </p>
            <Link
              href="/admin/finance/payroll/salaries"
              className="text-amber-700 underline text-xs font-medium"
            >
              مشاهده لیست معاشات موجود →
            </Link>
          </div>
        </div>
      )}

      {/* Preview / existing list */}
      {existing.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              معاشات ماه {months[month - 1]?.name} {year}
            </h3>
            <span className="text-xs text-gray-500">
              {formatNumber(existing.length)} نفر
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">
                    معلم
                  </th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">
                    معاش نهایی
                  </th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {existing.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {s.teacherName || `معلم #${s.teacherId}`}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                      {formatAFN(s.finalAmount || s.amount)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          salaryStatusColors[s.status] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {salaryStatusLabels[s.status] || s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action card */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-purple-200" size={20} />
              <span className="text-sm font-medium text-purple-100">
                آماده پردازش
              </span>
            </div>
            <p className="text-2xl font-bold">
              معاش ماه {months[month - 1]?.name || month} {year}
            </p>
            <p className="text-purple-100 text-sm mt-1">
              {existing.length > 0
                ? `${existing.length} معاش از قبل موجود`
                : 'معاشات جدید ایجاد خواهد شد'}
            </p>
          </div>
          <DollarSign className="text-purple-200 opacity-60" size={48} />
        </div>

        <button
          onClick={handleGenerate}
          disabled={processing}
          className="w-full py-3 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
        >
          {processing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CreditCard size={18} />
          )}
          {existing.length > 0 ? 'بازپردازش معاشات' : 'ایجاد معاشات'}
        </button>
      </div>
    </div>
  );
}