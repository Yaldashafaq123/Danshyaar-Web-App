// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import dashboardAPI, { DashboardStats, Activity } from '@/lib/api/admin';
import {
  Users,
  GraduationCap,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  UserPlus,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatAfghanDate } from '@/lib/utils/afghan-helpers';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardAPI.getStats();
        setStats(data);
        setActivities(data.recentActivities || []);
      } catch (err: unknown) {
        const errorDetails = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          errorDetails.response?.data?.message ||
            errorDetails.message ||
            'خطا در دریافت اطلاعات'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: 'دانش‌آموزان',
      value: stats?.totalStudents ?? 0,
      icon: GraduationCap,
      change: stats?.studentsChange ?? 0,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      href: '/admin/students',
    },
    {
      title: 'معلمان',
      value: stats?.totalTeachers ?? 0,
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      href: '/admin/teachers',
    },
    {
      title: 'درآمد',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      change: stats?.revenueChange ?? 0,
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      href: '/finance',
    },
    {
      title: 'حضور و غیاب',
      value: `${stats?.attendanceRate ?? 0}%`,
      icon: Calendar,
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      href: '/principal/attendance',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-5 text-slate-900 font-semibold text-lg">
            در حال بارگذاری...
          </p>
          <p className="text-slate-700 text-sm mt-1">لطفاً کمی صبر کنید</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="text-red-600" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-800 mb-2">
                خطا در بارگذاری داشبورد
              </h3>
              <p className="text-red-700 font-medium mb-5 leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <RefreshCw size={18} />
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-2xl p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-32 -translate-x-32"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-amber-400" size={20} />
              <span className="text-amber-300 text-sm font-semibold tracking-wide">
                پنل مدیریت
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              داشبورد مدیریت
            </h1>
            <p className="text-blue-100 font-medium">
              خوش آمدید، <span className="text-white font-bold">{user?.fullName}</span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
            <p className="text-blue-100 text-xs font-medium mb-1">امروز</p>
            <p className="text-white font-bold text-sm">
              {formatAfghanDate(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = (stat.change || 0) >= 0;
          return (
            <Link
              key={index}
              href={stat.href}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-slate-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="text-white" size={22} />
                </div>
                <ArrowUpRight
                  className="text-slate-300 group-hover:text-slate-900 transition-colors"
                  size={20}
                />
              </div>

              <p className={`text-sm font-semibold ${stat.text} mb-1`}>
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-slate-900 mb-3">
                {stat.value}
              </p>

              {stat.change !== undefined && stat.change !== 0 && (
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                      isPositive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span className="text-xs font-bold">
                      {isPositive ? '+' : ''}
                      {stat.change}%
                    </span>
                  </div>
                  <span className="text-xs text-slate-700 font-medium">
                    از ماه قبل
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            value: stats?.totalClasses ?? 0,
            label: 'تعداد صنوف',
            gradient: 'from-blue-500 to-indigo-600',
          },
          {
            value: stats?.pendingFees ?? 0,
            label: 'شهریه معوقه',
            gradient: 'from-rose-500 to-red-600',
          },
          {
            value: `${stats?.attendanceRate ?? 0}%`,
            label: 'میزان حضور',
            gradient: 'from-emerald-500 to-teal-600',
          },
          {
            value: stats?.totalParents ?? 0,
            label: 'والدین',
            gradient: 'from-violet-500 to-purple-600',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden group"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-5 rounded-full -translate-y-8 translate-x-8 group-hover:opacity-10 transition-opacity`}
            ></div>
            <p
              className={`text-3xl font-bold bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent mb-1`}
            >
              {item.value}
            </p>
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              فعالیت‌های اخیر
            </h3>
            <p className="text-sm text-slate-700 font-medium mt-0.5">
              آخرین رویدادهای سیستم
            </p>
          </div>
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
          >
            مشاهده همه
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="text-slate-700" size={28} />
              </div>
              <p className="text-slate-900 font-semibold">
                فعالیتی ثبت نشده است
              </p>
              <p className="text-sm text-slate-700 font-medium mt-1">
                به‌زودی فعالیت‌ها اینجا نمایش داده می‌شوند
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {activity.user?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    <span className="font-bold">{activity.user}</span>
                    <span className="text-slate-700"> — {activity.action}</span>
                  </p>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    {activity.time}
                  </p>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              href: '/admin/students/add',
              icon: UserPlus,
              label: 'ثبت دانش‌آموز',
              gradient: 'from-blue-500 to-indigo-600',
              bg: 'bg-blue-50',
              hover: 'hover:bg-blue-100',
            },
            {
              href: '/admin/teachers/add',
              icon: UserPlus,
              label: 'ثبت معلم',
              gradient: 'from-emerald-500 to-teal-600',
              bg: 'bg-emerald-50',
              hover: 'hover:bg-emerald-100',
            },
            {
              href: '/finance/fee-collection',
              icon: CreditCard,
              label: 'ثبت شهریه',
              gradient: 'from-amber-500 to-orange-600',
              bg: 'bg-amber-50',
              hover: 'hover:bg-amber-100',
            },
            {
              href: '/admin/classes/add',
              icon: Calendar,
              label: 'ثبت صنف',
              gradient: 'from-violet-500 to-purple-600',
              bg: 'bg-violet-50',
              hover: 'hover:bg-violet-100',
            },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                href={action.href}
                className={`group ${action.bg} ${action.hover} rounded-2xl p-5 transition-all duration-300 text-center border border-transparent hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5`}
              >
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="text-white" size={22} />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}