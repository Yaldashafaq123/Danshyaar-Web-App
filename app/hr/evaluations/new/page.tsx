// app/admin/hr/evaluations/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Award,
  User,
  Star,
} from 'lucide-react';
import { hrEvaluationsAPI, hrStaffAPI } from '@/lib/api/hr';
import type { StaffMember } from '@/types/hr';
import { formatNumber } from '@/lib/utils/hr-helpers';

const PERIODS = [
  { value: 'MONTHLY', label: 'ماهانه' },
  { value: 'QUARTERLY', label: 'فصلی' },
  { value: 'SEMESTER', label: 'شش‌ماهه' },
  { value: 'ANNUAL', label: 'سالانه' },
  { value: 'PROBATION', label: 'دوره آزمایشی' },
];

const SCORE_CRITERIA = [
  { key: 'teachingQuality', label: 'کیفیت تدریس / کار' },
  { key: 'attendanceScore', label: 'حضور و وقت‌شناسی' },
  { key: 'studentFeedback', label: 'رضایت شاگردان/همکاران' },
  { key: 'teamworkScore', label: 'کار گروهی' },
  { key: 'punctualityScore', label: 'نظم و انضباط' },
] as const;

export default function NewEvaluationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    userId: initialUserId || '',
    period: 'ANNUAL',
    teachingQuality: 3,
    attendanceScore: 3,
    studentFeedback: 3,
    teamworkScore: 3,
    punctualityScore: 3,
    strengths: '',
    weaknesses: '',
    goals: '',
    recommendations: '',
  });

  useEffect(() => {
    hrStaffAPI
      .list({ limit: 500 })
      .then((res) => setStaff(res.staff))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const updateScore = (
    key: (typeof SCORE_CRITERIA)[number]['key'],
    value: number
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.userId) {
      setError('لطفاً کارمند را انتخاب کنید');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await hrEvaluationsAPI.create({
        userId: Number(form.userId),
        period: form.period,
        teachingQuality: form.teachingQuality,
        attendanceScore: form.attendanceScore,
        studentFeedback: form.studentFeedback,
        teamworkScore: form.teamworkScore,
        punctualityScore: form.punctualityScore,
        strengths: form.strengths || undefined,
        weaknesses: form.weaknesses || undefined,
        goals: form.goals || undefined,
        recommendations: form.recommendations || undefined,
      });

      setSuccess('ارزیابی با موفقیت ثبت شد');
      setTimeout(() => {
        router.push('/admin/hr/evaluations');
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ثبت ارزیابی';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const avgScore =
    (form.teachingQuality +
      form.attendanceScore +
      form.studentFeedback +
      form.teamworkScore +
      form.punctualityScore) /
    5;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
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
            <Award className="text-pink-500" size={26} />
            ارزیابی جدید
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ارزیابی عملکرد یک کارمند
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

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <User size={18} className="text-pink-500" />
          اطلاعات اصلی
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              کارمند *
            </label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">انتخاب کنید...</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                  {s.position ? ` — ${s.position}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              دوره ارزیابی
            </label>
            <select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star size={18} className="text-yellow-500" />
          معیارهای ارزیابی
        </h3>

        <div className="space-y-4">
          {SCORE_CRITERIA.map((c) => {
            const score = form[c.key];
            return (
              <div key={c.key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-900">
                    {c.label}
                  </p>
                  <span
                    className={`text-lg font-bold ${
                      score >= 4
                        ? 'text-green-600'
                        : score >= 3
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {score}/5
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateScore(c.key, n)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        score >= n
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'bg-white text-gray-400 border border-gray-200 hover:border-pink-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Average display */}
        <div className="mt-4 p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg text-white flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm">میانگین امتیاز</p>
            <p className="text-3xl font-bold">{avgScore.toFixed(1)} / 5</p>
          </div>
          <Award size={40} className="text-pink-200 opacity-60" />
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          یادداشت‌های ارزیاب
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NoteField
            label="نقاط قوت"
            value={form.strengths}
            onChange={(v) => setForm({ ...form, strengths: v })}
            placeholder="مثال: مدیریت عالی صنف..."
          />
          <NoteField
            label="نقاط ضعف"
            value={form.weaknesses}
            onChange={(v) => setForm({ ...form, weaknesses: v })}
            placeholder="مثال: تأخیر در تحویل کار..."
          />
          <NoteField
            label="اهداف"
            value={form.goals}
            onChange={(v) => setForm({ ...form, goals: v })}
            placeholder="اهداف برای دوره بعدی"
          />
          <NoteField
            label="توصیه‌ها"
            value={form.recommendations}
            onChange={(v) => setForm({ ...form, recommendations: v })}
            placeholder="توصیه‌های بهبود"
          />
        </div>
      </div>

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
          ثبت ارزیابی
        </button>
      </div>
    </div>
  );
}

function NoteField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    </div>
  );
}