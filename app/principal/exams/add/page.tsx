// app/admin/academic/exams/add/page.tsx
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
  ClipboardList,
} from 'lucide-react';
import {
  principalExamsAPI,
  principalClassesAPI,
  principalAcademicYearsAPI,
} from '@/lib/api/principal';
import type { Class, AcademicYear } from '@/types/principal';

export default function AddExamPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<Class[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    subject: '',
    classId: '',
    date: '',
    startTime: '',
    totalMarks: '100',
    passingMarks: '40',
    type: 'general',
    month: '',
    year: '',
    academicYearId: '',
    description: '',
    isPublished: false,
  });

  useEffect(() => {
    Promise.all([
      principalClassesAPI.list(),
      principalAcademicYearsAPI.list(),
    ])
      .then(([cls, yrs]) => {
        setClasses(cls);
        setYears(yrs);
        const activeYear = yrs.find((y) => y.isActive);
        if (activeYear) {
          setForm((f) => ({ ...f, academicYearId: String(activeYear.id) }));
        }
      })
      .catch((e) => console.error('Load error:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.classId || !form.date) {
      setError('نام، صنف و تاریخ امتحان الزامی است');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await principalExamsAPI.create({
        name: form.name,
        subject: form.subject || undefined,
        classId: Number(form.classId),
        date: form.date,
        startTime: form.startTime || undefined,
        totalMarks: form.totalMarks ? Number(form.totalMarks) : undefined,
        passingMarks: form.passingMarks
          ? Number(form.passingMarks)
          : undefined,
        isPublished: form.isPublished,
        type: form.type || undefined,
        month: form.month ? Number(form.month) : undefined,
        year: form.year ? Number(form.year) : undefined,
        description: form.description || undefined,
        academicYearId: form.academicYearId
          ? Number(form.academicYearId)
          : undefined,
      });
      setSuccess('امتحان با موفقیت ایجاد شد');
      setTimeout(() => {
        router.push('/admin/academic/exams');
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ایجاد امتحان';
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
            <ClipboardList className="text-indigo-500" size={26} />
            ایجاد امتحان جدید
          </h1>
          <p className="text-gray-500 text-sm">اطلاعات امتحان را وارد کنید</p>
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
        {/* Basic */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            اطلاعات امتحان
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="نام امتحان *"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="مثال: امتحان ماهانه ریاضی"
            />
            <FormInput
              label="مضمون"
              value={form.subject}
              onChange={(v) => setForm({ ...form, subject: v })}
              placeholder="ریاضی، دری..."
            />
            <FormSelect
              label="صنف *"
              value={form.classId}
              onChange={(v) => setForm({ ...form, classId: v })}
              options={[
                { value: '', label: 'انتخاب کنید...' },
                ...classes.map((c) => ({
                  value: String(c.id),
                  label: `${c.name} ${c.section || ''}`.trim(),
                })),
              ]}
            />
            <FormSelect
              label="نوع امتحان"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={[
                { value: 'general', label: 'عمومی' },
                { value: 'monthly', label: 'ماهانه' },
                { value: 'half_yearly', label: 'چهارونیم‌ماهه' },
                { value: 'final', label: 'سالانه' },
                { value: 'quiz', label: 'کوییز' },
              ]}
            />
            <FormInput
              label="تاریخ *"
              type="date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
            />
            <FormInput
              label="زمان شروع"
              type="time"
              value={form.startTime}
              onChange={(v) => setForm({ ...form, startTime: v })}
            />
            <FormInput
              label="نمره کل"
              type="number"
              value={form.totalMarks}
              onChange={(v) => setForm({ ...form, totalMarks: v })}
            />
            <FormInput
              label="نمره قبولی"
              type="number"
              value={form.passingMarks}
              onChange={(v) => setForm({ ...form, passingMarks: v })}
            />
          </div>
        </div>

        {/* Extra */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            جزئیات بیشتر
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <FormInput
              label="ماه"
              type="number"
              value={form.month}
              onChange={(v) => setForm({ ...form, month: v })}
              placeholder="1-12"
            />
            <FormInput
              label="سال"
              type="number"
              value={form.year}
              onChange={(v) => setForm({ ...form, year: v })}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              توضیحات
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="توضیحات اضافی درباره امتحان..."
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              className="w-4 h-4 rounded text-blue-600"
            />
            <span className="text-sm text-gray-700">
              امتحان بلافاصله منتشر شود
            </span>
          </label>
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
          className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          ایجاد امتحان
        </button>
      </div>
    </div>
  );
}

// ========== FORM SUB-COMPONENTS ==========

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
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