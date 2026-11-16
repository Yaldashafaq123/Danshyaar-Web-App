// app/admin/finance/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertTriangle,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  FileText,
  DollarSign,
  Percent,
  Wallet,
} from 'lucide-react';
import {
  financeDashboardAPI,
  financeReportsAPI,
} from '@/lib/api/finance';
import type { FeeStatistics } from '@/types/finance';
import {
  formatAFN,
  formatAFNCompact,
  formatNumber,
  formatPercentage,
} from '@/lib/utils/finance-helpers';

export default function ReportsOverviewPage() {
  const [stats, setStats] = useState<FeeStatistics | null>(null);
  const [income, setIncome] = useState<{
    income: { total: number };
    expenses: { total: number };
    netIncome: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, i] = await Promise.all([
        financeDashboardAPI.getFeeStatistics().catch(() => null),
        financeReportsAPI.getIncomeStatement().catch(() => null),
      ]);
      if (s) setStats(s);
      if (i) setIncome(i);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت گزارشات';
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  const collectionRate = stats?.collectionRate || 0;
  const netIncome = income?.netIncome || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={26} />
            گزارشات مالی
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تحلیل جامع وضعیت مالی مکتب
          </p>
        </div>
        <button
          onClick={fetchData}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          label="وصول امروز"
          value={formatAFN(stats?.todayCollection ?? 0)}
          subtitle={`${formatNumber(stats?.todayCount ?? 0)} پرداخت`}
          icon={TrendingUp}
          gradient="from-emerald-500 to-teal-600"
          href="/admin/finance/reports/daily"
        />
        <Card
          label="وصول ماه"
          value={formatAFN(stats?.monthCollection ?? 0)}
          subtitle="مجموع ماه جاری"
          icon={Calendar}
          gradient="from-blue-500 to-indigo-600"
          href="/admin/finance/reports/monthly"
        />
        <Card
          label="باقی‌مانده کل"
          value={formatAFN(stats?.pendingFees ?? 0)}
          subtitle={`${formatNumber(stats?.pendingCount ?? 0)} مورد`}
          icon={AlertTriangle}
          gradient="from-rose-500 to-red-600"
          href="/admin/finance/reports/outstanding"
        />
        <Card
          label="سود خالص"
          value={formatAFN(netIncome)}
          subtitle={netIncome >= 0 ? 'سود' : 'زیان'}
          icon={Wallet}
          gradient={
            netIncome >= 0
              ? 'from-purple-500 to-indigo-600'
              : 'from-red-500 to-rose-600'
          }
          href="/admin/finance/reports/income-vs-expense"
        />
      </div>

      {/* Collection rate */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              نرخ وصول کل
            </h3>
            <p className="text-sm text-gray-500">
              نسبت تخصیص‌های تکمیل شده به کل
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-emerald-600">
            {formatPercentage(collectionRate, 1)}
          </span>
          <span className="text-sm text-gray-500">
            {formatNumber(stats?.paidAssignments ?? 0)} از{' '}
            {formatNumber(stats?.totalAssignments ?? 0)} تخصیص
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(collectionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Report Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          گزارشات تفصیلی
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportCard
            title="وصول روزانه"
            description="گزارش پرداخت‌های امروز"
            icon={Receipt}
            href="/admin/finance/reports/daily"
            gradient="from-emerald-500 to-teal-600"
          />
          <ReportCard
            title="وصول ماهانه"
            description="تحلیل درآمد ماهانه"
            icon={Calendar}
            href="/admin/finance/reports/monthly"
            gradient="from-blue-500 to-indigo-600"
          />
          <ReportCard
            title="معوقات"
            description="شاگردان با فیس پرداخت‌نشده"
            icon={AlertTriangle}
            href="/admin/finance/reports/outstanding"
            gradient="from-rose-500 to-red-600"
          />
          <ReportCard
            title="عواید و مصارف"
            description="مقایسه درآمد و هزینه"
            icon={BarChart3}
            href="/admin/finance/reports/income-vs-expense"
            gradient="from-purple-500 to-indigo-600"
          />
          <ReportCard
            title="گزارش سالانه"
            description="خلاصه کل سال مالی"
            icon={FileText}
            href="/admin/finance/reports/annual"
            gradient="from-orange-500 to-amber-600"
          />
          <ReportCard
            title="تاریخ پرداخت‌ها"
            description="همه تراکنش‌ها"
            icon={DollarSign}
            href="/admin/finance/payment-history"
            gradient="from-cyan-500 to-blue-600"
          />
        </div>
      </div>

      {/* Quick insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          خلاصه سریع
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Insight
            label="کل شاگردان"
            value={formatNumber(stats?.totalStudents ?? 0)}
            color="text-blue-600"
          />
          <Insight
            label="وصول سال"
            value={formatAFNCompact(stats?.yearCollection ?? 0)}
            color="text-emerald-600"
          />
          <Insight
            label="معوقات بحرانی"
            value={formatNumber(stats?.overdueCount ?? 0)}
            color="text-red-600"
          />
        </div>
      </div>
    </div>
  );
}

function Card({
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

function ReportCard({
  title,
  description,
  icon: Icon,
  href,
  gradient,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow group"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}
      >
        <Icon className="text-white" size={22} />
      </div>
      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}

function Insight({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}