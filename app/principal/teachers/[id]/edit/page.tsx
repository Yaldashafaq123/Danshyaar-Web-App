// app/admin/academic/teachers/[id]/edit/page.tsx
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
import { principalTeachersAPI } from '@/lib/api/principal';

export default function EditTeacherPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    specialization: '',
    experience: '',
    certification: '',
    baseSalary: '',
    isActive: true,
    availability: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const teacher = await principalTeachersAPI.getById(teacherId);
        setForm({
          fullName: teacher.User.fullName || '',
          phone: teacher.User.phone || '',
          specialization: teacher.specialization || '',
          experience: '',
          certification: '',
          baseSalary: '',
          isActive: teacher.isActive,
          availability: true,
        });
      } catch (err: unknown) {
        console.error('❌ [Edit Teacher] Load error:', err);
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
    if (!isNaN(teacherId)) load();
  }, [teacherId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await principalTeachersAPI.update(teacherId, {
        fullName: form.fullName,
        phone: form.phone,
        specialization: form.specialization,
        experience: form.experience,
        certification: form.certification,
        baseSalary: form.baseSalary ? Number(form.baseSalary) : undefined,
        isActive: form.isActive,
        availability: form.availability,
      });
      setSuccess('اطلاعات با موفقیت ذخیره شد');
      setTimeout(() => {
        router.push(`/admin/academic/teachers/${teacherId}`);
      }, 1200);
    } catch (err: unknown) {
      console.error('❌ [Edit Teacher] Save error:', err);
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
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ویرایش معلم</h1>
          <p className="text-gray-500 text-sm">
            تغییر اطلاعات معلم #{teacherId}
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

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            اطلاعات اصلی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="نام کامل"
              value={form.fullName}
              onChange={(v) => setForm({ ...form, fullName: v })}
            />
            <FormInput
              label="شماره تماس"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <FormInput
              label="تخصص"
              value={form.specialization}
              onChange={(v) => setForm({ ...form, specialization: v })}
              placeholder="مثال: ریاضی، فزیک..."
            />
            <FormInput
              label="تجربه"
              value={form.experience}
              onChange={(v) => setForm({ ...form, experience: v })}
              placeholder="مثال: ۵ سال"
            />
            <FormInput
              label="گواهی‌نامه"
              value={form.certification}
              onChange={(v) => setForm({ ...form, certification: v })}
            />
            <FormInput
              label="معاش پایه (افغانی)"
              type="number"
              value={form.baseSalary}
              onChange={(v) => setForm({ ...form, baseSalary: v })}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            وضعیت
          </h3>
          <div className="space-y-3">
            <CheckboxField
              id="isActive"
              label="معلم فعال است"
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
            />
            <CheckboxField
              id="availability"
              label="قابل تعیین در صنوف"
              checked={form.availability}
              onChange={(v) => setForm({ ...form, availability: v })}
            />
          </div>
        </div>
      </div>

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

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded text-blue-600"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}