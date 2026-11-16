// app/admin/finance/fee-collection/student/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  DollarSign,
  Loader2,
  AlertCircle,
  User,
  FileText,
  Receipt,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { financeStudentsAPI } from '@/lib/api/finance';
import type { StudentFeeInfo } from '@/types/finance';
import {
  formatAFN,
  formatDate,
  paymentMethodLabels,
  classTimeLabels,
} from '@/lib/utils/finance-helpers';

interface PaymentHistoryRow {
  id: number;
  date: string;
  month: string;
  monthName: string;
  year: number;
  tuitionFee: number;
  transportFee: number;
  otherFees: number;
  discount: number;
  payment: number;
  balance: number;
  details: string;
  billNo: string;
  confirmedBy: string;
  paymentMethod: string;
}

export default function StudentFeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params.id);

  const [info, setInfo] = useState<StudentFeeInfo | null>(null);
  const [history, setHistory] = useState<PaymentHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isNaN(studentId)) {
        setError('شناسه نامعتبر');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [feeInfo, hist] = await Promise.all([
          financeStudentsAPI.getFeeInfo(studentId),
          financeStudentsAPI.getFeeHistory(studentId).catch(() => []),
        ]);
        setInfo(feeInfo);
        setHistory(hist as PaymentHistoryRow[]);
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
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (error || !info) {
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

  const feeDetails = info.feeDetails;
  const collectionRate =
    feeDetails.totalFees > 0
      ? Math.round((feeDetails.paidAmount / feeDetails.totalFees) * 100)
      : 0;

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
            {info.student.fullName}
          </h1>
          <p className="text-gray-500 text-sm">
            {info.student.class.name}
            {info.student.class.section && ` - ${info.student.class.section}`}
          </p>
        </div>
        <Link
          href="/admin/finance/fee-collection"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
        >
          <DollarSign size={16} />
          وصول فیس
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryBox
          label="کل فیس"
          value={feeDetails.totalFees}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <SummaryBox
          label="پرداخت شده"
          value={feeDetails.paidAmount}
          color="text-green-600"
          bg="bg-green-50"
        />
        <SummaryBox
          label="باقی‌مانده"
          value={feeDetails.balance}
          color={feeDetails.balance > 0 ? 'text-red-600' : 'text-gray-600'}
          bg={feeDetails.balance > 0 ? 'bg-red-50' : 'bg-gray-50'}
        />
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-purple-600" />
            <p className="text-xs text-gray-600">نرخ وصول</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {collectionRate}%
          </p>
        </div>
      </div>

      {/* Student info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          اطلاعات شاگرد
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <InfoRow
            label="نام پدر"
            value={info.student.fatherName || '—'}
            icon={User}
          />
          <InfoRow
            label="شماره تماس"
            value={info.student.phone || '—'}
            icon={User}
          />
          <InfoRow
            label="نوبت"
            value={classTimeLabels[info.student.classTime] || '—'}
            icon={Calendar}
          />
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Receipt size={18} className="text-gray-500" />
          <h3 className="text-base font-semibold text-gray-900">
            سابقه پرداخت‌ها
          </h3>
          <span className="text-xs text-gray-500 ml-2">
            ({history.length} مورد)
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500 text-sm">
              پرداختی ثبت نشده است
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تاریخ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    دوره
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    مبلغ
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    روش
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شماره رسید
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    ثبت کننده
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(h.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {h.monthName && h.year
                        ? `${h.monthName} ${h.year}`
                        : 'یک‌باره'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                      {formatAFN(h.payment)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {paymentMethodLabels[h.paymentMethod] || h.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {h.billNo || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {h.confirmedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{formatAFN(value)}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-gray-400" />
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}