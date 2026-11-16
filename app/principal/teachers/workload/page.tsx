// app/admin/academic/teachers/workload/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  RefreshCw,
  User,
  Home,
  BookOpen,
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { principalTeachersAPI } from '@/lib/api/principal';
import type { Teacher } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

interface WorkloadRow extends Teacher {
  classCount: number;
  subjectCount: number;
  totalStudents: number;
}

export default function TeacherWorkloadPage() {
  const [rows, setRows] = useState<WorkloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await principalTeachersAPI.list({ limit: 200 });

      // Fetch detail for each teacher to get classes
      const enriched = await Promise.all(
        res.teachers.map(async (t) => {
          try {
            const detail = await principalTeachersAPI.getById(t.id);
            return {
              ...t,
              classCount: detail.Class.length,
              subjectCount: detail.TeacherSubject.length,
              totalStudents: detail.Class.reduce(
                (sum, c) => sum + (c._count?.Student || 0),
                0
              ),
            };
          } catch {
            return {
              ...t,
              classCount: 0,
              subjectCount: t.subjects.length,
              totalStudents: 0,
            };
          }
        })
      );

      enriched.sort((a, b) => b.totalStudents - a.totalStudents);
      setRows(enriched);
    } catch (err: unknown) {
      console.error('❌ [Workload] Error:', err);
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

  const totalWorkload = rows.reduce((s, r) => s + r.totalStudents, 0);
  const avgWorkload =
    rows.length > 0 ? Math.round(totalWorkload / rows.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="text-blue-500" size={26} />
            بار کاری معلمان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            توزیع صنوف، مضامین و شاگردان در میان معلمان
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

      {/* Summary */}
      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">تعداد معلمان</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(rows.length)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">مجموع شاگردان</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(totalWorkload)}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">میانگین هر معلم</p>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(avgWorkload)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
            <p className="mt-3 text-gray-500 text-sm">
              در حال محاسبه بار کاری...
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">معلمی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    معلم
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    صنوف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    مضامین
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شاگردان
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    بار کاری
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const workloadLevel =
                    row.totalStudents > 100
                      ? 'HIGH'
                      : row.totalStudents > 50
                      ? 'MEDIUM'
                      : 'LOW';
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/academic/teachers/${row.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 overflow-hidden flex-shrink-0">
                            {row.profileImage ? (
                              <img
                                src={row.profileImage}
                                alt={row.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={16} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600">
                              {row.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {row.teacherCode || row.email}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Home size={14} className="text-gray-400" />
                          {formatNumber(row.classCount)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <BookOpen size={14} className="text-gray-400" />
                          {formatNumber(row.subjectCount)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Users size={14} className="text-gray-400" />
                          {formatNumber(row.totalStudents)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            workloadLevel === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : workloadLevel === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {workloadLevel === 'HIGH'
                            ? 'بالا'
                            : workloadLevel === 'MEDIUM'
                            ? 'متوسط'
                            : 'پایین'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}