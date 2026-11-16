// app/admin/hr/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Award,
  TrendingUp,
  FileText,
  AlertTriangle,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  UserX,
} from 'lucide-react';
import { hrDashboardAPI } from '@/lib/api/hr';
import type { HRDashboardDetails } from '@/types/hr';
import {
  formatNumber,
  formatPercentage,
} from '@/lib/utils/hr-helpers';

export default function HRReportsOverviewPage() {
  const [data, setData] = useState<HRDashboardDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrDashboardAPI.getDetails();
      setData(res);
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
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  const s = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-pink-500" size={26} />
            گزارشات منابع بشری
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تحلیل جامع وضعیت کارمندان
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
        <StatCard
          label="کل کارمندان"
          value={formatNumber(s?.totalStaff ?? 0)}
          subtitle={`${formatNumber(s?.activeStaff ?? 0)} فعال`}
          icon={Users}
          gradient="from-pink-500 to-rose-600"
        />
        <StatCard
          label="معلمان"
          value={formatNumber(s?.totalTeachers ?? 0)}
          subtitle="فعال"
          icon={Award}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="در رخصتی"
          value={formatNumber(s?.onLeave ?? 0)}
          subtitle={`${formatNumber(s?.pendingRequests ?? 0)} درخواست`}
          icon={UserX}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          label="حضور امروز"
          value={formatPercentage(s?.attendanceRate ?? 0)}
          subtitle={`${formatNumber(s?.todayAttendance ?? 0)} نفر`}
          icon={Clock}
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      {/* Attendance rate bar */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              نرخ حضور کلی
            </h3>
            <p className="text-sm text-gray-500">
              نسبت حضور امروز به کل کارمندان فعال
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-emerald-600">
            {formatPercentage(s?.attendanceRate ?? 0)}
          </span>
          <span className="text-sm text-gray-500">
            {formatNumber(s?.todayAttendance ?? 0)} از{' '}
            {formatNumber(s?.activeStaff ?? 0)} نفر
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(s?.attendanceRate ?? 0, 100)}%` }}
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
            title="گزارش حضور"
            description="حضور و غیاب کارمندان"
            icon={Clock}
            href="/admin/hr/reports/attendance"
            gradient="from-pink-500 to-rose-600"
          />
          <ReportCard
            title="گزارش کارمندان"
            description="لیست و تحلیل کارمندان"
            icon={Users}
            href="/admin/hr/staff"
            gradient="from-blue-500 to-indigo-600"
          />
          <ReportCard
            title="گزارش رخصتی‌ها"
            description="درخواست‌های رخصتی"
            icon={Calendar}
            href="/admin/hr/leaves"
            gradient="from-amber-500 to-orange-600"
          />
          <ReportCard
            title="گزارش معاشات"
            description="معاشات و پرداخت‌ها"
            icon={DollarSign}
            href="/admin/hr/salaries"
            gradient="from-emerald-500 to-teal-600"
          />
          <ReportCard
            title="ارزیابی‌های عملکرد"
            description="عملکرد کارمندان"
            icon={Award}
            href="/admin/hr/evaluations"
            gradient="from-purple-500 to-indigo-600"
          />
          <ReportCard
            title="اخطارها و انتظام"
            description="اخطارهای فعال"
            icon={AlertTriangle}
            href="/admin/hr/warnings"
            gradient="from-red-500 to-rose-600"
          />
        </div>
      </div>

      {/* Quick insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          خلاصه سریع
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            label="کارمندان فعال"
            value={`${formatPercentage(
              s?.totalStaff
                ? ((s.activeStaff / s.totalStaff) * 100)
                : 0
            )}`}
            description="از کل کارمندان"
            color="text-emerald-600"
          />
          <InsightCard
            label="اخطارهای فعال"
            value={formatNumber(s?.totalWarnings ?? 0)}
            description="نیاز به پیگیری"
            color="text-red-600"
          />
          <InsightCard
            label="قراردادهای در حال انقضا"
            value={formatNumber(s?.expiringContracts ?? 0)}
            description="طی ۳۰ روز آینده"
            color="text-amber-600"
          />
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-amber-500" size={20} />
              <h4 className="font-semibold text-gray-900">
                درخواست‌های رخصتی
              </h4>
            </div>
            <Link
              href="/admin/hr/leaves"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              مشاهده
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {formatNumber(s?.pendingRequests ?? 0)} درخواست در انتظار تأیید
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              <h4 className="font-semibold text-gray-900">
                هشدارهای امنیتی
              </h4>
            </div>
            <Link
              href="/admin/hr/warnings"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              مشاهده
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {formatNumber(s?.totalWarnings ?? 0)} اخطار فعال
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}
        >
          <Icon className="text-white" size={20} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
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
      <h3 className="text-base font-bold text-gray-900 group-hover:text-pink-600">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}

function InsightCard({
  label,
  value,
  description,
  color,
}: {
  label: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
}