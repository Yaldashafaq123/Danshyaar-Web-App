// app/student/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart3,
  BookOpen,
  Target,
  Award,
  Zap,
  TrendingDown,
  Star,
} from 'lucide-react';
import {
  studentGradesAPI,
  studentAttendanceAPI,
} from '@/lib/api/student-portal';
import type {
  GradesResponse,
  TermGrades,
  AttendanceOverview,
} from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
  getScoreColor,
  getScoreBg,
  getSubjectColor,
} from '@/lib/utils/student-helpers';

export default function AnalyticsPage() {
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
      let message = 'خطا در دریافت تحلیل‌ها';
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

  const subjects = currentGrades?.subjects || [];
  const overallAvg = currentGrades?.overallAverage || 0;
  const attendanceRate = attendance?.stats.averageRate || 0;

  // Sort subjects by average
  const sortedSubjects = [...subjects]
    .filter((s) => s.average > 0)
    .sort((a, b) => b.average - a.average);

  const bestSubject = sortedSubjects[0];
  const worstSubject = sortedSubjects[sortedSubjects.length - 1];

  // Calculate subject spread (highest - lowest)
  const subjectSpread =
    bestSubject && worstSubject
      ? bestSubject.average - worstSubject.average
      : 0;

  // Term trend
  const termGrades = gradesData
    ? Object.values(gradesData.allTermsGrades || {})
    : [];
  const sortedTerms = [...termGrades].sort((a, b) => {
    const dateA = a.term.startDate ? new Date(a.term.startDate).getTime() : 0;
    const dateB = b.term.startDate ? new Date(b.term.startDate).getTime() : 0;
    return dateA - dateB;
  });

  const maxSubjectAvg = Math.max(
    ...sortedSubjects.map((s) => s.average),
    100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-indigo-500" size={26} />
            تحلیل عملکرد
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            نگاهی عمیق به عملکرد تحصیلی شما
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="معدل کل"
          value={overallAvg.toString()}
          subtitle="از ۱۰۰"
          icon={Award}
          color={getScoreColor(overallAvg)}
          bg={getScoreBg(overallAvg).replace('bg-', 'bg-').replace('-600', '-50').replace('-500', '-50')}
        />
        <KPICard
          label="بهترین مضمون"
          value={bestSubject?.average.toString() || '—'}
          subtitle={bestSubject?.subject || '—'}
          icon={Star}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <KPICard
          label="نیاز به بهبود"
          value={worstSubject?.average.toString() || '—'}
          subtitle={worstSubject?.subject || '—'}
          icon={TrendingDown}
          color="text-red-600"
          bg="bg-red-50"
        />
        <KPICard
          label="حضور"
          value={formatPercentage(attendanceRate)}
          subtitle="نرخ حضور"
          icon={Target}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      {/* Subject bar chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-500" />
          عملکرد به تفکیک مضمون
        </h3>

        {sortedSubjects.length === 0 ? (
          <div className="p-8 text-center">
            <BarChart3 className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-sm text-gray-500">
              داده‌ای برای نمایش وجود ندارد
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSubjects.map((subject) => {
              const color = getSubjectColor(subject.subject);
              const percent = (subject.average / maxSubjectAvg) * 100;
              const width = (subject.average / 100) * 100;

              return (
                <div key={subject.subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {subject.subject}
                      </span>
                      {subject.totalLetter && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {subject.totalLetter}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          subject.average
                        )}`}
                      >
                        {subject.average}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analysis insights */}
      {sortedSubjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strength card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} />
              <span className="text-sm font-medium text-green-100">
                نقطه قوت اصلی
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {bestSubject?.subject}
            </p>
            <p className="text-sm text-green-100">
              با معدل {bestSubject?.average} — به تلاش خود ادامه دهید!
            </p>
          </div>

          {/* Improvement card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={20} />
              <span className="text-sm font-medium text-amber-100">
                نیاز به توجه ویژه
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {worstSubject?.subject}
            </p>
            <p className="text-sm text-amber-100">
              با معدل {worstSubject?.average} — با تمرین بیشتر بهبود می‌یابد
            </p>
          </div>
        </div>
      )}

      {/* Term trend line */}
      {sortedTerms.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            روند معدل در طول ترم‌ها
          </h3>

          <div className="flex items-end justify-around gap-3 h-64">
            {sortedTerms.map((term, index) => {
              const heightPercent = (term.overallAverage / 100) * 100;
              const prevAvg =
                index > 0 ? sortedTerms[index - 1].overallAverage : null;
              const diff =
                prevAvg !== null ? term.overallAverage - prevAvg : null;

              return (
                <div
                  key={String(term.term.id)}
                  className="flex-1 flex flex-col items-center justify-end gap-2"
                >
                  {/* Value */}
                  <span
                    className={`text-sm font-bold ${getScoreColor(
                      term.overallAverage
                    )}`}
                  >
                    {term.overallAverage}
                  </span>

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[60px] rounded-t-lg transition-all duration-500 relative ${getScoreBg(
                      term.overallAverage
                    )}`}
                    style={{
                      height: `${Math.max(heightPercent, 10)}%`,
                      minHeight: '40px',
                    }}
                  >
                    {diff !== null && diff !== 0 && (
                      <span
                        className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold ${
                          diff > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {diff > 0 ? '↑' : '↓'}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
                      {term.term.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-indigo-500" />
          خلاصه تحلیلی
        </h3>

        <div className="space-y-3 text-sm text-gray-700">
          <InsightRow
            label="میانگین کلی"
            value={`${overallAvg} از ۱۰۰`}
            status={
              overallAvg >= 90
                ? 'excellent'
                : overallAvg >= 75
                ? 'good'
                : overallAvg >= 60
                ? 'average'
                : 'needs-work'
            }
          />
          <InsightRow
            label="تعداد مضامین قوی (۸۰+)"
            value={`${sortedSubjects.filter((s) => s.average >= 80).length} مضمون`}
            status="good"
          />
          <InsightRow
            label="تعداد مضامین ضعیف (<۶۰)"
            value={`${sortedSubjects.filter((s) => s.average < 60).length} مضمون`}
            status={
              sortedSubjects.filter((s) => s.average < 60).length > 0
                ? 'needs-work'
                : 'excellent'
            }
          />
          <InsightRow
            label="انحراف بین مضامین"
            value={`${subjectSpread.toFixed(1)} امتیاز`}
            status={
              subjectSpread <= 20
                ? 'excellent'
                : subjectSpread <= 40
                ? 'good'
                : 'average'
            }
          />
          <InsightRow
            label="نرخ حضور"
            value={formatPercentage(attendanceRate)}
            status={
              attendanceRate >= 90
                ? 'excellent'
                : attendanceRate >= 75
                ? 'good'
                : 'needs-work'
            }
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-indigo-600" size={20} />
          <h3 className="text-base font-semibold text-gray-900">
            توصیه‌های شخصی‌سازی شده
          </h3>
        </div>

        <ul className="space-y-3 text-sm text-gray-700">
          {worstSubject && worstSubject.average < 70 && (
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <span>
                روی مضمون <strong>{worstSubject.subject}</strong> تمرکز بیشتری
                داشته باشید. با معلم خود صحبت کنید و برنامه مطالعه منظم تنظیم
                کنید.
              </span>
            </li>
          )}
          {subjectSpread > 40 && (
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <span>
                تفاوت عملکرد شما بین مضامین زیاد است. سعی کنید تعادل بیشتری
                بین مضامین برقرار کنید.
              </span>
            </li>
          )}
          {attendanceRate < 90 && (
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <span>
                حضور منظم در صنف می‌تواند به بهبود عملکرد شما کمک کند. سعی
                کنید حضور خود را افزایش دهید.
              </span>
            </li>
          )}
          {overallAvg >= 80 && (
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <span>
                <strong>آفرین!</strong> عملکرد شما عالی است. با همین روند ادامه
                دهید تا به قله برسید. 🏔️
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
    </div>
  );
}

function InsightRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'excellent' | 'good' | 'average' | 'needs-work';
}) {
  const config = {
    excellent: {
      badge: 'bg-green-100 text-green-700',
      label: 'عالی',
    },
    good: {
      badge: 'bg-blue-100 text-blue-700',
      label: 'خوب',
    },
    average: {
      badge: 'bg-yellow-100 text-yellow-700',
      label: 'متوسط',
    },
    'needs-work': {
      badge: 'bg-red-100 text-red-700',
      label: 'نیاز به کار',
    },
  }[status];

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-bold text-gray-900">{value}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}