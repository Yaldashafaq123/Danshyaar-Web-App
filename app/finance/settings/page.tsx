// app/admin/finance/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  Info,
  DollarSign,
  Percent,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
} from 'lucide-react';
import { financeMiscAPI } from '@/lib/api/finance';
import Link from 'next/link';

interface SchoolFeeSettings {
  feesType: number; // 1 = yearly, 2 = monthly
  eduType: number; // 1 = cold, 2 = hot
  discountAllowness: number; // 0 = no, 1 = yes
  feesPayment: number; // 1 = active
}

export default function FinanceSettingsPage() {
  const [settings, setSettings] = useState<SchoolFeeSettings>({
    feesType: 2,
    eduType: 1,
    discountAllowness: 1,
    feesPayment: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeMiscAPI.getSchoolFeeSettings();
      setSettings(res);
    } catch (err: unknown) {
      console.error(err);
      // Use defaults on error — settings endpoint may not exist
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // NOTE: Backend doesn't have a PUT settings endpoint yet.
      // We save locally for now.
      localStorage.setItem('finance-settings', JSON.stringify(settings));
      await new Promise((res) => setTimeout(res, 500));

      setSuccess('تنظیمات ذخیره شد (به‌صورت محلی)');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('خطا در ذخیره تنظیمات');
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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-gray-700" size={26} />
          تنظیمات مالی
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          پیکربندی سیستم فیس و مالی
        </p>
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

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">توجه</p>
          <p>
            در حال حاضر تنظیمات به‌صورت محلی ذخیره می‌شوند. برای فعال‌سازی
            ذخیره‌سازی مرکزی، نیاز به افزودن endpoint در backend است.
          </p>
        </div>
      </div>

      {/* Settings sections */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Fee type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign size={16} className="text-blue-500" />
            نوع فیس
          </label>
          <div className="grid grid-cols-2 gap-3">
            <SettingButton
              active={settings.feesType === 1}
              onClick={() => setSettings({ ...settings, feesType: 1 })}
              title="سالانه"
              description="فیس یک‌بار برای کل سال"
            />
            <SettingButton
              active={settings.feesType === 2}
              onClick={() => setSettings({ ...settings, feesType: 2 })}
              title="ماهانه"
              description="فیس به تفکیک ۱۲ ماه"
            />
          </div>
        </div>

        {/* Edu type */}
        <div className="border-t border-gray-100 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            نوع آموزش
          </label>
          <div className="grid grid-cols-2 gap-3">
            <SettingButton
              active={settings.eduType === 1}
              onClick={() => setSettings({ ...settings, eduType: 1 })}
              title="سرد"
              description="سیستم آموزشی سرد (زمستانی)"
            />
            <SettingButton
              active={settings.eduType === 2}
              onClick={() => setSettings({ ...settings, eduType: 2 })}
              title="گرم"
              description="سیستم آموزشی گرم (تابستانی)"
            />
          </div>
        </div>

        {/* Discount allow */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent size={16} className="text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  اجازه تخفیف‌دهی
                </p>
                <p className="text-xs text-gray-500">
                  امکان اعمال تخفیف روی فیس
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  discountAllowness: settings.discountAllowness === 1 ? 0 : 1,
                })
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                settings.discountAllowness === 1
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {settings.discountAllowness === 1 ? (
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
        </div>

        {/* Fee payment */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  سیستم پرداخت فیس
                </p>
                <p className="text-xs text-gray-500">
                  فعال بودن دریافت فیس
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  feesPayment: settings.feesPayment === 1 ? 0 : 1,
                })
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                settings.feesPayment === 1
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {settings.feesPayment === 1 ? (
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
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
          <QuickLink
            label="دسته‌بندی مصارف"
            description="مدیریت دسته‌ها"
            href="/admin/finance/expenses/categories"
          />
          <QuickLink
            label="سال‌های تحصیلی"
            description="از داشبورد اکادمیک"
            href="/admin/academic/academics/years"
          />
          <QuickLink
            label="قالب‌های فیس"
            description="مدیریت قالب‌ها"
            href="/admin/finance/fee-templates"
          />
        </div>
      </div>
    </div>
  );
}

function SettingButton({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-right transition-colors ${
        active
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <p className="font-bold text-sm">{title}</p>
      <p className="text-xs opacity-70 mt-0.5">{description}</p>
    </button>
  );
}

function QuickLink({
  label,
  description,
  href,
}: {
  label: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRight size={14} className="text-gray-400 rotate-180" />
    </Link>
  );
}