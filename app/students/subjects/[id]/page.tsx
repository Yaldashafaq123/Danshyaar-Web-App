// app/student/subjects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Loader2,
  AlertCircle,
  User,
  FileText,
  Play,
  TrendingUp,
  CheckCircle,
  Video,
  Award,
} from 'lucide-react';
import {
  studentCoursesAPI,
  studentGradesAPI,
  studentLessonsAPI,
} from '@/lib/api/student-portal';
import type {
  StudentSubject,
  CourseLesson,
  SubjectGrade,
} from '@/types/student-portal';
import {
  formatNumber,
  formatShamsiDate,
  getSubjectColor,
  getScoreColor,
  gradeLetterColors,
  gradeStatusColors,
} from '@/lib/utils/student-helpers';

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = Number(params.id);

  const [subject, setSubject] = useState<StudentSubject | null>(null);
  const [grade, setGrade] = useState<SubjectGrade | null>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isNaN(subjectId)) {
        setError('شناسه نامعتبر');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const [subjectsRes, gradesRes] = await Promise.all([
          studentCoursesAPI.getSubjects().catch(() => []),
          studentGradesAPI.getCurrent().catch(() => null),
        ]);

        const found = subjectsRes.find((s) => s.id === subjectId);
        if (!found) {
          // Try by name in case id isn't a subject id
          throw new Error('مضمون یافت نشد');
        }
        setSubject(found);

        // Find matching grade
        if (gradesRes && gradesRes.subjects) {
          const match = gradesRes.subjects.find(
            (g) => g.subject === found.name
          );
          if (match) setGrade(match);
        }

        // Try to load lessons (only if course exists)
        try {
          const lessonsRes = await studentLessonsAPI.getCourseLessons(subjectId);
          setLessons(lessonsRes);
        } catch {
          setLessons([]);
        }
      } catch (err: unknown) {
        console.error(err);
        let msg = 'خطا در دریافت اطلاعات مضمون';
        if (err && typeof err === 'object' && 'message' in err) {
          msg = (err as { message?: string }).message || msg;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error || !subject) {
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

  const color = getSubjectColor(subject.name);

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
            {subject.name}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            جزئیات مضمون
          </p>
        </div>
      </div>

      {/* Hero */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={24} />
              <span className="text-sm font-medium opacity-90">
                مضمون درسی
              </span>
            </div>
            <p className="text-3xl font-bold">{subject.name}</p>
            {subject.teacherName && (
              <p className="text-sm opacity-90 mt-2 flex items-center gap-1">
                <User size={14} />
                معلم: {subject.teacherName}
              </p>
            )}
          </div>
          {grade && grade.average > 0 && (
            <div className="text-center">
              <p className="text-xs opacity-90 mb-1">معدل</p>
              <p className="text-5xl font-bold">{grade.average}</p>
              {grade.totalLetter && (
                <p className="text-sm opacity-90 mt-1">
                  {grade.totalLetter}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grade breakdown */}
      {grade && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={18} className="text-indigo-500" />
            نمرات این مضمون
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GradeCell
              label="ماهانه"
              value={grade.monthly}
              max={grade.monthlyMaxScore}
              letter={grade.halfYearlyLetter || '-'}
            />
            <GradeCell
              label="نیم‌سال"
              value={grade.halfYearly}
              max={grade.halfYearlyMaxScore}
              letter={grade.halfYearlyLetter || '-'}
            />
            <GradeCell
              label="سالانه"
              value={grade.final}
              max={grade.finalMaxScore}
              letter={grade.finalLetter || '-'}
            />
            <GradeCell
              label="مجموع"
              value={grade.total}
              max={100}
              letter={grade.totalLetter || '-'}
              highlight
            />
          </div>

          {grade.statusDisplay && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600">وضعیت:</span>
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  gradeStatusColors[grade.status] ||
                  'bg-gray-100 text-gray-600'
                }`}
              >
                {grade.statusDisplay}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {subject.description && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            توضیحات
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {subject.description}
          </p>
        </div>
      )}

      {/* Lessons */}
      {lessons.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Video size={18} className="text-indigo-500" />
              درس‌های این مضمون
            </h3>
            <span className="text-xs text-gray-500">
              {formatNumber(lessons.length)} درس
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {lessons.map((lesson) => (
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
                  <p className="font-medium text-gray-900 truncate">
                    {lesson.title}
                  </p>
                  {lesson.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {lesson.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {lesson.duration && (
                      <span>{lesson.duration} دقیقه</span>
                    )}
                    <span>
                      درس {lesson.order}
                    </span>
                    {lesson.isFree && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        رایگان
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 rotate-180" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {lessons.length === 0 && !grade && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <BookOpen className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            هنوز محتوایی برای این مضمون اضافه نشده
          </p>
        </div>
      )}
    </div>
  );
}

function GradeCell({
  label,
  value,
  max,
  letter,
  highlight = false,
}: {
  label: string;
  value: number | null;
  max: number;
  letter: string;
  highlight?: boolean;
}) {
  const percent =
    value !== null && max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div
      className={`p-4 rounded-xl text-center ${
        highlight ? 'bg-indigo-50' : 'bg-gray-50'
      }`}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          value !== null ? getScoreColor(percent) : 'text-gray-400'
        }`}
      >
        {value !== null ? value : '—'}
      </p>
      {max > 0 && (
        <p className="text-xs text-gray-400">از {max}</p>
      )}
      {value !== null && (
        <span
          className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
            gradeLetterColors[letter] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {letter}
        </span>
      )}
    </div>
  );
}