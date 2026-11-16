// app/admin/academic/evaluations/teachers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  BookOpen,
  Star,
  Award,
  ArrowRight,
  X,
  Play,
} from 'lucide-react';
import { principalEvaluationsAPI } from '@/lib/api/principal';
import type { EvaluationTemplate } from '@/types/principal';
import { formatNumber, evaluationPeriodLabels } from '@/lib/utils/principal-helpers';

interface TeacherForEval {
  id: number;
  userId: number;
  fullName: string;
  email?: string;
  profileImage?: string;
  teacherCode?: string;
  specialization?: string;
  rating: number;
  subjects: string[];
  classes: string[];
  evaluationsCount: number;
}

export default function SelectTeacherPage() {
  const router = useRouter();

  const [teachers, setTeachers] = useState<TeacherForEval[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Start modal
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherForEval | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [period, setPeriod] = useState('SEMESTER');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teacherRes, templatesRes] = await Promise.all([
        principalEvaluationsAPI.listTeachers({ search: search || undefined }),
        principalEvaluationsAPI.listTemplates(),
      ]);
      setTeachers(teacherRes as TeacherForEval[]);
      setTemplates(templatesRes);
      const defaultTpl = templatesRes.find((t) => t.isDefault);
      if (defaultTpl) setSelectedTemplateId(String(defaultTpl.id));
      else if (templatesRes.length > 0)
        setSelectedTemplateId(String(templatesRes[0].id));
    } catch (err: unknown) {
      console.error('❌ [Teacher Selection] Error:', err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartEvaluation = async () => {
    if (!selectedTeacher || !selectedTemplateId) {
      setError('لطفاً معلم و قالب را انتخاب کنید');
      return;
    }
    try {
      setCreating(true);
      setError(null);
      const result = (await principalEvaluationsAPI.create({
        teacherId: selectedTeacher.id,
        templateId: Number(selectedTemplateId),
        period,
      })) as { id?: number } | undefined;
      setSuccess('ارزیابی ایجاد شد');
      const newId = result?.id;
      setTimeout(() => {
        if (newId) router.push(`/admin/academic/evaluations/${newId}`);
        else router.push('/admin/academic/evaluations');
      }, 800);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ایجاد ارزیابی';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    `${t.fullName} ${t.teacherCode || ''} ${t.specialization || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/academic/evaluations"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="text-pink-500" size={26} />
              انتخاب معلم برای ارزیابی
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              یک معلم را انتخاب کنید تا ارزیابی جدید آغاز شود
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

      {/* Templates warning */}
      {templates.length === 0 && !loading && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-orange-800">
            <p className="font-medium mb-1">هیچ قالب ارزیابی وجود ندارد</p>
            <p>
              برای شروع ارزیابی، ابتدا یک قالب ارزیابی ایجاد کنید.{' '}
              <Link
                href="/admin/academic/evaluations/templates"
                className="underline font-medium"
              >
                رفتن به قالب‌ها
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی معلم بر اساس نام، کد یا تخصص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Teachers grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <User className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">معلمی یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden flex-shrink-0">
                  {t.profileImage ? (
                    <img
                      src={t.profileImage}
                      alt={t.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 truncate">
                    {t.fullName}
                  </h3>
                  {t.teacherCode && (
                    <p className="text-xs text-gray-500">
                      کد: {t.teacherCode}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Star
                      size={12}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {t.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {t.specialization && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="text-gray-400">تخصص: </span>
                  {t.specialization}
                </p>
              )}

              <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
                {t.subjects.slice(0, 3).map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    <BookOpen size={10} />
                    {s}
                  </span>
                ))}
                {t.subjects.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{t.subjects.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Award size={12} />
                  {formatNumber(t.evaluationsCount)} ارزیابی
                </div>
                <button
                  onClick={() => {
                    setSelectedTeacher(t);
                    setError(null);
                    setSuccess(null);
                  }}
                  disabled={templates.length === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white rounded-lg text-xs hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={12} />
                  ارزیابی
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start evaluation modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                شروع ارزیابی جدید
              </h3>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 overflow-hidden">
                {selectedTeacher.profileImage ? (
                  <img
                    src={selectedTeacher.profileImage}
                    alt={selectedTeacher.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedTeacher.fullName}
                </p>
                {selectedTeacher.specialization && (
                  <p className="text-xs text-gray-600">
                    {selectedTeacher.specialization}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  قالب ارزیابی *
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب کنید...</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.criteriaCount} معیار)
                      {tpl.isDefault ? ' ⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  دوره ارزیابی
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(evaluationPeriodLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedTeacher(null)}
                disabled={creating}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleStartEvaluation}
                disabled={creating || !selectedTemplateId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 text-sm"
              >
                {creating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Play size={14} />
                )}
                شروع ارزیابی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}