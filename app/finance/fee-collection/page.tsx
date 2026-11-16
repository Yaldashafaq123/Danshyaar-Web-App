// app/admin/finance/fee-collection/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  DollarSign,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Users,
  X,
  Save,
  Receipt,
  Building2,
  CreditCard,
  Wallet,
  ChevronLeft,
  Calendar,
  FileText,
} from 'lucide-react';
import {
  financeStudentsAPI,
  financePaymentsAPI,
  financeAcademicYearsAPI,
  financeMiscAPI,
} from '@/lib/api/finance';
import type {
  StudentFeeInfo,
  AcademicYear,
  AfghanMonthOption,
  PaymentMethod,
} from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatDate,
  paymentMethodLabels,
  classTimeLabels,
} from '@/lib/utils/finance-helpers';

interface SearchResult {
  id: number;
  userId: number;
  classId: number;
  status: string;
  studentNumber?: string;
  user: { fullName: string; email: string; phone: string };
  class: { id: number; name: string; section: string | null } | null;
}

export default function FeeCollectionPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<StudentFeeInfo | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [afghanMonths, setAfghanMonths] = useState<AfghanMonthOption[]>([]);

  // Payment modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    month: '',
    year: new Date().getFullYear() - 621,
    tuitionFee: '0',
    transportFee: '0',
    otherFees: '0',
    admissionFee: '0',
    discount: '0',
    payment: '0',
    paymentMethod: 'CASH' as PaymentMethod,
    details: '',
    billNo: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load dropdown data once
  useEffect(() => {
    Promise.all([
      financeAcademicYearsAPI.list().catch(() => []),
      financeMiscAPI.getAfghanMonths().catch(() => []),
    ]).then(([years, months]) => {
      setAcademicYears(years);
      setAfghanMonths(months);
      const activeYear = years.find((y) => y.isActive);
      const currentMonth = months.find((m) => m.isCurrent);
      setPayForm((f) => ({
        ...f,
        month: currentMonth ? String(currentMonth.number) : '1',
      }));
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError(null);
        const res = await financeStudentsAPI.search(query);
        setResults(res);
      } catch (err) {
        console.error(err);
        setSearchError('خطا در جستجو');
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const loadStudentDetail = async (studentId: number) => {
    try {
      setLoadingDetail(true);
      setError(null);
      const info = await financeStudentsAPI.getFeeInfo(studentId);
      setSelectedStudent(info);

      // Pre-fill payment form
      const activeYear = academicYears.find((y) => y.isActive);
      const currentMonth = afghanMonths.find((m) => m.isCurrent);
      setPayForm((f) => ({
        ...f,
        year: activeYear ? new Date(activeYear.startDate).getFullYear() - 621 : f.year,
        month: currentMonth ? String(currentMonth.number) : f.month,
        tuitionFee: String(info.feeDetails.tuitionFee || 0),
        transportFee: String(info.feeDetails.transportFee || 0),
        otherFees: String(info.feeDetails.otherFees || 0),
        admissionFee: String(info.feeDetails.admissionFee || 0),
        discount: '0',
        payment: String(info.feeDetails.balance || 0),
      }));
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات شاگرد';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openPayModal = () => {
    setError(null);
    setSuccess(null);
    setPayModalOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedStudent) return;

    const activeYear = academicYears.find((y) => y.isActive);
    if (!activeYear) {
      setError('سال تحصیلی فعال یافت نشد. ابتدا یک سال تحصیلی فعال تعیین کنید.');
      return;
    }

    if (!payForm.month || !payForm.year) {
      setError('ماه و سال الزامی است');
      return;
    }

    const paymentAmount = Number(payForm.payment);
    if (paymentAmount <= 0) {
      setError('مبلغ پرداخت باید بزرگتر از صفر باشد');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await financePaymentsAPI.recordStudentFeePayment({
        studentId: selectedStudent.student.id,
        academicYearId: activeYear.id,
        month: Number(payForm.month),
        year: Number(payForm.year),
        tuitionFee: Number(payForm.tuitionFee) || 0,
        transportFee: Number(payForm.transportFee) || 0,
        otherFees: Number(payForm.otherFees) || 0,
        admissionFee: Number(payForm.admissionFee) || 0,
        discount: Number(payForm.discount) || 0,
        payment: paymentAmount,
        paymentMethod: payForm.paymentMethod,
        details: payForm.details || undefined,
        billNo: payForm.billNo || undefined,
      });

      setSuccess(
        `پرداخت ${formatAFN(paymentAmount)} با موفقیت ثبت شد`
      );
      setPayModalOpen(false);

      // Reload student
      await loadStudentDetail(selectedStudent.student.id);

      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ثبت پرداخت';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const generateBillNo = async () => {
    try {
      const res = await financePaymentsAPI.getBillNumber();
      setPayForm((f) => ({ ...f, billNo: res.billNo }));
    } catch {
      // Silent — bill number is optional
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={26} />
            وصول فیس
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            جستجو، مشاهده و ثبت پرداخت فیس شاگردان
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/finance/fee-collection/bulk"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Users size={16} />
            وصول گروهی
          </Link>
          {selectedStudent && (
            <button
              onClick={() => {
                setSelectedStudent(null);
                setQuery('');
                setResults([]);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              <X size={16} />
              پاک کردن
            </button>
          )}
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
      {!selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            جستجوی شاگرد
          </label>
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام، ایمیل یا شماره شاگرد را وارد کنید..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            {searching && (
              <Loader2
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin"
              />
            )}
          </div>

          {/* Results */}
          {searchError && (
            <p className="mt-3 text-sm text-red-600">{searchError}</p>
          )}

          {query.length >= 2 && !searching && results.length === 0 && (
            <div className="mt-4 p-8 text-center">
              <User className="mx-auto text-gray-300" size={40} />
              <p className="mt-2 text-sm text-gray-500">
                شاگردی یافت نشد
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadStudentDetail(r.id)}
                  disabled={loadingDetail}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-right disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {r.user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r.class
                        ? `${r.class.name} ${r.class.section || ''}`
                        : 'بدون صنف'}{' '}
                      • {r.user.phone || r.user.email}
                    </p>
                  </div>
                  <ChevronLeft
                    size={18}
                    className="text-gray-400 flex-shrink-0"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading detail */}
      {loadingDetail && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto" size={32} />
          <p className="mt-3 text-gray-500 text-sm">
            در حال بارگذاری اطلاعات فیس...
          </p>
        </div>
      )}

      {/* Student Fee Detail */}
      {selectedStudent && !loadingDetail && (
        <StudentFeePanel
          info={selectedStudent}
          onCollect={openPayModal}
        />
      )}

      {/* Payment Modal */}
      {payModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  ثبت پرداخت
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedStudent.student.fullName}
                </p>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ماه *
                  </label>
                  <select
                    value={payForm.month}
                    onChange={(e) =>
                      setPayForm({ ...payForm, month: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {afghanMonths.length === 0 ? (
                      <option value="">حمل</option>
                    ) : (
                      afghanMonths.map((m) => (
                        <option key={m.key} value={m.number}>
                          {m.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    سال *
                  </label>
                  <input
                    type="number"
                    value={payForm.year}
                    onChange={(e) =>
                      setPayForm({ ...payForm, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="شهریه"
                  type="number"
                  value={payForm.tuitionFee}
                  onChange={(v) => setPayForm({ ...payForm, tuitionFee: v })}
                />
                <FormInput
                  label="حمل و نقل"
                  type="number"
                  value={payForm.transportFee}
                  onChange={(v) => setPayForm({ ...payForm, transportFee: v })}
                />
                <FormInput
                  label="سایر مصارف"
                  type="number"
                  value={payForm.otherFees}
                  onChange={(v) => setPayForm({ ...payForm, otherFees: v })}
                />
                <FormInput
                  label="هزینه پذیرش"
                  type="number"
                  value={payForm.admissionFee}
                  onChange={(v) => setPayForm({ ...payForm, admissionFee: v })}
                />
                <FormInput
                  label="تخفیف"
                  type="number"
                  value={payForm.discount}
                  onChange={(v) => setPayForm({ ...payForm, discount: v })}
                />
                <FormInput
                  label="مبلغ پرداخت *"
                  type="number"
                  value={payForm.payment}
                  onChange={(v) => setPayForm({ ...payForm, payment: v })}
                  highlight
                />
              </div>

              {/* Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  روش پرداخت
                </label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(paymentMethodLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bill No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  شماره رسید
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={payForm.billNo}
                    onChange={(e) =>
                      setPayForm({ ...payForm, billNo: e.target.value })
                    }
                    placeholder="اختیاری"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={generateBillNo}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 whitespace-nowrap"
                  >
                    تولید خودکار
                  </button>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  یادداشت
                </label>
                <textarea
                  value={payForm.details}
                  onChange={(e) =>
                    setPayForm({ ...payForm, details: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPayModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handlePayment}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                ثبت پرداخت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StudentFeePanel({
  info,
  onCollect,
}: {
  info: StudentFeeInfo;
  onCollect: () => void;
}) {
  const feeDetails = info.feeDetails;
  const collectionRate =
    feeDetails.totalFees > 0
      ? Math.round((feeDetails.paidAmount / feeDetails.totalFees) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Student header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 overflow-hidden flex-shrink-0">
              {info.student.photo ? (
                <img
                  src={info.student.photo}
                  alt={info.student.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={28} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {info.student.fullName}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {info.student.fatherName && `ولد ${info.student.fatherName} • `}
                {info.student.class.name}
                {info.student.class.section && ` - ${info.student.class.section}`}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <Calendar size={12} />
                نوبت: {classTimeLabels[info.student.classTime] || 'صبح'}
                {info.student.phone && (
                  <>
                    <span>•</span>
                    <span>{info.student.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onCollect}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            <DollarSign size={18} />
            ثبت پرداخت
          </button>
        </div>
      </div>

      {/* Fee summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          label="کل فیس"
          value={formatAFN(feeDetails.totalFees)}
          icon={FileText}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <SummaryCard
          label="پرداخت شده"
          value={formatAFN(feeDetails.paidAmount)}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
        <SummaryCard
          label="باقی‌مانده"
          value={formatAFN(feeDetails.balance)}
          icon={AlertCircle}
          color={feeDetails.balance > 0 ? 'text-red-600' : 'text-gray-600'}
          bg={feeDetails.balance > 0 ? 'bg-red-50' : 'bg-gray-50'}
        />
        <SummaryCard
          label="نرخ وصول"
          value={`${collectionRate}%`}
          icon={Wallet}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Fee breakdown by type */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          تفکیک فیس
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FeeBox
            label="شهریه"
            value={feeDetails.tuitionFee}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <FeeBox
            label="حمل و نقل"
            value={feeDetails.transportFee}
            color="text-cyan-600"
            bg="bg-cyan-50"
          />
          <FeeBox
            label="پذیرش"
            value={feeDetails.admissionFee}
            color="text-orange-600"
            bg="bg-orange-50"
          />
          <FeeBox
            label="سایر"
            value={feeDetails.otherFees}
            color="text-gray-600"
            bg="bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly fees */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            فیس‌های ماهانه
          </h3>
          {info.monthlyFees.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              فیس ماهانه‌ای ثبت نشده
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {info.monthlyFees.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      {f.monthName}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {f.monthName} {f.year}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatAFN(f.paid)} از {formatAFN(f.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        f.balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {f.balance > 0 ? formatAFN(f.balance) : 'کامل'}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        f.status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : f.status === 'PARTIAL'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {f.status === 'PAID'
                        ? 'پرداخت شده'
                        : f.status === 'PARTIAL'
                        ? 'ناقص'
                        : 'در انتظار'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* One-time fees */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            فیس‌های یک‌باره
          </h3>
          {info.oneTimeFees.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              فیس یک‌باره‌ای ثبت نشده
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {info.oneTimeFees.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {f.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatAFN(f.paid)} از {formatAFN(f.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        f.balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {f.balance > 0 ? formatAFN(f.balance) : 'کامل'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function FeeBox({
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
    <div className={`${bg} rounded-lg p-3`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-base font-bold ${color}`}>{formatAFN(value)}</p>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  highlight = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
          highlight
            ? 'border-emerald-300 bg-emerald-50/50'
            : 'border-gray-200'
        }`}
      />
    </div>
  );
}