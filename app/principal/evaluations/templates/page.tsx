// app/admin/academic/evaluations/templates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Star,
  ClipboardList,
  Eye,
  BookOpen,
} from 'lucide-react';
import { principalEvaluationsAPI } from '@/lib/api/principal';
import type { EvaluationTemplate } from '@/types/principal';
import { formatNumber, formatDate } from '@/lib/utils/principal-helpers';

export default function EvaluationTemplatesPage() {
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await principalEvaluationsAPI.listTemplates(true);
      setTemplates(data);
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDefault = async () => {
    try {
      setCreating(true);
      setError(null);
      await principalEvaluationsAPI.createDefaultTemplate();
      setSuccess('قالب پیش‌فرض ایجاد شد');
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ایجاد قالب پیش‌فرض';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-500" size={26} />
            قالب‌های ارزیابی
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            قالب‌های معیارهای ارزیابی معلمان
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleCreateDefault}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Star size={16} />
            )}
            قالب پیش‌فرض
          </button>
          <Link
            href="/admin/academic/evaluations/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} />
            قالب جدید
          </Link>
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

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">هیچ قالبی وجود ندارد</p>
          <p className="text-xs text-gray-400 mt-1">
            روی «قالب پیش‌فرض» کلیک کنید تا قالب استاندارد ساخته شود
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-xl shadow-sm p-5 border-2 ${
                t.isDefault ? 'border-yellow-400' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <FileText size={20} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      <Star size={10} />
                      پیش‌فرض
                    </span>
                  )}
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1">
                {t.name}
              </h3>
              {t.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {t.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500">معیارها</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatNumber(t.criteriaCount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">ارزیابی‌ها</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatNumber(t.evaluationsCount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">دوره</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {t.period}
                  </p>
                </div>
              </div>

              {t.createdBy && (
                <p className="text-xs text-gray-400 mt-3">
                  ساخته شده توسط {t.createdBy}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}