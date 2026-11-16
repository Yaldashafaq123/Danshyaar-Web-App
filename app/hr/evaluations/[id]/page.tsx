// app/admin/hr/evaluations/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Award,
  Loader2,
  AlertCircle,
  User,
  Star,
  TrendingUp,
  MessageSquare,
  Target,
  Lightbulb,
  Calendar,
} from 'lucide-react';
import { hrEvaluationsAPI } from '@/lib/api/hr';
import type { Evaluation } from '@/types/hr';
import {
  formatShamsiDate,
  formatNumber,
} from '@/lib/utils/hr-helpers';

function getScoreInfo(score: number | null | undefined) {
  if (score === null || score === undefined)
    return { text: 'text-gray-500', bg: 'bg-gray-100', label: '—' };
  if (score >= 4.5)
    return { text: 'text-green-600', bg: 'bg-green-100', label: 'عالی' };
  if (score >= 4)
    return { text: 'text-blue-600', bg: 'bg-blue-100', label: 'خیلی خوب' };
  if (score >= 3)
    return { text: 'text-yellow-600', bg: 'bg-yellow-100', label: 'خوب' };
  if (score >= 2)
    return { text: 'text-orange-600', bg: 'bg-orange-100', label: 'قابل قبول' };
  return { text: 'text-red-600', bg: 'bg-red-100', label: 'نیاز به بهبود' };
}

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = Number(params.id);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isNaN(evaluationId)) {
        setError('شناسه نامعتبر');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // The backend doesn't have a getById method, so we get it from the list
        const res = await hrEvaluationsAPI.list({ limit: 500 });
        const found = res.evaluations.find((e) => e.id === evaluationId);
        if (!found) throw new Error('ارزیابی یافت نشد');
        setEvaluation(found);
      } catch (err: unknown) {
        console.error(err);
        let message = 'خطا در دریافت ارزیابی';
        if (err && typeof err === 'object' && 'message' in err) {
          message = (err as { message?: string }).message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  if (error || !evaluation) {
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

  const overallScoreInfo = getScoreInfo(evaluation.overallScore);
  const overallPercent = evaluation.overallScore
    ? (Number(evaluation.overallScore) / 5) * 100
    : 0;

  const criteria = [
    {
      label: 'کیفیت تدریس / کار',
      score: evaluation.teachingQuality,
      icon: Award,
    },
    {
      label: 'حضور و وقت‌شناسی',
      score: evaluation.attendanceScore,
      icon: Calendar,
    },
    {
      label: 'رضایت شاگردان/همکاران',
      score: evaluation.studentFeedback,
      icon: User,
    },
    {
      label: 'کار گروهی',
      score: evaluation.teamworkScore,
      icon: TrendingUp,
    },
    {
      label: 'نظم و انضباط',
      score: evaluation.punctualityScore,
      icon: Star,
    },
  ];

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
            <Award className="text-pink-500" size={26} />
            جزئیات ارزیابی
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {formatShamsiDate(evaluation.date)}
          </p>
        </div>
      </div>

      {/* Hero score */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm">امتیاز کل</p>
            <p className="text-6xl font-bold mt-2">
              {evaluation.overallScore
                ? Number(evaluation.overallScore).toFixed(1)
                : '—'}
            </p>
            <p className="text-pink-100 text-sm mt-2">
              از ۵ • {overallScoreInfo.label}
            </p>
          </div>
          <div className="text-right">
            <Award size={64} className="text-pink-200 opacity-40" />
            <p className="text-2xl font-bold mt-2">{evaluation.period}</p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={16} className="text-pink-500" />
            اطلاعات کارمند
          </h3>
          <div className="space-y-2 text-sm">
            <Row label="نام" value={evaluation.User.fullName} />
            <Row label="ایمیل" value={evaluation.User.email} />
            <Row label="نقش" value={evaluation.User.role} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={16} className="text-pink-500" />
            اطلاعات ارزیابی
          </h3>
          <div className="space-y-2 text-sm">
            <Row label="ارزیاب" value={evaluation.Evaluator?.fullName || '—'} />
            <Row label="دوره" value={evaluation.period} />
            <Row label="تاریخ" value={formatShamsiDate(evaluation.date)} />
          </div>
        </div>
      </div>

      {/* Criteria breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Star size={16} className="text-yellow-500" />
          تفکیک معیارها
        </h3>

        <div className="space-y-4">
          {criteria.map((c) => {
            const score = c.score;
            const info = getScoreInfo(score);
            const percent = score ? (Number(score) / 5) * 100 : 0;
            const Icon = c.icon;

            return (
              <div key={c.label} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {c.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${info.text}`}>
                      {score ? Number(score).toFixed(1) : '—'}/5
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${info.bg} ${info.text}`}
                    >
                      {info.label}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      percent >= 80
                        ? 'bg-green-500'
                        : percent >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      {(evaluation.strengths ||
        evaluation.weaknesses ||
        evaluation.goals ||
        evaluation.recommendations) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-pink-500" />
            یادداشت‌ها
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluation.strengths && (
              <CommentBox
                title="نقاط قوت"
                content={evaluation.strengths}
                color="text-green-700"
                bg="bg-green-50"
                icon={TrendingUp}
              />
            )}
            {evaluation.weaknesses && (
              <CommentBox
                title="نقاط ضعف"
                content={evaluation.weaknesses}
                color="text-red-700"
                bg="bg-red-50"
                icon={AlertCircle}
              />
            )}
            {evaluation.goals && (
              <CommentBox
                title="اهداف"
                content={evaluation.goals}
                color="text-blue-700"
                bg="bg-blue-50"
                icon={Target}
              />
            )}
            {evaluation.recommendations && (
              <CommentBox
                title="توصیه‌ها"
                content={evaluation.recommendations}
                color="text-purple-700"
                bg="bg-purple-50"
                icon={Lightbulb}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function CommentBox({
  title,
  content,
  color,
  bg,
  icon: Icon,
}: {
  title: string;
  content: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`${bg} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <p className={`text-sm font-semibold ${color}`}>{title}</p>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}