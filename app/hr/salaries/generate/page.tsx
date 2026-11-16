// app/admin/hr/salaries/generate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Sparkles,
  Info,
  Users,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { hrSalariesAPI } from '@/lib/api/hr';
import type { Salary } from '@/types/hr';
import {
  formatAFN,
  formatNumber,
  getShamsiMonthName,
  getCurrentShamsiYear,
  salaryStatusLabels,
  salaryStatusColors,
} from '@/lib/utils/hr-helpers';

export default function GenerateSalariesPage() {
  const router = useRouter();

  const currentYear = getCurrentShamsiYear();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(currentYear);

  const [existing, setExisting] = useState<Salary[]>([]);
  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const checkExisting = async () => {
    try {
      setChecking(true);
      setError(null);
      const res = await hrSalariesAPI.list({ month, year, limit: 500 });
      setExisting(res.salaries);
    } catch (err) {
      console.error(err);
      setExisting([]);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleGenerate = async () => {
    if (existing.length > 0) {
      const confirmed = window.confirm(
        `${existing.length} معاش قبلاً برای این ماه ثبت شده. آیا ادامه می‌دهید؟ (معاشات موجود نادیده گرفته می‌شوند)`
      );
      if (!confirmed) return;
    }

    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);
      const res = await hrSalariesAPI.generate({ month, year });
      setSuccess(
        `${res.created} معاش ایجاد شد، ${res.skipped} نادیده گرفته شد`
      );
      await checkExisting();
      setTimeout(() => {
        router.push('/admin/hr/salaries');
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ایجاد معاشات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const existingTotal = existing.reduce(
    (sum, s) => sum + Number(s.finalAmount),
    0
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/hr/salaries"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-pink-500" size={26} />
            ایجاد معاشات ماهانه
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ایجاد خودکار معاشات همه معلمان فعال
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
          <p className="font-medium mb-1">راهنمای ایجاد معاشات</p>
          <p>
            سیستم برای هر معلم فعال، معاش پایه را به‌عنوان مبلغ نهایی در نظر
            می‌گیرد. پس از ایجاد، می‌توانید پرداخت را ثبت کنید.
          </p>
        </div>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-pink-500" />
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getShamsiMonthName(m)}
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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

      {/* Existing warning */}
      {existing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle
            className="text-amber-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div className="text-sm text-amber-800 flex-1">
            <p className="font-medium mb-1">
              {existing.length} معاش برای این ماه ثبت شده
            </p>
            <p className="mb-2">
              مجموع: {formatAFN(existingTotal)} — اگر دوباره ایجاد کنید،
              معاشات موجود نادیده گرفته می‌شوند.
            </p>
            <Link
              href="/admin/hr/salaries"
              className="text-amber-700 underline text-xs font-medium"
            >
              مشاهده معاشات موجود →
            </Link>
          </div>
        </div>
      )}

      {/* Preview table */}
      {existing.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              معاشات موجود {getShamsiMonthName(month)} {year}
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
                      {s.teacherName}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                      {formatAFN(s.finalAmount)}
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
      <div className="bg-gradient-to-br from-pink-500 to-rose-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-pink-200" size={20} />
              <span className="text-sm font-medium text-pink-100">
                آماده ایجاد
              </span>
            </div>
            <p className="text-2xl font-bold">
              معاش {getShamsiMonthName(month)} {year}
            </p>
            <p className="text-pink-100 text-sm mt-1">
              {existing.length > 0
                ? `${existing.length} معاش از قبل موجود`
                : 'معاشات جدید ایجاد خواهد شد'}
            </p>
          </div>
          <DollarSign className="text-pink-200 opacity-60" size={48} />
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3 bg-white text-pink-700 rounded-xl font-bold hover:bg-pink-50 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
        >
          {generating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {existing.length > 0 ? 'ادامه ایجاد' : 'ایجاد معاشات'}
        </button>
      </div>
    </div>
  );
}