// app/admin/academic/exams/results/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
  Home,
  Users,
  TrendingUp,
  CheckCircle,
  EyeOff,
  ClipboardList,
  ArrowLeft,
} from 'lucide-react';
import { principalExamsAPI, principalClassesAPI } from '@/lib/api/principal';
import type { Exam, Class } from '@/types/principal';
import { formatNumber, formatDate } from '@/lib/utils/principal-helpers';

interface ClassResult {
  cls: Class;
  totalExams: number;
  publishedExams: number;
  totalGrades: number;
  percent: number;
}

export default function ExamResultsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classResults, setClassResults] = useState<ClassResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [examRes, cls] = await Promise.all([
        principalExamsAPI.list({ limit: 1000 }),
        principalClassesAPI.list(),
      ]);
      setExams(examRes.exams);
      setClasses(cls);

      // Group exams by class
      const results: ClassResult[] = cls.map((c) => {
        const classExams = examRes.exams.filter((e) => e.classId === c.id);
        const published = classExams.filter((e) => e.isPublished);
        const totalGrades = classExams.reduce(
          (sum, e) => sum + e.gradesCount,
          0
        );
        const totalStudents = c.studentCount * classExams.length;
        const percent =
          totalStudents > 0
            ? Math.round((totalGrades / totalStudents) * 100)
            : 0;

        return {
          cls: c,
          totalExams: classExams.length,
          publishedExams: published.length,
          totalGrades,
          percent,
        };
      });

      setClassResults(results);
    } catch (err: unknown) {
      console.error('❌ [Exam Results] Error:', err);
      let message = 'خطا در دریافت نتایج';
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

  const publishedExams = exams.filter((e) => e.isPublished);
  const draftExams = exams.filter((e) => !e.isPublished);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/academic/exams"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="text-green-500" size={26} />
              نتایج امتحانات
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              خلاصه نتایج منتشر شده و پیش‌نویس‌ها
            </p>
          </div>
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          label="مجموع امتحانات"
          value={exams.length}
          icon={ClipboardList}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <MiniStat
          label="منتشر شده"
          value={publishedExams.length}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
        <MiniStat
          label="پیش‌نویس"
          value={draftExams.length}
          icon={EyeOff}
          color="text-gray-600"
          bg="bg-gray-50"
        />
        <MiniStat
          label="مجموع نمرات"
          value={exams.reduce((s, e) => s + e.gradesCount, 0)}
          icon={TrendingUp}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Progress by class */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            درصد تکمیل نمرات به تفکیک صنف
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            نسبت نمرات ثبت شده به کل شاگردان در همه امتحانات صنف
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          </div>
        ) : classResults.length === 0 ? (
          <div className="p-12 text-center">
            <Home className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">هیچ صنفی یافت نشد</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {classResults.map((r) => (
              <div key={r.cls.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Class info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Home size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {r.cls.name} {r.cls.section || ''}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {formatNumber(r.cls.studentCount)} شاگرد
                        </span>
                        <span>{r.cls.teacherName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Exam counts */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">امتحانات</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatNumber(r.totalExams)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">منتشر شده</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatNumber(r.publishedExams)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">نمرات</p>
                      <p className="text-sm font-bold text-blue-600">
                        {formatNumber(r.totalGrades)}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-full md:w-48 flex-shrink-0">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>تکمیل نمرات</span>
                      <span>{r.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          r.percent === 100
                            ? 'bg-green-500'
                            : r.percent >= 50
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${r.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published exams list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            امتحانات منتشر شده
          </h3>
        </div>
        {publishedExams.length === 0 ? (
          <div className="p-8 text-center">
            <EyeOff className="mx-auto text-gray-300" size={32} />
            <p className="mt-2 text-gray-500 text-sm">
              هیچ امتحانی منتشر نشده
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {publishedExams.slice(0, 10).map((e) => (
              <Link
                key={e.id}
                href={`/admin/academic/exams/${e.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <FileCheck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {e.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {e.className} • {formatDate(e.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatNumber(e.gradesCount)} /{' '}
                    {formatNumber(e.studentCount)}
                  </p>
                  <p className="text-xs text-gray-500">نمره ثبت شده</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
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
      <p className={`text-2xl font-bold ${color}`}>{formatNumber(value)}</p>
    </div>
  );
}