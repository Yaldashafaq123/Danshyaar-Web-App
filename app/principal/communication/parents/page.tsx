// app/admin/academic/communication/parents/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Users,
  Home,
  ChevronLeft,
  ChevronRight,
  Send,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { principalStudentsAPI, principalClassesAPI } from '@/lib/api/principal';
import type { Student, Class } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

interface ParentContact {
  id: number;
  parentId: number;
  studentName: string;
  studentImage?: string;
  className: string;
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  relationship?: string;
}

export default function ParentsCommunicationPage() {
  const [contacts, setContacts] = useState<ParentContact[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchClasses = async () => {
    try {
      const data = await principalClassesAPI.list();
      setClasses(data);
    } catch (err) {
      console.error('Classes load error:', err);
    }
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const studentsRes = await principalStudentsAPI.list({
        page,
        limit,
        search: search || undefined,
        classId: classFilter !== 'all' ? Number(classFilter) : 'all',
      });

      const collected: ParentContact[] = [];

      for (const s of studentsRes.students) {
        try {
          const detail = await principalStudentsAPI.getById(s.id);
          if (detail.ParentStudent && detail.ParentStudent.length > 0) {
            for (const ps of detail.ParentStudent) {
              collected.push({
                id: s.id * 1000 + (ps.Parent.id % 1000),
                parentId: ps.Parent.id,
                studentName: s.fullName,
                studentImage: s.profileImage,
                className: s.className,
                parentName: ps.Parent.User?.fullName || 'نامشخص',
                parentEmail: ps.Parent.User?.email,
                parentPhone: ps.Parent.User?.phone,
              });
            }
          }
        } catch {
          // skip students without parent data
        }
      }

      setContacts(collected);
      setTotal(studentsRes.total);
      setTotalPages(studentsRes.totalPages);
    } catch (err: unknown) {
      console.error('❌ [Parents] Error:', err);
      let message = 'خطا در دریافت اطلاعات والدین';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, classFilter]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const copyToClipboard = (text: string, id: number) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-blue-500" size={26} />
            ارتباط با والدین
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total > 0
              ? `اطلاعات والدین ${total.toLocaleString('fa-IR')} شاگرد`
              : 'مدیریت تماس با والدین'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/academic/communication/sms"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Send size={16} />
            ارسال پیامک
          </Link>
          <button
            onClick={fetchContacts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو بر اساس نام شاگرد یا والد..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">همه صنوف</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section || ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Contacts grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          <p className="mt-3 text-gray-500 text-sm">
            در حال بارگذاری اطلاعات والدین...
          </p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            اطلاعات والدی برای این فیلتر یافت نشد
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                {/* Student */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden flex-shrink-0">
                    {c.studentImage ? (
                      <img
                        src={c.studentImage}
                        alt={c.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {c.studentName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {c.className}
                    </p>
                  </div>
                  <Link
                    href={`/admin/academic/students/${c.id % 1000 || c.id}`}
                    className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                    title="پروفایل شاگرد"
                  >
                    <ChevronLeft size={16} />
                  </Link>
                </div>

                {/* Parent */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {c.parentName}
                    </span>
                  </div>

                  {c.parentEmail && (
                    <div className="flex items-center gap-2 group">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <a
                        href={`mailto:${c.parentEmail}`}
                        className="text-sm text-blue-600 hover:underline truncate flex-1"
                      >
                        {c.parentEmail}
                      </a>
                      <button
                        onClick={() =>
                          copyToClipboard(c.parentEmail!, c.id + 1)
                        }
                        className="p-1 text-gray-400 hover:text-blue-600 rounded opacity-0 group-hover:opacity-100"
                        title="کپی"
                      >
                        {copiedId === c.id + 1 ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  )}

                  {c.parentPhone && (
                    <div className="flex items-center gap-2 group">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${c.parentPhone}`}
                        className="text-sm text-blue-600 hover:underline flex-1"
                      >
                        {c.parentPhone}
                      </a>
                      <button
                        onClick={() =>
                          copyToClipboard(c.parentPhone!, c.id + 2)
                        }
                        className="p-1 text-gray-400 hover:text-blue-600 rounded opacity-0 group-hover:opacity-100"
                        title="کپی"
                      >
                        {copiedId === c.id + 2 ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
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
        </>
      )}
    </div>
  );
}