// app/student/courses/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Video,
  Loader2,
  AlertCircle,
  User,
  BookOpen,
  Play,
  Clock,
  CheckCircle,
  Award,
  FileText,
  Target,
  ListChecks,
  Star,
} from 'lucide-react';
import {
  studentCoursesAPI,
  studentLessonsAPI,
} from '@/lib/api/student-portal';
import type { StudentCourse, CourseLesson } from '@/types/student-portal';
import { formatNumber } from '@/lib/utils/student-helpers';

interface CourseDetail extends StudentCourse {
  long_description?: string;
  teacher_image?: string;
  teacher_bio?: string;
  teacher_email?: string;
  lectures_count?: number;
  enrolled_students?: number;
  learning_outcomes?: string[];
  requirements_list?: string[];
  CourseObjective?: { id: number; text: string }[];
  CourseRequirement?: { id: number; text: string }[];
  class_name?: string;
  class_section?: string;
  is_enrolled?: boolean;
  status?: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseRes, lessonsRes] = await Promise.all([
        studentCoursesAPI.getById(courseId),
        studentLessonsAPI.getCourseLessons(courseId).catch(() => []),
      ]);

      setCourse(courseRes as CourseDetail);
      setLessons(lessonsRes);
    } catch (err: unknown) {
      console.error(err);
      let msg = 'خطا در دریافت اطلاعات دوره';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(courseId)) loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setMessage(null);
      await studentCoursesAPI.enroll(courseId);
      setMessage('با موفقیت در دوره ثبت‌نام شدید');
      await loadCourse();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let msg = 'خطا در ثبت‌نام';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      setError(msg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error || !course) {
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

  const isEnrolled = course.enrolled || course.is_enrolled;
  const objectives =
    course.CourseObjective?.map((o) => o.text) ||
    course.learning_outcomes ||
    [];
  const requirements =
    course.CourseRequirement?.map((r) => r.text) ||
    course.requirements_list ||
    [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {course.title}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            جزئیات دوره
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Hero */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="relative h-64 bg-gradient-to-br from-indigo-500 to-purple-600">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="text-white/60" size={80} />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              {course.subject && (
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                  {course.subject}
                </span>
              )}
              {course.is_general && (
                <span className="px-2 py-0.5 bg-blue-500 rounded-full text-xs">
                  عمومی
                </span>
              )}
              {isEnrolled && (
                <span className="px-2 py-0.5 bg-green-500 rounded-full text-xs">
                  ثبت‌نام شده
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
            {course.description && (
              <p className="text-sm text-white/90 max-w-2xl line-clamp-2">
                {course.description}
              </p>
            )}
          </div>
        </div>

        {/* Course meta */}
        <div className="p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} className="text-gray-400" />
                {course.teacher_name}
              </div>
              {course.duration && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  {formatNumber(course.duration)} دقیقه
                </div>
              )}
              {lessons.length > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen size={16} className="text-gray-400" />
                  {formatNumber(lessons.length)} درس
                </div>
              )}
            </div>

            {course.class_name && (
              <div className="text-sm text-gray-600">
                صنف: {course.class_name}{' '}
                {course.class_section && `- ${course.class_section}`}
              </div>
            )}

            {isEnrolled && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    پیشرفت شما
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="lg:w-64 flex-shrink-0">
            {isEnrolled ? (
              <Link
                href={
                  lessons.length > 0
                    ? `/student/learning/lessons/${lessons[0].id}`
                    : '#'
                }
                className="block w-full text-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
              >
                <Play className="inline-block mr-2" size={18} />
                {course.progress === 0 ? 'شروع دوره' : 'ادامه یادگیری'}
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium disabled:opacity-50"
              >
                {enrolling ? (
                  <Loader2 size={18} className="animate-spin inline mr-2" />
                ) : (
                  <Play className="inline mr-2" size={18} />
                )}
                ثبت‌نام در دوره
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Objectives & Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {objectives.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target size={18} className="text-emerald-500" />
              اهداف یادگیری
            </h3>
            <ul className="space-y-2">
              {objectives.map((obj, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <CheckCircle
                    size={16}
                    className="text-emerald-500 flex-shrink-0 mt-0.5"
                  />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}

        {requirements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ListChecks size={18} className="text-amber-500" />
              پیش‌نیازها
            </h3>
            <ul className="space-y-2">
              {requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Teacher card */}
      {course.teacher_name && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={18} className="text-indigo-500" />
            معلم دوره
          </h3>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden flex-shrink-0">
              {course.teacher_image ? (
                <img
                  src={course.teacher_image}
                  alt={course.teacher_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={28} />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">
                {course.teacher_name}
              </p>
              {course.teacher_bio && (
                <p className="text-sm text-gray-600 mt-1">
                  {course.teacher_bio}
                </p>
              )}
              {course.teacher_email && (
                <p className="text-xs text-gray-500 mt-1">
                  {course.teacher_email}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lessons */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Video size={18} className="text-indigo-500" />
            محتوای دوره
          </h3>
          <span className="text-xs text-gray-500">
            {formatNumber(lessons.length)} درس
          </span>
        </div>

        {lessons.length === 0 ? (
          <div className="p-12 text-center">
            <Video className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500 text-sm">
              هنوز درسی به این دوره اضافه نشده
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/student/learning/lessons/${lesson.id}`}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    lesson.isCompleted
                      ? 'bg-green-100 text-green-600'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {lesson.isCompleted ? (
                    <CheckCircle size={22} />
                  ) : (
                    <Play size={22} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {lesson.title}
                    </p>
                    {lesson.isFree && !isEnrolled && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        رایگان
                      </span>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {lesson.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>درس {index + 1}</span>
                    {lesson.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {lesson.duration} دقیقه
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 rotate-180" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}