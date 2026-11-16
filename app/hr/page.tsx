// app/admin/hr/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  FileText,
  Award,
  Briefcase,
  CreditCard,
  Bell,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { hrDashboardAPI } from '@/lib/api/hr';
import type { HRDashboardDetails } from '@/types/hr';
import {
  formatNumber,
  formatPercentage,
  formatShamsiDate,
  leaveTypeLabels,
  leaveStatusLabels,
  leaveStatusColors,
} from '@/lib/utils/hr-helpers';
import { useAuthStore } from '@/lib/store/authStore';

export default function HRDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<HRDashboardDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 [HR Dashboard] Fetching...');
      const res = await hrDashboardAPI.getDetails();
      console.log('✅ [HR Dashboard] Data:', res);
      setData(res);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('❌ [HR Dashboard] Error:', err);
      let message = 'خطا در دریافت اطلاعات داشبورد';
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
    fetchData();
  }, []);

  // ---------- Loading ----------
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-pink-500 mx-auto" size={40} />
          <p className="mt-4 text-gray-500">
            در حال بارگذاری داشبورد منابع بشری...
          </p>
        </div>
      </div>
    );
  }

  // ---------- Error ----------
  if (error && !data) {
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
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw size={16} />
          تلاش مجدد
        </button>
      </div>
    );
  }

  // ---------- Main ----------
  const s = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            داشبورد منابع بشری
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            خوش آمدید {user?.fullName} — نظارت بر کارمندان و پرسنل
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            بروزرسانی
          </button>
          <Link
            href="/admin/hr/staff/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Users size={16} />
            ثبت کارمند
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
          title="کارمندان"
          value={formatNumber(s?.totalStaff ?? 0)}
          subtitle={`${formatNumber(s?.activeStaff ?? 0)} فعال`}
          icon={Users}
          gradient="from-pink-500 to-rose-600"
          href="/admin/hr/staff"
        />
        <StatCard
          title="معلمان"
          value={formatNumber(s?.totalTeachers ?? 0)}
          subtitle="فعال"
          icon={UserCheck}
          gradient="from-blue-500 to-indigo-600"
          href="/admin/hr/staff?staffType=TEACHER"
        />
        <StatCard
          title="در انتظار رخصتی"
          value={formatNumber(s?.pendingRequests ?? 0)}
          subtitle="درخواست‌های رخصتی"
          icon={Calendar}
          gradient="from-amber-500 to-orange-600"
          href="/admin/hr/leaves"
        />
        <StatCard
          title="حضور امروز"
          value={formatPercentage(s?.attendanceRate ?? 0)}
          subtitle={`${formatNumber(s?.todayAttendance ?? 0)} نفر`}
          icon={Clock}
          gradient="from-emerald-500 to-teal-600"
          href="/admin/hr/attendance/today"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          label="در رخصتی"
          value={formatNumber(s?.onLeave ?? 0)}
          icon={UserX}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <MiniStat
          label="قراردادهای نزدیک به انقضا"
          value={formatNumber(s?.expiringContracts ?? 0)}
          icon={FileText}
          color="text-red-600"
          bg="bg-red-50"
        />
        <MiniStat
          label="اخطارهای فعال"
          value={formatNumber(s?.totalWarnings ?? 0)}
          icon={AlertTriangle}
          color="text-rose-600"
          bg="bg-rose-50"
        />
        <MiniStat
          label="حضور ماه"
          value={formatNumber(s?.monthAttendance ?? 0)}
          icon={TrendingUp}
          color="text-cyan-600"
          bg="bg-cyan-50"
        />
      </div>

      {/* Attendance Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              نرخ حضور امروز
            </h3>
            <p className="text-sm text-gray-500">
              نسبت حضور کارمندان و معلمان
            </p>
          </div>
          <Link
            href="/admin/hr/attendance/today"
            className="text-sm text-pink-600 hover:text-pink-700"
          >
            مشاهده جزئیات →
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-1">
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
                style={{
                  width: `${Math.min(s?.attendanceRate ?? 0, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <QuickLink
            label="کارمندان"
            description="مدیریت پرسنل"
            icon={Users}
            href="/admin/hr/staff"
            color="pink"
          />
          <QuickLink
            label="حضور و غیاب"
            description="گزارش دستگاه"
            icon={Clock}
            href="/admin/hr/attendance/today"
            color="emerald"
          />
          <QuickLink
            label="رخصتی‌ها"
            description="درخواست‌های رخصتی"
            icon={Calendar}
            href="/admin/hr/leaves"
            color="orange"
          />
          <QuickLink
            label="معاشات"
            description="پردازش معاش"
            icon={DollarSign}
            href="/admin/hr/salaries"
            color="blue"
          />
          <QuickLink
            label="ارزیابی‌ها"
            description="عملکرد کارمندان"
            icon={Award}
            href="/admin/hr/evaluations"
            color="purple"
          />
          <QuickLink
            label="اسناد"
            description="مدارک کارمندان"
            icon={FileText}
            href="/admin/hr/documents"
            color="cyan"
          />
          <QuickLink
            label="کارت‌های شناسایی"
            description="ID Cards"
            icon={CreditCard}
            href="/admin/hr/id-cards"
            color="indigo"
          />
          <QuickLink
            label="اخطارها"
            description="انتظامی"
            icon={AlertTriangle}
            href="/admin/hr/warnings"
            color="rose"
          />
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              درخواست‌های رخصتی اخیر
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              در انتظار تأیید
            </p>
          </div>
          <Link
            href="/admin/hr/leaves"
            className="text-sm text-pink-600 hover:text-pink-700"
          >
            مشاهده همه →
          </Link>
        </div>

        {!data?.recentLeaves || data.recentLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="mx-auto text-green-300" size={40} />
            <p className="mt-3 text-gray-500 text-sm">
              هیچ درخواست رخصتی در انتظار نیست 🎉
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recentLeaves.slice(0, 5).map((leave) => (
              <div
                key={leave.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden flex-shrink-0">
                    {leave.User.profileImage ? (
                      <img
                        src={leave.User.profileImage}
                        alt={leave.User.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {leave.User.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {leaveTypeLabels[leave.type] || leave.type}
                      {' • '}
                      {formatShamsiDate(leave.startDate)} —{' '}
                      {formatShamsiDate(leave.endDate)}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    leaveStatusColors[leave.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {leaveStatusLabels[leave.status] || leave.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts / Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              <h4 className="font-semibold text-gray-900">
                اخطارهای فعال
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
            {formatNumber(s?.totalWarnings ?? 0)} اخطار فعال نیاز به پیگیری دارند
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="text-amber-500" size={20} />
              <h4 className="font-semibold text-gray-900">
                قراردادهای نزدیک به انقضا
              </h4>
            </div>
            <Link
              href="/admin/hr/staff"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              مشاهده
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {formatNumber(s?.expiringContracts ?? 0)} قرارداد در ۳۰ روز آینده
            منقضی می‌شود
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
  pink: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
  emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
  indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
  rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
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