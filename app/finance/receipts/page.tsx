// app/admin/finance/receipts/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Printer,
  User,
  Calendar,
  Filter,
  Eye,
  X,
} from 'lucide-react';
import { financePaymentsAPI } from '@/lib/api/finance';
import type { Payment } from '@/types/finance';
import {
  formatAFN,
  formatDate,
  formatNumber,
  paymentMethodLabels,
} from '@/lib/utils/finance-helpers';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [previewReceipt, setPreviewReceipt] = useState<Payment | null>(null);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financePaymentsAPI.getHistory({
        search: search || undefined,
        page: 1,
        limit: 50,
      });
      setReceipts(res.payments);
    } catch (err: unknown) {
      console.error('❌ [Receipts] Error:', err);
      let message = 'خطا در دریافت رسیدها';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handlePrint = (receipt: Payment) => {
    setPreviewReceipt(receipt);
  };

  const handleActualPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="text-blue-500" size={26} />
            رسیدها
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            مشاهده و چاپ رسیدهای پرداخت
          </p>
        </div>
        <button
          onClick={fetchReceipts}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی رسید بر اساس نام شاگرد یا شماره رسید..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
        </div>
      ) : receipts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Receipt className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">رسیدی یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((r) => (
            <div
              key={`${r.type}-${r.id}`}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">شماره رسید</p>
                    <p className="text-sm font-bold text-gray-900">
                      {r.referenceNo || `#${r.id}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    r.type === 'monthly'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {r.type === 'monthly' ? 'ماهانه' : 'یک‌باره'}
                </span>
              </div>

              <div className="space-y-1.5 mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <User size={12} className="text-gray-400" />
                  <span className="text-gray-700 font-medium truncate">
                    {r.studentName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatDate(r.date)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {r.feeTitle}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-lg font-bold text-emerald-600">
                  {formatAFN(r.amount)}
                </p>
                <button
                  onClick={() => handlePrint(r)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100"
                >
                  <Printer size={12} />
                  چاپ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <h3 className="text-lg font-bold text-gray-900">
                پیش‌نمایش رسید
              </h3>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt content */}
            <div id="receipt-print" className="space-y-4">
              <div className="text-center border-b border-dashed border-gray-300 pb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  مکتب عصرا
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  رسید پرداخت فیس
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <ReceiptRow label="شماره رسید" value={previewReceipt.referenceNo || `#${previewReceipt.id}`} />
                <ReceiptRow label="تاریخ" value={formatDate(previewReceipt.date)} />
                <ReceiptRow label="شاگرد" value={previewReceipt.studentName} />
                <ReceiptRow label="صنف" value={previewReceipt.className} />
                <ReceiptRow label="نوع فیس" value={previewReceipt.feeTitle} />
                <ReceiptRow
                  label="روش پرداخت"
                  value={paymentMethodLabels[previewReceipt.paymentMethod] || previewReceipt.paymentMethod}
                />
                <ReceiptRow label="ثبت کننده" value={previewReceipt.confirmedBy} />
              </div>

              <div className="border-t border-dashed border-gray-300 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">مبلغ کل:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatAFN(previewReceipt.amount)}
                  </span>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-gray-300">
                <p className="text-xs text-gray-400">
                  با تشکر از همکاری شما
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 print:hidden">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                بستن
              </button>
              <button
                onClick={handleActualPrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <Printer size={14} />
                چاپ رسید
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-900 font-medium text-left">{value}</span>
    </div>
  );
}