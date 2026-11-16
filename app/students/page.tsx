// app/student/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ClipboardList,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Play,
  FileText,
  Video,
  Bell,
  CheckCircle,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { studentDashboardAPI } from '@/lib/api/student-portal';
import type { StudentDashboard } from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
  getGreeting,
  getScoreColor,
  getScoreBg,
} from '@/lib/utils/student-helpers';
import { useAuthStore } from '@/lib/store/authStore';

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎓 [Student Dashboard] Fetching...');
      const res = await studentDashboardAPI.getDashboard();
      console.log('✅ [Student Dashboard] Data:', res);
      setData(res);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('❌ [Student Dashboard] Error:', err);
      let message = 'خطا در دریافت اطلاعات داشبورد';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
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

  // ---------- Loading ----------
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={40} />
          <p className="mt-4 text-gray-500">در حال بارگذاری داشبورد...</p>
        </div>
      </div>
    );
  }

  // ---------- Error ----------
  if (error && !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-700">
            خطا در بارگذاری
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw size={16} />
          تلاش مجدد
        </button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-32 -translate-x-32" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-yellow-300" size={20} />
              <span className="text-yellow-100 text-sm font-semibold tracking-wide">
                {getGreeting()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {user?.fullName || 'شاگرد عزیز'}
            </h1>
            <p className="text-indigo-100 font-medium">
              به پورتال آموزشی خوش آمدید 🌟
            </p>

            {/* Streak badge */}
            {stats && stats.streak_days > 0 && (
              <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full">
                <Trophy size={14} className="text-yellow-300" />
                <span className="text-sm font-medium">
                  {formatNumber(stats.streak_days)} روز پیاپی فعال
                </span>
              </div>
            )}
          </div>

          {/* Average score card */}
          {stats && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-center">
              <p className="text-indigo-100 text-xs font-medium mb-1">
                معدل کل
              </p>
              <p className="text-4xl font-bold">
                {stats.average_score.toFixed(1)}
              </p>
              <p className="text-indigo-100 text-xs mt-1">از ۱۰۰</p>
            </div>
          )}
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-400 text-center">
          آخرین بروزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}
        </p>
      )}

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="معدل نمرات"
          value={stats ? stats.average_score.toFixed(1) : '—'}
          subtitle="از ۱۰۰"
          icon={TrendingUp}
          gradient="from-emerald-500 to-teal-600"
          href="/student/exams/results"
        />
        <StatCard
          title="نرخ حضور"
          value={formatPercentage(stats?.attendance_rate ?? 0)}
          subtitle="۳۰ روز اخیر"
          icon={CheckCircle}
          gradient="from-blue-500 to-indigo-600"
          href="/student/attendance"
        />
        <StatCard
          title="کارخانگی‌های باقی‌مانده"
          value={formatNumber(stats?.assignments_pending ?? 0)}
          subtitle={`از ${formatNumber(stats?.assignments_total ?? 0)} کارخانگی`}
          icon={ClipboardList}
          gradient="from-amber-500 to-orange-600"
          href="/student/assignments"
        />
        <StatCard
          title="امتحانات پیش‌رو"
          value={formatNumber(stats?.exams_upcoming ?? 0)}
          subtitle="این هفته"
          icon={Calendar}
          gradient="from-pink-500 to-rose-600"
          href="/student/exams"
        />
      </div>

      {/* Continue Learning */}
      {data?.continueLearning && data.continueLearning.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Play className="text-indigo-500" size={20} />
              ادامه یادگیری
            </h3>
            <Link
              href="/student/courses"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              مشاهده همه →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.continueLearning.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-400 to-purple-500">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="text-white/60" size={40} />
                    </div>
                  )}
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-indigo-600">
                    {course.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {course.teacher_name}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {course.progress}% تکمیل
                    </span>
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout: upcoming exams + recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="text-pink-500" size={18} />
              امتحانات پیش‌رو
            </h3>
            <Link
              href="/student/exams"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              مشاهده همه →
            </Link>
          </div>

          {!data?.upcomingExams || data.upcomingExams.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="mx-auto text-green-300" size={40} />
              <p className="mt-3 text-gray-500 text-sm">
                امتحانی در پیش نیست 🎉
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.upcomingExams.slice(0, 5).map((exam) => (
                <Link
                  key={exam.id}
                  href={`/student/exams/${exam.id}`}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {exam.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {exam.subject} • {exam.type}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-900">
                      {exam.date}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                      <Clock size={10} />
                      {exam.time}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="text-indigo-500" size={18} />
              فعالیت‌های اخیر
            </h3>
          </div>

          {!data?.recentActivities || data.recentActivities.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto text-gray-300" size={40} />
              <p className="mt-3 text-gray-500 text-sm">
                فعالیتی ثبت نشده
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 flex items-center gap-3 hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink
            label="کارنامه"
            description="نتایج و نمرات"
            icon={FileText}
            href="/student/reports"
            color="indigo"
          />
          <QuickLink
            label="تقسیم اوقات"
            description="برنامه هفتگی"
            icon={Calendar}
            href="/student/timetable"
            color="blue"
          />
          <QuickLink
            label="کارخانگی"
            description="تکالیف درسی"
            icon={ClipboardList}
            href="/student/assignments"
            color="amber"
          />
          <QuickLink
            label="کتابخانه"
            description="کتاب‌های دیجیتال"
            icon={BookOpen}
            href="/student/library"
            color="emerald"
          />
          <QuickLink
            label="ارزیابی من"
            description="بازخورد معلمان"
            icon={Award}
            href="/student/evaluation"
            color="pink"
          />
          <QuickLink
            label="دستاوردها"
            description="افتخارات و جوایز"
            icon={Trophy}
            href="/student/achievements"
            color="yellow"
          />
          <QuickLink
            label="سفر تحصیلی"
            description="مسیر پیشرفت"
            icon={Sparkles}
            href="/student/journey"
            color="purple"
          />
          <QuickLink
            label="اهداف"
            description="اهداف یادگیری"
            icon={Target}
            href="/student/goals"
            color="cyan"
          />
        </div>
      </div>

      {/* Performance Summary */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={18} />
            خلاصه عملکرد
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average score */}
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">معدل</p>
              <p className="text-2xl font-bold text-emerald-600 mb-2">
                {stats.average_score.toFixed(1)}
              </p>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className={getScoreBg(stats.average_score)}
                  style={{ width: `${stats.average_score}%` }}
                />
              </div>
            </div>

            {/* Attendance */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">حضور</p>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {formatPercentage(stats.attendance_rate)}
              </p>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${stats.attendance_rate}%` }}
                />
              </div>
            </div>

            {/* Assignments */}
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">کارخانگی تکمیل شده</p>
              <p className="text-2xl font-bold text-amber-600 mb-2">
                {formatNumber(
                  (stats.assignments_total || 0) - (stats.assignments_pending || 0)
                )}
              </p>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.assignments_total > 0
                        ? ((stats.assignments_total - stats.assignments_pending) /
                            stats.assignments_total) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  href,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm group-hover:scale-105 transition-transform`}
        >
          <Icon className="text-white" size={20} />
        </div>
        <ArrowUpRight
          className="text-gray-300 group-hover:text-gray-500 transition-colors"
          size={18}
        />
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </Link>
  );
}

const quickLinkColors = {
  indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  pink: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
  yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
};

function QuickLink({
  label,
  description,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: keyof typeof quickLinkColors;
}) {
  return (
    <Link
      href={href}
      className={`p-4 rounded-xl transition-colors text-center ${quickLinkColors[color]}`}
    >
      <Icon size={22} className="mx-auto mb-2" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs opacity-70 mt-0.5">{description}</p>
    </Link>
  );
}