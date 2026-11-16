// app/admin/hr/id-cards/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Search,
  User,
  Printer,
  Plus,
  Calendar,
  QrCode,
} from 'lucide-react';
import { hrIdCardsAPI, hrStaffAPI } from '@/lib/api/hr';
import type { IdCard, StaffMember } from '@/types/hr';
import {
  formatShamsiDate,
  formatNumber,
} from '@/lib/utils/hr-helpers';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'در انتظار',
  ACTIVE: 'فعال',
  EXPIRED: 'منقضی',
  LOST: 'گم شده',
  DAMAGED: 'خراب',
  CANCELLED: 'لغو شده',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
  LOST: 'bg-red-100 text-red-700',
  DAMAGED: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function IdCardsPage() {
  const [cards, setCards] = useState<IdCard[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    expiryDate: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrIdCardsAPI.list({
        status: statusFilter || undefined,
        limit: 200,
      });
      setCards(res.cards);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت کارت‌ها';
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
    setForm({ userId: '', expiryDate: '' });
    setCreateOpen(true);
    setError(null);
  };

  const handleCreate = async () => {
    if (!form.userId) {
      setError('لطفاً کارمند را انتخاب کنید');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await hrIdCardsAPI.create({
        userId: Number(form.userId),
        expiryDate: form.expiryDate || undefined,
      });
      setSuccess('کارت شناسایی ایجاد شد');
      setCreateOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ایجاد کارت';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async (id: number) => {
    try {
      setProcessing(id);
      await hrIdCardsAPI.print(id);
      setSuccess('کارت چاپ شد و فعال گردید');
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('خطا در چاپ کارت');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = cards.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.User.fullName.toLowerCase().includes(q) ||
      c.cardNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-pink-500" size={26} />
            کارت‌های شناسایی
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {formatNumber(cards.length)} کارت ثبت شده
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            کارت جدید
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو نام یا شماره کارت..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CreditCard className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">کارتی یافت نشد</p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            ایجاد اولین کارت
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden flex-shrink-0">
                    {card.User.profileImage ? (
                      <img
                        src={card.User.profileImage}
                        alt={card.User.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={22} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {card.User.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {card.User.role}
                    </p>
                  </div>
                </div>
                <QrCode size={18} className="text-gray-300 flex-shrink-0" />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">شماره کارت:</span>
                  <span className="font-mono font-medium text-gray-900">
                    {card.cardNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاریخ صدور:</span>
                  <span className="text-gray-700">
                    {formatShamsiDate(card.issueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاریخ انقضا:</span>
                  <span className="text-gray-700">
                    {formatShamsiDate(card.expiryDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    STATUS_COLORS[card.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {STATUS_LABELS[card.status] || card.status}
                </span>

                {card.status === 'PENDING' && (
                  <button
                    onClick={() => handlePrint(card.id)}
                    disabled={processing === card.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white rounded-lg text-xs hover:bg-pink-700 disabled:opacity-50"
                  >
                    {processing === card.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Printer size={12} />
                    )}
                    چاپ
                  </button>
                )}

                {card.status === 'ACTIVE' && card.printedAt && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} />
                    چاپ شده
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                ایجاد کارت شناسایی
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
                  تاریخ انقضا (اختیاری)
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm({ ...form, expiryDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  اگر خالی بگذارید، یک سال از امروز در نظر گرفته می‌شود
                </p>
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                ایجاد کارت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}