// app/student/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  Bell,
  Globe,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Save,
  Moon,
  Sun,
  Monitor,
  Mail,
  MessageSquare,
  Volume2,
  Smartphone,
  Shield,
  Info,
} from 'lucide-react';
import { studentProfileAPI } from '@/lib/api/student-portal';
import { useAuthStore } from '@/lib/store/authStore';

interface StudentSettings {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  homeworkReminders: boolean;
  examReminders: boolean;
  attendanceAlerts: boolean;
  feeReminders: boolean;
  // Appearance
  theme: 'light' | 'dark' | 'system';
  language: 'fa' | 'en' | 'ps';
  sound: boolean;
  // Privacy
  showProfileToOthers: boolean;
  showGradesToParents: boolean;
}

const DEFAULT_SETTINGS: StudentSettings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  homeworkReminders: true,
  examReminders: true,
  attendanceAlerts: true,
  feeReminders: true,
  theme: 'light',
  language: 'fa',
  sound: true,
  showProfileToOthers: false,
  showGradesToParents: true,
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<StudentSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Password change
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('student-settings');
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = <K extends keyof StudentSettings>(
    key: K,
    value: StudentSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      localStorage.setItem('student-settings', JSON.stringify(settings));
      await new Promise((resolve) => setTimeout(resolve, 400));
      setMessage({
        type: 'success',
        text: 'تنظیمات با موفقیت ذخیره شد',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'خطا در ذخیره تنظیمات',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.new) {
      setMessage({ type: 'error', text: 'لطفاً همه فیلدها را پر کنید' });
      return;
    }
    if (passwordForm.new.length < 6) {
      setMessage({
        type: 'error',
        text: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد',
      });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'رمز عبور جدید با تکرار مطابقت ندارد' });
      return;
    }

    try {
      setSavingPassword(true);
      setMessage(null);
      // Placeholder — no backend endpoint for password change here yet
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMessage({
        type: 'success',
        text: 'رمز عبور با موفقیت تغییر کرد',
      });
      setPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'خطا در تغییر رمز عبور' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm('آیا می‌خواهید همه تنظیمات را به حالت پیش‌فرض بازگردانید؟')
    ) {
      setSettings(DEFAULT_SETTINGS);
      try {
        localStorage.removeItem('student-settings');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-gray-700" size={26} />
          تنظیمات
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          پیکربندی حساب کاربری و ترجیحات
        </p>
      </div>

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

      {/* Account info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-indigo-500" />
          اطلاعات حساب
        </h3>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden flex-shrink-0">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">
                {user?.fullName?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">{user?.fullName}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => setPasswordModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
        >
          <Lock size={16} />
          تغییر رمز عبور
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Bell size={18} className="text-indigo-500" />
          اطلاع‌رسانی
        </h3>

        <ToggleRow
          label="ایمیل اطلاع‌رسانی"
          description="دریافت اطلاعیه‌ها از طریق ایمیل"
          icon={Mail}
          value={settings.emailNotifications}
          onChange={(v) => update('emailNotifications', v)}
        />
        <ToggleRow
          label="اعلان فوری (Push)"
          description="اعلان‌های فوری در مرورگر"
          icon={Bell}
          value={settings.pushNotifications}
          onChange={(v) => update('pushNotifications', v)}
        />
        <ToggleRow
          label="پیامک"
          description="دریافت پیامک برای اطلاعیه‌های مهم"
          icon={Smartphone}
          value={settings.smsNotifications}
          onChange={(v) => update('smsNotifications', v)}
        />

        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            یادآورها
          </p>
          <div className="space-y-3">
            <ToggleRow
              label="یادآور کارخانگی"
              description="یادآوری تحویل کارخانگی"
              icon={CheckCircle}
              value={settings.homeworkReminders}
              onChange={(v) => update('homeworkReminders', v)}
            />
            <ToggleRow
              label="یادآور امتحانات"
              description="اطلاع از امتحانات پیش‌رو"
              icon={CheckCircle}
              value={settings.examReminders}
              onChange={(v) => update('examReminders', v)}
            />
            <ToggleRow
              label="هشدارهای حضور"
              description="اطلاع از غیبت‌ها و تأخیرها"
              icon={CheckCircle}
              value={settings.attendanceAlerts}
              onChange={(v) => update('attendanceAlerts', v)}
            />
            <ToggleRow
              label="یادآور فیس"
              description="اطلاع از سررسید پرداخت فیس"
              icon={CheckCircle}
              value={settings.feeReminders}
              onChange={(v) => update('feeReminders', v)}
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Palette size={18} className="text-indigo-500" />
          ظاهر و زبان
        </h3>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            تم صفحه
          </label>
          <div className="grid grid-cols-3 gap-3">
            <ThemeButton
              icon={Sun}
              label="روشن"
              active={settings.theme === 'light'}
              onClick={() => update('theme', 'light')}
            />
            <ThemeButton
              icon={Moon}
              label="تاریک"
              active={settings.theme === 'dark'}
              onClick={() => update('theme', 'dark')}
            />
            <ThemeButton
              icon={Monitor}
              label="سیستم"
              active={settings.theme === 'system'}
              onClick={() => update('theme', 'system')}
            />
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Globe size={14} />
            زبان
          </label>
          <select
            value={settings.language}
            onChange={(e) =>
              update('language', e.target.value as StudentSettings['language'])
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="fa">فارسی (دری)</option>
            <option value="ps">پشتو</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Sound */}
        <ToggleRow
          label="صداهای رابط"
          description="پخش صدا هنگام اعلان‌ها"
          icon={Volume2}
          value={settings.sound}
          onChange={(v) => update('sound', v)}
        />
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Eye size={18} className="text-indigo-500" />
          حریم خصوصی
        </h3>

        <ToggleRow
          label="نمایش پروفایل برای دیگران"
          description="شاگردان دیگر می‌توانند پروفایل شما را ببینند"
          icon={Eye}
          value={settings.showProfileToOthers}
          onChange={(v) => update('showProfileToOthers', v)}
        />
        <ToggleRow
          label="نمایش نمرات به والدین"
          description="والدین شما می‌توانند نمرات را ببینند"
          icon={Eye}
          value={settings.showGradesToParents}
          onChange={(v) => update('showGradesToParents', v)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          بازگشت به پیش‌فرض
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          ذخیره تنظیمات
        </button>
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">یادداشت</p>
          <p>
            تنظیمات فعلاً به‌صورت محلی (در مرورگر) ذخیره می‌شوند. برای همگام‌سازی
            بین دستگاه‌ها، نیاز به فعال‌سازی این ویژگی در backend است.
          </p>
        </div>
      </div>

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                تغییر رمز عبور
              </h3>
              <button
                onClick={() => setPasswordModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  رمز عبور فعلی
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current: e.target.value,
                      })
                    }
                    className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  رمز عبور جدید
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.new}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, new: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  تکرار رمز عبور جدید
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirm: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPasswordModal(false)}
                disabled={savingPassword}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                {savingPassword ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                تغییر رمز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ToggleRow({
  label,
  description,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-start gap-3">
        <Icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          value ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
            value ? 'right-0.5' : 'right-6'
          }`}
        />
      </button>
    </div>
  );
}

function ThemeButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-center transition-colors ${
        active
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      <Icon size={20} className="mx-auto mb-2" />
      <p className="text-sm font-medium">{label}</p>
    </button>
  );
}