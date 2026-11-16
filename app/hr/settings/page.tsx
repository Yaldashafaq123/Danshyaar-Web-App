// app/admin/hr/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Info,
  Bell,
  Users,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface HRSettings {
  workStartTime: string;
  workEndTime: string;
  lateGracePeriod: number;
  annualLeaveDays: number;
  sickLeaveDays: number;
  emergencyLeaveDays: number;
  maternityLeaveDays: number;
  notifyOnContractExpiry: boolean;
  notifyOnBirthday: boolean;
  notifyOnPendingLeave: boolean;
  autoGenerateSalaries: boolean;
}

const DEFAULT_SETTINGS: HRSettings = {
  workStartTime: '07:30',
  workEndTime: '15:00',
  lateGracePeriod: 0,
  annualLeaveDays: 24,
  sickLeaveDays: 12,
  emergencyLeaveDays: 5,
  maternityLeaveDays: 90,
  notifyOnContractExpiry: true,
  notifyOnBirthday: true,
  notifyOnPendingLeave: true,
  autoGenerateSalaries: false,
};

export default function HRSettingsPage() {
  const [settings, setSettings] = useState<HRSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hr-settings');
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const update = <K extends keyof HRSettings>(
    key: K,
    value: HRSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Save to localStorage (backend doesn't have a settings endpoint)
      localStorage.setItem('hr-settings', JSON.stringify(settings));
      await new Promise((res) => setTimeout(res, 400));

      setSuccess('تنظیمات ذخیره شد (به‌صورت محلی)');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm('آیا می‌خواهید همه تنظیمات را به حالت پیش‌فرض بازگردانید؟')
    ) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('hr-settings');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-gray-700" size={26} />
            تنظیمات منابع بشری
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            پیکربندی سیستم حضور، رخصتی و اطلاع‌رسانی
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

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">توجه</p>
          <p>
            در حال حاضر تنظیمات به‌صورت محلی (در مرورگر) ذخیره می‌شوند. برای
            ذخیره‌سازی مرکزی، نیاز به افزودن endpoint در backend است.
          </p>
        </div>
      </div>

      {/* Work Hours */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Clock size={18} className="text-pink-500" />
          ساعات کاری
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ساعت شروع
            </label>
            <input
              type="time"
              value={settings.workStartTime}
              onChange={(e) => update('workStartTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ساعت پایان
            </label>
            <input
              type="time"
              value={settings.workEndTime}
              onChange={(e) => update('workEndTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              مهلت تأخیر (دقیقه)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={settings.lateGracePeriod}
              onChange={(e) =>
                update('lateGracePeriod', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              کارمندانی که تا این مدت پس از ساعت شروع بیایند، تأخیر محسوب نمی‌شوند
            </p>
          </div>
        </div>
      </div>

      {/* Leave Days */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={18} className="text-pink-500" />
          بیلانس رخصتی سالانه
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رخصتی سالانه (روز)
            </label>
            <input
              type="number"
              min="0"
              value={settings.annualLeaveDays}
              onChange={(e) =>
                update('annualLeaveDays', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رخصتی مریضی (روز)
            </label>
            <input
              type="number"
              min="0"
              value={settings.sickLeaveDays}
              onChange={(e) =>
                update('sickLeaveDays', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رخصتی اضطراری (روز)
            </label>
            <input
              type="number"
              min="0"
              value={settings.emergencyLeaveDays}
              onChange={(e) =>
                update('emergencyLeaveDays', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رخصتی زایمان (روز)
            </label>
            <input
              type="number"
              min="0"
              value={settings.maternityLeaveDays}
              onChange={(e) =>
                update('maternityLeaveDays', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Bell size={18} className="text-pink-500" />
          اطلاع‌رسانی
        </h3>

        <ToggleRow
          label="اطلاع قرارداد در حال انقضا"
          description="اطلاع‌رسانی ۳۰ روز قبل از انقضای قرارداد"
          value={settings.notifyOnContractExpiry}
          onChange={(v) => update('notifyOnContractExpiry', v)}
        />
        <ToggleRow
          label="اطلاع تولد کارمندان"
          description="اطلاع‌رسانی در روز تولد کارمندان"
          value={settings.notifyOnBirthday}
          onChange={(v) => update('notifyOnBirthday', v)}
        />
        <ToggleRow
          label="اطلاع درخواست‌های رخصتی در انتظار"
          description="اطلاع‌رسانی فوری برای درخواست‌های جدید"
          value={settings.notifyOnPendingLeave}
          onChange={(v) => update('notifyOnPendingLeave', v)}
        />
      </div>

      {/* Payroll */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign size={18} className="text-pink-500" />
          معاشات
        </h3>

        <ToggleRow
          label="ایجاد خودکار معاشات"
          description="ایجاد خودکار معاشات در ابتدای هر ماه"
          value={settings.autoGenerateSalaries}
          onChange={(v) => update('autoGenerateSalaries', v)}
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
          className="inline-flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          ذخیره تنظیمات
        </button>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/admin/hr/staff"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-pink-500" />
              <span className="text-sm text-gray-700">کارمندان</span>
            </div>
            <ArrowRight size={14} className="text-gray-400 rotate-180" />
          </Link>
          <Link
            href="/admin/hr/departments"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-pink-500" />
              <span className="text-sm text-gray-700">بخش‌ها</span>
            </div>
            <ArrowRight size={14} className="text-gray-400 rotate-180" />
          </Link>
          <Link
            href="/admin/hr/recruitment"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-pink-500" />
              <span className="text-sm text-gray-700">استخدام</span>
            </div>
            <ArrowRight size={14} className="text-gray-400 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          value
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {value ? (
          <>
            <ToggleRight size={16} /> فعال
          </>
        ) : (
          <>
            <ToggleLeft size={16} /> غیرفعال
          </>
        )}
      </button>
    </div>
  );
}