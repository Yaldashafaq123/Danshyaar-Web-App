// app/admin/finance/fee-assignments/new/page.tsx
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
  Search,
  User,
  Plus,
  Trash2,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  financeAssignmentsAPI,
  financeAcademicYearsAPI,
  financeTemplatesAPI,
  financeCategoriesAPI,
  financeStudentsAPI,
} from '@/lib/api/finance';
import type {
  AcademicYear,
  FeeTemplate,
  FeeCategory,
  FeeType,
} from '@/types/finance';
import { formatAFN, feeTypeLabels } from '@/lib/utils/finance-helpers';

interface StudentResult {
  id: number;
  userId: number;
  classId: number;
  status: string;
  studentNumber?: string;
  user: { fullName: string; email: string; phone: string };
  class: { id: number; name: string; section: string | null } | null;
}

interface FeeItemForm {
  feeType: FeeType;
  name: string;
  amount: string;
  isRecurring: boolean;
}

export default function NewFeeAssignmentPage() {
  const router = useRouter();

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [templates, setTemplates] = useState<FeeTemplate[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);

  const [mode, setMode] = useState<'direct' | 'template'>('direct');

  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [studentSearching, setStudentSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);

  const [academicYearId, setAcademicYearId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<FeeItemForm[]>([
    {
      feeType: 'MONTHLY_TUITION',
      name: 'شهریه ماهانه',
      amount: '0',
      isRecurring: true,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      financeAcademicYearsAPI.list().catch(() => []),
      financeTemplatesAPI.list().catch(() => []),
      financeCategoriesAPI.list().catch(() => []),
    ])
      .then(([y, t, c]) => {
        setYears(y);
        setTemplates(t);
        setCategories(c);
        const active = y.find((x) => x.isActive);
        if (active) setAcademicYearId(String(active.id));
      })
      .finally(() => setLoading(false));
  }, []);

  // Debounced student search
  useEffect(() => {
    if (!studentQuery || studentQuery.length < 2) {
      setStudentResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setStudentSearching(true);
        const res = await financeStudentsAPI.search(studentQuery);
        setStudentResults(res);
      } catch {
        setStudentResults([]);
      } finally {
        setStudentSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [studentQuery]);

  // When template is chosen, prefill items
  useEffect(() => {
    if (mode === 'template' && templateId) {
      const tpl = templates.find((t) => t.id === Number(templateId));
      if (tpl && tpl.items.length > 0) {
        setItems(
          tpl.items.map((i) => ({
            feeType: i.feeType,
            name: i.name,
            amount: String(i.amount),
            isRecurring: i.isRecurring,
          }))
        );
      }
    }
  }, [templateId, mode, templates]);

  const addItem = () => {
    setItems([
      ...items,
      { feeType: 'OTHER', name: '', amount: '0', isRecurring: false },
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
      items.map((it, i) =>
        i === idx ? { ...it, [field]: value } : it
      )
    );
  };

  const handleSave = async () => {
    if (!selectedStudent) {
      setError('یک شاگرد را انتخاب کنید');
      return;
    }
    if (!academicYearId) {
      setError('سال تحصیلی را انتخاب کنید');
      return;
    }
    if (mode === 'direct') {
      const invalid = items.find(
        (it) => !it.name || Number(it.amount) <= 0
      );
      if (invalid) {
        setError('همه اقلام باید نام و مبلغ معتبر داشته باشند');
        return;
      }
    }
    if (mode === 'template' && !templateId) {
      setError('یک قالب انتخاب کنید');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload =
        mode === 'template'
          ? {
              studentId: selectedStudent.id,
              academicYearId: Number(academicYearId),
              feeTemplateId: Number(templateId),
              notes: notes || undefined,
            }
          : {
              studentId: selectedStudent.id,
              academicYearId: Number(academicYearId),
              items: items.map((it) => ({
                feeType: it.feeType,
                name: it.name,
                amount: Number(it.amount),
                isRecurring: it.isRecurring,
                finalAmount: Number(it.amount),
              })),
              notes: notes || undefined,
            };

      await financeAssignmentsAPI.create(payload);

      setSuccess('تخصیص فیس با موفقیت ایجاد شد');
      setTimeout(() => {
        router.push('/admin/finance/fee-assignments');
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ایجاد تخصیص';
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
            تخصیص فیس جدید
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تخصیص فیس به یک شاگرد
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

      {/* Student selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={18} />
          انتخاب شاگرد
        </h3>

        {selectedStudent ? (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedStudent.user.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedStudent.class
                    ? `${selectedStudent.class.name} ${selectedStudent.class.section || ''}`
                    : 'بدون صنف'}
                  {selectedStudent.user.phone && ` • ${selectedStudent.user.phone}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedStudent(null);
                setStudentQuery('');
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="نام یا شماره تلفن شاگرد..."
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {studentSearching && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin"
                />
              )}
            </div>

            {studentQuery.length >= 2 && !studentSearching && studentResults.length === 0 && (
              <p className="mt-3 text-sm text-gray-500 text-center">
                شاگردی یافت نشد
              </p>
            )}

            {studentResults.length > 0 && (
              <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                {studentResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedStudent(s);
                      setStudentResults([]);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-gray-100 text-right"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {s.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.class
                          ? `${s.class.name} ${s.class.section || ''}`
                          : 'بدون صنف'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Year + Mode */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            سال تحصیلی *
          </label>
          <select
            value={academicYearId}
            onChange={(e) => setAcademicYearId(e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            روش تخصیص
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('direct')}
              className={`p-3 rounded-lg border-2 text-sm text-center transition-colors ${
                mode === 'direct'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <DollarSign size={18} className="mx-auto mb-1" />
              <p className="font-medium">تخصیص دستی</p>
              <p className="text-xs opacity-70 mt-0.5">
                افزودن اقلام به‌صورت دستی
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode('template')}
              className={`p-3 rounded-lg border-2 text-sm text-center transition-colors ${
                mode === 'template'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <FileText size={18} className="mx-auto mb-1" />
              <p className="font-medium">از قالب</p>
              <p className="text-xs opacity-70 mt-0.5">
                استفاده از قالب موجود
              </p>
            </button>
          </div>
        </div>

        {mode === 'template' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              قالب فیس *
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب کنید...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.className} ({t.itemCount} مورد)
                </option>
              ))}
            </select>
            {templates.length === 0 && (
              <p className="mt-2 text-xs text-orange-600">
                قالب فیس موجود نیست. ابتدا از بخش «قالب‌های فیس» ایجاد کنید.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Items (only in direct mode) */}
      {mode === 'direct' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              اقلام فیس
            </h3>
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
                className="p-3 bg-gray-50 rounded-lg border border-gray-100"
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
                    placeholder="نام قلم"
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

                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={it.isRecurring}
                      onChange={(e) =>
                        updateItem(idx, 'isRecurring', e.target.checked)
                      }
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    فیس ماهانه (12 ماه)
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">مجموع:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatAFN(total)}
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          یادداشت
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="یادداشت اختیاری..."
        />
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
          ایجاد تخصیص
        </button>
      </div>
    </div>
  );
}