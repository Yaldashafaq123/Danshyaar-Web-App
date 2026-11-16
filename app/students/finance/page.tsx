// app/student/finance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  TrendingDown,
  Receipt,
  Download,
  Info,
  Wallet,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { financeStudentsAPI } from '@/lib/api/finance';
import type { StudentFeeInfo } from '@/types/finance';
import { useAuthStore } from '@/lib/store/authStore';
import { formatShamsiDate } from '@/lib/utils/student-helpers';
import {
  formatAFN,
  getAfghanMonthName,
  feeStatusLabels,
  feeStatusColors,
} from '@/lib/utils/finance-helpers';

export default function StudentFinancePage() {
  const { user } = useAuthStore();
  const [info, setInfo] = useState<StudentFeeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The student's own ID — we may need to fetch it from profile first
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get student profile to find student ID
        const { studentProfileAPI } = await import('@/lib/api/student-portal');
        const profile = await studentProfileAPI.getProfile();
        const sid = profile.student.id;
        setStudentId(sid);

        // Fetch fee info
        const feeInfo = await financeStudentsAPI.getFeeInfo(sid);
        setInfo(feeInfo);
      } catch (err: unknown) {
        console.error(err);
        let message = 'خطا در دریافت اطلاعات مالی';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          message = e.response?.data?.message || e.message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-700">
            خطا در بارگذاری
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error || 'اطلاعاتی یافت نشد'}</p>
      </div>
    );
  }

  const feeDetails = info.feeDetails;
  const collectionRate =
    feeDetails.totalFees > 0
      ? Math.round((feeDetails.paidAmount / feeDetails.totalFees) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={26} />
            وضعیت مالی
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            فقط مشاهده — برای ویرایش با مالی مکتب تماس بگیرید
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
          <Info size={14} />
          حالت فقط-خواندن
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-blue-600" />
            <p className="text-xs text-gray-600">مجموع فیس</p>
          </div>
          <p className="text-xl font-bold text-blue-600">
            {formatAFN(feeDetails.totalFees)}
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-xs text-gray-600">پرداخت شده</p>
          </div>
          <p className="text-xl font-bold text-green-600">
            {formatAFN(feeDetails.paidAmount)}
          </p>
        </div>

        <div
          className={`rounded-xl p-4 ${
            feeDetails.balance > 0 ? 'bg-red-50' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              size={16}
              className={
                feeDetails.balance > 0 ? 'text-red-600' : 'text-gray-400'
              }
            />
            <p className="text-xs text-gray-600">باقی‌مانده</p>
          </div>
          <p
            className={`text-xl font-bold ${
              feeDetails.balance > 0 ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {formatAFN(feeDetails.balance)}
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-purple-600" />
            <p className="text-xs text-gray-600">نرخ پرداخت</p>
          </div>
          <p className="text-xl font-bold text-purple-600">
            {collectionRate}%
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            پیشرفت پرداخت
          </h3>
          <span className="text-2xl font-bold text-emerald-600">
            {collectionRate}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>

      {/* Fee breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt size={18} className="text-indigo-500" />
          تفکیک فیس
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FeeBox label="شهریه" value={feeDetails.tuitionFee} color="blue" />
          <FeeBox
            label="حمل و نقل"
            value={feeDetails.transportFee}
            color="cyan"
          />
          <FeeBox label="پذیرش" value={feeDetails.admissionFee} color="orange" />
          <FeeBox label="سایر" value={feeDetails.otherFees} color="gray" />
        </div>
      </div>

      {/* Monthly fees */}
      {info.monthlyFees.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" />
              فیس‌های ماهانه
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {info.monthlyFees.map((fee) => (
              <div
                key={fee.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                    {fee.monthName}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {fee.monthName} {fee.year}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatAFN(fee.paid)} از {formatAFN(fee.amount)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      fee.balance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {fee.balance > 0 ? formatAFN(fee.balance) : 'پرداخت شده'}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      feeStatusColors[fee.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {feeStatusLabels[fee.status] || fee.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">یادداشت</p>
          <p>
            این صفحه فقط برای مشاهده وضعیت مالی شماست. برای پرداخت، تخفیف یا
            هرگونه سؤال مالی، لطفاً با بخش مالی مکتب تماس بگیرید یا والدین خود
            را راهنمایی کنید.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeeBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'cyan' | 'orange' | 'gray';
}) {
  const colorMap = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50' },
    cyan: { text: 'text-cyan-600', bg: 'bg-cyan-50' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50' },
    gray: { text: 'text-gray-600', bg: 'bg-gray-50' },
  }[color];

  return (
    <div className={`${colorMap.bg} rounded-lg p-3`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-base font-bold ${colorMap.text}`}>
        {formatAFN(value)}
      </p>
    </div>
  );
}