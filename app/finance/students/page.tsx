// app/admin/finance/students/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  User,
  Eye,
  Home,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  financeStudentsAPI,
  financeBulkAPI,
} from '@/lib/api/finance';
import {
  formatAFN,
  formatNumber,
  collectionRateColor,
} from '@/lib/utils/finance-helpers';

interface StudentWithFee {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  classId: number;
  className: string;
  classSection?: string;
  hasFeePlan: boolean;
  feePlanId: number | null;
  feeStatus: string | null;
  balanceAmount: number;
  existingPlans: {
    id: number;
    academicYearId: number;
    AcademicYear: string;
    status: string;
  }[];
}

interface ClassOption {
  id: number;
  name: string;
  section: string;
  studentCount: number;
}

export default function FinanceStudentsPage() {
  const [students, setStudents] = useState<StudentWithFee[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (classFilter) {
        const res = await financeStudentsAPI.getByClass(Number(classFilter));
        setStudents(res as StudentWithFee[]);
      } else {
        // No class selected — fetch classes and show empty
        setStudents([]);
      }
    } catch (err: unknown) {
      console.error('❌ [Finance Students] Error:', err);
      let message = 'خطا در دریافت شاگردان';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [classFilter]);

  useEffect(() => {
    financeBulkAPI
      .getClasses()
      .then(setClasses)
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q))
    );
  });

  const totals = {
    withPlan: students.filter((s) => s.hasFeePlan).length,
    withBalance: students.filter((s) => s.balanceAmount > 0).length,
    totalBalance: students.reduce((s, st) => s + st.balanceAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-500" size={26} />
            شاگردان و فیس
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            مشاهده وضعیت فیس شاگردان
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {/* Class picker */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          انتخاب صنف
        </label>
        {classes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            در حال بارگذاری صنوف...
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setClassFilter(String(c.id))}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg text-sm transition-colors ${
                  classFilter === String(c.id)
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home size={16} />
                <span className="text-xs font-medium">
                  {c.name} {c.section}
                </span>
                <span className="text-[10px] opacity-70">
                  {formatNumber(c.studentCount)} شاگرد
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {classFilter && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">
              شاگردان دارای تخصیص فیس
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(totals.withPlan)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">شاگردان دارای معوق</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatNumber(totals.withBalance)}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">مجموع معوقات</p>
            <p className="text-2xl font-bold text-red-600">
              {formatAFN(totals.totalBalance)}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Content */}
      {!classFilter ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Home className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            برای مشاهده شاگردان، ابتدا یک صنف انتخاب کنید
          </p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">شاگردی در این صنف نیست</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="جستجوی شاگرد..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شاگرد
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    وضعیت فیس
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    باقی‌مانده
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {s.name}
                          </p>
                          {s.phone && (
                            <p className="text-xs text-gray-500">{s.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.hasFeePlan ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle size={10} />
                          {s.feeStatus === 'ACTIVE'
                            ? 'فعال'
                            : s.feeStatus === 'COMPLETED'
                            ? 'تکمیل شده'
                            : s.feeStatus}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          <XCircle size={10} />
                          بدون فیس
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-semibold ${collectionRateColor(
                          s.balanceAmount > 0 ? 0 : 100
                        )}`}
                      >
                        {s.balanceAmount > 0
                          ? formatAFN(s.balanceAmount)
                          : 'کامل'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/finance/fee-collection/student/${s.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100"
                        >
                          <DollarSign size={12} />
                          فیس
                        </Link>
                        {s.feePlanId && (
                          <Link
                            href={`/admin/finance/fee-assignments/${s.feePlanId}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                          >
                            <Eye size={12} />
                            تخصیص
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}