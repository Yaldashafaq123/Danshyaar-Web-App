// app/student/journey/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  BookOpen,
  Trophy,
  Target,
  CheckCircle,
  Calendar,
  Rocket,
  Milestone,
  Flag,
} from 'lucide-react';
import {
  studentGradesAPI,
  studentAttendanceAPI,
} from '@/lib/api/student-portal';
import type {
  TermGrades,
  AttendanceOverview,
  GradesResponse,
} from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
  getScoreColor,
  getScoreBg,
} from '@/lib/utils/student-helpers';

interface JourneyMilestone {
  id: string;
  type: 'term' | 'achievement' | 'improvement';
  title: string;
  description: string;
  date?: string;
  value?: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export default function AcademicJourneyPage() {
  const [gradesData, setGradesData] = useState<GradesResponse | null>(null);
  const [currentGrades, setCurrentGrades] = useState<TermGrades | null>(null);
  const [attendance, setAttendance] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allRes, currentRes, attendanceRes] = await Promise.all([
        studentGradesAPI.getAll().catch(() => null),
        studentGradesAPI.getCurrent().catch(() => null),
        studentAttendanceAPI.getOverview().catch(() => null),
      ]);

      setGradesData(allRes);
      setCurrentGrades(currentRes);
      setAttendance(attendanceRes);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات';
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

  // Prepare journey timeline
  const termGrades: TermGrades[] = gradesData
    ? Object.values(gradesData.allTermsGrades || {})
    : [];

  const sortedTerms = [...termGrades].sort((a, b) => {
    const dateA = a.term.startDate ? new Date(a.term.startDate).getTime() : 0;
    const dateB = b.term.startDate ? new Date(b.term.startDate).getTime() : 0;
    return dateA - dateB; // oldest first
  });

  const overallAvg = currentGrades?.overallAverage || 0;
  const attendanceRate = attendance?.stats.averageRate || 0;
  const classRank = currentGrades?.classRank || 0;
  const totalStudents = currentGrades?.totalStudents || 0;

  // Calculate growth
  const firstTermAvg =
    sortedTerms.length > 0 ? sortedTerms[0].overallAverage : 0;
  const latestTermAvg =
    sortedTerms.length > 0
      ? sortedTerms[sortedTerms.length - 1].overallAverage
      : 0;
  const totalGrowth = latestTermAvg - firstTermAvg;

  // Milestones
  const milestones: JourneyMilestone[] = [];

  sortedTerms.forEach((term, index) => {
    milestones.push({
      id: `term-${term.term.id}`,
      type: 'term',
      title: term.term.name,
      description: `معدل: ${term.overallAverage} — رتبه: ${term.classRank} از ${term.totalStudents}`,
      date: term.term.startDate,
      value: term.overallAverage,
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    });

    // Add improvement milestone if growth from previous term
    if (index > 0) {
      const prevAvg = sortedTerms[index - 1].overallAverage;
      const diff = term.overallAverage - prevAvg;
      if (Math.abs(diff) >= 3) {
        milestones.push({
          id: `growth-${index}`,
          type: 'improvement',
          title:
            diff > 0
              ? `پیشرفت ${diff.toFixed(1)} امتیاز`
              : `افت ${Math.abs(diff).toFixed(1)} امتیاز`,
          description:
            diff > 0
              ? 'عملکرد شما نسبت به ترم قبل بهتر شد!'
              : 'نیاز به تمرکز بیشتر دارید',
          value: term.overallAverage,
          icon: diff > 0 ? TrendingUp : TrendingDown,
          color: diff > 0 ? 'text-green-600' : 'text-red-600',
          bg: diff > 0 ? 'bg-green-50' : 'bg-red-50',
        });
      }
    }
  });

  // Achievement milestones
  if (overallAvg >= 90) {
    milestones.push({
      id: 'achievement-90',
      type: 'achievement',
      title: 'شاگرد ممتاز',
      description: 'کسب معدل ۹۰+',
      icon: Trophy,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    });
  } else if (overallAvg >= 80) {
    milestones.push({
      id: 'achievement-80',
      type: 'achievement',
      title: 'شاگرد برتر',
      description: 'کسب معدل ۸۰+',
      icon: Award,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    });
  }

  if (attendanceRate >= 95) {
    milestones.push({
      id: 'attendance-perfect',
      type: 'achievement',
      title: 'حضور عالی',
      description: `حضور ${attendanceRate}% در صنف`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    });
  }

  if (classRank > 0 && classRank <= 3) {
    milestones.push({
      id: 'rank-top3',
      type: 'achievement',
      title: `رتبه ${classRank} صنف`,
      description: `از ${totalStudents} شاگرد`,
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    });
  }

  // Sort milestones by date (newest first for display)
  const sortedMilestones = milestones.reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={26} />
            سفر تحصیلی من
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            داستان پیشرفت شما در مکتب عصرا
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Hero stats */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-32 -translate-x-32" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="text-yellow-300" size={24} />
            <span className="text-yellow-100 font-semibold">
              داستان شما
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <div>
              <p className="text-indigo-100 text-xs mb-1">معدل فعلی</p>
              <p className="text-4xl font-bold">{overallAvg}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs mb-1">حضور</p>
              <p className="text-4xl font-bold">
                {attendanceRate}
                <span className="text-xl">%</span>
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs mb-1">رتبه صنف</p>
              <p className="text-4xl font-bold">
                {classRank}
                <span className="text-lg"> / {totalStudents}</span>
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs mb-1">تعداد ترم‌ها</p>
              <p className="text-4xl font-bold">{sortedTerms.length}</p>
            </div>
          </div>

          {totalGrowth !== 0 && (
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center gap-3">
              {totalGrowth > 0 ? (
                <>
                  <TrendingUp
                    className="text-green-300 flex-shrink-0"
                    size={24}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      پیشرفت کل: +{totalGrowth.toFixed(1)} امتیاز
                    </p>
                    <p className="text-xs text-indigo-100 mt-0.5">
                      نسبت به اولین ترم
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <TrendingDown
                    className="text-red-300 flex-shrink-0"
                    size={24}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      افت کل: {totalGrowth.toFixed(1)} امتیاز
                    </p>
                    <p className="text-xs text-indigo-100 mt-0.5">
                      نیاز به تلاش بیشتر
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Journey timeline */}
      {sortedMilestones.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Milestone size={18} className="text-indigo-500" />
            مسیر پیشرفت
          </h3>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute right-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200" />

            <div className="space-y-6">
              {sortedMilestones.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <div key={milestone.id} className="relative flex items-start gap-4">
                    {/* Icon circle */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full ${milestone.bg} border-4 border-white flex items-center justify-center flex-shrink-0 shadow-md`}
                    >
                      <Icon size={20} className={milestone.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-base">
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {milestone.description}
                          </p>
                          {milestone.date && (
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Calendar size={10} />
                              {milestone.date}
                            </p>
                          )}
                        </div>
                        {milestone.value !== undefined && (
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 ${getScoreBg(
                              milestone.value
                            )}`}
                          >
                            {milestone.value}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Flag className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">
            سفر تحصیلی شما هنوز شروع نشده
          </p>
          <p className="text-xs text-gray-400 mt-2">
            با پیشرفت در درس‌ها و کسب دستاوردها، داستان شما اینجا شکل می‌گیرد
          </p>
        </div>
      )}

      {/* Term comparison chart */}
      {sortedTerms.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            مقایسه عملکرد بین ترم‌ها
          </h3>

          <div className="space-y-4">
            {sortedTerms.map((term, index) => {
              const prevAvg =
                index > 0 ? sortedTerms[index - 1].overallAverage : 0;
              const diff = index > 0 ? term.overallAverage - prevAvg : 0;

              return (
                <div key={String(term.term.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {term.term.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {term.term.startDate}
                        {term.term.endDate && ` - ${term.term.endDate}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {index > 0 && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            diff > 0
                              ? 'bg-green-100 text-green-700'
                              : diff < 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {diff > 0 ? '+' : ''}
                          {diff.toFixed(1)}
                        </span>
                      )}
                      <span
                        className={`text-2xl font-bold ${getScoreColor(
                          term.overallAverage
                        )}`}
                      >
                        {term.overallAverage}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getScoreBg(
                        term.overallAverage
                      )}`}
                      style={{
                        width: `${Math.min(term.overallAverage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goal flag */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Target size={32} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-amber-100 mb-1">
              هدف نهایی شما
            </p>
            <p className="text-2xl font-bold mb-1">معدل ۹۵ و بالاتر</p>
            <p className="text-xs text-amber-100">
              با تلاش مستمر می‌توانید به قله برسید 🏔️
            </p>
          </div>
        </div>

        {/* Progress to goal */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-amber-100">پیشرفت به سمت هدف</span>
            <span className="font-bold">
              {Math.min(Math.round((overallAvg / 95) * 100), 100)}%
            </span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((overallAvg / 95) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}