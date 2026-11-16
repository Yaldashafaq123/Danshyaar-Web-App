// app/admin/hr/staff/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  User,
  Phone,
  Mail,
  Home,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Briefcase,
  Download,
} from 'lucide-react';
import { hrStaffAPI } from '@/lib/api/hr';
import type { StaffMember } from '@/types/hr';
import {
  formatNumber,
  formatShamsiDate,
  staffTypeLabels,
  staffTypeColors,
} from '@/lib/utils/hr-helpers';

export default function StaffListPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [staffTypeFilter, setStaffTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrStaffAPI.list({
        page,
        limit,
        search: search || undefined,
        staffType: staffTypeFilter !== 'all' ? staffTypeFilter : 'all',
        status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive') : undefined,
      });
      setStaff(res.staff);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      console.error('❌ [Staff] Error:', err);
      let message = 'خطا در دریافت لیست کارمندان';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, staffTypeFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setSearch('');
    setStaffTypeFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const hasFilters =
    search || staffTypeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-pink-500" size={26} />
            کارمندان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total > 0
              ? `${total.toLocaleString('fa-IR')} کارمند ثبت شده`
              : 'مدیریت کارمندان و پرسنل مکتب'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/hr/staff/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            ثبت کارمند
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو نام، ایمیل یا شماره تذکره..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <select
            value={staffTypeFilter}
            onChange={(e) => {
              setStaffTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">همه انواع</option>
            {Object.entries(staffTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>

        {hasFilters && (
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              پاک کردن فیلترها
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
          </div>
        ) : staff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">هیچ کارمندی یافت نشد</p>
            {!hasFilters && (
              <Link
                href="/admin/hr/staff/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
              >
                <Plus size={16} />
                ثبت اولین کارمند
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    کارمند
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    نوع
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    سمت
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    بخش
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    تاریخ شمولیت
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    وضعیت
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden flex-shrink-0">
                          {s.profileImage ? (
                            <img
                              src={s.profileImage}
                              alt={s.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {s.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          staffTypeColors[s.staffType] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {staffTypeLabels[s.staffType] || s.staffType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {s.position || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {s.department || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.joinDate ? formatShamsiDate(s.joinDate) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          s.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {s.isActive ? (
                          <>
                            <UserCheck size={10} /> فعال
                          </>
                        ) : (
                          <>
                            <UserX size={10} /> غیرفعال
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/hr/staff/${s.id}`}
                        className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm"
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
        {!loading && staff.length > 0 && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              صفحه {page.toLocaleString('fa-IR')} از{' '}
              {totalPages.toLocaleString('fa-IR')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
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