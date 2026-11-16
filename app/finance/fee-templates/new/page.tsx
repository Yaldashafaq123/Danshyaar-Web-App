// app/admin/finance/fee-templates/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Plus,
  Trash2,
  DollarSign,
} from 'lucide-react';
import {
  financeTemplatesAPI,
  financeAcademicYearsAPI,
  financeCategoriesAPI,
  financeBulkAPI,
} from '@/lib/api/finance';
import type {
  AcademicYear,
  FeeCategory,
  FeeType,
} from '@/types/finance';
import { formatAFN } from '@/lib/utils/finance-helpers';

interface ClassOption {
  id: number;
  name: string;
  section: string;
  studentCount: number;
}

interface FeeItemForm {
  feeType: FeeType;
  name: string;
  amount: string;
  isRecurring: boolean;
  isMandatory: boolean;
  description: string;
}

const defaultItems: FeeItemForm[] = [
  {
    feeType: 'MONTHLY_TUITION',
    name: 'شهریه ماهانه',
    amount: '0',
    isRecurring: true,
    isMandatory: true,
    description: '',
  },
];

export default function NewFeeTemplatePage() {
  const router = useRouter();

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);

  const [form, setForm] = useState({
    name: '',
    classId: '',
    academicYearId: '',
    description: '',
    isActive: true,
  });

  const [items, setItems] = useState<FeeItemForm[]>(defaultItems);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      financeAcademicYearsAPI.list().catch(() => []),
      financeBulkAPI.getClasses().catch(() => []),
      financeCategoriesAPI.list().catch(() => []),
    ])
      .then(([y, c, cat]) => {
        setYears(y);
        setClasses(c);
        setCategories(cat);
        const activeYear = y.find((x) => x.isActive);
        if (activeYear) {
          setForm((f) => ({ ...f, academicYearId: String(activeYear.id) }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        feeType: 'OTHER',
        name: '',
        amount: '0',
        isRecurring: false,
        isMandatory: true,
        description: '',
      },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (
    idx: number,
    field: keyof FeeItemForm,
    value: string | boolean | FeeType
  ) => {
    setItems(
      items.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('نام قالب الزامی است');
      return;
    }
    if (!form.academicYearId) {
      setError('سال تحصیلی الزامی است');
      return;
    }
    const invalid = items.find((it) => !it.name.trim() || Number(it.amount) <= 0);
    if (invalid) {
      setError('همه اقلام باید نام و مبلغ معتبر داشته باشند');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await financeTemplatesAPI.create({
        name: form.name,
        classId: form.classId ? Number(form.classId) : null,
        academicYearId: Number(form.academicYearId),
        description: form.description || undefined,
        isActive: form.isActive,
        items: items.map((it) => ({
          feeType: it.feeType,
          name: it.name,
          amount: Number(it.amount),
          isRecurring: it.isRecurring,
          isMandatory: it.isMandatory,
          description: it.description || undefined,
        })),
      });

      setSuccess('قالب با موفقیت ایجاد شد');
      setTimeout(() => {
        router.push('/admin/finance/fee-templates');
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ایجاد قالب';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-500" size={26} />
            قالب فیس جدید
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ایجاد الگوی فیس برای استفاده گروهی
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

      {/* Basic info */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          اطلاعات قالب
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              نام قالب *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: فیس صنف اول — سال ۱۴۰۳"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              سال تحصیلی *
            </label>
            <select
              value={form.academicYearId}
              onChange={(e) =>
                setForm({ ...form, academicYearId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب کنید...</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name} {y.isActive ? '(فعال)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              صنف (اختیاری)
            </label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">همه صنوف</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section} ({c.studentCount} شاگرد)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              توضیحات
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="توضیحات اختیاری..."
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600"
          />
          <span className="text-sm text-gray-700">قالب فعال باشد</span>
        </label>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign size={18} className="text-blue-500" />
              اقلام فیس
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              مجموع: {formatAFN(total)} — {items.length} قلم
            </p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
          >
            <Plus size={12} />
            افزودن قلم
          </button>
        </div>

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={it.feeType}
                  onChange={(e) =>
                    updateItem(idx, 'feeType', e.target.value as FeeType)
                  }
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={it.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  placeholder="نام قلم *"
                  className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={it.amount}
                    onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                    placeholder="مبلغ"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={it.isRecurring}
                    onChange={(e) =>
                      updateItem(idx, 'isRecurring', e.target.checked)
                    }
                    className="w-3.5 h-3.5 rounded text-blue-600"
                  />
                  ماهانه (۱۲ ماه)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={it.isMandatory}
                    onChange={(e) =>
                      updateItem(idx, 'isMandatory', e.target.checked)
                    }
                    className="w-3.5 h-3.5 rounded text-blue-600"
                  />
                  اجباری
                </label>
                <input
                  type="text"
                  value={it.description}
                  onChange={(e) =>
                    updateItem(idx, 'description', e.target.value)
                  }
                  placeholder="توضیح"
                  className="flex-1 min-w-[160px] px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
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
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          ایجاد قالب
        </button>
      </div>
    </div>
  );
}