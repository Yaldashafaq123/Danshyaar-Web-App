// app/admin/academic/academics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Home,
  Users,
  ArrowLeft,
  RefreshCw,
  GraduationCap,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { principalAcademicYearsAPI, principalSubjectsAPI, principalClassesAPI } from '@/lib/api/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

export default function AcademicsOverviewPage() {
  const [stats, setStats] = useState({
    years: 0,
    activeYear: '',
    subjects: 0,
    classes: 0,
    studentsInClasses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [years, subjects, classes] = await Promise.all([
        principalAcademicYearsAPI.list(),
        principalSubjectsAPI.list({ limit: 1000 }),
        principalClassesAPI.list(),
      ]);

      const activeYear = years.find((y) => y.isActive);
      const totalStudents = classes.reduce((s, c) => s + c.studentCount, 0);

      setStats({
        years: years.length,
        activeYear: activeYear?.name || 'تعیین نشده',
        subjects: subjects.total,
        classes: classes.length,
        studentsInClasses: totalStudents,
      });
    } catch (err: unknown) {
      console.error('❌ [Academics] Error:', err);
      let message = 'خطا در دریافت اطلاعات';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            مدیریت امور اکادمیک
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            سال تحصیلی، مضامین و صنوف
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

      {/* Active Year Banner */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">سال تحصیلی فعال</p>
            <p className="text-2xl font-bold">{stats.activeYear}</p>
          </div>
          <Calendar size={56} className="text-blue-200 opacity-50" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="سال‌های تحصیلی"
          value={stats.years}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="مضامین"
          value={stats.subjects}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          label="صنوف"
          value={stats.classes}
          icon={Home}
          color="purple"
        />
        <StatCard
          label="شاگردان در صنوف"
          value={stats.studentsInClasses}
          icon={GraduationCap}
          color="orange"
        />
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NavCard
          title="سال‌های تحصیلی"
          description="ایجاد، ویرایش و مدیریت سال‌های تحصیلی"
          icon={Calendar}
          href="/admin/academic/academics/years"
          color="from-blue-500 to-blue-600"
          count={stats.years}
        />
        <NavCard
          title="مضامین"
          description="مدیریت مضامین و تخصیص به صنوف"
          icon={BookOpen}
          href="/admin/academic/academics/subjects"
          color="from-green-500 to-green-600"
          count={stats.subjects}
        />
        <NavCard
          title="صنوف"
          description="ایجاد و مدیریت صنوف مکتب"
          icon={Home}
          href="/admin/academic/academics/classes"
          color="from-purple-500 to-purple-600"
          count={stats.classes}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">
            {formatNumber(value)}
          </p>
        </div>
        <div className={`p-2.5 rounded-full ${colors.bg}`}>
          <Icon className={colors.text} size={20} />
        </div>
      </div>
    </div>
  );
}

function NavCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  count,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
    >
      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}
      >
        <Icon className="text-white" size={28} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
        {title}
        <ChevronLeft size={18} />
      </h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      <p className="text-2xl font-bold text-gray-900 mt-3">
        {formatNumber(count)}
      </p>
    </Link>
  );
}