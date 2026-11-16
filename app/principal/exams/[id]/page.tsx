// app/admin/academic/exams/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  ClipboardList,
  Calendar,
  Home,
  Users,
  AlertCircle,
  Loader2,
  Edit3,
  CheckCircle,
  EyeOff,
  TrendingUp,
  BookOpen,
  FileCheck,
} from 'lucide-react';
import { principalExamsAPI } from '@/lib/api/principal';
import type { Exam } from '@/types/principal';
import {
  examStatusLabels,
  examStatusColors,
  formatDate,
  formatNumber,
} from '@/lib/utils/principal-helpers';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchExam = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await principalExamsAPI.list({ limit: 1000 });
      const found = data.exams.find((e) => e.id === examId);
      if (!found) throw new Error('امتحان یافت نشد');
      setExam(found);
    } catch (err: unknown) {
      console.error('❌ [Exam Detail] Error:', err);
      let message = 'خطا در دریافت اطلاعات امتحان';
      if (err && typeof err === 'object' && 'message' in err) {
        message = (err as { message?: string }).message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(examId)) fetchExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const handleTogglePublish = async () => {
    if (!exam) return;
    try {
      setToggling(true);
      await principalExamsAPI.togglePublish(exam.id);
      await fetchExam();
    } catch (err) {
      console.error(err);
      setError('خطا در تغییر وضعیت');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !exam) {
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

  const gradesPercent =
    exam.studentCount > 0
      ? Math.round((exam.gradesCount / exam.studentCount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.name}</h1>
            <p className="text-gray-500 text-sm">
              {exam.subject || 'بدون مضمون'} • {exam.className}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePublish}
            disabled={toggling}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              exam.isPublished
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50`}
          >
            {toggling ? (
              <Loader2 size={16} className="animate-spin" />
            ) : exam.isPublished ? (
              <EyeOff size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            {exam.isPublished ? 'لغو انتشار' : 'انتشار'}
          </button>
          <Link
            href={`/admin/academic/exams/${exam.id}/marks`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Edit3 size={16} />
            ورود نمرات
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <ClipboardList size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
            {exam.name}
          </h2>
          <div className="flex justify-center mb-4">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                examStatusColors[exam.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {examStatusLabels[exam.status] || exam.status}
            </span>
          </div>

          <div className="space-y-3 mt-6">
            <InfoRow
              label="صنف"
              value={exam.className}
              icon={Home}
              color="text-purple-600"
            />
            <InfoRow
              label="تاریخ"
              value={formatDate(exam.date)}
              icon={Calendar}
              color="text-blue-600"
            />
            <InfoRow
              label="مضمون"
              value={exam.subject || 'نامشخص'}
              icon={BookOpen}
              color="text-green-600"
            />
            <InfoRow
              label="نمره کل"
              value={String(exam.totalMarks)}
              icon={TrendingUp}
              color="text-orange-600"
            />
            <InfoRow
              label="نوع"
              value={exam.type || 'general'}
              icon={ClipboardList}
              color="text-gray-600"
            />
            <InfoRow
              label="وضعیت انتشار"
              value={exam.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
              icon={exam.isPublished ? CheckCircle : EyeOff}
              color={exam.isPublished ? 'text-green-600' : 'text-gray-400'}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              پیشرفت ثبت نمرات
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <ProgressBox
                label="شاگردان"
                value={exam.studentCount}
                color="text-blue-600"
                bg="bg-blue-50"
                icon={Users}
              />
              <ProgressBox
                label="نمرات ثبت شده"
                value={exam.gradesCount}
                color="text-green-600"
                bg="bg-green-50"
                icon={FileCheck}
              />
              <ProgressBox
                label="درصد تکمیل"
                value={gradesPercent}
                color="text-purple-600"
                bg="bg-purple-50"
                suffix="%"
                icon={TrendingUp}
              />
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  gradesPercent === 100
                    ? 'bg-green-500'
                    : gradesPercent >= 50
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                }`}
                style={{ width: `${gradesPercent}%` }}
              />
            </div>

            <div className="flex justify-end mt-3">
              <Link
                href={`/admin/academic/exams/${exam.id}/marks`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {gradesPercent === 100
                  ? 'مشاهده و ویرایش نمرات →'
                  : 'ادامه ثبت نمرات →'}
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              دسترسی سریع
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <QuickLink
                label="ورود / ویرایش نمرات"
                description="ثبت نمرات شاگردان"
                icon={Edit3}
                href={`/admin/academic/exams/${exam.id}/marks`}
                color="text-indigo-600"
                bg="bg-indigo-50"
              />
              <QuickLink
                label="نتایج امتحانات"
                description="مشاهده همه نتایج"
                icon={FileCheck}
                href="/admin/academic/exams/results"
                color="text-green-600"
                bg="bg-green-50"
              />
              <QuickLink
                label="لیست شاگردان"
                description={`${exam.studentCount} شاگرد در این صنف`}
                icon={Users}
                href="/admin/academic/students"
                color="text-blue-600"
                bg="bg-blue-50"
              />
              <QuickLink
                label="صنف مربوطه"
                description={exam.className}
                icon={Home}
                href={`/admin/academic/academics/classes/${exam.classId}`}
                color="text-purple-600"
                bg="bg-purple-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Icon size={16} className={color} />
        {label}
      </div>
      <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
        {value}
      </span>
    </div>
  );
}

function ProgressBox({
  label,
  value,
  color,
  bg,
  suffix = '',
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  suffix?: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`${bg} rounded-lg p-3 text-center`}>
      <Icon size={16} className={`${color} mx-auto mb-1`} />
      <p className={`text-xl font-bold ${color}`}>
        {formatNumber(value)}
        {suffix}
      </p>
      <p className="text-xs text-gray-600 mt-0.5">{label}</p>
    </div>
  );
}

function QuickLink({
  label,
  description,
  icon: Icon,
  href,
  color,
  bg,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bg: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
    </Link>
  );
}