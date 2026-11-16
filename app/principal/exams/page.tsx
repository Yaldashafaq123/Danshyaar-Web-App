// app/admin/academic/exams/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Home,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  EyeOff,
} from 'lucide-react';
import { principalExamsAPI, principalClassesAPI } from '@/lib/api/principal';
import type { Exam, Class } from '@/types/principal';
import {
  examStatusLabels,
  examStatusColors,
  formatDate,
  formatNumber,
} from '@/lib/utils/principal-helpers';

export default function ExamsListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await principalExamsAPI.list({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        classId: classFilter !== 'all' ? Number(classFilter) : undefined,
      });
      setExams(data.exams);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      console.error('❌ [Exams] Error:', err);
      let message = 'خطا در دریافت امتحانات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, classFilter]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    principalClassesAPI
      .list()
      .then(setClasses)
      .catch((e) => console.error('Classes load error:', e));
  }, []);

  const handleTogglePublish = async (exam: Exam) => {
    try {
      setProcessingId(exam.id);
      await principalExamsAPI.togglePublish(exam.id);
      setSuccess(
        exam.isPublished ? 'امتحان از انتشار خارج شد' : 'امتحان منتشر شد'
      );
      await fetchExams();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      console.error(err);
      setError('خطا در تغییر وضعیت انتشار');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setProcessingId(deleteId);
      await principalExamsAPI.delete(deleteId);
      setSuccess('امتحان حذف شد');
      setDeleteId(null);
      await fetchExams();
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در حذف امتحان';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
      setDeleteId(null);
    } finally {
      setProcessingId(null);
    }
  };

  // Summary counts
  const upcoming = exams.filter((e) => e.status === 'upcoming').length;
  const ongoing = exams.filter((e) => e.status === 'ongoing').length;
  const completed = exams.filter((e) => e.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-indigo-500" size={26} />
            امتحانات
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total > 0
              ? `${total.toLocaleString('fa-IR')} امتحان ثبت شده`
              : 'مدیریت امتحانات مکتب'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/academic/exams/results"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileCheck size={16} />
            نتایج
          </Link>
          <button
            onClick={fetchExams}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/academic/exams/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Plus size={16} />
            امتحان جدید
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <MiniStat
          label="پیش‌رو"
          value={upcoming}
          icon={Calendar}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <MiniStat
          label="در جریان"
          value={ongoing}
          icon={TrendingUp}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <MiniStat
          label="تمام شده"
          value={completed}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی امتحان..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="upcoming">پیش‌رو</option>
            <option value="ongoing">در جریان</option>
            <option value="completed">تمام شده</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">همه صنوف</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section || ''}
              </option>
            ))}
          </select>
        </div>
      </div>

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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">هیچ امتحانی یافت نشد</p>
            <Link
              href="/admin/academic/exams/add"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <Plus size={16} />
              ایجاد اولین امتحان
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    امتحان
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    صنف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تاریخ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    نمرات
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    وضعیت
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/academic/exams/${exam.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm group-hover:text-indigo-600">
                            {exam.name}
                          </p>
                          {exam.subject && (
                            <p className="text-xs text-gray-500">
                              {exam.subject}
                            </p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {exam.className}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(exam.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(exam.gradesCount)}
                        </span>
                        <span className="text-xs text-gray-400">
                          / {formatNumber(exam.studentCount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            examStatusColors[exam.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {examStatusLabels[exam.status] || exam.status}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            exam.isPublished
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {exam.isPublished ? (
                            <>
                              <CheckCircle size={10} /> منتشر
                            </>
                          ) : (
                            <>
                              <EyeOff size={10} /> پیش‌نویس
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/academic/exams/${exam.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="مشاهده"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/admin/academic/exams/${exam.id}/marks`}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                          title="ورود نمرات"
                        >
                          <Edit3 size={14} />
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(exam)}
                          disabled={processingId === exam.id}
                          className={`p-1.5 rounded ${
                            exam.isPublished
                              ? 'text-orange-500 hover:bg-orange-50'
                              : 'text-green-500 hover:bg-green-50'
                          }`}
                          title={exam.isPublished ? 'لغو انتشار' : 'انتشار'}
                        >
                          {processingId === exam.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : exam.isPublished ? (
                            <EyeOff size={14} />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteId(exam.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && exams.length > 0 && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              صفحه {page.toLocaleString('fa-IR')} از{' '}
              {totalPages.toLocaleString('fa-IR')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">حذف امتحان</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              اگر نمره‌ای برای این امتحان ثبت شده باشد، حذف نخواهد شد.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={processingId !== null}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={processingId !== null}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {processingId !== null ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
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