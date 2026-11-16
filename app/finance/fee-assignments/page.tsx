// app/admin/finance/fee-assignments/page.tsx
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
  User,
  Eye,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  financeAssignmentsAPI,
  financeAcademicYearsAPI,
} from '@/lib/api/finance';
import { financeBulkAPI } from '@/lib/api/finance';
import type { FeeAssignment, AcademicYear } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatDate,
  assignmentStatusLabels,
  assignmentStatusColors,
  collectionRateColor,
  collectionRateBg,
} from '@/lib/utils/finance-helpers';

interface ClassOption {
  id: number;
  name: string;
  section: string;
  studentCount: number;
}

export default function FeeAssignmentsPage() {
  const [assignments, setAssignments] = useState<FeeAssignment[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeAssignmentsAPI.list({
        classId: classFilter ? Number(classFilter) : undefined,
        academicYearId: yearFilter ? Number(yearFilter) : undefined,
        status: statusFilter || undefined,
      });
      setAssignments(res);
    } catch (err: unknown) {
      console.error('❌ [Fee Assignments] Error:', err);
      let message = 'خطا در دریافت تخصیص‌های فیس';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [classFilter, yearFilter, statusFilter]);

  useEffect(() => {
    Promise.all([
      financeAcademicYearsAPI.list().catch(() => []),
      financeBulkAPI.getClasses().catch(() => []),
    ]).then(([y, c]) => {
      setYears(y);
      setClasses(c);
      const activeYear = y.find((x) => x.isActive);
      if (activeYear) setYearFilter(String(activeYear.id));
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setProcessing(true);
      await financeAssignmentsAPI.delete(deleteId);
      setDeleteId(null);
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در حذف';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
      setDeleteId(null);
    } finally {
      setProcessing(false);
    }
  };

  const filtered = assignments.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = a.student?.user?.fullName?.toLowerCase() || '';
    const phone = a.student?.user?.phone?.toLowerCase() || '';
    return name.includes(s) || phone.includes(s);
  });

  const totals = filtered.reduce(
    (acc, a) => ({
      amount: acc.amount + a.totalAmount,
      paid: acc.paid + a.totalPaid,
      balance: acc.balance + a.totalBalance,
    }),
    { amount: 0, paid: 0, balance: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-500" size={26} />
            تخصیص‌های فیس
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length.toLocaleString('fa-IR')} تخصیص
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
            href="/admin/finance/fee-assignments/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} />
            تخصیص جدید
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="مجموع فیس"
          value={formatAFN(totals.amount)}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <SummaryCard
          label="پرداخت شده"
          value={formatAFN(totals.paid)}
          color="text-green-600"
          bg="bg-green-50"
        />
        <SummaryCard
          label="باقی‌مانده"
          value={formatAFN(totals.balance)}
          color="text-red-600"
          bg="bg-red-50"
        />
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
              placeholder="جستجوی نام شاگرد یا شماره تلفن..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">همه صنوف</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="ACTIVE">فعال</option>
            <option value="COMPLETED">تکمیل شده</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="CANCELLED">لغو شده</option>
          </select>
        </div>

        {years.length > 0 && (
          <div className="mt-3">
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
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">هیچ تخصیصی یافت نشد</p>
            <Link
              href="/admin/finance/fee-assignments/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus size={16} />
              ایجاد اولین تخصیص
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شاگرد
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    صنف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    سال تحصیلی
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    مجموع
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    باقی‌مانده
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    نرخ
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
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {a.student?.user?.fullName || 'نامشخص'}
                          </p>
                          {a.student?.user?.phone && (
                            <p className="text-xs text-gray-500">
                              {a.student.user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {a.student?.class
                        ? `${a.student.class.name} ${a.student.class.section || ''}`
                        : 'بدون صنف'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {a.academicYear?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatAFN(a.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">
                      {formatAFN(a.totalBalance)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${collectionRateBg(a.collectionRate)}`}
                            style={{
                              width: `${Math.min(a.collectionRate, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${collectionRateColor(
                            a.collectionRate
                          )}`}
                        >
                          {a.collectionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          assignmentStatusColors[a.status] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {assignmentStatusLabels[a.status] || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/finance/fee-assignments/${a.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="مشاهده"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(a.id)}
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
      </div>

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">حذف تخصیص</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              اگر پرداختی برای این تخصیص ثبت شده باشد، به‌جای حذف، لغو
              خواهد شد.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={processing}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={processing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {processing ? (
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

function SummaryCard({
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
    <div className={`${bg} rounded-xl p-4`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}