// app/admin/finance/discounts/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Percent,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  DollarSign,
  Plus,
  X,
  Save,
  FileText,
  Users,
  TrendingDown,
} from 'lucide-react';
import {
  financeDiscountsAPI,
  financeAssignmentsAPI,
  financeStudentsAPI,
} from '@/lib/api/finance';
import type { FeeAssignment } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatDate,
} from '@/lib/utils/finance-helpers';

interface StudentResult {
  id: number;
  userId: number;
  classId: number;
  status: string;
  user: { fullName: string; email: string; phone: string };
  class: { id: number; name: string; section: string | null } | null;
}

export default function DiscountsPage() {
  const [assignments, setAssignments] = useState<FeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(
    null
  );
  const [studentAssignments, setStudentAssignments] = useState<FeeAssignment[]>(
    []
  );
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(
    null
  );
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [form, setForm] = useState({
    amount: '',
    reason: '',
  });
  const [saving, setSaving] = useState(false);

  // Fetch all assignments (which contain discount data)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeAssignmentsAPI.list({});
      setAssignments(res);
    } catch (err: unknown) {
      console.error('❌ [Discounts] Error:', err);
      let message = 'خطا در دریافت تخفیفات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced student search
  useEffect(() => {
    if (!studentQuery || studentQuery.length < 2) {
      setStudentResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await financeStudentsAPI.search(studentQuery);
        setStudentResults(res);
      } catch {
        setStudentResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [studentQuery]);

  const openModal = () => {
    setModalOpen(true);
    setStudentQuery('');
    setStudentResults([]);
    setSelectedStudent(null);
    setStudentAssignments([]);
    setSelectedAssignmentId(null);
    setSelectedItemId(null);
    setForm({ amount: '', reason: '' });
    setError(null);
    setSuccess(null);
  };

  const pickStudent = async (s: StudentResult) => {
    setSelectedStudent(s);
    setStudentResults([]);
    setLoadingAssignments(true);
    try {
      const res = await financeAssignmentsAPI.list({
        studentId: s.id,
        status: 'ACTIVE',
      });
      setStudentAssignments(res);
      if (res.length > 0) {
        setSelectedAssignmentId(res[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleApply = async () => {
    if (!selectedAssignmentId) {
      setError('تخصیص فیس انتخاب نشده');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('مبلغ تخفیف باید بزرگتر از صفر باشد');
      return;
    }
    if (!form.reason.trim()) {
      setError('دلیل تخفیف الزامی است');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await financeDiscountsAPI.apply({
        feeAssignmentId: selectedAssignmentId,
        feeAssignmentItemId: selectedItemId || undefined,
        amount: Number(form.amount),
        reason: form.reason,
      });

      setSuccess(`تخفیف ${formatAFN(Number(form.amount))} با موفقیت اعمال شد`);
      setModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در اعمال تخفیف';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // Compute discount stats per assignment
  const enrichedAssignments = assignments
    .map((a) => {
      const discounts = (a as unknown as {
        studentDiscounts?: {
          id: number;
          amount: number;
          reason: string;
          createdAt: string;
          User?: { fullName: string };
        }[];
      }).studentDiscounts || [];
      const totalDiscount = discounts.reduce(
        (sum, d) => sum + Number(d.amount),
        0
      );
      return { assignment: a, discounts, totalDiscount };
    })
    .filter((x) => x.totalDiscount > 0);

  const filtered = enrichedAssignments.filter((x) => {
    if (!search) return true;
    const name = x.assignment.student?.user?.fullName?.toLowerCase() || '';
    const phone = x.assignment.student?.user?.phone?.toLowerCase() || '';
    const q = search.toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const grandTotal = filtered.reduce((s, x) => s + x.totalDiscount, 0);
  const totalStudents = new Set(filtered.map((x) => x.assignment.studentId))
    .size;

  const selectedAssignment = studentAssignments.find(
    (a) => a.id === selectedAssignmentId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Percent className="text-pink-500" size={26} />
            تخفیف‌ها و بورسیه
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            اعمال و مدیریت تخفیفات فیس
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
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            تخفیف جدید
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-pink-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-pink-600" />
            <p className="text-xs text-gray-600">مجموع تخفیفات</p>
          </div>
          <p className="text-2xl font-bold text-pink-600">
            {formatAFN(grandTotal)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-blue-600" />
            <p className="text-xs text-gray-600">شاگردان با تخفیف</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatNumber(totalStudents)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-purple-600" />
            <p className="text-xs text-gray-600">تعداد تخفیف‌ها</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatNumber(
              enrichedAssignments.reduce(
                (s, x) => s + x.discounts.length,
                0
              )
            )}
          </p>
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی شاگرد با تخفیف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Percent className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            هنوز تخفیفی اعمال نشده
          </p>
          <button
            onClick={openModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            اعمال اولین تخفیف
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                    مبلغ تخفیف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تعداد
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    آخری
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(({ assignment, discounts, totalDiscount }) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.student?.user?.fullName || 'نامشخص'}
                          </p>
                          {assignment.student?.user?.phone && (
                            <p className="text-xs text-gray-500">
                              {assignment.student.user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {assignment.student?.class
                        ? `${assignment.student.class.name} ${assignment.student.class.section || ''}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-pink-600">
                      {formatAFN(totalDiscount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatNumber(discounts.length)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {discounts[0]
                        ? formatDate(discounts[0].createdAt)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply discount modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  اعمال تخفیف جدید
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  انتخاب شاگرد و ثبت تخفیف
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Student picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                شاگرد
              </label>

              {selectedStudent ? (
                <div className="flex items-center justify-between p-3 bg-pink-50 border border-pink-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {selectedStudent.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedStudent.class
                          ? `${selectedStudent.class.name} ${selectedStudent.class.section || ''}`
                          : 'بدون صنف'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentQuery('');
                      setStudentAssignments([]);
                      setSelectedAssignmentId(null);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="نام یا شماره تلفن..."
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  {searching && (
                    <Loader2
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500 animate-spin"
                    />
                  )}

                  {studentResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {studentResults.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => pickStudent(s)}
                          className="w-full flex items-center gap-2 p-2.5 hover:bg-gray-50 text-right border-b border-gray-100 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <User size={12} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {s.user.fullName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {s.class
                                ? `${s.class.name} ${s.class.section || ''}`
                                : 'بدون صنف'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Assignment + item selector */}
            {selectedStudent && loadingAssignments && (
              <div className="p-4 text-center">
                <Loader2 className="animate-spin text-pink-500 mx-auto" size={24} />
              </div>
            )}

            {selectedStudent && !loadingAssignments && studentAssignments.length === 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                این شاگرد تخصیص فیس فعالی ندارد. ابتدا یک تخصیص ایجاد کنید.
              </div>
            )}

            {selectedStudent && !loadingAssignments && studentAssignments.length > 0 && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    تخصیص فیس *
                  </label>
                  <select
                    value={selectedAssignmentId || ''}
                    onChange={(e) => {
                      setSelectedAssignmentId(Number(e.target.value));
                      setSelectedItemId(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {studentAssignments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.academicYear?.name || 'تخصیص'} — باقی‌مانده:{' '}
                        {formatAFN(a.totalBalance)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item selector (optional) */}
                {selectedAssignment && selectedAssignment.feeItems.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      قلم خاص (اختیاری)
                    </label>
                    <select
                      value={selectedItemId || ''}
                      onChange={(e) =>
                        setSelectedItemId(e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">تخفیف روی کل تخصیص</option>
                      {selectedAssignment.feeItems
                        .filter((i) => i.status !== 'CANCELLED')
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} — {formatAFN(item.finalAmount)}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Amount + Reason */}
            {selectedAssignmentId && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    مبلغ تخفیف *
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    دلیل تخفیف *
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    rows={3}
                    placeholder="مثال: یتیم، بورسیه علمی، تخفیف خانوادگی..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleApply}
                disabled={saving || !selectedAssignmentId}
                className="inline-flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                اعمال تخفیف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}