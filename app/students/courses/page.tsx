// app/student/courses/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Video,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  Play,
  Search,
  BookOpen,
  TrendingUp,
  Eye,
  Clock,
} from 'lucide-react';
import { studentCoursesAPI } from '@/lib/api/student-portal';
import type { StudentCourse } from '@/types/student-portal';
import { formatNumber } from '@/lib/utils/student-helpers';

type TabType = 'my' | 'browse';

export default function CoursesPage() {
  const [tab, setTab] = useState<TabType>('my');
  const [myCourses, setMyCourses] = useState<StudentCourse[]>([]);
  const [browseCourses, setBrowseCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (tab === 'my') {
        const res = await studentCoursesAPI.getMyCourses();
        setMyCourses(res);
      } else {
        const res = await studentCoursesAPI.getBrowse({ limit: 50 });
        setBrowseCourses(res.items);
      }
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت دوره‌ها';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const courses = tab === 'my' ? myCourses : browseCourses;
  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher_name.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const enrolledCount = myCourses.filter((c) => c.enrolled).length;
  const completedCount = myCourses.filter(
    (c) => c.enrolled && c.progress === 100
  ).length;
  const inProgressCount = myCourses.filter(
    (c) => c.enrolled && c.progress > 0 && c.progress < 100
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="text-indigo-500" size={26} />
            دوره‌های من
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {tab === 'my'
              ? `${formatNumber(myCourses.length)} دوره`
              : 'دوره‌های موجود برای ثبت‌نام'}
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1">
        <button
          onClick={() => setTab('my')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'my'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <BookOpen size={16} />
            دوره‌های من
          </span>
        </button>
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'browse'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Eye size={16} />
            مرور دوره‌ها
          </span>
        </button>
      </div>

      {/* Stats (My tab only) */}
      {tab === 'my' && !loading && myCourses.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-blue-600" />
              <p className="text-xs text-gray-600">ثبت‌نام شده</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(enrolledCount)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-amber-600" />
              <p className="text-xs text-gray-600">در حال یادگیری</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {formatNumber(inProgressCount)}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-green-600" />
              <p className="text-xs text-gray-600">تکمیل شده</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(completedCount)}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی دوره یا معلم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Video className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            {tab === 'my'
              ? 'هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید'
              : 'دوره‌ای یافت نشد'}
          </p>
          {tab === 'my' && (
            <button
              onClick={() => setTab('browse')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <Eye size={16} />
              مرور دوره‌های موجود
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: StudentCourse }) {
  return (
    <Link
      href={`/student/courses/${course.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden block"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-indigo-400 to-purple-500">
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

        {/* Progress bar (if enrolled) */}
        {course.enrolled && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
            <div
              className="h-full bg-yellow-400"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}

        {/* Enrolled badge */}
        {course.enrolled && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
            ثبت‌نام شده
          </span>
        )}

        {/* General badge */}
        {course.is_general && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
            عمومی
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-indigo-600">
          {course.title}
        </h3>

        {course.subject && (
          <p className="text-xs text-gray-500 mb-2">{course.subject}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <User size={12} />
          <span className="truncate">{course.teacher_name}</span>
        </div>

        {course.enrolled && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {course.progress}% تکمیل
            </span>
            <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
              {course.progress === 0
                ? 'شروع'
                : course.progress === 100
                ? 'مرور'
                : 'ادامه'}
              <Play size={10} />
            </span>
          </div>
        )}

        {!course.enrolled && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-xs text-indigo-600 font-medium">
              مشاهده جزئیات →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}