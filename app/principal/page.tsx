// app/admin/academic/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Home,
  BookOpen,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  UserCheck,
  AlertCircle,
  Award,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { principalDashboardAPI } from '@/lib/api/principal';
import type { DashboardSummary } from '@/types/principal';
import { formatNumber, formatPercentage } from '@/lib/utils/principal-helpers';
import { useAuthStore } from '@/lib/store/authStore';

export default function AcademicDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 [Academic Dashboard] Fetching...');
      const data = await principalDashboardAPI.getDashboard();
      console.log('✅ [Academic Dashboard] Data:', data);
      setStats(data);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('❌ [Academic Dashboard] Error:', err);
      let message = 'خطا در دریافت اطلاعات داشبورد';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        message = axiosErr.response?.data?.message || axiosErr.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ================================
  // LOADING STATE
  // ================================
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">در حال بارگذاری داشبورد...</p>
        </div>
      </div>
    );
  }

  // ================================
  // ERROR STATE
  // ================================
  if (error && !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-700">
            خطا در بارگذاری داشبورد
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={16} />
          تلاش مجدد
        </button>
      </div>
    );
  }

  // ================================
  // MAIN DASHBOARD
  // ================================
  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            داشبورد اکادمیک مکتب
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            خوش آمدید {user?.fullName} — نظارت جامع بر عملکرد آموزشی
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-400">
          آخرین بروزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}
        </p>
      )}

      {/* ---------- Primary Stats Cards ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="شاگردان"
          value={formatNumber(stats?.totalStudents ?? 0)}
          subtitle={`${formatNumber(stats?.activeStudents ?? 0)} فعال`}
          icon={GraduationCap}
          color="blue"
          href="/admin/academic/students"
        />
        <StatCard
          title="معلمان"
          value={formatNumber(stats?.totalTeachers ?? 0)}
          subtitle={`${formatNumber(stats?.activeTeachers ?? 0)} فعال`}
          icon={Users}
          color="green"
          href="/admin/academic/teachers"
        />
        <StatCard
          title="صنوف"
          value={formatNumber(stats?.totalClasses ?? 0)}
          subtitle="فعال"
          icon={Home}
          color="purple"
          href="/admin/academic/academics/classes"
        />
        <StatCard
          title="مضامین"
          value={formatNumber(stats?.totalSubjects ?? 0)}
          subtitle="ثبت شده"
          icon={BookOpen}
          color="orange"
          href="/admin/academic/academics/subjects"
        />
      </div>

      {/* ---------- Secondary Stats Row ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          label="امتحانات"
          value={formatNumber(stats?.totalExams ?? 0)}
          icon={ClipboardList}
          color="text-indigo-600"
        />
        <MiniStat
          label="کارخانگی‌ها"
          value={formatNumber(stats?.totalAssignments ?? 0)}
          icon={FileText}
          color="text-pink-600"
        />
        <MiniStat
          label="حضور امروز"
          value={formatPercentage(stats?.attendanceRate ?? 0)}
          icon={UserCheck}
          color="text-green-600"
        />
        <MiniStat
          label="والدین"
          value={formatNumber(stats?.totalParents ?? 0)}
          icon={Users}
          color="text-cyan-600"
        />
      </div>

      {/* ---------- Attendance Highlight ---------- */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              حضور و غیاب امروز
            </h3>
            <p className="text-sm text-gray-500">
              نسبت حضور کارمندان و معلمان امروز
            </p>
          </div>
          <Link
            href="/admin/academic/reports/attendance"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            مشاهده گزارش →
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-green-600">
                {formatPercentage(stats?.attendanceRate ?? 0)}
              </span>
              <span className="text-sm text-gray-500">
                {formatNumber(stats?.todayAttendance ?? 0)} نفر حاضر
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats?.attendanceRate ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Quick Navigation Grid ---------- */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <QuickLink
            label="لیست شاگردان"
            description="مدیریت و مشاهده"
            icon={Users}
            href="/admin/academic/students"
            color="blue"
          />
          <QuickLink
            label="لیست معلمان"
            description="مدیریت معلمان"
            icon={Users}
            href="/admin/academic/teachers"
            color="green"
          />
          <QuickLink
            label="ارتقاء صنوف"
            description="ارتقاء شاگردان"
            icon={Award}
            href="/admin/academic/students/promotion"
            color="purple"
          />
          <QuickLink
            label="تقسیم اوقات"
            description="جدول زمانی"
            icon={Calendar}
            href="/admin/academic/timetable"
            color="orange"
          />
          <QuickLink
            label="امتحانات"
            description="مدیریت امتحانات"
            icon={ClipboardList}
            href="/admin/academic/exams"
            color="indigo"
          />
          <QuickLink
            label="ارزیابی معلمان"
            description="سیستم ارزیابی"
            icon={Award}
            href="/admin/academic/evaluations"
            color="pink"
          />
          <QuickLink
            label="گزارشات"
            description="تحلیل و آمار"
            icon={BarChart3}
            href="/admin/academic/reports"
            color="cyan"
          />
          <QuickLink
            label="ارتباطات"
            description="ارتباط با والدین"
            icon={MessageSquare}
            href="/admin/academic/communication/parents"
            color="yellow"
          />
        </div>
      </div>

      {/* ---------- Alerts / Monitoring ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* At-risk students */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <h4 className="font-semibold text-gray-900">
                شاگردان در خطر
              </h4>
            </div>
            <Link
              href="/admin/academic/students/at-risk"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              مشاهده
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            شاگردانی که نیاز به توجه ویژه دارند — حضور پایین، نمرات ضعیف، یا
            مشکلات انتظامی
          </p>
        </div>

        {/* Top performers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="text-green-500" size={20} />
              <h4 className="font-semibold text-gray-900">
                شاگردان برتر
              </h4>
            </div>
            <Link
              href="/admin/academic/students/top-performers"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              مشاهده
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            شاگردان با عملکرد عالی — تشویق و تقدیر از تلاش‌های آنان
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  href: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
  },
};

function StatCard({ title, value, subtitle, icon: Icon, color, href }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors.bg}`}>
          <Icon className={colors.text} size={24} />
        </div>
      </div>
    </Link>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

function MiniStat({ label, value, icon: Icon, color }: MiniStatProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={color} size={16} />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface QuickLinkProps {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'pink' | 'cyan' | 'yellow';
}

const quickLinkColors = {
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  green: 'bg-green-50 text-green-600 hover:bg-green-100',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
  pink: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
  cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
  yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
};

function QuickLink({ label, description, icon: Icon, href, color }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className={`p-4 rounded-xl transition-colors text-center ${quickLinkColors[color]}`}
    >
      <Icon size={24} className="mx-auto mb-2" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs opacity-70 mt-0.5">{description}</p>
    </Link>
  );
}