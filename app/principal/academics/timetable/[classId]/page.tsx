// app/admin/academic/timetable/[classId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Loader2,
  AlertCircle,
  Save,
  Trash2,
  Edit3,
  X,
  BookOpen,
  User,
  Home,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { principalTimetableAPI, principalClassesAPI } from '@/lib/api/principal';
import { principalSubjectsAPI, principalTeachersAPI } from '@/lib/api/principal';
import type { TimetableResponse, Subject, Teacher } from '@/types/principal';
import { dayNames } from '@/lib/utils/principal-helpers';

export default function ClassTimetablePage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.classId);

  const [data, setData] = useState<TimetableResponse | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editPeriod, setEditPeriod] = useState<number | null>(null);
  const [form, setForm] = useState({
    subjectId: '',
    teacherId: '',
    room: '',
    startTime: '',
    endTime: '',
  });
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadTimetable = async (day: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await principalTimetableAPI.get(classId, day);
      setData(res);
    } catch (err: unknown) {
      console.error('❌ [Timetable] Error:', err);
      let message = 'خطا در دریافت جدول';
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
    loadTimetable(currentDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, currentDay]);

  useEffect(() => {
    Promise.all([
      principalSubjectsAPI.list({ limit: 1000 }),
      principalTeachersAPI.list({ limit: 200, status: 'active' }),
    ])
      .then(([sub, tch]) => {
        setSubjects(sub.subjects);
        setTeachers(tch.teachers);
      })
      .catch((e) => console.error('Dropdown load error:', e));
  }, []);

  const openEdit = (period: number) => {
    const entry = data?.periods.find((p) => p.period === period);
    setEditPeriod(period);
    setForm({
      subjectId: entry?.subjectId ? String(entry.subjectId) : '',
      teacherId: entry?.teacherId ? String(entry.teacherId) : '',
      room: entry?.room || '',
      startTime: entry?.startTime || '',
      endTime: entry?.endTime || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.subjectId) {
      setError('مضمون الزامی است');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await principalTimetableAPI.save({
        classId,
        day: currentDay,
        period: editPeriod!,
        subjectId: Number(form.subjectId),
        teacherId: form.teacherId ? Number(form.teacherId) : undefined,
        room: form.room || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
      });
      setSuccess('جدول ذخیره شد');
      setModalOpen(false);
      await loadTimetable(currentDay);
      setTimeout(() => setSuccess(null), 2500);
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
      await principalTimetableAPI.delete(deleteId);
      setSuccess('حذف شد');
      setDeleteId(null);
      await loadTimetable(currentDay);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      console.error(err);
      setError('خطا در حذف');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              تقسیم اوقات {data?.class.name || ''}
            </h1>
            <p className="text-gray-500 text-sm">
              {data?.class.academicYear || ''}
            </p>
          </div>
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

      {/* Day tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
        {dayNames.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentDay(idx)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentDay === idx
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Periods */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.periods.map((period) => (
              <div
                key={period.period}
                className={`p-4 flex items-center gap-4 ${
                  period.isEmpty ? 'bg-gray-50/50' : ''
                }`}
              >
                {/* Period number */}
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  {period.period + 1}
                </div>

                {/* Time */}
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    {period.startTime}
                  </p>
                  <p className="text-xs text-gray-500">{period.endTime}</p>
                </div>

                {/* Subject */}
                <div className="flex-1 min-w-0">
                  {period.isEmpty ? (
                    <span className="text-sm text-gray-400">خالی</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-sm font-medium">
                        <BookOpen size={12} />
                        {period.subject}
                      </span>
                      {period.teacher && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          <User size={10} />
                          {period.teacher}
                        </span>
                      )}
                      {period.room && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          <Home size={10} />
                          {period.room}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(period.period)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="ویرایش"
                  >
                    {period.isEmpty ? <Plus size={16} /> : <Edit3 size={16} />}
                  </button>
                  {!period.isEmpty && period.id && (
                    <button
                      onClick={() => setDeleteId(period.id!)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && editPeriod !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {data?.periods.find((p) => p.period === editPeriod)?.isEmpty
                  ? 'افزودن مضمون'
                  : 'ویرایش مضمون'}{' '}
                — {dayNames[currentDay]} دوره {editPeriod + 1}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  مضمون *
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) =>
                    setForm({ ...form, subjectId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب کنید...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  معلم
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
                  اتاق / صنف
                </label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder="مثال: صنف ۱۰۱"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    زمان شروع
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    زمان پایان
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
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

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">حذف دوره</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              آیا این دوره را از جدول حذف کنیم؟
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                <Trash2 size={14} />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}