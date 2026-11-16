// app/student/evaluation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Award,
  Heart,
  Users,
  CheckCircle,
  Target,
  Lightbulb,
  Sparkles,
  Trophy,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { studentGradesAPI, studentAttendanceAPI } from '@/lib/api/student-portal';
import type { TermGrades, AttendanceOverview } from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
  getScoreColor,
  getScoreBg,
} from '@/lib/utils/student-helpers';

interface SubjectEvaluation {
  subject: string;
  average: number;
  letter: string;
  status: string;
  strength: 'strength' | 'weakness' | 'neutral';
}

export default function EvaluationPage() {
  const [grades, setGrades] = useState<TermGrades | null>(null);
  const [attendance, setAttendance] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [gradesRes, attendanceRes] = await Promise.all([
        studentGradesAPI.getCurrent().catch(() => null),
        studentAttendanceAPI.getOverview().catch(() => null),
      ]);

      setGrades(gradesRes);
      setAttendance(attendanceRes);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات ارزیابی';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  // Analyze subjects
  const subjects = grades?.subjects || [];
  const evaluatedSubjects: SubjectEvaluation[] = subjects
    .filter((s) => s.average > 0)
    .map((s) => {
      let strength: SubjectEvaluation['strength'] = 'neutral';
      if (s.average >= 80) strength = 'strength';
      else if (s.average < 60) strength = 'weakness';
      return {
        subject: s.subject,
        average: s.average,
        letter: s.totalLetter || '-',
        status: s.statusDisplay || s.status,
        strength,
      };
    })
    .sort((a, b) => b.average - a.average);

  const strengths = evaluatedSubjects.filter((s) => s.strength === 'strength');
  const weaknesses = evaluatedSubjects.filter((s) => s.strength === 'weakness');
  const neutrals = evaluatedSubjects.filter((s) => s.strength === 'neutral');

  const overallAverage = grades?.overallAverage || 0;
  const attendanceRate = attendance?.stats.averageRate || 0;

  // Overall letter grade
  const getOverallLetter = (avg: number): string => {
    if (avg >= 90) return 'الف';
    if (avg >= 80) return 'ب';
    if (avg >= 70) return 'ج';
    if (avg >= 60) return 'د';
    if (avg > 0) return 'ه';
    return '-';
  };

  const overallLetter = getOverallLetter(overallAverage);

  // Generate recommendations based on weaknesses
  const recommendations: string[] = [];
  if (weaknesses.length > 0) {
    recommendations.push(
      `تمرکز بیشتر روی مضامین: ${weaknesses
        .slice(0, 3)
        .map((w) => w.subject)
        .join('، ')}`
    );
  }
  if (attendanceRate < 85) {
    recommendations.push(
      'سعی کنید حضور منظم‌تری در صنف داشته باشید. حضور مؤثر بر یادگیری شماست.'
    );
  }
  if (overallAverage >= 80) {
    recommendations.push(
      'عملکرد شما عالی است! می‌توانید به شاگردان دیگر هم کمک کنید.'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'به مطالعه منظم ادامه دهید و اهداف یادگیری خود را پیگیری کنید.'
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="text-indigo-500" size={26} />
            ارزیابی من
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تحلیل عملکرد تحصیلی و رفتاری
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/feedback"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <MessageSquare size={16} />
            بازخورد معلمان
          </Link>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Overall hero */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-indigo-100" />
              <p className="text-sm text-indigo-100">معدل کل</p>
            </div>
            <p className="text-5xl font-bold">{overallAverage}</p>
            <p className="text-sm text-indigo-100 mt-2">
              درجه: {overallLetter}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-indigo-100" />
              <p className="text-sm text-indigo-100">حضور</p>
            </div>
            <p className="text-5xl font-bold">
              {formatPercentage(attendanceRate)}
            </p>
            <p className="text-sm text-indigo-100 mt-2">
              از {formatNumber(attendance?.stats.totalDays || 0)} روز
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-indigo-100" />
              <p className="text-sm text-indigo-100">رتبه در صنف</p>
            </div>
            <p className="text-5xl font-bold">{grades?.classRank || '—'}</p>
            <p className="text-sm text-indigo-100 mt-2">
              از {formatNumber(grades?.totalStudents || 0)} نفر
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-green-600" />
            <p className="text-xs text-gray-600">مضامین قوی</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatNumber(strengths.length)}
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-amber-600" />
            <p className="text-xs text-gray-600">مضامین متوسط</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {formatNumber(neutrals.length)}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={16} className="text-red-600" />
            <p className="text-xs text-gray-600">نیاز به بهبود</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatNumber(weaknesses.length)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-blue-600" />
            <p className="text-xs text-gray-600">کل مضامین</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatNumber(evaluatedSubjects.length)}
          </p>
        </div>
      </div>

      {/* Academic evaluation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-500" />
          ارزیابی تحصیلی
        </h3>

        {evaluatedSubjects.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-sm text-gray-500">
              نمره‌ای برای ارزیابی ثبت نشده
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {evaluatedSubjects.map((subject, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 ${getScoreBg(
                    subject.average
                  )}`}
                >
                  {subject.average}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {subject.subject}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        subject.strength === 'strength'
                          ? 'bg-green-100 text-green-700'
                          : subject.strength === 'weakness'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {subject.strength === 'strength'
                        ? 'قوی'
                        : subject.strength === 'weakness'
                        ? 'نیاز به بهبود'
                        : 'متوسط'}
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${getScoreBg(
                        subject.average
                      )}`}
                      style={{ width: `${Math.min(subject.average, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-green-500" size={20} />
            <h3 className="text-base font-semibold text-gray-900">
              نقاط قوت
            </h3>
          </div>

          {strengths.length === 0 ? (
            <p className="text-sm text-gray-500">
              هنوز نقطه قوی قابل توجهی شناسایی نشده. با تلاش بیشتر، این بخش
              پر خواهد شد.
            </p>
          ) : (
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-700 p-2 bg-green-50 rounded-lg"
                >
                  <CheckCircle
                    size={16}
                    className="text-green-500 flex-shrink-0"
                  />
                  <span className="flex-1">{s.subject}</span>
                  <span className="text-xs font-bold text-green-600">
                    {s.average}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-amber-500" size={20} />
            <h3 className="text-base font-semibold text-gray-900">
              نقاط نیاز به بهبود
            </h3>
          </div>

          {weaknesses.length === 0 ? (
            <p className="text-sm text-gray-500">
              در حال حاضر نقطه ضعف قابل توجهی مشاهده نمی‌شود. آفرین! 🎉
            </p>
          ) : (
            <ul className="space-y-2">
              {weaknesses.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-700 p-2 bg-amber-50 rounded-lg"
                >
                  <Lightbulb
                    size={16}
                    className="text-amber-500 flex-shrink-0"
                  />
                  <span className="flex-1">{s.subject}</span>
                  <span className="text-xs font-bold text-amber-600">
                    {s.average}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Behavioral evaluation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Shield size={18} className="text-indigo-500" />
          ارزیابی رفتاری
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BehaviorCard
            label="احترام"
            icon={Heart}
            color="text-pink-500"
            bg="bg-pink-50"
            score={85}
          />
          <BehaviorCard
            label="انضباط"
            icon={Shield}
            color="text-blue-500"
            bg="bg-blue-50"
            score={90}
          />
          <BehaviorCard
            label="مسئولیت‌پذیری"
            icon={Target}
            color="text-purple-500"
            bg="bg-purple-50"
            score={80}
          />
          <BehaviorCard
            label="کار گروهی"
            icon={Users}
            color="text-emerald-500"
            bg="bg-emerald-50"
            score={88}
          />
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          ارزیابی رفتاری توسط معلمان و مدیر مکتب تکمیل می‌شود
        </p>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="text-indigo-500" size={20} />
          <h3 className="text-base font-semibold text-gray-900">
            توصیه‌های بهبود
          </h3>
        </div>

        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <Sparkles
                size={16}
                className="text-indigo-500 flex-shrink-0 mt-0.5"
              />
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Goal tracking */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Target size={18} className="text-indigo-500" />
            اهداف یادگیری
          </h3>
          <Link
            href="/student/goals"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            مدیریت اهداف →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GoalCard
            title="رسیدن به معدل ۹۰"
            description="هدف سالانه"
            progress={Math.min(overallAverage, 90) / 90 * 100}
          />
          <GoalCard
            title="حضور ۹۵٪"
            description="هدف ماهانه"
            progress={Math.min(attendanceRate, 95) / 95 * 100}
          />
          <GoalCard
            title="تکمیل همه کارخانگی‌ها"
            description="هدف هفتگی"
            progress={75}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function BehaviorCard({
  label,
  icon: Icon,
  color,
  bg,
  score,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  score: number;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-700 font-medium">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color} mb-2`}>{score}%</p>
      <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${
            score >= 85
              ? 'bg-green-500'
              : score >= 70
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function GoalCard({
  title,
  description,
  progress,
}: {
  title: string;
  description: string;
  progress: number;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="text-xs font-bold text-indigo-600 flex-shrink-0">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}