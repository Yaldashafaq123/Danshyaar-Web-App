// app/admin/academic/teachers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Edit3,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Users,
  Star,
  AlertCircle,
  Loader2,
  Home,
  Award,
  TrendingUp,
} from 'lucide-react';
import { principalTeachersAPI } from '@/lib/api/principal';
import type { TeacherDetail } from '@/types/principal';
import { formatNumber, formatDate } from '@/lib/utils/principal-helpers';

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = Number(params.id);

  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (isNaN(teacherId)) {
        setError('شناسه معلم نامعتبر است');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await principalTeachersAPI.getById(teacherId);
        setTeacher(data);
      } catch (err: unknown) {
        console.error('❌ [Teacher Detail] Error:', err);
        let message = 'خطا در دریافت اطلاعات معلم';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          message = e.response?.data?.message || e.message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-600" size={20} />
            <h3 className="font-semibold text-red-700">خطا</h3>
          </div>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalStudents = teacher.Class.reduce(
    (sum, c) => sum + (c._count?.Student || 0),
    0
  );

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
              پروفایل معلم
            </h1>
            <p className="text-gray-500 text-sm">اطلاعات کامل معلم</p>
          </div>
        </div>
        <Link
          href={`/admin/academic/teachers/${teacher.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit3 size={16} />
          ویرایش
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 overflow-hidden">
                {teacher.User.profileImage ? (
                  <img
                    src={teacher.User.profileImage}
                    alt={teacher.User.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} />
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {teacher.User.fullName}
              </h2>
              {teacher.teacherCode && (
                <p className="text-sm text-gray-500 mt-1">
                  کد معلم: {teacher.teacherCode}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  {teacher.rating ? teacher.rating.toFixed(1) : '0.0'}
                </span>
              </div>
              <span
                className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  teacher.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {teacher.isActive ? 'فعال' : 'غیرفعال'}
              </span>

              <div className="mt-4 w-full space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{teacher.User.email}</span>
                </div>
                {teacher.User.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{teacher.User.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              خلاصه
            </h3>
            <StatRow
              label="تعداد صنوف"
              value={formatNumber(teacher.Class.length)}
              icon={Home}
              color="text-blue-600"
            />
            <StatRow
              label="مجموع شاگردان"
              value={formatNumber(totalStudents)}
              icon={Users}
              color="text-purple-600"
            />
            <StatRow
              label="تعداد مضامین"
              value={formatNumber(teacher.TeacherSubject.length)}
              icon={BookOpen}
              color="text-green-600"
            />
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specialization */}
          {teacher.specialization && (
            <SectionCard title="تخصص">
              <div className="flex items-center gap-2 text-gray-700">
                <Award size={18} className="text-blue-600" />
                <span>{teacher.specialization}</span>
              </div>
            </SectionCard>
          )}

          {/* Subjects */}
          <SectionCard title="مضامین تدریس">
            {teacher.TeacherSubject.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                مضمونی تعیین نشده
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {teacher.TeacherSubject.map((ts, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    <BookOpen size={14} />
                    {ts.Subject.name}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Classes */}
          <SectionCard title="صنوف تدریس">
            {teacher.Class.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                صنفی تعیین نشده
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teacher.Class.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/academic/academics/classes/${c.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {c.name} {c.section || ''}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatNumber(c._count?.Student || 0)} شاگرد
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Salary history (read-only, no edit) */}
          <SectionCard title="سابقه معاش (فقط مشاهده)">
            {teacher.Salary.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                سابقه معاش ثبت نشده
              </p>
            ) : (
              <div className="space-y-2">
                {teacher.Salary.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-700">
                        ماه {s.month} / {s.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatNumber(s.finalAmount)} افغانی
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : s.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.status === 'PAID'
                          ? 'پرداخت شده'
                          : s.status === 'PENDING'
                          ? 'در انتظار'
                          : s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">
              برای مدیریت معاش به بخش مالی مراجعه کنید
            </p>
          </SectionCard>
        </div>
      </div>
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

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}