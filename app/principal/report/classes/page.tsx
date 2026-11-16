// app/admin/academic/reports/classes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  User,
  TrendingUp,
} from 'lucide-react';
import {
  principalReportsAPI,
  principalAcademicYearsAPI,
} from '@/lib/api/principal';
import type { ClassReport, AcademicYear } from '@/types/principal';
import { formatNumber, formatPercentage } from '@/lib/utils/principal-helpers';

export default function ClassComparisonPage() {
  const [data, setData] = useState<ClassReport | null>(null);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [report, yearsList] = await Promise.all([
        principalReportsAPI.classes(
          selectedYear ? Number(selectedYear) : undefined
        ),
        principalAcademicYearsAPI.list(),
      ]);
      setData(report);
      if (years.length === 0) setYears(yearsList);
    } catch (err: unknown) {
      console.error('❌ [Class Report] Error:', err);
      let message = 'خطا در دریافت گزارش';
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
  }, [selectedYear]);

  // Sort by student count for chart scaling
  const maxStudents = data
    ? Math.max(1, ...data.classes.map((c) => c.studentCount))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/academic/reports"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="text-purple-500" size={26} />
              مقایسه صنوف
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              تحلیل و مقایسه عملکرد صنوف
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">همه سال‌ها</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name} {y.isActive ? '(فعال)' : ''}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary */}
      {data && !loading && (
        <div className="grid grid-cols-3 gap-4">
          <StatBox
            label="صنوف"
            value={data.totalClasses}
            icon={Home}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatBox
            label="شاگردان"
            value={data.totalStudents}
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-green-600" />
              <p className="text-xs text-gray-600">میانگین جمع‌آوری</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatPercentage(data.averageCollectionRate)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          </div>
        ) : !data || data.classes.length === 0 ? (
          <div className="p-12 text-center">
            <Home className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">هیچ صنفی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    صنف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    معلم
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شاگردان
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    توزیع
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.classes
                  .sort((a, b) => b.studentCount - a.studentCount)
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/academic/academics/classes/${c.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {c.name} {c.section || ''}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User size={12} className="text-gray-400" />
                          {c.teacherName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatNumber(c.studentCount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full max-w-[200px] bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${(c.studentCount / maxStudents) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
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
      <p className={`text-2xl font-bold ${color}`}>{formatNumber(value)}</p>
    </div>
  );
}