// app/admin/academic/evaluations/templates/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Info,
} from 'lucide-react';
import {
  principalEvaluationsAPI,
  principalAcademicYearsAPI,
} from '@/lib/api/principal';
import type { AcademicYear } from '@/types/principal';
import {
  evaluationPeriodLabels,
  evaluationCategoryLabels,
} from '@/lib/utils/principal-helpers';

interface Criterion {
  name: string;
  nameFarsi: string;
  category: string;
  weight: number;
  maxScore: number;
}

const defaultCriteria: Criterion[] = [
  { name: 'Lesson Planning', nameFarsi: 'برنامه‌ریزی درسی', category: 'TEACHING', weight: 1.5, maxScore: 5 },
  { name: 'Subject Knowledge', nameFarsi: 'تسلط بر ماده درسی', category: 'TEACHING', weight: 1.5, maxScore: 5 },
  { name: 'Classroom Management', nameFarsi: 'مدیریت صنف', category: 'DISCIPLINE', weight: 1.5, maxScore: 5 },
  { name: 'Communication', nameFarsi: 'ارتباطات', category: 'COMMUNICATION', weight: 1.0, maxScore: 5 },
  { name: 'Punctuality', nameFarsi: 'وقت‌شناسی', category: 'PROFESSIONAL', weight: 1.0, maxScore: 5 },
];

export default function NewTemplatePage() {
  const router = useRouter();

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    period: 'SEMESTER',
    academicYearId: '',
    isDefault: false,
  });

  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);

  useEffect(() => {
    principalAcademicYearsAPI
      .list()
      .then((yrs) => {
        setYears(yrs);
        const active = yrs.find((y) => y.isActive);
        if (active) setForm((f) => ({ ...f, academicYearId: String(active.id) }));
      })
      .catch((e) => console.error(e));
  }, []);

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      { name: '', nameFarsi: '', category: 'TEACHING', weight: 1.0, maxScore: 5 },
    ]);
  };

  const removeCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const updateCriterion = (idx: number, field: keyof Criterion, value: string | number) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = async () => {
    if (!form.name) {
      setError('نام قالب الزامی است');
      return;
    }
    if (criteria.length === 0) {
      setError('حداقل یک معیار لازم است');
      return;
    }
    if (criteria.some((c) => !c.nameFarsi && !c.name)) {
      setError('همه معیارها باید نام داشته باشند');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await principalEvaluationsAPI.createTemplate({
        name: form.name,
        description: form.description,
        period: form.period,
        academicYearId: form.academicYearId
          ? Number(form.academicYearId)
          : undefined,
        isDefault: form.isDefault,
        criteria,
      });
      setSuccess('قالب با موفقیت ایجاد شد');
      setTimeout(() => {
        router.push('/admin/academic/evaluations/templates');
      }, 1200);
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

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);

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
            قالب ارزیابی جدید
          </h1>
          <p className="text-gray-500 text-sm">
            ایجاد قالب جدید برای ارزیابی معلمان
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

      {/* Template info */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            اطلاعات قالب
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="نام قالب *"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="مثال: قالب استاندارد ارزیابی"
            />
            <FormSelect
              label="دوره ارزیابی"
              value={form.period}
              onChange={(v) => setForm({ ...form, period: v })}
              options={Object.entries(evaluationPeriodLabels).map(
                ([value, label]) => ({ value, label })
              )}
            />
            <FormSelect
              label="سال تحصیلی"
              value={form.academicYearId}
              onChange={(v) => setForm({ ...form, academicYearId: v })}
              options={[
                { value: '', label: 'تعیین نشده' },
                ...years.map((y) => ({
                  value: String(y.id),
                  label: `${y.name}${y.isActive ? ' (فعال)' : ''}`,
                })),
              ]}
            />
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

          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="w-4 h-4 rounded text-blue-600"
            />
            <span className="text-sm text-gray-700">
              این قالب پیش‌فرض باشد
            </span>
          </label>
        </div>
      </div>

      {/* Criteria */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              معیارهای ارزیابی
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              مجموع وزن: {totalWeight.toFixed(1)} • {criteria.length} معیار
            </p>
          </div>
          <button
            onClick={addCriterion}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
          >
            <Plus size={12} />
            افزودن معیار
          </button>
        </div>

        <div className="space-y-3">
          {criteria.map((c, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={c.nameFarsi}
                    onChange={(e) =>
                      updateCriterion(idx, 'nameFarsi', e.target.value)
                    }
                    placeholder="نام معیار (فارسی)"
                    className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) =>
                      updateCriterion(idx, 'name', e.target.value)
                    }
                    placeholder="Name (English)"
                    className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={c.category}
                    onChange={(e) =>
                      updateCriterion(idx, 'category', e.target.value)
                    }
                    className="px-3 py-1.5 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(evaluationCategoryLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">وزن</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="3"
                        value={c.weight}
                        onChange={(e) =>
                          updateCriterion(
                            idx,
                            'weight',
                            Number(e.target.value) || 1
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">حداکثر</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={c.maxScore}
                        onChange={(e) =>
                          updateCriterion(
                            idx,
                            'maxScore',
                            Number(e.target.value) || 5
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeCriterion(idx)}
                  disabled={criteria.length === 1}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 flex-shrink-0"
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
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

function FormInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}