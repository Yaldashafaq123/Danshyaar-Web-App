// app/admin/hr/warnings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Search,
  User,
  Plus,
  Calendar,
  Shield,
  FileText,
} from 'lucide-react';
import { hrWarningsAPI, hrStaffAPI } from '@/lib/api/hr';
import type { Warning, StaffMember, WarningType } from '@/types/hr';
import {
  formatShamsiDate,
  formatNumber,
  warningTypeLabels,
  warningStatusLabels,
  warningStatusColors,
  warningTypeColors,
} from '@/lib/utils/hr-helpers';

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    type: 'VERBAL' as WarningType,
    title: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  // Resolve modal
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrWarningsAPI.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 200,
      });
      setWarnings(res.warnings);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اخطارها';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    hrStaffAPI
      .list({ limit: 500 })
      .then((res) => setStaff(res.staff))
      .catch((e) => console.error(e));
  }, []);

  const openCreateModal = () => {
    setForm({
      userId: '',
      type: 'VERBAL',
      title: '',
      description: '',
    });
    setCreateOpen(true);
    setError(null);
  };

  const handleCreate = async () => {
    if (!form.userId || !form.title.trim() || !form.description.trim()) {
      setError('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await hrWarningsAPI.create({
        userId: Number(form.userId),
        type: form.type,
        title: form.title,
        description: form.description,
      });
      setSuccess('اخطار ثبت شد');
      setCreateOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ثبت اخطار';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveId) return;
    if (!resolution.trim()) {
      setError('لطفاً راه‌حل را وارد کنید');
      return;
    }

    try {
      setResolving(true);
      setError(null);
      await hrWarningsAPI.resolve(resolveId, resolution);
      setSuccess('اخطار حل شد');
      setResolveId(null);
      setResolution('');
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('خطا در حل اخطار');
    } finally {
      setResolving(false);
    }
  };

  const filtered = warnings.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      w.User.fullName.toLowerCase().includes(q) ||
      w.title.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: warnings.length,
    active: warnings.filter((w) => w.status === 'ACTIVE').length,
    resolved: warnings.filter((w) => w.status === 'RESOLVED').length,
    expired: warnings.filter((w) => w.status === 'EXPIRED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={26} />
            اخطارها و انتظام
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            مدیریت اخطارهای کارمندان
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
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            <Plus size={16} />
            اخطار جدید
          </button>
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

      {/* Status tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
        {(['ACTIVE', 'RESOLVED', 'EXPIRED', 'all'] as const).map((s) => {
          const label =
            s === 'all'
              ? `همه (${counts.all})`
              : `${warningStatusLabels[s]} (${counts[s.toLowerCase() as keyof typeof counts]})`;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجو نام کارمند یا عنوان اخطار..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-red-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="mx-auto text-green-300" size={48} />
            <p className="mt-3 text-gray-500">
              {statusFilter === 'ACTIVE'
                ? 'هیچ اخطار فعالی وجود ندارد 🎉'
                : 'اخطاری یافت نشد'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((w) => (
              <WarningRow
                key={w.id}
                warning={w}
                processing={processing === w.id}
                onResolve={() => {
                  setResolveId(w.id);
                  setResolution('');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                ثبت اخطار جدید
              </h3>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  کارمند *
                </label>
                <select
                  value={form.userId}
                  onChange={(e) =>
                    setForm({ ...form, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">انتخاب کنید...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  نوع اخطار
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as WarningType })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {Object.entries(warningTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  عنوان *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="مثال: تأخیر مکرر"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  توضیحات *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="توضیحات کامل..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setCreateOpen(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                ثبت اخطار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                حل اخطار
              </h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                راه‌حل / نتیجه *
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
                placeholder="مثال: کارمند تعهد به بهبود داد"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setResolveId(null)}
                disabled={resolving}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {resolving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                حل اخطار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WarningRow({
  warning,
  processing,
  onResolve,
}: {
  warning: Warning;
  processing: boolean;
  onResolve: () => void;
}) {
  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{warning.User.fullName}</p>
            <p className="text-xs text-gray-500 truncate">
              {warning.User.email}
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {warning.title}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {warning.description}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              warningTypeColors[warning.type] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {warningTypeLabels[warning.type] || warning.type}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              warningStatusColors[warning.status] ||
              'bg-gray-100 text-gray-600'
            }`}
          >
            {warningStatusLabels[warning.status] || warning.status}
          </span>
        </div>

        <div className="text-xs text-gray-500 flex-shrink-0">
          {formatShamsiDate(warning.issuedDate)}
        </div>

        {warning.status === 'ACTIVE' && (
          <button
            onClick={onResolve}
            disabled={processing}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100 disabled:opacity-50 flex-shrink-0"
          >
            {processing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CheckCircle size={12} />
            )}
            حل
          </button>
        )}
      </div>

      {warning.resolution && (
        <div className="mt-3 p-2 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-xs text-green-800">
            <span className="font-medium">راه‌حل: </span>
            {warning.resolution}
          </p>
        </div>
      )}
    </div>
  );
}