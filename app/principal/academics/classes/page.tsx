// app/admin/academic/academics/classes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Edit3,
  Trash2,
  Eye,
  Users,
  User,
  Save,
} from 'lucide-react';
import { principalClassesAPI, principalAcademicYearsAPI, principalTeachersAPI } from '@/lib/api/principal';
import type { Class, AcademicYear, Teacher } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    section: '',
    academicYearId: '',
    teacherId: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cls, yrs, tch] = await Promise.all([
        principalClassesAPI.list(),
        principalAcademicYearsAPI.list(),
        principalTeachersAPI.list({ limit: 200, status: 'active' }),
      ]);
      setClasses(cls);
      setYears(yrs);
      setTeachers(tch.teachers);
    } catch (err: unknown) {
      console.error('❌ [Classes] Error:', err);
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

  const openCreate = () => {
    setEditingId(null);
    const activeYear = years.find((y) => y.isActive);
    setForm({
      name: '',
      section: '',
      academicYearId: activeYear ? String(activeYear.id) : '',
      teacherId: '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (c: Class) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      section: c.section || '',
      academicYearId: c.academicYearId ? String(c.academicYearId) : '',
      teacherId: c.teacherId ? String(c.teacherId) : '',
      description: c.description || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.academicYearId) {
      setError('نام صنف و سال تحصیلی الزامی است');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: form.name,
        section: form.section,
        academicYearId: Number(form.academicYearId),
        teacherId: form.teacherId ? Number(form.teacherId) : undefined,
        description: form.description,
      };
      if (editingId) {
        await principalClassesAPI.update(editingId, payload);
        setSuccess('صنف بروزرسانی شد');
      } else {
        await principalClassesAPI.create(payload);
        setSuccess('صنف جدید ایجاد شد');
      }
      setModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ذخیره';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setProcessingId(deleteId);
      await principalClassesAPI.delete(deleteId);
      setSuccess('صنف حذف شد');
      setDeleteId(null);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در حذف';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
      setDeleteId(null);
    } finally {
      setProcessingId(null);
    }
  };

  const totalStudents = classes.reduce((s, c) => s + c.studentCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="text-purple-500" size={26} />
            صنوف
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {classes.length} صنف • {totalStudents.toLocaleString('fa-IR')} شاگرد
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            بروزرسانی
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <Plus size={16} />
            صنف جدید
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Home className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">هیچ صنفی ثبت نشده</p>
          <button
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <Plus size={16} />
            ایجاد اولین صنف
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <Home size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {c.name} {c.section || ''}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {c.academicYear || 'بدون سال'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Users size={14} /> شاگردان
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(c.studentCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <User size={14} /> معلم
                  </span>
                  <span className="font-medium text-gray-700 truncate max-w-[140px]">
                    {c.teacherName}
                  </span>
                </div>
              </div>

              <Link
                href={`/admin/academic/academics/classes/${c.id}`}
                className="mt-4 w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100"
              >
                <Eye size={12} />
                مشاهده جزئیات
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'ویرایش صنف' : 'صنف جدید'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    نام صنف *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="اول، دوم..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    شعبه
                  </label>
                  <input
                    type="text"
                    value={form.section}
                    onChange={(e) =>
                      setForm({ ...form, section: e.target.value })
                    }
                    placeholder="الف، ب، ج"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  سال تحصیلی *
                </label>
                <select
                  value={form.academicYearId}
                  onChange={(e) =>
                    setForm({ ...form, academicYearId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب کنید...</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.isActive ? '(فعال)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  معلم مسئول
                </label>
                <select
                  value={form.teacherId}
                  onChange={(e) =>
                    setForm({ ...form, teacherId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">تعیین نشده</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  توضیحات
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">حذف صنف</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              اگر صنف شاگرد داشته باشد، حذف نخواهد شد.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={processingId !== null}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={processingId !== null}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {processingId !== null ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}