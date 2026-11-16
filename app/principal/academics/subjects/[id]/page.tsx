// app/admin/academic/academics/subjects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Users,
  User,
  Home,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { principalSubjectsAPI, principalClassesAPI } from '@/lib/api/principal';
import type { Subject, Class } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = Number(params.id);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, cls] = await Promise.all([
        principalSubjectsAPI.list({ limit: 1000 }),
        principalClassesAPI.list(),
      ]);
      const found = list.subjects.find((s) => s.id === subjectId);
      if (!found) throw new Error('مضمون یافت نشد');
      setSubject(found);
      setClasses(cls);
    } catch (err: unknown) {
      console.error('❌ [Subject Detail] Error:', err);
      let message = 'خطا در دریافت اطلاعات';
      if (err && typeof err === 'object' && 'message' in err) {
        message = (err as { message?: string }).message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(subjectId)) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const handleAssign = async () => {
    if (!selectedClassId) return;
    try {
      setSaving(true);
      await principalSubjectsAPI.assignToClass({
        subjectId,
        classId: Number(selectedClassId),
      });
      setAssignOpen(false);
      setSelectedClassId('');
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در تخصیص';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (classId: number) => {
    try {
      await principalSubjectsAPI.removeFromClass(subjectId, classId);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError('خطا در حذف از صنف');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error || 'یافت نشد'}</p>
        </div>
      </div>
    );
  }

  const unassignedClasses = classes.filter(
    (c) => !subject.classes.some((sc) => sc.id === c.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
          <p className="text-gray-500 text-sm">جزئیات مضمون</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 text-center">
            {subject.name}
          </h2>
          {subject.description && (
            <p className="text-sm text-gray-500 text-center mt-2">
              {subject.description}
            </p>
          )}

          <div className="mt-6 space-y-3">
            <StatRow
              label="تعداد معلمان"
              value={formatNumber(subject.teacherCount)}
              icon={User}
              color="text-blue-600"
            />
            <StatRow
              label="تعداد صنوف"
              value={formatNumber(subject.classCount)}
              icon={Home}
              color="text-purple-600"
            />
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Teachers */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              معلمان
            </h3>
            {subject.teachers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                معلمی تعیین نشده
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subject.teachers.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                      {t.profileImage ? (
                        <img
                          src={t.profileImage}
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t.name}
                      </p>
                      {t.email && (
                        <p className="text-xs text-gray-500">{t.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Classes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                صنوف این مضمون
              </h3>
              <button
                onClick={() => setAssignOpen(true)}
                disabled={unassignedClasses.length === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
              >
                <Plus size={12} />
                افزودن به صنف
              </button>
            </div>

            {subject.classes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                این مضمون به هیچ صنفی متصل نیست
              </p>
            ) : (
              <div className="space-y-2">
                {subject.classes.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {c.name} {c.section || ''}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemove(c.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="حذف از صنف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign modal */}
      {assignOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">افزودن به صنف</h3>
              <button
                onClick={() => setAssignOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">صنف را انتخاب کنید...</option>
              {unassignedClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section || ''}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setAssignOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedClassId || saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                افزودن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Icon size={16} className={color} />
        {label}
      </div>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}