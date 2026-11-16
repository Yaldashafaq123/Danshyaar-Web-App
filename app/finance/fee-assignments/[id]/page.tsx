// app/admin/finance/fee-assignments/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  FileText,
  Loader2,
  AlertCircle,
  User,
  Home,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { financeAssignmentsAPI } from '@/lib/api/finance';
import type { FeeAssignment } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatDate,
  assignmentStatusLabels,
  assignmentStatusColors,
  feeStatusLabels,
  feeStatusColors,
  collectionRateBg,
  getAfghanMonthName,
} from '@/lib/utils/finance-helpers';

export default function FeeAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = Number(params.id);

  const [assignment, setAssignment] = useState<FeeAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isNaN(assignmentId)) {
        setError('شناسه نامعتبر');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await financeAssignmentsAPI.getById(assignmentId);
        setAssignment(res);
      } catch (err: unknown) {
        console.error(err);
        let message = 'خطا در دریافت اطلاعات';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          message = e.response?.data?.message || e.message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !assignment) {
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

  const recurringItems = assignment.feeItems.filter((i) => i.isRecurring);
  const oneTimeItems = assignment.feeItems.filter((i) => !i.isRecurring);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            جزئیات تخصیص #{assignment.id}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {assignment.student?.user?.fullName || 'نامشخص'}
          </p>
        </div>
        <span
          className={`text-sm px-3 py-1.5 rounded-full ${
            assignmentStatusColors[assignment.status] ||
            'bg-gray-100 text-gray-600'
          }`}
        >
          {assignmentStatusLabels[assignment.status] || assignment.status}
        </span>
      </div>

      {/* Student + Year */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">شاگرد</p>
            <p className="font-bold text-gray-900 truncate">
              {assignment.student?.user?.fullName || 'نامشخص'}
            </p>
            {assignment.student?.user?.phone && (
              <p className="text-xs text-gray-500">
                {assignment.student.user.phone}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Home size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">صنف</p>
            <p className="font-bold text-gray-900 truncate">
              {assignment.student?.class
                ? `${assignment.student.class.name} ${assignment.student.class.section || ''}`
                : 'بدون صنف'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Calendar size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">سال تحصیلی</p>
            <p className="font-bold text-gray-900 truncate">
              {assignment.academicYear?.name || '—'}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(assignment.assignedDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Financial summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" />
          خلاصه مالی
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <SummaryBox
            label="مجموع فیس"
            value={formatAFN(assignment.totalAmount)}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <SummaryBox
            label="پرداخت شده"
            value={formatAFN(assignment.totalPaid)}
            color="text-green-600"
            bg="bg-green-50"
          />
          <SummaryBox
            label="باقی‌مانده"
            value={formatAFN(assignment.totalBalance)}
            color={assignment.totalBalance > 0 ? 'text-red-600' : 'text-gray-600'}
            bg={assignment.totalBalance > 0 ? 'bg-red-50' : 'bg-gray-50'}
          />
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">نرخ وصول</p>
            <p className="text-xl font-bold text-purple-600">
              {assignment.collectionRate}%
            </p>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`${collectionRateBg(assignment.collectionRate)} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(assignment.collectionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Recurring items (monthly) */}
      {recurringItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            <h3 className="text-base font-semibold text-gray-900">
              فیس‌های ماهانه
            </h3>
            <span className="text-xs text-gray-500">
              ({recurringItems.length} قلم)
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {recurringItems.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      مبلغ ماهانه: {formatAFN(item.amount)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      feeStatusColors[item.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {feeStatusLabels[item.status] || item.status}
                  </span>
                </div>

                {/* Monthly breakdown */}
                {item.MonthlyFeeRecord && item.MonthlyFeeRecord.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {item.MonthlyFeeRecord.map((rec) => (
                      <div
                        key={rec.id}
                        className={`p-2 rounded-lg text-center border ${
                          rec.status === 'PAID'
                            ? 'bg-green-50 border-green-200'
                            : rec.status === 'PARTIAL'
                            ? 'bg-blue-50 border-blue-200'
                            : rec.status === 'OVERDUE'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <p className="text-xs font-bold text-gray-700">
                          {getAfghanMonthName(rec.month)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {rec.year}
                        </p>
                        <p className="text-xs font-medium text-gray-900 mt-1">
                          {formatAFN(rec.balanceAmount)}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            rec.status === 'PAID'
                              ? 'text-green-600'
                              : rec.status === 'PARTIAL'
                              ? 'text-blue-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {feeStatusLabels[rec.status] || rec.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* One-time items */}
      {oneTimeItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <DollarSign size={18} className="text-purple-500" />
            <h3 className="text-base font-semibold text-gray-900">
              فیس‌های یک‌باره
            </h3>
            <span className="text-xs text-gray-500">
              ({oneTimeItems.length} قلم)
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {oneTimeItems.map((item) => {
              const paid = Number(item.paidAmount || 0);
              const amount = Number(item.finalAmount);
              const balance = amount - paid;
              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <Receipt size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        مبلغ: {formatAFN(amount)} • پرداخت:{' '}
                        {formatAFN(paid)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-xs text-gray-500">باقی‌مانده</p>
                      <p
                        className={`font-bold ${
                          balance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {balance > 0 ? formatAFN(balance) : 'کامل'}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        feeStatusColors[item.status] ||
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {feeStatusLabels[item.status] || item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href={`/admin/finance/fee-collection/student/${assignment.studentId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <DollarSign size={16} />
          وصول فیس
        </Link>

        <Link
          href="/admin/finance/fee-assignments"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          بازگشت به لیست
        </Link>
      </div>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-4`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}