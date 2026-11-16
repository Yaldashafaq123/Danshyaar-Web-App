'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  School, 
  Users, 
  UserCheck, 
  DollarSign, 
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  CreditCard
} from 'lucide-react';
import { formatCurrency, getStatusColor, getStatusLabel, formatAfghanDate } from '@/lib/utils/afghan-helpers';
import { superAdminAPI } from '@/lib/api/superAdmin';

// Define types
interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalUsers: number;
  monthlyRevenue: number;
  revenueChange: number;
  studentGrowth: number;
  systemHealth: number;
  newSchoolsThisMonth: number;
}

interface RecentSchool {
  id: number;
  name: string;
  nameFarsi?: string;
  code: string;
  status: string;
  _count?: {
    students?: number;
    teachers?: number;
  };
  createdAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapResponse(value: unknown): unknown {
  if (!isRecord(value)) return value;
  return 'data' in value ? value.data : value;
}

function requiredNumber(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('پاسخ آمار داشبورد نامعتبر است');
  }
  return value;
}

function toDashboardStats(value: unknown): DashboardStats {
  const data = unwrapResponse(value);
  if (!isRecord(data)) {
    throw new Error('پاسخ آمار داشبورد نامعتبر است');
  }
  return {
    totalSchools: requiredNumber(data, 'totalSchools'),
    activeSchools: requiredNumber(data, 'activeSchools'),
    totalStudents: requiredNumber(data, 'totalStudents'),
    totalTeachers: requiredNumber(data, 'totalTeachers'),
    totalUsers: requiredNumber(data, 'totalUsers'),
    monthlyRevenue: requiredNumber(data, 'monthlyRevenue'),
    revenueChange: requiredNumber(data, 'revenueChange'),
    studentGrowth: requiredNumber(data, 'studentGrowth'),
    systemHealth: requiredNumber(data, 'systemHealth'),
    newSchoolsThisMonth: requiredNumber(data, 'newSchoolsThisMonth'),
  };
}

function toRecentSchools(value: unknown): RecentSchool[] {
  const data = unwrapResponse(value);
  const items: unknown[] | null = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.data)
      ? data.data
      : null;
  if (!items) {
    throw new Error('پاسخ فهرست مدارس نامعتبر است');
  }

  return items.map((item) => {
    if (!isRecord(item)) {
      throw new Error('اطلاعات فهرست مدارس نامعتبر است');
    }
    const school = item;
    if (
      typeof school.id !== 'number' ||
      !Number.isFinite(school.id) ||
      typeof school.name !== 'string' ||
      typeof school.status !== 'string'
    ) {
      throw new Error('اطلاعات فهرست مدارس نامعتبر است');
    }
    const counts = isRecord(school._count) ? school._count : {};
    return {
      id: school.id,
      name: school.name,
      nameFarsi:
        typeof school.nameFarsi === 'string' ? school.nameFarsi : undefined,
      code: typeof school.code === 'string' ? school.code : '',
      status: school.status,
      _count: {
        students:
          typeof counts.students === 'number' && Number.isFinite(counts.students)
            ? counts.students
            : undefined,
        teachers:
          typeof counts.teachers === 'number' && Number.isFinite(counts.teachers)
            ? counts.teachers
            : undefined,
      },
      createdAt:
        typeof school.createdAt === 'string' ? school.createdAt : '',
    };
  });
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSchools, setRecentSchools] = useState<RecentSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsResponse, schoolsResponse] = await Promise.all([
        superAdminAPI.getDashboardStats(),
        superAdminAPI.getAllSchools({ page: 1, limit: 5 }),
      ]);
      setStats(toDashboardStats(statsResponse));
      setRecentSchools(toRecentSchools(schoolsResponse));
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'دریافت اطلاعات داشبورد ممکن نشد';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statsCards = [
    {
      title: 'مدارس',
      value: stats?.totalSchools ?? '—',
      icon: School,
      subValue: stats ? `${stats.activeSchools} فعال` : undefined,
      color: 'blue',
      href: '/super-admin/schools',
    },
    {
      title: 'دانش‌آموزان',
      value: stats?.totalStudents ?? '—',
      icon: Users,
      subValue: stats ? `+${stats.studentGrowth}% رشد` : undefined,
      color: 'green',
      href: '/super-admin/schools',
    },
    {
      title: 'معلمان',
      value: stats?.totalTeachers ?? '—',
      icon: UserCheck,
      color: 'purple',
      href: '/super-admin/users',
    },
    {
      title: 'درآمد ماهانه',
      value: stats ? formatCurrency(stats.monthlyRevenue) : '—',
      icon: DollarSign,
      subValue: stats ? `${stats.revenueChange}% تغییر` : undefined,
      color: 'yellow',
      href: '/super-admin/subscriptions',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">داشبورد کنترل مرکزی</h1>
          <p className="text-gray-500">خلاصه وضعیت کل سیستم</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/schools/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>افزودن مدرسه</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void fetchDashboardData()}
              className="shrink-0 rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800"
            >
              تلاش دوباره
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.href || '#'}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts Row - Simplified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">روند درآمد</h3>
            <span className="text-sm text-gray-500">اطلاعات موجود نیست</span>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            داده‌ای برای نمودار درآمد از سرور دریافت نشده است
          </div>
        </div>

        {/* Student Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">رشد دانش‌آموزان</h3>
            <span className="text-sm text-gray-500">اطلاعات موجود نیست</span>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            داده‌ای برای نمودار رشد از سرور دریافت نشده است
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">وضعیت سیستم</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>سلامت سیستم</span>
                <span className="font-medium">
                  {stats ? `${stats.systemHealth}%` : '—'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (stats?.systemHealth ?? 0) > 90
                      ? 'bg-green-500'
                      : (stats?.systemHealth ?? 0) > 70
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${stats?.systemHealth ?? 0}%` }}
                />
              </div>
            </div>
            <div className={`p-3 rounded-full ${
              !stats
                ? 'bg-gray-100'
                : stats.systemHealth > 90
                ? 'bg-green-100'
                : stats.systemHealth > 70
                ? 'bg-yellow-100'
                : 'bg-red-100'
            }`}>
              {!stats ? (
                <AlertCircle className="text-gray-500" size={24} />
              ) : stats.systemHealth > 90 ? (
                <CheckCircle className="text-green-600" size={24} />
              ) : stats.systemHealth > 70 ? (
                <AlertCircle className="text-yellow-600" size={24} />
              ) : (
                <XCircle className="text-red-600" size={24} />
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-lg text-center">
              <span className="text-green-600">🟢 فعال</span>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg text-center">
              <span className="text-yellow-600">🟡 هشدار</span>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-center">
              <span className="text-red-600">🔴 خطا</span>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg text-center">
              <span className="text-gray-600">⚪ غیرفعال</span>
            </div>
          </div>
        </div>

        {/* Recent Schools */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">مدارس اخیر</h3>
            <Link href="/super-admin/schools" className="text-sm text-blue-600 hover:text-blue-700">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-3">
            {recentSchools.map((school) => (
              <Link
                key={school.id}
                href={`/super-admin/schools/${school.id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {school.name?.[0] || 'M'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{school.name}</p>
                    <p className="text-xs text-gray-500">
                      {school._count?.students ?? '—'} دانش‌آموز •{' '}
                      {school._count?.teachers ?? '—'} معلم
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(school.status)}`}>
                    {getStatusLabel(school.status)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {school.createdAt
                      ? formatAfghanDate(school.createdAt)
                      : '—'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/super-admin/schools/new"
          className="p-4 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors text-center"
        >
          <School size={24} className="mx-auto mb-2" />
          <span className="text-sm">افزودن مدرسه</span>
        </Link>
        <Link
          href="/super-admin/users"
          className="p-4 bg-green-50 rounded-xl text-green-600 hover:bg-green-100 transition-colors text-center"
        >
          <Users size={24} className="mx-auto mb-2" />
          <span className="text-sm">مدیریت کاربران</span>
        </Link>
        <Link
          href="/super-admin/subscriptions"
          className="p-4 bg-yellow-50 rounded-xl text-yellow-600 hover:bg-yellow-100 transition-colors text-center"
        >
          <CreditCard size={24} className="mx-auto mb-2" />
          <span className="text-sm">اشتراک‌ها</span>
        </Link>
        <Link
          href="/super-admin/audit-logs"
          className="p-4 bg-purple-50 rounded-xl text-purple-600 hover:bg-purple-100 transition-colors text-center"
        >
          <FileText size={24} className="mx-auto mb-2" />
          <span className="text-sm">لاگ‌ها</span>
        </Link>
      </div>
    </div>
  );
}