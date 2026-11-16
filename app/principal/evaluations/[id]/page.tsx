// app/admin/academic/evaluations/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Award,
  Send,
  ClipboardList,
  Star,
} from 'lucide-react';
import { principalEvaluationsAPI } from '@/lib/api/principal';
import {
  evaluationCategoryLabels,
  evaluationStatusLabels,
  formatPercentage,
  gradeColors,
  evaluationPeriodLabels,
} from '@/lib/utils/principal-helpers';

interface EvaluationCriteriaScore {
  criteriaId: number;
  name: string;
  nameFarsi?: string;
  category: string;
  weight: number;
  maxScore: number;
  score: number | null;
  comment: string | null;
}

interface EvaluationDetail {
  id: number;
  teacher: {
    id: number;
    fullName: string;
    email?: string;
    profileImage?: string;
    teacherCode?: string;
    specialization?: string;
    subjects: string[];
  };
  template: { id: number; name: string; period: string };
  evaluator: { id: number; fullName: string; role: string };
  academicYear?: string;
  period: string;
  term: string;
  status: string;
  overallScore?: number;
  percentage?: number;
  grade?: string;
  gradeLabel?: string;
  categoryScores?: {
    teachingScore?: number;
    disciplineScore?: number;
    communicationScore?: number;
    professionalScore?: number;
    studentRelationScore?: number;
  };
  strengths?: string;
  weaknesses?: string;
  goals?: string;
  recommendations?: string;
  principalNotes?: string;
  criteria: EvaluationCriteriaScore[];
}

export default function EvaluationFormPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = Number(params.id);

  const [data, setData] = useState<EvaluationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [scores, setScores] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState({
    strengths: '',
    weaknesses: '',
    goals: '',
    recommendations: '',
    principalNotes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = (await principalEvaluationsAPI.getById(evaluationId)) as EvaluationDetail;
      setData(res);

      // Initialize scores
      const initScores: Record<number, number> = {};
      const initComments: Record<number, string> = {};
      res.criteria.forEach((c) => {
        if (c.score !== null) initScores[c.criteriaId] = c.score;
        if (c.comment) initComments[c.criteriaId] = c.comment;
      });
      setScores(initScores);
      setComments(initComments);
      setNotes({
        strengths: res.strengths || '',
        weaknesses: res.weaknesses || '',
        goals: res.goals || '',
        recommendations: res.recommendations || '',
        principalNotes: res.principalNotes || '',
      });
    } catch (err: unknown) {
      console.error('❌ [Evaluation] Error:', err);
      let message = 'خطا در دریافت ارزیابی';
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
    if (!isNaN(evaluationId)) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationId]);

  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      setError(null);
      const payload = {
        scores: data.criteria
          .filter((c) => scores[c.criteriaId] !== undefined)
          .map((c) => ({
            criteriaId: c.criteriaId,
            score: scores[c.criteriaId],
            comment: comments[c.criteriaId] || undefined,
          })),
        strengths: notes.strengths || undefined,
        weaknesses: notes.weaknesses || undefined,
        goals: notes.goals || undefined,
        recommendations: notes.recommendations || undefined,
        principalNotes: notes.principalNotes || undefined,
      };
      await principalEvaluationsAPI.submitScores(evaluationId, payload);
      setSuccess('امتیازات ذخیره شد');
      await loadData();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ذخیره امتیازات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      // Save first, then submit
      await handleSave();
      await principalEvaluationsAPI.submit(evaluationId);
      setSuccess('ارزیابی نهایی شد');
      await loadData();
      setTimeout(() => {
        router.push(`/admin/academic/evaluations/${evaluationId}/report`);
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در نهایی‌سازی';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const computedStats = (() => {
    if (!data) return { percent: 0, weighted: 0, max: 0 };
    let weighted = 0;
    let max = 0;
    data.criteria.forEach((c) => {
      const s = scores[c.criteriaId];
      const score = s !== undefined ? s : 0;
      weighted += score * c.weight;
      max += c.maxScore * c.weight;
    });
    const percent = max > 0 ? (weighted / max) * 100 : 0;
    return { percent, weighted, max };
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isLocked =
    data.status === 'SUBMITTED' || data.status === 'ACKNOWLEDGED';

  const categoryGroups = data.criteria.reduce<
    Record<string, EvaluationCriteriaScore[]>
  >((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
              ارزیابی معلم
            </h1>
            <p className="text-gray-500 text-sm">
              {data.teacher.fullName} • {data.template.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isLocked && (
            <>
              <button
                onClick={handleSave}
                disabled={saving || submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                ذخیره
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                نهایی‌سازی
              </button>
            </>
          )}
          <button
            onClick={() =>
              router.push(`/admin/academic/evaluations/${evaluationId}/report`)
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <ClipboardList size={16} />
            کارنامه
          </button>
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

      {isLocked && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          این ارزیابی نهایی شده و قابل ویرایش نیست.
        </div>
      )}

      {/* Teacher + status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden flex-shrink-0">
              {data.teacher.profileImage ? (
                <img
                  src={data.teacher.profileImage}
                  alt={data.teacher.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 truncate">
                {data.teacher.fullName}
              </h3>
              {data.teacher.teacherCode && (
                <p className="text-xs text-gray-500">
                  کد: {data.teacher.teacherCode}
                </p>
              )}
            </div>
          </div>
          {data.teacher.specialization && (
            <p className="text-sm text-gray-600 mt-3">
              <span className="text-gray-400">تخصص: </span>
              {data.teacher.specialization}
            </p>
          )}
          {data.teacher.subjects.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">مضامین:</p>
              <div className="flex flex-wrap gap-1">
                {data.teacher.subjects.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            جزئیات ارزیابی
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DetailBox
              label="دوره"
              value={evaluationPeriodLabels[data.period] || data.period}
            />
            <DetailBox label="قالب" value={data.template.name} />
            <DetailBox
              label="وضعیت"
              value={evaluationStatusLabels[data.status] || data.status}
            />
            <DetailBox
              label="سال تحصیلی"
              value={data.academicYear || '—'}
            />
          </div>

          {data.percentage !== undefined && data.percentage !== null && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">نمره نهایی</span>
                <span
                  className={`text-xl font-bold ${
                    gradeColors[data.grade || '']?.text || 'text-gray-700'
                  }`}
                >
                  {formatPercentage(data.percentage, 1)}{' '}
                  <span className="text-xs">
                    ({data.gradeLabel || data.grade})
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    data.percentage >= 80
                      ? 'bg-green-500'
                      : data.percentage >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Criteria */}
      {Object.entries(categoryGroups).map(([category, items]) => (
        <div key={category} className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            {evaluationCategoryLabels[category] || category}
          </h3>

          <div className="space-y-4">
            {items.map((c) => (
              <div
                key={c.criteriaId}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {c.nameFarsi || c.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      وزن: {c.weight} • حداکثر: {c.maxScore}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex gap-1">
                      {Array.from({ length: c.maxScore }, (_, i) => i + 1).map(
                        (n) => {
                          const active =
                            (scores[c.criteriaId] || 0) >= n && !isLocked;
                          const filled = (scores[c.criteriaId] || 0) >= n;
                          return (
                            <button
                              key={n}
                              onClick={() => {
                                if (isLocked) return;
                                setScores({
                                  ...scores,
                                  [c.criteriaId]: n,
                                });
                              }}
                              disabled={isLocked}
                              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                                filled
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-white text-gray-400 border border-gray-200 hover:border-pink-400'
                              } ${isLocked ? 'cursor-not-allowed' : ''}`}
                            >
                              {n}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    value={comments[c.criteriaId] || ''}
                    onChange={(e) =>
                      setComments({
                        ...comments,
                        [c.criteriaId]: e.target.value,
                      })
                    }
                    disabled={isLocked}
                    placeholder="یادداشت (اختیاری)..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Live total */}
      {!isLocked && (
        <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">نمره در حال محاسبه</p>
              <p className="text-3xl font-bold mt-1">
                {formatPercentage(computedStats.percent, 1)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-pink-100 text-xs">امتیاز کل</p>
              <p className="text-lg font-bold">
                {computedStats.weighted.toFixed(1)} /{' '}
                {computedStats.max.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          یادداشت‌های ارزیاب
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NoteField
            label="نقاط قوت"
            value={notes.strengths}
            onChange={(v) => setNotes({ ...notes, strengths: v })}
            disabled={isLocked}
            color="border-green-200"
          />
          <NoteField
            label="نقاط ضعف"
            value={notes.weaknesses}
            onChange={(v) => setNotes({ ...notes, weaknesses: v })}
            disabled={isLocked}
            color="border-red-200"
          />
          <NoteField
            label="اهداف"
            value={notes.goals}
            onChange={(v) => setNotes({ ...notes, goals: v })}
            disabled={isLocked}
            color="border-blue-200"
          />
          <NoteField
            label="توصیه‌ها"
            value={notes.recommendations}
            onChange={(v) => setNotes({ ...notes, recommendations: v })}
            disabled={isLocked}
            color="border-purple-200"
          />
        </div>
        <NoteField
          label="یادداشت مدیر"
          value={notes.principalNotes}
          onChange={(v) => setNotes({ ...notes, principalNotes: v })}
          disabled={isLocked}
          color="border-gray-200"
        />
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
    </div>
  );
}

function NoteField({
  label,
  value,
  onChange,
  disabled,
  color,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  color: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        className={`w-full px-3 py-2 border ${color} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100`}
      />
    </div>
  );
}