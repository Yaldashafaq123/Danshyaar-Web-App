// app/admin/finance/expenses/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { financeExpensesAPI } from '@/lib/api/finance';
import type { ExpenseCategory } from '@/types/finance';
import { formatAFN } from '@/lib/utils/finance-helpers';

export default function AddExpensePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    financeExpensesAPI
      .getCategories()
      .then((c) => {
        setCategories(c);
        if (c.length > 0) setForm((f) => ({ ...f, categoryId: String(c[0].id) }));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.categoryId) {
      setError('دسته‌بندی را انتخاب کنید');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('مبلغ باید بزرگتر از صفر باشد');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await financeExpensesAPI.create({
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        description: form.description || undefined,
        date: form.date || undefined,
      });

      setSuccess('مصرف با موفقیت ثبت شد');
      setTimeout(() => {
        router.push('/admin/finance/expenses');
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ثبت مصرف';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="text-orange-500" size={26} />
            ثبت مصرف جدید
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ثبت هزینه جدید مکتب
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

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            دسته‌بندی *
          </label>
          {categories.length === 0 ? (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
              هیچ دسته‌بندی‌ای وجود ندارد.{' '}
              <button
                onClick={() =>
                  router.push('/admin/finance/expenses/categories')
                }
                className="underline font-medium"
              >
                ایجاد دسته‌بندی
              </button>
            </div>
          ) : (
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            مبلغ (افغانی) *
          </label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {form.amount && Number(form.amount) > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              معادل: {formatAFN(Number(form.amount))}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            تاریخ
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            توضیحات
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="مثال: خرید لوازم اداری..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => router.back()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <X size={16} />
          انصراف
        </button>
        <button
          onClick={handleSave}
          disabled={saving || categories.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          ثبت مصرف
        </button>
      </div>
    </div>
  );
}