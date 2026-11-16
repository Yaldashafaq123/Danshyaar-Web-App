// app/student/subjects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  TrendingUp,
  ChevronLeft,
  Search,
  Sparkles,
} from 'lucide-react';
import { studentCoursesAPI, studentGradesAPI } from '@/lib/api/student-portal';
import type { StudentSubject } from '@/types/student-portal';
import {
  formatNumber,
  getSubjectColor,
  getScoreColor,
} from '@/lib/utils/student-helpers';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [subjectsWithGrades, setSubjectsWithGrades] = useState<
    (StudentSubject & { average?: number; letter?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load subjects and current grades in parallel
      const [subjectsRes, gradesRes] = await Promise.all([
        studentCoursesAPI.getSubjects().catch(() => []),
        studentGradesAPI.getCurrent().catch(() => null),
      ]);

      setSubjects(subjectsRes);

      // Merge with grades if available
      if (gradesRes && gradesRes.subjects) {
        const gradeMap = new Map(
          gradesRes.subjects.map((s) => [s.subject, s])
        );
        const merged = subjectsRes.map((subj) => {
          const grade = gradeMap.get(subj.name);
          return {
            ...subj,
            average: grade?.average,
            letter: grade?.totalLetter,
          };
        });
        setSubjectsWithGrades(merged);
      } else {
        setSubjectsWithGrades(subjectsRes);
      }
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت مضامین';
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

  const filtered = subjectsWithGrades.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const overallAvg =
    filtered.filter((s) => s.average && s.average > 0).length > 0
      ? filtered
          .filter((s) => s.average && s.average > 0)
          .reduce((sum, s) => sum + (s.average || 0), 0) /
        filtered.filter((s) => s.average && s.average > 0).length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-indigo-500" size={26} />
            مضامین من
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {formatNumber(filtered.length)} مضمون درسی
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

      {/* Summary Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-indigo-600" />
              <p className="text-xs text-gray-600">تعداد مضامین</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(filtered.length)}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-emerald-600" />
              <p className="text-xs text-gray-600">میانگین کل</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {overallAvg.toFixed(1)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-purple-600" />
              <p className="text-xs text-gray-600">معلمان</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(
                new Set(filtered.map((s) => s.teacherName).filter(Boolean)).size
              )}
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
            placeholder="جستجوی مضمون..."
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
          <BookOpen className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            هنوز مضمونی به شما تخصیص داده نشده
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((subject) => {
            const color = getSubjectColor(subject.name);
            return (
              <Link
                key={subject.id}
                href={`/student/subjects/${subject.id}`}
                className="group bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <BookOpen size={24} style={{ color }} />
                  </div>
                  {subject.average !== undefined && subject.average > 0 && (
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${getScoreColor(
                          subject.average
                        )}`}
                      >
                        {subject.average.toFixed(1)}
                      </p>
                      {subject.letter && (
                        <p className="text-xs text-gray-500">
                          {subject.letter}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 mb-1">
                  {subject.name}
                </h3>

                {subject.teacherName && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <User size={12} />
                    {subject.teacherName}
                  </div>
                )}

                {subject.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {subject.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    مشاهده جزئیات
                  </span>
                  <ChevronLeft
                    size={16}
                    className="text-gray-400 group-hover:text-indigo-600 transition-colors"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}