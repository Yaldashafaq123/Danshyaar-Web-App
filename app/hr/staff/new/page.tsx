// app/admin/hr/staff/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import { hrStaffAPI } from '@/lib/api/hr';
import type { CreateStaffInput, StaffType } from '@/types/hr';
import {
  staffTypeLabels,
  sexLabels,
  maritalStatusLabels,
  educationLevelLabels,
} from '@/lib/utils/hr-helpers';

export default function NewStaffPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<CreateStaffInput>({
    fullName: '',
    nameFarsi: '',
    email: '',
    phone: '',
    password: '',
    staffType: 'TEACHER',
    position: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    salary: undefined,
    isActive: true,
    notes: '',
    fatherName: '',
    fatherNameFarsi: '',
    grandfatherName: '',
    sex: '',
    maritalStatus: '',
    bloodType: '',
    civilId: '',
    civilIdIssueDate: '',
    civilIdExpiryDate: '',
    birthDate: '',
    birthPlace: '',
    nationality: 'افغان',
    currentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    educationLevel: '',
    educationField: '',
    educationInstitution: '',
    graduationYear: undefined,
    workExperience: '',
    contractStartDate: '',
    contractEndDate: '',
    contractType: '',
    baseSalary: undefined,
    salaryCurrency: 'AFN',
    bankAccountNumber: '',
    bankName: '',
    insuranceNumber: '',
    insuranceProvider: '',
    hasInsurance: false,
    hasContract: false,
  });

  const update = (field: keyof CreateStaffInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!form.fullName.trim()) {
      setError('نام کامل الزامی است');
      return;
    }
    if (!form.email.trim()) {
      setError('ایمیل الزامی است');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Clean empty values
      const payload: CreateStaffInput = { ...form };
      Object.keys(payload).forEach((key) => {
        const v = payload[key as keyof CreateStaffInput];
        if (v === '' || v === undefined || v === null) {
          delete payload[key as keyof CreateStaffInput];
        }
      });

      const res = await hrStaffAPI.create(payload);
      setSuccess('کارمند با موفقیت ثبت شد');
      setTimeout(() => {
        router.push(`/admin/hr/staff/${res.id}`);
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ثبت کارمند';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

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
            <Users className="text-pink-500" size={26} />
            ثبت کارمند جدید
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            اطلاعات کامل کارمند را وارد کنید
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

      {/* Section 1: Basic Info */}
      <FormSection title="اطلاعات اصلی" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="نام کامل *"
            value={form.fullName}
            onChange={(v) => update('fullName', v)}
            placeholder="مثال: احمد رحیمی"
          />
          <FormInput
            label="نام به فارسی"
            value={form.nameFarsi || ''}
            onChange={(v) => update('nameFarsi', v)}
            placeholder="اختیاری"
          />
          <FormInput
            label="ایمیل *"
            type="email"
            value={form.email}
            onChange={(v) => update('email', v)}
            placeholder="example@school.com"
          />
          <FormInput
            label="شماره تماس"
            value={form.phone || ''}
            onChange={(v) => update('phone', v)}
            placeholder="07XX XXX XXX"
          />
          <FormInput
            label="رمز عبور *"
            type="password"
            value={form.password}
            onChange={(v) => update('password', v)}
            placeholder="حداقل ۶ کاراکتر"
          />
          <FormSelect
            label="نوع کارمند *"
            value={form.staffType}
            onChange={(v) => update('staffType', v as StaffType)}
            options={Object.entries(staffTypeLabels).map(([key, label]) => ({
              value: key,
              label,
            }))}
          />
        </div>
      </FormSection>

      {/* Section 2: Position */}
      <FormSection title="موقعیت شغلی" icon={Briefcase}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="سمت"
            value={form.position || ''}
            onChange={(v) => update('position', v)}
            placeholder="مثال: معلم ریاضی"
          />
          <FormInput
            label="بخش"
            value={form.department || ''}
            onChange={(v) => update('department', v)}
            placeholder="مثال: ابتداییه"
          />
          <FormInput
            label="تاریخ شمولیت"
            type="date"
            value={form.joinDate || ''}
            onChange={(v) => update('joinDate', v)}
          />
          <FormInput
            label="معاش (افغانی)"
            type="number"
            value={form.salary?.toString() || ''}
            onChange={(v) => update('salary', v ? Number(v) : undefined)}
            placeholder="0"
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
      </FormSection>

      {/* Section 3: Personal */}
      <FormSection title="اطلاعات شخصی" icon={User}>
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
          <FormInput
            label="نام پدرکلان"
            value={form.grandfatherName || ''}
            onChange={(v) => update('grandfatherName', v)}
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
          <FormSelect
            label="گروه خون"
            value={form.bloodType || ''}
            onChange={(v) => update('bloodType', v)}
            options={[
              { value: '', label: 'انتخاب نشده' },
              { value: 'A_POSITIVE', label: 'A+' },
              { value: 'A_NEGATIVE', label: 'A-' },
              { value: 'B_POSITIVE', label: 'B+' },
              { value: 'B_NEGATIVE', label: 'B-' },
              { value: 'AB_POSITIVE', label: 'AB+' },
              { value: 'AB_NEGATIVE', label: 'AB-' },
              { value: 'O_POSITIVE', label: 'O+' },
              { value: 'O_NEGATIVE', label: 'O-' },
            ]}
          />
          <FormInput
            label="شماره تذکره"
            value={form.civilId || ''}
            onChange={(v) => update('civilId', v)}
          />
          <FormInput
            label="تاریخ تولد"
            type="date"
            value={form.birthDate || ''}
            onChange={(v) => update('birthDate', v)}
          />
          <FormInput
            label="محل تولد"
            value={form.birthPlace || ''}
            onChange={(v) => update('birthPlace', v)}
          />
          <FormInput
            label="تابعیت"
            value={form.nationality || ''}
            onChange={(v) => update('nationality', v)}
          />
        </div>
      </FormSection>

      {/* Section 4: Address */}
      <FormSection title="آدرس و تماس" icon={MapPin}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="آدرس فعلی"
            value={form.currentAddress || ''}
            onChange={(v) => update('currentAddress', v)}
          />
          <FormInput
            label="آدرس دائمی"
            value={form.permanentAddress || ''}
            onChange={(v) => update('permanentAddress', v)}
          />
          <FormInput
            label="نام تماس اضطراری"
            value={form.emergencyContactName || ''}
            onChange={(v) => update('emergencyContactName', v)}
          />
          <FormInput
            label="شماره تماس اضطراری"
            value={form.emergencyContactPhone || ''}
            onChange={(v) => update('emergencyContactPhone', v)}
          />
          <FormInput
            label="نسبت با تماس اضطراری"
            value={form.emergencyContactRelation || ''}
            onChange={(v) => update('emergencyContactRelation', v)}
            placeholder="مثال: پدر، برادر"
          />
        </div>
      </FormSection>

      {/* Section 5: Education */}
      <FormSection title="تحصیلات" icon={Building2}>
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
            label="رشته تحصیل"
            value={form.educationField || ''}
            onChange={(v) => update('educationField', v)}
          />
          <FormInput
            label="مؤسسه تحصیلی"
            value={form.educationInstitution || ''}
            onChange={(v) => update('educationInstitution', v)}
          />
          <FormInput
            label="سال فراغت"
            type="number"
            value={form.graduationYear?.toString() || ''}
            onChange={(v) => update('graduationYear', v ? Number(v) : undefined)}
          />
          <div className="md:col-span-2">
            <FormInput
              label="سابقه کاری"
              value={form.workExperience || ''}
              onChange={(v) => update('workExperience', v)}
              placeholder="مثال: ۵ سال تدریس در مکتب X"
            />
          </div>
        </div>
      </FormSection>

      {/* Section 6: Contract */}
      <FormSection title="قرارداد و بانک" icon={DollarSign}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="تاریخ شروع قرارداد"
            type="date"
            value={form.contractStartDate || ''}
            onChange={(v) => update('contractStartDate', v)}
          />
          <FormInput
            label="تاریخ پایان قرارداد"
            type="date"
            value={form.contractEndDate || ''}
            onChange={(v) => update('contractEndDate', v)}
          />
          <FormInput
            label="نوع قرارداد"
            value={form.contractType || ''}
            onChange={(v) => update('contractType', v)}
            placeholder="مثال: دائمی، موقت"
          />
          <FormInput
            label="معاش پایه"
            type="number"
            value={form.baseSalary?.toString() || ''}
            onChange={(v) => update('baseSalary', v ? Number(v) : undefined)}
          />
          <FormInput
            label="نام بانک"
            value={form.bankName || ''}
            onChange={(v) => update('bankName', v)}
          />
          <FormInput
            label="شماره حساب"
            value={form.bankAccountNumber || ''}
            onChange={(v) => update('bankAccountNumber', v)}
          />
          <FormInput
            label="شماره بیمه"
            value={form.insuranceNumber || ''}
            onChange={(v) => update('insuranceNumber', v)}
          />
          <FormInput
            label="شرکت بیمه"
            value={form.insuranceProvider || ''}
            onChange={(v) => update('insuranceProvider', v)}
          />
        </div>

        <div className="mt-4 space-y-2">
          <CheckboxField
            id="hasInsurance"
            label="بیمه دارد"
            checked={!!form.hasInsurance}
            onChange={(v) => update('hasInsurance', v)}
          />
          <CheckboxField
            id="hasContract"
            label="قرارداد دارد"
            checked={!!form.hasContract}
            onChange={(v) => update('hasContract', v)}
          />
        </div>
      </FormSection>

      {/* Section 7: Notes */}
      <FormSection title="یادداشت" icon={X}>
        <textarea
          value={form.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
          placeholder="یادداشت اضافی..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </FormSection>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/95 backdrop-blur p-3 rounded-xl shadow-lg border border-gray-100">
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
          ثبت کارمند
        </button>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon size={18} className="text-pink-500" />
        {title}
      </h3>
      {children}
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
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded text-pink-600"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}