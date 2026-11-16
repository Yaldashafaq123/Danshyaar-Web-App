// app/admin/academic/students/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  Eye,
  RefreshCw,
  GraduationCap,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Award,
} from 'lucide-react';
import { principalStudentsAPI } from '@/lib/api/principal';
import { principalClassesAPI } from '@/lib/api/principal';
import type { Student, Class } from '@/types/principal';
import {
  studentStatusLabels,
  studentStatusColors,
  formatDate,
} from '@/lib/utils/principal-helpers';

export default function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchClasses = async () => {
    try {
      const data = await principalClassesAPI.list();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await principalStudentsAPI.list({
        page,
        limit,
        search: search || undefined,
        classId: classFilter !== 'all' ? Number(classFilter) : 'all',
        status: statusFilter !== 'all' ? statusFilter : 'all',
      });
      setStudents(data.students);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      console.error('❌ [Students] Error:', err);
      let message = 'خطا در دریافت لیست شاگردان';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, classFilter, statusFilter]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleClassChange = (value: string) => {
    setClassFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لیست شاگردان</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total > 0
              ? `${total.toLocaleString('fa-IR')} شاگرد ثبت شده`
              : 'مدیریت شاگردان مکتب'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStudents}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            بروزرسانی
          </button>
          <Link
            href="/admin/academic/students/promotion"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <Award size={16} />
            ارتقاء
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو بر اساس نام، ایمیل یا شماره شاگرد..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Class filter */}
          <div className="relative">
            <Filter
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={classFilter}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">همه صنوف</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.section || ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="ACTIVE">فعال</option>
              <option value="GRADUATED">فارغ‌التحصیل</option>
              <option value="SUSPENDED">تعلیق</option>
              <option value="LEFT">ترک تحصیل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-3 text-gray-500 text-sm">در حال بارگذاری...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">هیچ شاگردی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شاگرد
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شماره شاگردی
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    صنف
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    وضعیت
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تاریخ ثبت
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden flex-shrink-0">
                          {student.profileImage ? (
                            <img
                              src={student.profileImage}
                              alt={student.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.studentNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {student.className}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          studentStatusColors[student.status] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {studentStatusLabels[student.status] || student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(student.enrollmentDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/academic/students/${student.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Eye size={14} />
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && students.length > 0 && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              صفحه {page.toLocaleString('fa-IR')} از{' '}
              {totalPages.toLocaleString('fa-IR')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}