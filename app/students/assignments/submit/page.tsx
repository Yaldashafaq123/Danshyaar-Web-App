// app/student/assignments/submit/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  X,
  ClipboardList,
  Paperclip,
  MessageSquare,
} from 'lucide-react';
import { studentAssignmentsAPI } from '@/lib/api/student-portal';
import type { Assignment } from '@/types/student-portal';
import { formatShamsiDate } from '@/lib/utils/student-helpers';

function SubmitAssignmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = Number(searchParams.get('id'));

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isNaN(assignmentId)) {
        setError('شناسه کارخانگی نامعتبر است');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await studentAssignmentsAPI.getById(assignmentId);
        setAssignment(res);

        // Pre-fill content if already submitted (draft-like)
        if (res.submission) {
          setContent(res.submission.feedback || '');
          setFileUrl(res.submission.fileUrl || '');
        }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      // In a real implementation, you'd upload the file first
      // For now, use a placeholder URL
      setFileUrl(`/uploads/assignments/${selected.name}`);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentId) return;

    if (!content.trim() && !file) {
      setError('لطفاً متن پاسخ یا فایل پاسخ را وارد کنید');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await studentAssignmentsAPI.submit(assignmentId, {
        content: content.trim() || undefined,
        fileUrl: fileUrl || undefined,
      });

      setSuccess('کارخانگی با موفقیت ارسال شد! 🎉');
      setTimeout(() => {
        router.push(`/student/assignments/${assignmentId}`);
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      let msg = 'خطا در ارسال کارخانگی';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="space-y-4">
        <Link
          href="/student/assignments"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight size={18} />
          بازگشت
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  const status = assignment.submission?.status;
  const alreadySubmitted = status === 'SUBMITTED' || status === 'GRADED';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/student/assignments/${assignmentId}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="text-indigo-500" size={26} />
            ارسال کارخانگی
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {assignment.title}
          </p>
        </div>
      </div>

      {/* Assignment info */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <ClipboardList size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">
              {assignment.title}
            </h3>
            {assignment.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {assignment.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>تاریخ تحویل: {formatShamsiDate(assignment.dueDate)}</span>
              {assignment.Class && (
                <span>
                  صنف: {assignment.Class.name}
                  {assignment.Class.section && ` - ${assignment.Class.section}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning if already submitted */}
      {alreadySubmitted && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">این کارخانگی قبلاً ارسال شده است</p>
            <p>
              اگر مجدداً ارسال کنید، نسخه فعلی جایگزین خواهد شد. مطمئن شوید
              که تغییرات دلخواه اعمال شده است.
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
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Text response */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare size={16} className="text-indigo-500" />
            پاسخ متنی
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="پاسخ خود را اینجا بنویسید..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
          <p className="mt-1 text-xs text-gray-500 text-left">
            {content.length} کاراکتر
          </p>
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Paperclip size={16} className="text-indigo-500" />
            فایل پیوست (اختیاری)
          </label>

          {file ? (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-indigo-600 flex-shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setFileUrl('');
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip"
              />
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm font-medium text-gray-700">
                کلیک کنید یا فایل را اینجا رها کنید
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF، Word، تصویر یا ZIP — حداکثر ۱۰ مگابایت
              </p>
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/student/assignments/${assignmentId}`}
          className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          انصراف
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting || (!content.trim() && !file)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {alreadySubmitted ? 'ارسال مجدد' : 'ارسال کارخانگی'}
        </button>
      </div>
    </div>
  );
}

export default function SubmitAssignmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      }
    >
      <SubmitAssignmentForm />
    </Suspense>
  );
}