// app/admin/finance/payroll/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  DollarSign,
  TrendingDown,
  Wallet,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUpRight,
  FileText,
  CreditCard,
} from 'lucide-react';
import { financeSalariesAPI } from '@/lib/api/finance';
import type { Salary } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  salaryStatusLabels,
  salaryStatusColors,
} from '@/lib/utils/finance-helpers';

export default function PayrollOverviewPage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeSalariesAPI.list({ month, year });
      setSalaries(res);
    } catch (err: unknown) {
      console.error('❌ [Payroll] Error:', err);
      let message = 'خطا در دریافت اطلاعات معاشات';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  // Compute stats
  const total = salaries.length;
  const paid = salaries.filter((s) => s.status === 'PAID');
  const pending = salaries.filter((s) => s.status === 'PENDING');
  const partial = salaries.filter((s) => s.status === 'PARTIAL');

  const totalAmount = salaries.reduce(
    (sum, s) => sum + Number(s.finalAmount || s.amount || 0),
    0
  );
  const totalPaid = salaries.reduce(
    (sum, s) => sum + Number(s.paidAmount || 0),
    0
  );
  const totalPending = totalAmount - totalPaid;

  const months = [
    'حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله',
    'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="text-purple-500" size={26} />
            معاشات و پردازش
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            مدیریت معاش معلمان و کارمندان
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
            href="/admin/finance/payroll/process"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <CreditCard size={16} />
            پردازش معاش
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md">
          <div className="relative">
            <Calendar
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="مجموع معاشات ماه"
          value={formatAFN(totalAmount)}
          subtitle={`${formatNumber(total)} نفر`}
          icon={DollarSign}
          gradient="from-purple-500 to-indigo-600"
          href="/admin/finance/payroll/salaries"
        />
        <SummaryCard
          label="پرداخت شده"
          value={formatAFN(totalPaid)}
          subtitle={`${formatNumber(paid.length)} نفر`}
          icon={CheckCircle}
          gradient="from-emerald-500 to-teal-600"
          href="/admin/finance/payroll/salaries?status=PAID"
        />
        <SummaryCard
          label="در انتظار پرداخت"
          value={formatAFN(totalPending)}
          subtitle={`${formatNumber(pending.length + partial.length)} نفر`}
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
          href="/admin/finance/payroll/salaries?status=PENDING"
        />
        <SummaryCard
          label="کل نفرات"
          value={formatNumber(total)}
          subtitle={`ماه ${months[month - 1]}`}
          icon={Users}
          gradient="from-blue-500 to-cyan-600"
          href="/admin/finance/payroll/salaries"
        />
      </div>

      {/* Payment rate */}
      {totalAmount > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                نرخ پرداخت معاشات
              </h3>
              <p className="text-sm text-gray-500">
                نسبت پرداخت شده به مجموع ماه {months[month - 1]} {year}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold text-purple-600">
              {Math.round((totalPaid / totalAmount) * 100)}%
            </span>
            <span className="text-sm text-gray-500">
              {formatAFN(totalPaid)} از {formatAFN(totalAmount)}
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((totalPaid / totalAmount) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Recent salaries */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            آخرین معاشات ثبت شده
          </h3>
          <Link
            href="/admin/finance/payroll/salaries"
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            مشاهده همه →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-purple-500 mx-auto" size={32} />
          </div>
        ) : salaries.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              معاشی برای ماه {months[month - 1]} {year} ثبت نشده
            </p>
            <Link
              href="/admin/finance/payroll/process"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              <CreditCard size={16} />
              پردازش معاشات این ماه
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {salaries.slice(0, 8).map((s) => (
              <div
                key={s.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Users size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {s.teacherName || `معلم #${s.teacherId}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {months[s.month - 1]} {s.year}
                    </p>
                  </div>
                </div>

                <div className="text-left flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">
                    {formatAFN(s.finalAmount || s.amount)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      salaryStatusColors[s.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {salaryStatusLabels[s.status] || s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink
            label="لیست معاشات"
            description="مشاهده همه"
            icon={FileText}
            href="/admin/finance/payroll/salaries"
            color="purple"
          />
          <QuickLink
            label="پردازش معاش"
            description="ایجاد ماهانه"
            icon={CreditCard}
            href="/admin/finance/payroll/process"
            color="emerald"
          />
          <QuickLink
            label="مصارف"
            description="مدیریت هزینه"
            icon={TrendingDown}
            href="/admin/finance/expenses"
            color="orange"
          />
          <QuickLink
            label="گزارشات"
            description="تحلیل مالی"
            icon={BarChart3Placeholder}
            href="/admin/finance/reports"
            color="blue"
          />
        </div>
      </div>
    </div>
  );
}

// Icon placeholder (since lucide has many icons)
function BarChart3Placeholder({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M7 16h2V8H7v8z" />
      <path d="M13 16h2v-4h-2v4z" />
      <path d="M19 16h2V6h-2v10z" />
    </svg>
  );
}

function SummaryCard({
  label,
  value,
  subtitle,
  icon: Icon,
  gradient,
  href,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm group-hover:scale-105 transition-transform`}
        >
          <Icon className="text-white" size={20} />
        </div>
        <ArrowUpRight
          className="text-gray-300 group-hover:text-gray-500 transition-colors"
          size={18}
        />
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </Link>
  );
}

const quickLinkColors = {
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
};

function QuickLink({
  label,
  description,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: keyof typeof quickLinkColors;
}) {
  return (
    <Link
      href={href}
      className={`p-4 rounded-xl transition-colors text-center ${quickLinkColors[color]}`}
    >
      <Icon size={22} className="mx-auto mb-2" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs opacity-70 mt-0.5">{description}</p>
    </Link>
  );
}