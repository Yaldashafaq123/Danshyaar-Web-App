// app/student/feedback/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  Lightbulb,
  Sparkles,
  CheckCircle,
  Clock,
  Heart,
} from 'lucide-react';
import { studentGradesAPI } from '@/lib/api/student-portal';
import type { TermGrades } from '@/types/student-portal';
import {
  formatNumber,
  getScoreColor,
  getSubjectColor,
} from '@/lib/utils/student-helpers';

interface FeedbackItem {
  id: number;
  teacherName: string;
  teacherImage?: string | null;
  subject: string;
  date?: string;
  type: 'praise' | 'improvement' | 'info';
  message: string;
  score?: number;
}

export default function FeedbackPage() {
  const [grades, setGrades] = useState<TermGrades | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentGradesAPI.getCurrent().catch(() => null);
      setGrades(res);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت بازخوردها';
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
    fetchData();
  }, []);

  // Generate feedback items from subject grades
  const feedback: FeedbackItem[] = (grades?.subjects || [])
    .filter((s) => s.average > 0)
    .map((s, i) => {
      let type: FeedbackItem['type'] = 'info';
      let message = '';

      if (s.average >= 90) {
        type = 'praise';
        message =
          'عملکرد عالی و مستمر! با همین تلاش ادامه بده. تلاش‌های تو قابل تقدیر است.';
      } else if (s.average >= 80) {
        type = 'praise';
        message =
          'نتیجه خوبی کسب کرده‌ای. با کمی تلاش بیشتر می‌توانی به بالاترین سطح برسی.';
      } else if (s.average >= 70) {
        type = 'info';
        message =
          'نتیجه‌ات قابل قبول است. سعی کن روی مباحث دشوارتر تمرکز بیشتری داشته باشی.';
      } else if (s.average >= 60) {
        type = 'improvement';
        message =
          'نیاز به تلاش بیشتر در این مضمون داری. از معلم خود کمک بخواه و تمرین بیشتری انجام بده.';
      } else {
        type = 'improvement';
        message =
          'عملکرد ضعیف در این مضمون. لطفاً با معلم خود صحبت کن و برنامه مطالعه ویژه تنظیم کن.';
      }

      return {
        id: i,
        teacherName: s.Teacher || 'معلم مضمون',
        subject: s.subject,
        date: s.halfYearlyExamDetails?.date || undefined,
        type,
        message,
        score: s.average,
      };
    });

  const praiseFeedbacks = feedback.filter((f) => f.type === 'praise');
  const improvementFeedbacks = feedback.filter((f) => f.type === 'improvement');
  const infoFeedbacks = feedback.filter((f) => f.type === 'info');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-indigo-500" size={26} />
            بازخورد معلمان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            نظرات و توصیه‌های معلمان در مورد عملکرد شما
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/evaluation"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Star size={16} />
            ارزیابی من
          </Link>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && feedback.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-xs text-gray-600">تشویق</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(praiseFeedbacks.length)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart size={16} className="text-blue-600" />
              <p className="text-xs text-gray-600">عمومی</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(infoFeedbacks.length)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb size={16} className="text-amber-600" />
              <p className="text-xs text-gray-600">توصیه به بهبود</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {formatNumber(improvementFeedbacks.length)}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
        </div>
      )}

      {/* Empty state */}
      {!loading && feedback.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">
            هنوز بازخوردی از معلمان دریافت نکرده‌اید
          </p>
          <p className="text-xs text-gray-400 mt-2">
            بازخوردها پس از ثبت نمرات و ارزیابی‌ها نمایش داده می‌شوند
          </p>
        </div>
      )}

      {/* Praise feedbacks */}
      {!loading && praiseFeedbacks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="text-green-500" size={20} />
            تشویق‌ها و تقدیرها
          </h3>
          <div className="space-y-3">
            {praiseFeedbacks.map((f) => (
              <FeedbackCard key={f.id} feedback={f} />
            ))}
          </div>
        </div>
      )}

      {/* Improvement feedbacks */}
      {!loading && improvementFeedbacks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="text-amber-500" size={20} />
            توصیه‌های بهبود
          </h3>
          <div className="space-y-3">
            {improvementFeedbacks.map((f) => (
              <FeedbackCard key={f.id} feedback={f} />
            ))}
          </div>
        </div>
      )}

      {/* Info feedbacks */}
      {!loading && infoFeedbacks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="text-blue-500" size={20} />
            بازخوردهای عمومی
          </h3>
          <div className="space-y-3">
            {infoFeedbacks.map((f) => (
              <FeedbackCard key={f.id} feedback={f} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function FeedbackCard({ feedback }: { feedback: FeedbackItem }) {
  const config = {
    praise: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: Award,
      iconColor: 'text-green-600',
      label: 'تشویق',
      labelColor: 'bg-green-100 text-green-700',
    },
    improvement: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: Lightbulb,
      iconColor: 'text-amber-600',
      label: 'بهبود',
      labelColor: 'bg-amber-100 text-amber-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Heart,
      iconColor: 'text-blue-600',
      label: 'عمومی',
      labelColor: 'bg-blue-100 text-blue-700',
    },
  }[feedback.type];

  const Icon = config.icon;
  const subjectColor = getSubjectColor(feedback.subject);

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-xl p-5`}
    >
      <div className="flex items-start gap-4">
        {/* Subject icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${subjectColor}20` }}
        >
          <BookOpen size={22} style={{ color: subjectColor }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900">
                  {feedback.subject}
                </h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.labelColor}`}
                >
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User size={12} />
                {feedback.teacherName}
              </div>
            </div>

            {feedback.score !== undefined && (
              <div className="text-right flex-shrink-0">
                <p
                  className={`text-xl font-bold ${getScoreColor(
                    feedback.score
                  )}`}
                >
                  {feedback.score}
                </p>
                <p className="text-xs text-gray-500">نمره</p>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="flex items-start gap-2 mt-3 p-3 bg-white rounded-lg">
            <Icon
              size={16}
              className={`${config.iconColor} flex-shrink-0 mt-0.5`}
            />
            <p className="text-sm text-gray-700 leading-relaxed">
              {feedback.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}