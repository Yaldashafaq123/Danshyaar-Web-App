// app/admin/academic/communication/sms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  User,
  Home,
  MessageSquare,
  Info,
  Search,
} from 'lucide-react';
import { principalClassesAPI, principalStudentsAPI } from '@/lib/api/principal';
import type { Class } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

type RecipientType = 'all' | 'class' | 'parents' | 'teachers';

export default function SmsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    recipientType: 'parents' as RecipientType,
    classId: '',
    message: '',
    phoneNumbers: '',
  });

  // Manual phone numbers (comma-separated)
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    principalClassesAPI
      .list()
      .then(setClasses)
      .catch((e) => console.error('Classes load error:', e))
      .finally(() => setLoading(false));
  }, []);

  const estimateRecipients = async (): Promise<number> => {
    if (manualMode) {
      return form.phoneNumbers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean).length;
    }

    try {
      if (form.recipientType === 'class' && form.classId) {
        const res = await principalStudentsAPI.list({
          classId: Number(form.classId),
          limit: 500,
        });
        return res.students.length;
      }
      if (form.recipientType === 'all') {
        const res = await principalStudentsAPI.list({ limit: 1000 });
        return res.total;
      }
      // parents/teachers: no direct count endpoint
      return 0;
    } catch {
      return 0;
    }
  };

  const handleSend = async () => {
    if (!form.message.trim()) {
      setError('لطفاً متن پیام را وارد کنید');
      return;
    }
    if (!manualMode && form.recipientType === 'class' && !form.classId) {
      setError('لطفاً صنف را انتخاب کنید');
      return;
    }
    if (manualMode && !form.phoneNumbers.trim()) {
      setError('لطفاً شماره‌ها را وارد کنید');
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSuccess(null);

      const recipientCount = await estimateRecipients();

      // NOTE: Backend SMS endpoint not yet implemented.
      // In production, we'd call POST /principal/communication/sms with:
      //   { recipientType, classId, message, phoneNumbers }
      await new Promise((res) => setTimeout(res, 900));

      setSuccess(
        `پیام‌ها در صف ارسال قرار گرفتند (${formatNumber(
          recipientCount || 1
        )} گیرنده)`
      );
      setForm((f) => ({ ...f, message: '' }));
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error(err);
      setError('خطا در ارسال پیام');
    } finally {
      setSending(false);
    }
  };

  const charCount = form.message.length;
  const smsParts = Math.ceil(charCount / 160) || 1;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/academic/communication/parents"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="text-blue-500" size={26} />
            ارسال پیامک
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ارسال پیام به والدین، شاگردان یا معلمان
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">راهنمای ارسال</p>
          <p>
            پیام‌ها از طریق سیستم SMS مکتب ارسال می‌شوند. برای هر ۱۶۰ کاراکتر،
            یک پیامک محاسبه می‌شود.
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

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Recipient type */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            گیرندگان
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!manualMode}
                onChange={() => setManualMode(false)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">انتخاب از سیستم</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={manualMode}
                onChange={() => setManualMode(true)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">ورود دستی شماره‌ها</span>
            </label>
          </div>

          {!manualMode ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <RecipientButton
                  active={form.recipientType === 'parents'}
                  onClick={() =>
                    setForm({ ...form, recipientType: 'parents' })
                  }
                  icon={Users}
                  label="والدین"
                />
                <RecipientButton
                  active={form.recipientType === 'all'}
                  onClick={() => setForm({ ...form, recipientType: 'all' })}
                  icon={User}
                  label="همه شاگردان"
                />
                <RecipientButton
                  active={form.recipientType === 'class'}
                  onClick={() => setForm({ ...form, recipientType: 'class' })}
                  icon={Home}
                  label="یک صنف خاص"
                />
                <RecipientButton
                  active={form.recipientType === 'teachers'}
                  onClick={() =>
                    setForm({ ...form, recipientType: 'teachers' })
                  }
                  icon={Users}
                  label="معلمان"
                />
              </div>

              {form.recipientType === 'class' && (
                <select
                  value={form.classId}
                  onChange={(e) =>
                    setForm({ ...form, classId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب صنف...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.section || ''} (
                      {formatNumber(c.studentCount)} شاگرد)
                    </option>
                  ))}
                </select>
              )}
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                شماره‌ها (با کاما جدا کنید)
              </label>
              <textarea
                value={form.phoneNumbers}
                onChange={(e) =>
                  setForm({ ...form, phoneNumbers: e.target.value })
                }
                rows={3}
                placeholder="0700000000, 0700000001, 0700000002"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-left"
                dir="ltr"
              />
            </div>
          )}
        </div>

        {/* Message */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            متن پیام
          </h3>

          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={6}
            placeholder="متن پیام خود را اینجا بنویسید..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{charCount} کاراکتر</span>
            <span>{smsParts} پیامک</span>
          </div>

          {/* Templates */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">قالب‌های آماده:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'سلام، این پیام از مکتب است. ',
                'به اطلاع می‌رسانیم که ',
                'جلسه والدین روز ',
                'نمرات میان‌دوره ',
                'غیبت فرزند شما در تاریخ ',
              ].map((tpl, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setForm({ ...form, message: form.message + tpl })
                  }
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {tpl.trim()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
        <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-800">
          <p className="font-medium mb-1">توجه</p>
          <p>
            در حال حاضر ارسال پیامک در حالت نمایشی است. برای فعال‌سازی ارسال
            واقعی، باید اتصال به سرویس پیامک (مانند Twilio یا اپراتور محلی)
            تنظیم شود.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/academic/communication/parents"
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
        >
          انصراف
        </Link>
        <button
          onClick={handleSend}
          disabled={sending || !form.message.trim()}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          ارسال پیامک
        </button>
      </div>
    </div>
  );
}

function RecipientButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-sm ${
        active
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );
}