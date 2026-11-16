// app/admin/academic/evaluations/[id]/report/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Award,
  User,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Trophy,
  Target,
  Lightbulb,
  FileText,
  Printer,
} from 'lucide-react';
import { principalEvaluationsAPI } from '@/lib/api/principal';
import {
  formatPercentage,
  formatDate,
  gradeColors,
  evaluationCategoryLabels,
  evaluationStatusLabels,
} from '@/lib/utils/principal-helpers';

interface ReportCriteria {
  criteriaId: number;
  name: string;
  nameFarsi?: string;
  category: string;
  categoryLabel: string;
  score: number;
  maxScore: number;
  weight: number;
  weightedScore: number;
  percentage: number;
  comment: string | null;
  color: string;
}

interface ReportCategory {
  category: string;
  categoryLabel: string;
  percentage: number;
  weight: number;
  color: string;
  criteria: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
    percentage: number;
    comment: string | null;
  }[];
}

interface ReportData {
  evaluationId: number;
  teacher: {
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    teacherCode?: string;
    specialization?: string;
    subjects: string[];
    classes: string[];
  };
  evaluation: {
    templateName: string;
    period: string;
    term: string;
    academicYear?: string;
    evaluatorName: string;
    evaluatorRole: string;
    evaluatedAt?: string;
    status: string;
  };
  overallScore: {
    totalScore: number;
    totalMaxScore: number;
    percentage: number;
    grade: string;
    gradeLabel: string;
    performanceLabel: string;
    performanceColor: string;
  };
  categoryBreakdown: ReportCategory[];
  criteria: ReportCriteria[];
  strengths: { name: string; category: string; percentage: number }[];
  weaknesses: { name: string; category: string; percentage: number }[];
  comments: {
    strengths?: string;
    weaknesses?: string;
    goals?: string;
    recommendations?: string;
    principalNotes?: string;
  };
  summary: {
    totalCriteria: number;
    criteriaAbove70: number;
    criteriaBelow50: number;
    strongestCategory?: string;
    weakestCategory?: string;
  };
}

export default function ReportCardPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = Number(params.id);

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = (await principalEvaluationsAPI.getReportCard(
          evaluationId
        )) as ReportData;
        setData(res);
      } catch (err: unknown) {
        console.error('❌ [Report Card] Error:', err);
        let message = 'خطا در دریافت کارنامه';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          message = e.response?.data?.message || e.message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (!isNaN(evaluationId)) load();
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !data) {
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
          <p className="text-red-700 text-sm">{error || 'یافت نشد'}</p>
        </div>
      </div>
    );
  }

  const overall = data.overallScore;

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
              <Trophy className="text-yellow-500" size={26} />
              کارنامه ارزیابی
            </h1>
            <p className="text-gray-500 text-sm">
              {data.teacher.fullName} • {data.evaluation.templateName}
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
        >
          <Printer size={16} />
          چاپ
        </button>
      </div>

      {/* Hero score */}
      <div
        className="rounded-2xl p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${overall.performanceColor}, ${overall.performanceColor}dd)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">
              نمره نهایی ارزیابی
            </p>
            <p className="text-6xl font-bold mt-2">
              {formatPercentage(overall.percentage, 1)}
            </p>
            <p className="text-white/90 text-sm mt-2">
              {overall.totalScore.toFixed(1)} از{' '}
              {overall.totalMaxScore.toFixed(1)}
            </p>
          </div>
          <div className="text-right">
            <Award className="text-white/40" size={64} />
            <p className="text-2xl font-bold mt-2">
              {overall.gradeLabel}
            </p>
            <p className="text-white/90 text-sm">
              {overall.performanceLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={16} className="text-pink-500" />
            اطلاعات معلم
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden">
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
              <p className="font-bold text-gray-900 truncate">
                {data.teacher.fullName}
              </p>
              {data.teacher.teacherCode && (
                <p className="text-xs text-gray-500">
                  کد: {data.teacher.teacherCode}
                </p>
              )}
              {data.teacher.specialization && (
                <p className="text-xs text-gray-500">
                  {data.teacher.specialization}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            اطلاعات ارزیابی
          </h3>
          <div className="space-y-2 text-sm">
            <Row label="قالب" value={data.evaluation.templateName} />
            <Row label="دوره" value={data.evaluation.period} />
            <Row label="سال تحصیلی" value={data.evaluation.academicYear || '—'} />
            <Row
              label="ارزیاب"
              value={`${data.evaluation.evaluatorName} (${data.evaluation.evaluatorRole})`}
            />
            <Row
              label="تاریخ"
              value={formatDate(data.evaluation.evaluatedAt)}
            />
            <Row
              label="وضعیت"
              value={
                evaluationStatusLabels[data.evaluation.status] ||
                data.evaluation.status
              }
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={16} className="text-purple-500" />
            خلاصه
          </h3>
          <div className="space-y-3">
            <SummaryBox
              label="معیارهای ارزیابی"
              value={data.summary.totalCriteria}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <SummaryBox
              label="بالای ۷۰٪"
              value={data.summary.criteriaAbove70}
              color="text-green-600"
              bg="bg-green-50"
            />
            <SummaryBox
              label="زیر ۵۰٪"
              value={data.summary.criteriaBelow50}
              color="text-red-600"
              bg="bg-red-50"
            />
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          تفکیک بر اساس دسته‌بندی
        </h3>

        <div className="space-y-4">
          {data.categoryBreakdown.map((cat) => (
            <div key={cat.category} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-gray-900">
                    {cat.categoryLabel}
                  </span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: cat.color }}
                >
                  {formatPercentage(cat.percentage, 1)}
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>

              <div className="space-y-2">
                {cat.criteria.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {c.score}/{c.maxScore}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            c.percentage >= 70
                              ? '#10b981'
                              : c.percentage >= 50
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      >
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-400">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-600" size={20} />
            <h3 className="text-base font-semibold text-gray-900">
              نقاط قوت
            </h3>
          </div>
          {data.strengths.length === 0 ? (
            <p className="text-sm text-gray-500">
              نقاط قوت قابل توجهی ثبت نشده
            </p>
          ) : (
            <div className="space-y-2">
              {data.strengths.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500">{s.category}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {formatPercentage(s.percentage, 1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-400">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="text-red-600" size={20} />
            <h3 className="text-base font-semibold text-gray-900">
              نقاط ضعف
            </h3>
          </div>
          {data.weaknesses.length === 0 ? (
            <p className="text-sm text-gray-500">
              نقطه ضعف قابل توجهی ثبت نشده 🎉
            </p>
          ) : (
            <div className="space-y-2">
              {data.weaknesses.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {w.name}
                    </p>
                    <p className="text-xs text-gray-500">{w.category}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {formatPercentage(w.percentage, 1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      {(data.comments.strengths ||
        data.comments.weaknesses ||
        data.comments.goals ||
        data.comments.recommendations ||
        data.comments.principalNotes) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={18} />
            یادداشت‌ها و توصیه‌ها
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.comments.strengths && (
              <CommentBox
                title="نقاط قوت"
                content={data.comments.strengths}
                color="text-green-700"
                bg="bg-green-50"
              />
            )}
            {data.comments.weaknesses && (
              <CommentBox
                title="نقاط ضعف"
                content={data.comments.weaknesses}
                color="text-red-700"
                bg="bg-red-50"
              />
            )}
            {data.comments.goals && (
              <CommentBox
                title="اهداف"
                content={data.comments.goals}
                color="text-blue-700"
                bg="bg-blue-50"
              />
            )}
            {data.comments.recommendations && (
              <CommentBox
                title="توصیه‌ها"
                content={data.comments.recommendations}
                color="text-purple-700"
                bg="bg-purple-50"
              />
            )}
            {data.comments.principalNotes && (
              <div className="md:col-span-2">
                <CommentBox
                  title="یادداشت مدیر"
                  content={data.comments.principalNotes}
                  color="text-gray-700"
                  bg="bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full criteria table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            جدول کامل معیارها
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                  معیار
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                  دسته
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                  نمره
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                  درصد
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                  یادداشت
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.criteria.map((c) => (
                <tr key={c.criteriaId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {c.nameFarsi || c.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {c.categoryLabel}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {c.score} / {c.maxScore}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${
                        c.percentage >= 70
                          ? 'text-green-600'
                          : c.percentage >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {c.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                    {c.comment || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium truncate max-w-[140px]">
        {value}
      </span>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-3 flex items-center justify-between`}>
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

function CommentBox({
  title,
  content,
  color,
  bg,
}: {
  title: string;
  content: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-4`}>
      <p className={`text-sm font-semibold mb-2 ${color}`}>{title}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}