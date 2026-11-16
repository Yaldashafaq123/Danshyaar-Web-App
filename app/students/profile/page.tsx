// app/student/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  Edit3,
  Save,
  X,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  Building2,
  Hash,
  FileText,
  MapPin,
  Heart,
  GraduationCap,
} from 'lucide-react';
import { studentProfileAPI } from '@/lib/api/student-portal';
import type { StudentProfile, UpdateProfileInput } from '@/types/student-portal';
import {
  formatShamsiDate,
} from '@/lib/utils/student-helpers';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<UpdateProfileInput>({
    fullName: '',
    phone: '',
    bio: '',
    address: '',
    birthDate: '',
    parentContact: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentProfileAPI.getProfile();
      setProfile(res);
      setForm({
        fullName: res.User.fullName || '',
        phone: res.User.phone || '',
        bio: res.student.bio || '',
        address: res.student.address || '',
        birthDate: res.student.birthDate || '',
        parentContact: res.student.parentContact || '',
      });
    } catch (err: unknown) {
      console.error(err);
      let msg = 'خطا در دریافت اطلاعات پروفایل';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage(null);
      const res = await studentProfileAPI.uploadImage(file);
      setMessage({ type: 'success', text: 'تصویر با موفقیت بروزرسانی شد' });
      if (profile) {
        setProfile({
          ...profile,
          User: { ...profile.User, profileImage: res.image },
        });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: 'error', text: 'خطا در آپلود تصویر' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Clean empty values
      const payload: UpdateProfileInput = {};
      if (form.fullName !== profile?.User.fullName) payload.fullName = form.fullName;
      if (form.phone !== profile?.User.phone) payload.phone = form.phone;
      if (form.bio !== profile?.student.bio) payload.bio = form.bio;
      if (form.address !== profile?.student.address) payload.address = form.address;
      if (form.birthDate !== profile?.student.birthDate) payload.birthDate = form.birthDate;
      if (form.parentContact !== profile?.student.parentContact) {
        payload.parentContact = form.parentContact;
      }

      await studentProfileAPI.updateProfile(payload);
      setMessage({ type: 'success', text: 'پروفایل با موفقیت بروزرسانی شد' });
      setEditing(false);
      await fetchProfile();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let msg = 'خطا در ذخیره اطلاعات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        fullName: profile.User.fullName || '',
        phone: profile.User.phone || '',
        bio: profile.student.bio || '',
        address: profile.student.address || '',
        birthDate: profile.student.birthDate || '',
        parentContact: profile.student.parentContact || '',
      });
    }
    setEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">پروفایل من</h1>
          <p className="text-gray-500 text-sm mt-1">
            اطلاعات شخصی و تحصیلی شما
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Edit3 size={16} />
            ویرایش پروفایل
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

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg border flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar + Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden ring-4 ring-indigo-50">
                  {profile.User.profileImage ? (
                    <img
                      src={profile.User.profileImage}
                      alt={profile.User.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={52} />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 shadow-md"
                  title="تغییر تصویر"
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {profile.User.fullName}
              </h2>

              {profile.student.studentNumber && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Hash size={14} />
                  شماره شاگردی: {profile.student.studentNumber}
                </p>
              )}

              <span
                className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  profile.student.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {profile.student.status === 'ACTIVE'
                  ? 'فعال'
                  : profile.student.status}
              </span>

              <div className="mt-5 w-full space-y-2 text-sm text-left">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{profile.User.email}</span>
                </div>
                {profile.User.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{profile.User.phone}</span>
                  </div>
                )}
                {profile.student.birthDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      تاریخ تولد: {formatShamsiDate(profile.student.birthDate)}
                    </span>
                  </div>
                )}
                {profile.student.enrollmentDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap size={16} className="text-gray-400" />
                    <span>
                      شمولیت: {formatShamsiDate(profile.student.enrollmentDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Class info */}
          {profile.student.Class && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={18} className="text-indigo-100" />
                <p className="text-sm font-medium text-indigo-100">
                  صنف فعلی
                </p>
              </div>
              <p className="text-2xl font-bold">
                {profile.student.Class.name}
                {profile.student.Class.section &&
                  ` - ${profile.student.Class.section}`}
              </p>
              {profile.student.Class.AcademicYear && (
                <p className="text-sm text-indigo-100 mt-1">
                  سال تحصیلی: {profile.student.Class.AcademicYear.name}
                </p>
              )}
              {profile.student.Class.Teacher?.User && (
                <p className="text-xs text-indigo-100 mt-2">
                  معلم مسئول: {profile.student.Class.Teacher.User.fullName}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-500" />
              اطلاعات شخصی
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="نام کامل"
                value={form.fullName || ''}
                editing={editing}
                onChange={(v) => setForm({ ...form, fullName: v })}
                icon={User}
              />
              <FormField
                label="شماره تماس"
                value={form.phone || ''}
                editing={editing}
                onChange={(v) => setForm({ ...form, phone: v })}
                icon={Phone}
              />
              <FormField
                label="تاریخ تولد"
                type="date"
                value={form.birthDate || ''}
                editing={editing}
                onChange={(v) => setForm({ ...form, birthDate: v })}
                icon={Calendar}
              />
              <FormField
                label="شماره تماس والدین"
                value={form.parentContact || ''}
                editing={editing}
                onChange={(v) => setForm({ ...form, parentContact: v })}
                icon={Users}
              />
              <div className="md:col-span-2">
                <FormField
                  label="آدرس"
                  value={form.address || ''}
                  editing={editing}
                  onChange={(v) => setForm({ ...form, address: v })}
                  icon={MapPin}
                />
              </div>
              <div className="md:col-span-2">
                <BioField
                  value={form.bio || ''}
                  editing={editing}
                  onChange={(v) => setForm({ ...form, bio: v })}
                />
              </div>
            </div>
          </div>

          {/* Read-only info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              اطلاعات تحصیلی
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ReadOnlyRow
                label="شماره شاگردی"
                value={profile.student.studentNumber || '—'}
                icon={Hash}
              />
              <ReadOnlyRow
                label="سال تحصیلی"
                value={
                  profile.student.Class?.AcademicYear?.name || '—'
                }
                icon={Calendar}
              />
              <ReadOnlyRow
                label="صنف"
                value={
                  profile.student.Class
                    ? `${profile.student.Class.name} ${
                        profile.student.Class.section || ''
                      }`.trim()
                    : '—'
                }
                icon={Building2}
              />
              <ReadOnlyRow
                label="تاریخ شمولیت"
                value={
                  profile.student.enrollmentDate
                    ? formatShamsiDate(profile.student.enrollmentDate)
                    : '—'
                }
                icon={GraduationCap}
              />
              <ReadOnlyRow
                label="وضعیت"
                value={
                  profile.student.status === 'ACTIVE'
                    ? 'فعال'
                    : profile.student.status
                }
                icon={Heart}
              />
            </div>
          </div>

          {/* Quick link to ID card */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                کارت شناسایی
              </h4>
              <p className="text-sm text-gray-500 mt-0.5">
                مشاهده و چاپ کارت شناسایی شاگرد
              </p>
            </div>
            <a
              href="/student/profile/id-card"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
            >
              <FileText size={16} />
              مشاهده کارت
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function FormField({
  label,
  value,
  editing,
  onChange,
  type = 'text',
  icon: Icon,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  type?: string;
  icon: React.ElementType;
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
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

function BioField({
  value,
  editing,
  onChange,
}: {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        درباره من
      </label>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="چند خطی درباره خودت بنویس..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 min-h-[80px]">
          {value || <span className="text-gray-400">تعیین نشده</span>}
        </div>
      )}
    </div>
  );
}

function ReadOnlyRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-indigo-500 flex-shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}