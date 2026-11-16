// app/admin/finance/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Edit3,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Award,
  Building2,
} from 'lucide-react';
import { financeProfileAPI } from '@/lib/api/finance';
import type { FinanceProfile } from '@/types/finance';
import { formatAFN, formatNumber, formatDate } from '@/lib/utils/finance-helpers';

export default function FinanceProfilePage() {
  const [profile, setProfile] = useState<FinanceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeProfileAPI.getProfile();
      setProfile(data);
      setForm({
        fullName: data.user.fullName || '',
        phone: data.user.phone || '',
        position: data.financeStaff.position || '',
        department: data.financeStaff.department || '',
        salary: data.financeStaff.salary?.toString() || '',
      });
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت پروفایل';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      await financeProfileAPI.updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        position: form.position,
        department: form.department,
        salary: form.salary ? Number(form.salary) : undefined,
      });
      setSaveMessage('پروفایل با موفقیت بروزرسانی شد');
      setEditing(false);
      await fetchProfile();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      setSaveMessage('خطا در بروزرسانی پروفایل');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        fullName: profile.user.fullName || '',
        phone: profile.user.phone || '',
        position: profile.financeStaff.position || '',
        department: profile.financeStaff.department || '',
        salary: profile.financeStaff.salary?.toString() || '',
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-700">
            خطا در بارگذاری
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error || 'پروفایل یافت نشد'}</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            پروفایل مالی
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            اطلاعات شخصی و آمار مالی
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit3 size={16} />
            ویرایش
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <X size={16} />
              لغو
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              ذخیره
            </button>
          </div>
        )}
      </div>

      {saveMessage && (
        <div
          className={`p-3 rounded-lg border flex items-center gap-2 ${
            saveMessage.includes('خطا')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          {saveMessage.includes('خطا') ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity Card */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 overflow-hidden">
              {profile.user.profileImage ? (
                <img
                  src={profile.user.profileImage}
                  alt={profile.user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} />
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {profile.user.fullName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {profile.financeStaff.position ||
                (profile.user.role === 'ADMIN' ? 'مدیر سیستم' : 'مسئول مالی')}
            </p>

            <div className="mt-4 w-full space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{profile.user.email}</span>
              </div>
              {profile.user.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{profile.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>عضو از: {formatDate(profile.user.createdAt)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 w-full">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  profile.user.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {profile.user.isActive ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>
        </div>

        {/* Details & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              اطلاعات شخصی
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="نام کامل"
                icon={User}
                value={form.fullName}
                editing={editing}
                onChange={(v) => setForm({ ...form, fullName: v })}
              />
              <FormField
                label="شماره تماس"
                icon={Phone}
                value={form.phone}
                editing={editing}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <FormField
                label="موقعیت"
                icon={Briefcase}
                value={form.position}
                editing={editing}
                onChange={(v) => setForm({ ...form, position: v })}
              />
              <FormField
                label="بخش"
                icon={Building2}
                value={form.department}
                editing={editing}
                onChange={(v) => setForm({ ...form, department: v })}
              />
              <FormField
                label="معاش"
                icon={DollarSign}
                value={form.salary}
                editing={editing}
                onChange={(v) => setForm({ ...form, salary: v })}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              آمار مالی
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox
                label="شاگردان"
                value={formatNumber(profile.statistics.totalStudents)}
                icon={Users}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatBox
                label="تخصیص‌ها"
                value={formatNumber(profile.statistics.totalAssignments)}
                icon={FileText}
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
              <StatBox
                label="وصول ماه"
                value={formatAFN(profile.statistics.monthlyCollection)}
                icon={TrendingUp}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <StatBox
                label="معوقات"
                value={formatAFN(profile.statistics.totalOutstanding)}
                icon={AlertCircle}
                color="text-red-600"
                bgColor="bg-red-50"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">نرخ وصول</p>
                <p className="text-lg font-bold text-emerald-600">
                  {profile.statistics.collectionRate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">فعال</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(profile.statistics.activeAssignments)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">تکمیل شده</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatNumber(profile.statistics.completedAssignments)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  value,
  editing,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        {editing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="w-full pr-10 pl-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 min-h-[38px] flex items-center">
            {value || <span className="text-gray-400">تعیین نشده</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-lg font-bold ${color} truncate`}>{value}</p>
    </div>
  );
}