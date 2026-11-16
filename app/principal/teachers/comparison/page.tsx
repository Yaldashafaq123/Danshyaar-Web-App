// app/admin/academic/teachers/comparison/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  RefreshCw,
  User,
  Loader2,
  AlertCircle,
  Home,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Award,
} from 'lucide-react';
import { principalTeachersAPI } from '@/lib/api/principal';
import type { Teacher } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

interface CompareRow {
  id: number;
  fullName: string;
  profileImage?: string;
  isActive: boolean;
  classCount: number;
  subjectCount: number;
  studentCount: number;
  rating: number;
  salaryCount: number;
}

export default function TeacherComparisonPage() {
  const [rows, setRows] = useState<CompareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await principalTeachersAPI.list({ limit: 200 });

      const enriched = await Promise.all(
        res.teachers.map(async (t) => {
          try {
            const detail = await principalTeachersAPI.getById(t.id);
            return {
              id: t.id,
              fullName: t.fullName,
              profileImage: t.profileImage,
              isActive: t.isActive,
              classCount: detail.Class.length,
              subjectCount: detail.TeacherSubject.length,
              studentCount: detail.Class.reduce(
                (sum, c) => sum + (c._count?.Student || 0),
                0
              ),
              rating: t.rating || 0,
              salaryCount: detail.Salary.length,
            };
          } catch {
            return {
              id: t.id,
              fullName: t.fullName,
              profileImage: t.profileImage,
              isActive: t.isActive,
              classCount: 0,
              subjectCount: t.subjects.length,
              studentCount: 0,
              rating: t.rating || 0,
              salaryCount: 0,
            };
          }
        })
      );

      setRows(enriched);
    } catch (err: unknown) {
      console.error('❌ [Comparison] Error:', err);
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

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selectedRows = rows.filter((r) => selected.includes(r.id));

  // Find max values for scaling
  const maxStudents = Math.max(1, ...selectedRows.map((r) => r.studentCount));
  const maxClasses = Math.max(1, ...selectedRows.map((r) => r.classCount));
  const maxSubjects = Math.max(1, ...selectedRows.map((r) => r.subjectCount));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-purple-500" size={26} />
            مقایسه معلمان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            مقایسه بار کاری و عملکرد معلمان (حداکثر ۳ معلم)
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

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          <p className="mt-3 text-gray-500 text-sm">در حال بارگذاری...</p>
        </div>
      ) : (
        <>
          {/* Selection list */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              انتخاب معلمان (حداکثر ۳ نفر)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {rows.map((r) => {
                const isSelected = selected.includes(r.id);
                const isDisabled = !isSelected && selected.length >= 3;
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleSelect(r.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : isDisabled
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-500 overflow-hidden flex-shrink-0">
                      {r.profileImage ? (
                        <img
                          src={r.profileImage}
                          alt={r.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={12} />
                      )}
                    </div>
                    <span className="truncate">{r.fullName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison */}
          {selectedRows.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Award className="mx-auto text-gray-300" size={48} />
              <p className="mt-3 text-gray-500">
                لطفاً حداقل یک معلم انتخاب کنید
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-5">
                جدول مقایسه
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 border-b border-gray-100">
                        معیار
                      </th>
                      {selectedRows.map((r) => (
                        <th
                          key={r.id}
                          className="text-center px-4 py-3 border-b border-gray-100"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 overflow-hidden">
                              {r.profileImage ? (
                                <img
                                  src={r.profileImage}
                                  alt={r.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={18} />
                              )}
                            </div>
                            <span className="text-xs font-medium text-gray-900">
                              {r.fullName}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <CompareRow
                      icon={Home}
                      label="تعداد صنوف"
                      values={selectedRows.map((r) => r.classCount)}
                      max={maxClasses}
                    />
                    <CompareRow
                      icon={BookOpen}
                      label="تعداد مضامین"
                      values={selectedRows.map((r) => r.subjectCount)}
                      max={maxSubjects}
                    />
                    <CompareRow
                      icon={Users}
                      label="مجموع شاگردان"
                      values={selectedRows.map((r) => r.studentCount)}
                      max={maxStudents}
                    />
                    <CompareRow
                      icon={Star}
                      label="امتیاز"
                      values={selectedRows.map((r) => Math.round(r.rating * 10))}
                      max={50}
                      suffix="%"
                      isRating
                    />
                  </tbody>
                </table>
              </div>

              {/* Winner summary */}
              {selectedRows.length >= 2 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <HighlightCard
                    title="بیشترین شاگردان"
                    student={selectedRows.reduce((a, b) =>
                      a.studentCount > b.studentCount ? a : b
                    )}
                    value={(selectedRows.reduce((a, b) =>
                      a.studentCount > b.studentCount ? a : b
                    ).studentCount).toString()}
                    suffix="شاگرد"
                    icon={Users}
                    color="text-purple-600"
                    bg="bg-purple-50"
                  />
                  <HighlightCard
                    title="بیشترین صنوف"
                    student={selectedRows.reduce((a, b) =>
                      a.classCount > b.classCount ? a : b
                    )}
                    value={(selectedRows.reduce((a, b) =>
                      a.classCount > b.classCount ? a : b
                    ).classCount).toString()}
                    suffix="صنف"
                    icon={Home}
                    color="text-blue-600"
                    bg="bg-blue-50"
                  />
                  <HighlightCard
                    title="بالاترین امتیاز"
                    student={selectedRows.reduce((a, b) =>
                      a.rating > b.rating ? a : b
                    )}
                    value={(
                      selectedRows.reduce((a, b) =>
                        a.rating > b.rating ? a : b
                      ).rating
                    ).toFixed(1)}
                    suffix="ستاره"
                    icon={TrendingUp}
                    color="text-yellow-600"
                    bg="bg-yellow-50"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CompareRow({
  icon: Icon,
  label,
  values,
  max,
  suffix = '',
  isRating = false,
}: {
  icon: React.ElementType;
  label: string;
  values: number[];
  max: number;
  suffix?: string;
  isRating?: boolean;
}) {
  const displayValues = isRating ? values.map((v) => v / 10) : values;
  const displayMax = isRating ? max / 10 : max;
  const best = Math.max(...displayValues);

  return (
    <tr>
      <td className="px-4 py-4 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-gray-400" />
          {label}
        </div>
      </td>
      {displayValues.map((v, i) => {
        const percent = displayMax > 0 ? (v / displayMax) * 100 : 0;
        const isBest = v === best && values.length > 1;
        return (
          <td key={i} className="px-4 py-4">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`text-sm font-bold ${
                  isBest ? 'text-green-600' : 'text-gray-800'
                }`}
              >
                {isRating ? v.toFixed(1) : formatNumber(v)}
                {suffix && <span className="text-xs ml-1">{suffix}</span>}
              </span>
              <div className="w-full max-w-[100px] bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    isBest ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function HighlightCard({
  title,
  student,
  value,
  suffix,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  student: CompareRow;
  value: string;
  suffix: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{title}</p>
      </div>
      <p className="text-sm font-medium text-gray-900 truncate">
        {student.fullName}
      </p>
      <p className={`text-2xl font-bold ${color} mt-1`}>
        {value}
        <span className="text-xs ml-1">{suffix}</span>
      </p>
    </div>
  );
}