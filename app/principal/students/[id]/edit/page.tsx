// app/admin/academic/students/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { principalStudentsAPI } from '@/lib/api/principal';
import { principalClassesAPI } from '@/lib/api/principal';
import type { StudentDetail, Class } from '@/types/principal';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);

  const [form, setForm] = useState({
    status: 'ACTIVE',
    classId: '',
    studentNumber: '',
    enrollmentDate: '',
    graduationDate: '',
    scholarship: false,
    scholarshipPercentage: '',
    feeWaiver: false,
    feeWaiverReason: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [student, cls] = await Promise.all([
          principalStudentsAPI.getById(studentId),
          principalClassesAPI.list(),
        ]);
        setClasses(cls);
        setForm({
          status: student.status || 'ACTIVE',
          classId: student.classId ? String(student.classId) : '',
          studentNumber: student.studentNumber || '',
          enrollmentDate: student.enrollmentDate
            ? student.enrollmentDate.split('T')[0]
            : '',
          graduationDate: student.graduationDate
            ? student.graduationDate.split('T')[0]
            : '',
          scholarship: student.scholarship || false,
          scholarshipPercentage:
            student.scholarshipPercentage !== undefined
              ? String(student.scholarshipPercentage)
              : '',
          feeWaiver: student.feeWaiver || false,
          feeWaiverReason: student.feeWaiverReason || '',
        });
      } catch (err: unknown) {
        console.error('❌ [Edit Student] Load error:', err);
        let message = 'خطا در بارگذاری اطلاعات';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          message = e.response?.data?.message || e.message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (!isNaN(studentId)) load();
  }, [studentId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await principalStudentsAPI.update(studentId, {
        status: form.status,
        classId: form.classId ? Number(form.classId) : undefined,
        studentNumber: form.studentNumber || undefined,
        enrollmentDate: form.enrollmentDate || undefined,
        graduationDate: form.graduationDate || undefined,
        scholarship: form.scholarship,
        scholarshipPercentage: form.scholarshipPercentage
          ? Number(form.scholarshipPercentage)
          : undefined,
        feeWaiver: form.feeWaiver,
        feeWaiverReason: form.feeWaiverReason || undefined,
      } as Partial<StudentDetail>);
      setSuccess('اطلاعات با موفقیت ذخیره شد');
      setTimeout(() => {
        router.push(`/admin/academic/students/${studentId}`);
      }, 1200);
    } catch (err: unknown) {
      console.error('❌ [Edit Student] Save error:', err);
      let message = 'خطا در ذخیره اطلاعات';
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
          <h1 className="text-2xl font-bold text-gray-900">ویرایش شاگرد</h1>
          <p className="text-gray-500 text-sm">
            تغییر اطلاعات شاگرد #{studentId}
          </p>
        </div>
      </div>

      {/* Alerts */}
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
            اطلاعات اصلی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="وضعیت"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: 'ACTIVE', label: 'فعال' },
                { value: 'GRADUATED', label: 'فارغ‌التحصیل' },
                { value: 'SUSPENDED', label: 'تعلیق' },
                { value: 'LEFT', label: 'ترک تحصیل' },
              ]}
            />
            <FormSelect
              label="صنف"
              value={form.classId}
              onChange={(v) => setForm({ ...form, classId: v })}
              options={[
                { value: '', label: 'بدون صنف' },
                ...classes.map((c) => ({
                  value: String(c.id),
                  label: `${c.name} ${c.section || ''}`.trim(),
                })),
              ]}
            />
            <FormInput
              label="شماره شاگردی"
              value={form.studentNumber}
              onChange={(v) => setForm({ ...form, studentNumber: v })}
              placeholder="مثال: STU-001"
            />
            <FormInput
              label="تاریخ ثبت‌نام"
              type="date"
              value={form.enrollmentDate}
              onChange={(v) => setForm({ ...form, enrollmentDate: v })}
            />
            <FormInput
              label="تاریخ فراغت"
              type="date"
              value={form.graduationDate}
              onChange={(v) => setForm({ ...form, graduationDate: v })}
            />
          </div>
        </div>

        {/* Financial aid (read-only info) */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            تخفیفات و بورسیه
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="scholarship"
                checked={form.scholarship}
                onChange={(e) =>
                  setForm({ ...form, scholarship: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="scholarship" className="text-sm text-gray-700">
                شاگرد بورسیه دارد
              </label>
            </div>

            {form.scholarship && (
              <FormInput
                label="درصد بورسیه"
                type="number"
                value={form.scholarshipPercentage}
                onChange={(v) =>
                  setForm({ ...form, scholarshipPercentage: v })
                }
                placeholder="0-100"
              />
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="feeWaiver"
                checked={form.feeWaiver}
                onChange={(e) =>
                  setForm({ ...form, feeWaiver: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="feeWaiver" className="text-sm text-gray-700">
                معافیت از پرداخت فیس
              </label>
            </div>

            {form.feeWaiver && (
              <FormInput
                label="دلیل معافیت"
                value={form.feeWaiverReason}
                onChange={(v) => setForm({ ...form, feeWaiverReason: v })}
                placeholder="مثال: یتیم، نیازمند..."
              />
            )}
          </div>
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
          ذخیره تغییرات
        </button>
      </div>
    </div>
  );
}

// ============================================
// FORM SUB-COMPONENTS
// ============================================

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
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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