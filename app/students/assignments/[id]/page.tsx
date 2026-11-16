// app/student/assignments/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  ClipboardList,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  Clock,
  FileText,
  Download,
  CheckCircle,
  TrendingUp,
  Send,
  BookOpen,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { studentAssignmentsAPI } from '@/lib/api/student-portal';
import type { Assignment } from '@/types/student-portal';
import {
  formatNumber,
  formatShamsiDate,
  formatDateTime,
  assignmentStatusLabels,
  assignmentStatusColors,
  getSubjectColor,
} from '@/lib/utils/student-helpers';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = Number(params.id);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isNaN(assignmentId)) {
        setError('شناسه نامعتبر');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await studentAssignmentsAPI.getById(assignmentId);
        setAssignment(res);
      } catch (err: unknown) {
        console.error(err);
        let msg = 'خطا در دریافت کارخانگی';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          msg = e.response?.data?.message || e.message || msg;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error || !assignment) {
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

  const status = assignment.submission?.status || 'PENDING';
  const statusLabel = assignmentStatusLabels[status] || status;
  const statusColor =
    assignmentStatusColors[status] || 'bg-gray-100 text-gray-600';

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = diffDays < 0 && status === 'PENDING';
  const isDueSoon = diffDays >= 0 && diffDays <= 2 && status === 'PENDING';
  const canSubmit = status === 'PENDING' || status === 'LATE';

  const subjectColor = getSubjectColor(
    assignment.Class?.name || assignment.title || ''
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            جزئیات کارخانگی
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {formatShamsiDate(assignment.dueDate)}
          </p>
        </div>
      </div>

      {/* Hero card */}
      <div
        className="rounded-2xl p-6 text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${subjectColor}, ${subjectColor}dd)`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={20} />
              <span className="text-sm font-medium opacity-90">
                کارخانگی درسی
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{assignment.title}</h2>
            {assignment.Class && (
              <p className="text-sm opacity-90 flex items-center gap-2">
                <BookOpen size={14} />
                {assignment.Class.name}
                {assignment.Class.section && ` - ${assignment.Class.section}`}
              </p>
            )}
          </div>

          <span
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Due date & submission info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`rounded-xl p-5 ${
            isOverdue
              ? 'bg-red-50 border-l-4 border-red-500'
              : isDueSoon
              ? 'bg-amber-50 border-l-4 border-amber-500'
              : 'bg-white border border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar
              size={16}
              className={
                isOverdue
                  ? 'text-red-500'
                  : isDueSoon
                  ? 'text-amber-500'
                  : 'text-indigo-500'
              }
            />
            <p className="text-xs text-gray-600">تاریخ تحویل</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatShamsiDate(assignment.dueDate)}
          </p>
          {status === 'PENDING' && (
            <p
              className={`text-xs mt-1 ${
                isOverdue
                  ? 'text-red-600'
                  : isDueSoon
                  ? 'text-amber-600'
                  : 'text-gray-500'
              }`}
            >
              {isOverdue
                ? `گذشته شده (${Math.abs(diffDays)} روز)`
                : diffDays === 0
                ? 'امروز آخرین فرصت'
                : diffDays === 1
                ? 'فردا آخرین فرصت'
                : `${diffDays} روز باقی‌مانده`}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <p className="text-xs text-gray-600">حداکثر نمره</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {assignment.maxGrade || 20}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-purple-500" />
            <p className="text-xs text-gray-600">معلم</p>
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">
            {assignment.Teacher?.User?.fullName || '—'}
          </p>
        </div>
      </div>

      {/* Grade result (if graded) */}
      {status === 'GRADED' &&
        assignment.submission?.grade !== undefined && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">
                  نمره دریافتی شما
                </p>
                <p className="text-4xl font-bold">
                  {assignment.submission.grade}
                  {assignment.maxGrade && (
                    <span className="text-lg text-green-100 ml-2">
                      / {assignment.maxGrade}
                    </span>
                  )}
                </p>
                {assignment.submission.submittedAt && (
                  <p className="text-xs text-green-100 mt-2">
                    ارسال شده: {formatDateTime(assignment.submission.submittedAt)}
                  </p>
                )}
              </div>
              <CheckCircle size={56} className="text-green-200" />
            </div>

            {assignment.submission.feedback && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MessageSquare size={14} />
                  بازخورد معلم
                </p>
                <p className="text-sm text-green-50 leading-relaxed">
                  {assignment.submission.feedback}
                </p>
              </div>
            )}
          </div>
        )}

      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText size={18} className="text-indigo-500" />
          توضیحات کارخانگی
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {assignment.description || 'توضیحی ارائه نشده است'}
        </p>
      </div>

      {/* Submission */}
      {assignment.submission && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Send size={18} className="text-indigo-500" />
            ارسال شما
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              label="وضعیت"
              value={statusLabel}
              icon={CheckCircle}
            />
            {assignment.submission.submittedAt && (
              <InfoRow
                label="تاریخ ارسال"
                value={formatDateTime(assignment.submission.submittedAt)}
                icon={Clock}
              />
            )}
          </div>

          {assignment.submission.fileUrl && (
            <div className="mt-4">
              <a
                href={assignment.submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm"
              >
                <Download size={16} />
                دانلود فایل ارسالی
              </a>
            </div>
          )}
        </div>
      )}

      {/* Overdue warning */}
      {isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle
            className="text-red-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">
              این کارخانگی زمان تحویل آن گذشته است
            </p>
            <p>
              لطفاً در اسرع وقت آن را ارسال کنید. ارسال با تأخیر ممکن است
              بر نمره شما تأثیر بگذارد.
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {canSubmit && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            بازگشت
          </button>
          <Link
            href={`/student/assignments/submit?id=${assignment.id}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Send size={16} />
            ارسال کارخانگی
          </Link>
        </div>
      )}

      {/* Already submitted */}
      {!canSubmit && (
        <div className="flex items-center justify-end">
          <Link
            href="/student/assignments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
          >
            <ClipboardList size={16} />
            بازگشت به لیست کارخانگی‌ها
          </Link>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-indigo-500 flex-shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}