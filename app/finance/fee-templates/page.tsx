// app/admin/finance/fee-templates/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  Home,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { financeTemplatesAPI, financeAcademicYearsAPI } from '@/lib/api/finance';
import type { FeeTemplate, AcademicYear } from '@/types/finance';
import { formatAFN, formatNumber } from '@/lib/utils/finance-helpers';

export default function FeeTemplatesPage() {
  const [templates, setTemplates] = useState<FeeTemplate[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [activeOnly, setActiveOnly] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeTemplatesAPI.list({
        academicYearId: yearFilter ? Number(yearFilter) : undefined,
        isActive: activeOnly ? true : undefined,
      });
      setTemplates(res);
    } catch (err: unknown) {
      console.error('❌ [Templates] Error:', err);
      let message = 'خطا در دریافت قالب‌ها';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [yearFilter, activeOnly]);

  useEffect(() => {
    financeAcademicYearsAPI
      .list()
      .then((y) => {
        setYears(y);
        const activeYear = y.find((x) => x.isActive);
        if (activeYear) setYearFilter(String(activeYear.id));
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await financeTemplatesAPI.delete(deleteId);
      setDeleteId(null);
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در حذف';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-500" size={26} />
            قالب‌های فیس
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            الگوهای آماده برای تخصیص گروهی فیس
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/finance/fee-templates/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} />
            قالب جدید
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی نام قالب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">همه سال‌ها</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name} {y.isActive ? '(فعال)' : ''}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            فقط فعال
          </label>
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
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">هیچ قالبی یافت نشد</p>
          <Link
            href="/admin/finance/fee-templates/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} />
            ایجاد اولین قالب
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border-2 border-transparent"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {t.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {t.academicYearName || '—'}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    t.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.isActive ? (
                    <>
                      <CheckCircle size={10} /> فعال
                    </>
                  ) : (
                    <>
                      <XCircle size={10} /> غیرفعال
                    </>
                  )}
                </span>
              </div>

              {/* Class */}
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                <Home size={14} className="text-gray-400" />
                <span className="truncate">
                  {t.classId ? t.className : 'همه صنوف'}
                </span>
              </div>

              {t.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {t.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                <div>
                  <p className="text-xs text-gray-500">اقلام</p>
                  <p className="text-base font-bold text-blue-600">
                    {formatNumber(t.itemCount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">دانش‌آموزان</p>
                  <p className="text-base font-bold text-green-600">
                    {formatNumber(t.assignedCount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">مجموع</p>
                  <p className="text-base font-bold text-purple-600 truncate">
                    {formatAFN(t.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/finance/fee-templates/${t.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100"
                >
                  <Eye size={12} />
                  مشاهده و تخصیص
                </Link>
                <button
                  onClick={() => setDeleteId(t.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">حذف قالب</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              اگر این قالب به شاگردی تخصیص یافته باشد، حذف نخواهد شد.
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteId(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {deleting ? (
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