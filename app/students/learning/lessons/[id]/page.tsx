// app/student/learning/lessons/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  FileText,
  Download,
  MessageSquare,
  Send,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Video,
  Paperclip,
} from 'lucide-react';
import { studentLessonsAPI } from '@/lib/api/student-portal';
import type { LessonDetail } from '@/types/student-portal';
import {
  formatNumber,
  formatDateTime,
} from '@/lib/utils/student-helpers';

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Number(params.id);

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Comment form
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentLessonsAPI.getDetail(lessonId);
      setLesson(res);
    } catch (err: unknown) {
      console.error(err);
      let msg = 'خطا در دریافت درس';
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
    if (!isNaN(lessonId)) fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const handleComplete = async () => {
    if (!lesson) return;
    try {
      setCompleting(true);
      setMessage(null);
      const lastPosition = videoRef.current
        ? Math.floor(videoRef.current.currentTime)
        : 0;
      await studentLessonsAPI.complete(lesson.id, lastPosition);
      setMessage({
        type: 'success',
        text: 'درس با موفقیت تکمیل شد! 🎉',
      });
      await fetchLesson();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'خطا در تکمیل درس' });
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!lesson || !commentText.trim()) return;
    try {
      setSubmittingComment(true);
      await studentLessonsAPI.addComment(lesson.id, commentText.trim());
      setCommentText('');
      setMessage({ type: 'success', text: 'نظر شما ثبت شد' });
      await fetchLesson();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'خطا در ثبت نظر' });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error || !lesson) {
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <BookOpen size={12} />
            {lesson.courseTitle}
          </p>
          <h1 className="text-xl font-bold text-gray-900 truncate mt-0.5">
            {lesson.title}
          </h1>
        </div>
        {lesson.isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex-shrink-0">
            <CheckCircle size={12} />
            تکمیل شده
          </span>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg border flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {message.text}
        </div>
      )}

      {/* Video area */}
      <div className="bg-black rounded-xl overflow-hidden shadow-lg">
        {lesson.videoUrl ? (
          <video
            ref={videoRef}
            controls
            className="w-full aspect-video"
            poster={lesson.thumbnail}
          >
            <source src={lesson.videoUrl} />
            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
          </video>
        ) : (
          <div className="w-full aspect-video flex flex-col items-center justify-center text-white/60 bg-gradient-to-br from-gray-800 to-gray-900">
            <Video size={64} />
            <p className="mt-4 text-sm">ویدیویی برای این درس آپلود نشده</p>
          </div>
        )}
      </div>

      {/* Meta + actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {lesson.teacherName && (
                <span className="flex items-center gap-1">
                  <User size={14} className="text-gray-400" />
                  {lesson.teacherName}
                </span>
              )}
              {lesson.duration && (
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-gray-400" />
                  {lesson.duration} دقیقه
                </span>
              )}
              <span className="flex items-center gap-1">
                درس {lesson.order}
              </span>
            </div>

            {/* Course progress */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">پیشرفت دوره</span>
                <span className="font-bold text-indigo-600">
                  {lesson.courseProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${lesson.courseProgress}%` }}
                />
              </div>
            </div>
          </div>

          {!lesson.isCompleted && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex-shrink-0"
            >
              {completing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              علامت‌گذاری به‌عنوان تکمیل شده
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {lesson.description && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText size={18} className="text-indigo-500" />
            توضیحات درس
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {lesson.description}
          </p>
        </div>
      )}

      {/* Attachments */}
      {lesson.attachments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Paperclip size={18} className="text-indigo-500" />
            فایل‌های پیوست
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.attachments.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.type}
                    {file.fileSize && ` • ${file.fileSize}`}
                  </p>
                </div>
                <Download size={16} className="text-gray-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Navigation prev/next */}
      {(lesson.prevLesson || lesson.nextLesson) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lesson.prevLesson ? (
            <Link
              href={`/student/learning/lessons/${lesson.prevLesson.id}`}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
            >
              <ChevronRight
                size={20}
                className="text-gray-400 rotate-180 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs text-gray-500">درس قبلی</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {lesson.prevLesson.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {lesson.nextLesson ? (
            <Link
              href={`/student/learning/lessons/${lesson.nextLesson.id}`}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3 text-white"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-90">درس بعدی</p>
                <p className="text-sm font-medium truncate">
                  {lesson.nextLesson.title}
                </p>
              </div>
              <ChevronLeft
                size={20}
                className="opacity-80 flex-shrink-0"
              />
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-indigo-500" />
          نظرات و پرسش‌ها ({formatNumber(lesson.comments.length)})
        </h3>

        {/* Add comment */}
        <div className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="سؤال یا نظر خود را بنویسید..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitComment}
              disabled={submittingComment || !commentText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              {submittingComment ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              ارسال نظر
            </button>
          </div>
        </div>

        {/* Comments list */}
        {lesson.comments.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto text-gray-300" size={40} />
            <p className="mt-3 text-sm text-gray-500">
              هنوز نظری ثبت نشده — اولین نفر باشید!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lesson.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden flex-shrink-0">
                  {comment.User.profileImage ? (
                    <img
                      src={comment.User.profileImage}
                      alt={comment.User.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {comment.User.fullName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="flex justify-center">
        <Link
          href={`/student/courses/${lesson.courseId}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm"
        >
          <ArrowRight size={16} />
          بازگشت به دوره
        </Link>
      </div>
    </div>
  );
}