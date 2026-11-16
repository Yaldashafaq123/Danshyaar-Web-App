// app/student/learning/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Loader2,
  AlertCircle,
  RefreshCw,
  Play,
  Clock,
  CheckCircle,
  BookOpen,
  TrendingUp,
  User,
  ArrowRight,
  Sparkles,
  Trophy,
  ChevronLeft,
} from 'lucide-react';
import { studentCoursesAPI, studentDashboardAPI } from '@/lib/api/student-portal';
import type { StudentCourse } from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
} from '@/lib/utils/student-helpers';

export default function LearningOverviewPage() {
  const [enrolled, setEnrolled] = useState<StudentCourse[]>([]);
  const [continueLearning, setContinueLearning] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [enrolledRes, continueRes] = await Promise.all([
        studentCoursesAPI.getEnrolled().catch(() => []),
        studentDashboardAPI.getContinueLearning().catch(() => []),
      ]);

      setEnrolled(enrolledRes);
      setContinueLearning(continueRes);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات یادگیری';
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

  const totalCourses = enrolled.length;
  const completedCourses = enrolled.filter((c) => c.progress === 100).length;
  const inProgressCourses = enrolled.filter(
    (c) => c.progress > 0 && c.progress < 100
  ).length;
  const notStartedCourses = enrolled.filter((c) => c.progress === 0).length;
  const totalHours = enrolled.reduce(
    (sum, c) => sum + (c.duration || 0) / 60,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="text-indigo-500" size={26} />
            آموزش آنلاین
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            دوره‌ها و درس‌های ویدیویی شما
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

      {/* Stats cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-indigo-600" />
              <p className="text-xs text-gray-600">کل دوره‌ها</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(totalCourses)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-amber-600" />
              <p className="text-xs text-gray-600">در حال یادگیری</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {formatNumber(inProgressCourses)}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-green-600" />
              <p className="text-xs text-gray-600">تکمیل شده</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(completedCourses)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-blue-600" />
              <p className="text-xs text-gray-600">مجموع ساعت</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(Math.round(totalHours))}
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

      {/* Continue learning */}
      {!loading && continueLearning.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Play className="text-indigo-500" size={20} />
              ادامه یادگیری
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueLearning.map((course) => (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden block"
              >
                <div className="relative h-36 bg-gradient-to-br from-indigo-500 to-purple-600">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="text-white/60" size={48} />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <Play
                        className="text-indigo-600 ml-1"
                        size={24}
                        fill="currentColor"
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-indigo-600">
                    {course.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    {course.teacher_name}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 flex-shrink-0">
                      {course.progress}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All enrolled courses */}
      {!loading && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-indigo-500" size={20} />
              همه دوره‌های من
            </h3>
            <Link
              href="/student/courses"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              مشاهده همه →
            </Link>
          </div>

          {enrolled.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Video className="mx-auto text-gray-300" size={48} />
              <p className="mt-3 text-gray-500">
                هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید
              </p>
              <Link
                href="/student/courses"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Sparkles size={16} />
                مرور دوره‌های موجود
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolled.map((course) => (
                <EnrolledCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
          <p className="mt-3 text-gray-500 text-sm">
            در حال بارگذاری...
          </p>
        </div>
      )}

      {/* Section stats */}
      {!loading && enrolled.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            خلاصه پیشرفت
          </h3>

          <div className="space-y-4">
            <ProgressRow
              label="دوره‌های تکمیل شده"
              value={completedCourses}
              total={totalCourses}
              color="bg-green-500"
            />
            <ProgressRow
              label="دوره‌های در حال یادگیری"
              value={inProgressCourses}
              total={totalCourses}
              color="bg-amber-500"
            />
            <ProgressRow
              label="دوره‌های شروع‌نشده"
              value={notStartedCourses}
              total={totalCourses}
              color="bg-gray-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function EnrolledCourseCard({ course }: { course: StudentCourse }) {
  const isCompleted = course.progress === 100;

  return (
    <Link
      href={`/student/courses/${course.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden block"
    >
      <div
        className={`relative h-32 ${
          isCompleted
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}
      >
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isCompleted ? (
              <CheckCircle className="text-white/60" size={40} />
            ) : (
              <Video className="text-white/60" size={40} />
            )}
          </div>
        )}

        {isCompleted && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-white rounded-full">
            <CheckCircle className="text-green-600" size={14} />
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-indigo-600">
          {course.title}
        </h4>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <User size={12} />
          <span className="truncate">{course.teacher_name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 mr-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  isCompleted
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                }`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
          <span
            className={`text-xs font-bold flex-shrink-0 ${
              isCompleted ? 'text-green-600' : 'text-indigo-600'
            }`}
          >
            {course.progress}%
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-900">
          {formatNumber(value)} / {formatNumber(total)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}