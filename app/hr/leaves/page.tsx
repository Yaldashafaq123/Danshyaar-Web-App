// app/admin/hr/leaves/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Search,
  User,
  Clock,
  Plus,
  ThumbsUp,
  ThumbsDown,
  FileText,
} from 'lucide-react';
import { hrLeavesAPI, hrStaffAPI } from '@/lib/api/hr';
import type {
  LeaveRequest,
  LeaveType,
  StaffMember,
} from '@/types/hr';
import {
  formatShamsiDate,
  formatNumber,
  leaveTypeLabels,
  leaveStatusLabels,
  leaveStatusColors,
} from '@/lib/utils/hr-helpers';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [search, setSearch] = useState('');

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: '',
    type: 'ANNUAL' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [creating, setCreating] = useState(false);

  // Reject modal
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrLeavesAPI.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100,
      });
      setLeaves(res.leaves);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت درخواست‌های رخصتی';
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
    fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    hrStaffAPI
      .list({ limit: 500 })
      .then((res) => setStaff(res.staff))
      .catch((e) => console.error(e));
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm('آیا این درخواست رخصتی را تأیید می‌کنید؟')) return;
    try {
      setProcessing(id);
      setError(null);
      await hrLeavesAPI.approve(id);
      setSuccess('درخواست تأیید شد');
      await fetchLeaves();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در تأیید';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    if (!rejectReason.trim()) {
      setError('دلیل رد الزامی است');
      return;
    }
    try {
      setRejecting(true);
      setError(null);
      await hrLeavesAPI.reject(rejectId, rejectReason);
      setSuccess('درخواست رد شد');
      setRejectId(null);
      setRejectReason('');
      await fetchLeaves();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در رد';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setRejecting(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.userId || !createForm.startDate || !createForm.endDate) {
      setError('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }
    if (new Date(createForm.startDate) > new Date(createForm.endDate)) {
      setError('تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await hrLeavesAPI.create({
        userId: Number(createForm.userId),
        type: createForm.type,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        reason: createForm.reason || undefined,
      });
      setSuccess('درخواست رخصتی ایجاد شد');
      setCreateOpen(false);
      setCreateForm({
        userId: '',
        type: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: '',
      });
      await fetchLeaves();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ایجاد درخواست';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const filtered = leaves.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.User.fullName.toLowerCase().includes(q) ||
      (l.User.email || '').toLowerCase().includes(q)
    );
  });

  const counts = {
    all: leaves.length,
    pending: leaves.filter((l) => l.status === 'PENDING').length,
    approved: leaves.filter((l) => l.status === 'APPROVED').length,
    rejected: leaves.filter((l) => l.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-pink-500" size={26} />
            درخواست‌های رخصتی
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تأیید یا رد درخواست‌های رخصتی کارمندان
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeaves}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            ثبت رخصتی
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
        {(['PENDING', 'APPROVED', 'REJECTED', 'all'] as const).map((s) => {
          const label =
            s === 'all'
              ? `همه (${counts.all})`
              : `${leaveStatusLabels[s]} (${counts[s.toLowerCase() as keyof typeof counts]})`;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-pink-600 text-white'
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
            placeholder="جستجوی نام کارمند..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              {statusFilter === 'PENDING'
                ? 'هیچ درخواست رخصتی در انتظار نیست 🎉'
                : 'درخواستی یافت نشد'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((leave) => (
              <LeaveRow
                key={leave.id}
                leave={leave}
                processing={processing === leave.id}
                onApprove={() => handleApprove(leave.id)}
                onReject={() => {
                  setRejectId(leave.id);
                  setRejectReason('');
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
                ثبت رخصتی جدید
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
                  value={createForm.userId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                  نوع رخصتی
                </label>
                <select
                  value={createForm.type}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      type: e.target.value as LeaveType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {Object.entries(leaveTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    از تاریخ *
                  </label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    تا تاریخ *
                  </label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  دلیل
                </label>
                <textarea
                  value={createForm.reason}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, reason: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setCreateOpen(false)}
                disabled={creating}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 text-sm"
              >
                {creating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                ثبت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <X size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                رد درخواست رخصتی
              </h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                دلیل رد *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="مثال: کمبود کارمندان در این مدت"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectId(null)}
                disabled={rejecting}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {rejecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ThumbsDown size={14} />
                )}
                رد درخواست
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveRow({
  leave,
  processing,
  onApprove,
  onReject,
}: {
  leave: LeaveRequest;
  processing: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const start = new Date(leave.startDate);
  const end = new Date(leave.endDate);
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* User */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden flex-shrink-0">
            {leave.User.profileImage ? (
              <img
                src={leave.User.profileImage}
                alt={leave.User.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{leave.User.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{leave.User.email}</p>
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            {leaveTypeLabels[leave.type] || leave.type}
          </span>
          <span className="text-xs text-gray-500">
            {formatNumber(days)} روز
          </span>
        </div>

        {/* Dates */}
        <div className="text-sm text-gray-700 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            {formatShamsiDate(leave.startDate)}
          </div>
          <div className="text-xs text-gray-500">
            تا {formatShamsiDate(leave.endDate)}
          </div>
        </div>

        {/* Status */}
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
            leaveStatusColors[leave.status] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {leaveStatusLabels[leave.status] || leave.status}
        </span>

        {/* Actions */}
        {leave.status === 'PENDING' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onApprove}
              disabled={processing}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ThumbsUp size={12} />
              )}
              تأیید
            </button>
            <button
              onClick={onReject}
              disabled={processing}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 disabled:opacity-50"
            >
              <ThumbsDown size={12} />
              رد
            </button>
          </div>
        )}

        {leave.status !== 'PENDING' && leave.Approver && (
          <div className="text-xs text-gray-500 flex-shrink-0">
            توسط: {leave.Approver.fullName}
          </div>
        )}
      </div>

      {leave.reason && (
        <p className="mt-2 text-xs text-gray-600 pl-15">
          دلیل: {leave.reason}
        </p>
      )}

      {leave.status === 'REJECTED' && leave.rejectionReason && (
        <p className="mt-2 text-xs text-red-600 pl-15">
          دلیل رد: {leave.rejectionReason}
        </p>
      )}
    </div>
  );
}