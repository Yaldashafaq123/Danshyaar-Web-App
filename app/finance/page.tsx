// app/admin/finance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Receipt,
  RefreshCw,
  Loader2,
  AlertCircle,
  BarChart3,
  Briefcase,
  Wallet,
  FileText,
  CreditCard,
  Percent,
  ArrowUpRight,
} from 'lucide-react';
import { financeDashboardAPI } from '@/lib/api/finance';
import type { DashboardSummary, FeeStatistics } from '@/types/finance';
import {
  formatAFN,
  formatAFNCompact,
  formatNumber,
  formatPercentage,
  collectionRateBg,
} from '@/lib/utils/finance-helpers';
import { useAuthStore } from '@/lib/store/authStore';

export default function FinanceDashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [stats, setStats] = useState<FeeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 [Finance Dashboard] Fetching...');
      const [s, st] = await Promise.all([
        financeDashboardAPI.getSummary(),
        financeDashboardAPI.getFeeStatistics().catch(() => null),
      ]);
      setSummary(s);
      if (st) setStats(st);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('❌ [Finance Dashboard] Error:', err);
      let message = 'خطا در دریافت اطلاعات داشبورد مالی';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ---------- Loading ----------
  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto" size={40} />
          <p className="mt-4 text-gray-500">در حال بارگذاری داشبورد مالی...</p>
        </div>
      </div>
    );
  }

  // ---------- Error ----------
  if (error && !summary) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-700">
            خطا در بارگذاری
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw size={16} />
          تلاش مجدد
        </button>
      </div>
    );
  }

  // ---------- Main ----------
  const collectionRate = stats?.collectionRate ?? summary?.completionRate ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">داشبورد مالی</h1>
          <p className="text-gray-500 text-sm mt-1">
            خوش آمدید {user?.fullName} — نمای کلی وضعیت مالی مکتب
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            بروزرسانی
          </button>
          <Link
            href="/admin/finance/fee-collection"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
          >
            <DollarSign size={16} />
            وصول فیس
          </Link>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-400">
          آخرین بروزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}
        </p>
      )}

      {/* Primary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="مجموع فیس باقی‌مانده"
          value={formatAFN(summary?.totalOutstanding ?? 0)}
          subtitle={`${formatNumber(stats?.pendingCount ?? 0)} مورد معوق`}
          icon={AlertTriangle}
          gradient="from-rose-500 to-red-600"
          href="/admin/finance/defaulters"
        />
        <StatCard
          title="وصول این ماه"
          value={formatAFN(summary?.monthlyCollection ?? 0)}
          subtitle="مجموع پرداخت‌های ماه"
          icon={TrendingUp}
          gradient="from-emerald-500 to-teal-600"
          href="/admin/finance/reports/monthly"
        />
        <StatCard
          title="وصول امروز"
          value={formatAFN(stats?.todayCollection ?? 0)}
          subtitle={`${formatNumber(stats?.todayCount ?? 0)} پرداخت`}
          icon={Receipt}
          gradient="from-blue-500 to-indigo-600"
          href="/admin/finance/reports/daily"
        />
        <StatCard
          title="شاگردان"
          value={formatNumber(summary?.totalStudents ?? 0)}
          subtitle={`${formatNumber(summary?.pendingStudents ?? 0)} دارای معوق`}
          icon={Users}
          gradient="from-violet-500 to-purple-600"
          href="/admin/finance/students"
        />
      </div>

      {/* Collection Rate Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              نرخ وصول فیس‌ها
            </h3>
            <p className="text-sm text-gray-500">
              نسبت تخصیص‌های تکمیل شده به کل
            </p>
          </div>
          <Link
            href="/admin/finance/reports"
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            مشاهده گزارشات →
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-emerald-600">
                {formatPercentage(collectionRate, 1)}
              </span>
              <span className="text-sm text-gray-500">
                {formatNumber(summary?.completedAssignments ?? 0)} از{' '}
                {formatNumber(summary?.totalAssignments ?? 0)} تخصیص
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`${collectionRateBg(collectionRate)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          label="وصول هفته"
          value={formatAFNCompact(stats?.weekCollection ?? 0)}
          icon={TrendingUp}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <MiniStat
          label="وصول سال"
          value={formatAFNCompact(stats?.yearCollection ?? 0)}
          icon={BarChart3}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <MiniStat
          label="معوقات"
          value={formatNumber(summary?.overdueRecords ?? 0)}
          icon={AlertTriangle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <MiniStat
          label="تخصیص‌های فعال"
          value={formatNumber(summary?.activeAssignments ?? 0)}
          icon={FileText}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Quick Navigation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink
            label="وصول فیس"
            description="ثبت پرداخت"
            icon={DollarSign}
            href="/admin/finance/fee-collection"
            color="emerald"
          />
          <QuickLink
            label="تخصیص فیس"
            description="مدیریت فیس‌ها"
            icon={FileText}
            href="/admin/finance/fee-assignments"
            color="blue"
          />
          <QuickLink
            label="شاگردان معوق"
            description="پیگیری معوقات"
            icon={AlertTriangle}
            href="/admin/finance/defaulters"
            color="rose"
          />
          <QuickLink
            label="معاشات"
            description="پردازش معاش"
            icon={Briefcase}
            href="/admin/finance/payroll"
            color="purple"
          />
          <QuickLink
            label="مصارف"
            description="ثبت و مدیریت"
            icon={TrendingDown}
            href="/admin/finance/expenses"
            color="orange"
          />
          <QuickLink
            label="تخفیف‌ها"
            description="تخفیف و بورسیه"
            icon={Percent}
            href="/admin/finance/discounts"
            color="pink"
          />
          <QuickLink
            label="گزارشات"
            description="تحلیل مالی"
            icon={BarChart3}
            href="/admin/finance/reports"
            color="cyan"
          />
          <QuickLink
            label="تاریخ پرداخت"
            description="همه پرداخت‌ها"
            icon={Receipt}
            href="/admin/finance/payment-history"
            color="indigo"
          />
        </div>
      </div>

      {/* Alerts / Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              <h4 className="font-semibold text-gray-900">
                شاگردان دارای معوق
              </h4>
            </div>
            <Link
              href="/admin/finance/defaulters"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              مشاهده
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {formatNumber(summary?.pendingStudents ?? 0)} شاگرد با{' '}
            {formatAFN(summary?.totalOutstanding ?? 0)} معوق
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="text-yellow-500" size={20} />
              <h4 className="font-semibold text-gray-900">معاشات در انتظار</h4>
            </div>
            <Link
              href="/admin/finance/payroll"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              مشاهده
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            پردازش معاش معلمان و کارمندان
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  href,
}: {
  title: string;
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
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </Link>
  );
}

function MiniStat({
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

const quickLinkColors = {
  emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  pink: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
  cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
  indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
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