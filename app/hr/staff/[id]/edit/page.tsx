// app/admin/hr/staff/[id]/edit/page.tsx
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
import { hrStaffAPI } from '@/lib/api/hr';
import type { CreateStaffInput, StaffType } from '@/types/hr';
import {
  staffTypeLabels,
  sexLabels,
  maritalStatusLabels,
  educationLevelLabels,
} from '@/lib/utils/hr-helpers';

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<CreateStaffInput>({
    fullName: '',
    email: '',
    password: '',
    staffType: 'OTHER',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await hrStaffAPI.getById(staffId);
        setForm({
          fullName: data.fullName || '',
          nameFarsi: data.nameFarsi || '',
          email: data.email || '',
          phone: data.phone || '',
          password: '', // never pre-fill password
          staffType: (data.staffType as StaffType) || 'OTHER',
          position: data.position || '',
          department: data.department || '',
          joinDate: data.joinDate ? data.joinDate.split('T')[0] : '',
          salary: data.salary ? Number(data.salary) : undefined,
          isActive: data.isActive,
          notes: data.notes || '',
          fatherName: data.fatherName || '',
          fatherNameFarsi: data.fatherNameFarsi || '',
          grandfatherName: data.grandfatherName || '',
          sex: data.sex || '',
          maritalStatus: data.maritalStatus || '',
          bloodType: data.bloodType || '',
          civilId: data.civilId || '',
          birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
          birthPlace: data.birthPlace || '',
          nationality: data.nationality || '',
          currentAddress: data.currentAddress || '',
          permanentAddress: data.permanentAddress || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          emergencyContactRelation: data.emergencyContactRelation || '',
          educationLevel: data.educationLevel || '',
          educationField: data.educationField || '',
          educationInstitution: data.educationInstitution || '',
          graduationYear: data.graduationYear || undefined,
          workExperience: data.workExperience || '',
          contractStartDate: data.contractStartDate
            ? data.contractStartDate.split('T')[0]
            : '',
          contractEndDate: data.contractEndDate
            ? data.contractEndDate.split('T')[0]
            : '',
          contractType: data.contractType || '',
          baseSalary: data.baseSalary ? Number(data.baseSalary) : undefined,
          salaryCurrency: data.salaryCurrency || 'AFN',
          bankAccountNumber: data.bankAccountNumber || '',
          bankName: data.bankName || '',
          insuranceNumber: data.insuranceNumber || '',
          insuranceProvider: data.insuranceProvider || '',
          hasInsurance: data.hasInsurance,
          hasContract: data.hasContract,
        });
      } catch (err: unknown) {
        console.error(err);
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
    if (!isNaN(staffId)) load();
  }, [staffId]);

  const update = (field: keyof CreateStaffInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: Partial<CreateStaffInput> = { ...form };
      // Don't send empty password
      if (!payload.password) delete payload.password;
      // Remove empty strings
      Object.keys(payload).forEach((key) => {
        if (payload[key as keyof CreateStaffInput] === '') {
          delete payload[key as keyof CreateStaffInput];
        }
      });

      await hrStaffAPI.update(staffId, payload);
      setSuccess('اطلاعات با موفقیت ذخیره شد');
      setTimeout(() => {
        router.push(`/admin/hr/staff/${staffId}`);
      }, 800);
    } catch (err: unknown) {
      console.error(err);
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
        <Loader2 className="animate-spin text-pink-500" size={40} />
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
          <h1 className="text-2xl font-bold text-gray-900">ویرایش کارمند</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            شماره {staffId}
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

      {/* Form sections */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          اطلاعات اصلی
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="نام کامل *"
            value={form.fullName}
            onChange={(v) => update('fullName', v)}
          />
          <FormInput
            label="نام به فارسی"
            value={form.nameFarsi || ''}
            onChange={(v) => update('nameFarsi', v)}
          />
          <FormInput
            label="ایمیل *"
            type="email"
            value={form.email}
            onChange={(v) => update('email', v)}
          />
          <FormInput
            label="شماره تماس"
            value={form.phone || ''}
            onChange={(v) => update('phone', v)}
          />
          <FormInput
            label="رمز عبور جدید (اختیاری)"
            type="password"
            value={form.password || ''}
            onChange={(v) => update('password', v)}
            placeholder="خالی بگذارید تا تغییر نکند"
          />
          <FormSelect
            label="نوع کارمند"
            value={form.staffType}
            onChange={(v) => update('staffType', v as StaffType)}
            options={Object.entries(staffTypeLabels).map(([key, label]) => ({
              value: key,
              label,
            }))}
          />
          <FormInput
            label="سمت"
            value={form.position || ''}
            onChange={(v) => update('position', v)}
          />
          <FormInput
            label="بخش"
            value={form.department || ''}
            onChange={(v) => update('department', v)}
          />
          <FormInput
            label="معاش"
            type="number"
            value={form.salary?.toString() || ''}
            onChange={(v) => update('salary', v ? Number(v) : undefined)}
          />
          <FormSelect
            label="وضعیت"
            value={form.isActive ? 'active' : 'inactive'}
            onChange={(v) => update('isActive', v === 'active')}
            options={[
              { value: 'active', label: 'فعال' },
              { value: 'inactive', label: 'غیرفعال' },
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          اطلاعات شخصی
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="نام پدر"
            value={form.fatherName || ''}
            onChange={(v) => update('fatherName', v)}
          />
          <FormInput
            label="نام پدر (فارسی)"
            value={form.fatherNameFarsi || ''}
            onChange={(v) => update('fatherNameFarsi', v)}
          />
          <FormSelect
            label="جنسیت"
            value={form.sex || ''}
            onChange={(v) => update('sex', v)}
            options={[
              { value: '', label: 'انتخاب نشده' },
              ...Object.entries(sexLabels).map(([key, label]) => ({
                value: key,
                label,
              })),
            ]}
          />
          <FormSelect
            label="وضعیت تأهل"
            value={form.maritalStatus || ''}
            onChange={(v) => update('maritalStatus', v)}
            options={[
              { value: '', label: 'انتخاب نشده' },
              ...Object.entries(maritalStatusLabels).map(([key, label]) => ({
                value: key,
                label,
              })),
            ]}
          />
          <FormInput
            label="شماره تذکره"
            value={form.civilId || ''}
            onChange={(v) => update('civilId', v)}
          />
          <FormInput
            label="محل تولد"
            value={form.birthPlace || ''}
            onChange={(v) => update('birthPlace', v)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          تحصیلات و سابقه
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="سطح تحصیل"
            value={form.educationLevel || ''}
            onChange={(v) => update('educationLevel', v)}
            options={[
              { value: '', label: 'انتخاب نشده' },
              ...Object.entries(educationLevelLabels).map(([key, label]) => ({
                value: key,
                label,
              })),
            ]}
          />
          <FormInput
            label="رشته"
            value={form.educationField || ''}
            onChange={(v) => update('educationField', v)}
          />
          <FormInput
            label="مؤسسه"
            value={form.educationInstitution || ''}
            onChange={(v) => update('educationInstitution', v)}
          />
          <FormInput
            label="سال فراغت"
            type="number"
            value={form.graduationYear?.toString() || ''}
            onChange={(v) => update('graduationYear', v ? Number(v) : undefined)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          یادداشت
        </h3>
        <textarea
          value={form.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="یادداشت اضافی..."
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
          className="inline-flex items-center gap-2 px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
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
// SUB-COMPONENTS
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
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
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