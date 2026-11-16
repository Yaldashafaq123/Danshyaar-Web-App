// app/admin/academic/academics/classes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Home,
  Users,
  User,
  BookOpen,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { principalClassesAPI, principalSubjectsAPI } from '@/lib/api/principal';
import type { Class, Subject } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.id);

  const [classData, setClassData] = useState<Class | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [cls, subj] = await Promise.all([
          principalClassesAPI.list(),
          principalSubjectsAPI.list({ limit: 1000 }),
        ]);
        const found = cls.find((c) => c.id === classId);
        if (!found) throw new Error('صنف یافت نشد');
        setClassData(found);
        // Filter subjects assigned to this class
        const classSubjects = subj.subjects.filter((s) =>
          s.classes.some((c) => c.id === classId)
        );
        setSubjects(classSubjects);
      } catch (err: unknown) {
        console.error('❌ [Class Detail] Error:', err);
        let message = 'خطا در دریافت اطلاعات';
        if (err && typeof err === 'object' && 'message' in err) {
          message = (err as { message?: string }).message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (!isNaN(classId)) load();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !classData) {
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {classData.name} {classData.section || ''}
          </h1>
          <p className="text-gray-500 text-sm">
            {classData.academicYear || 'بدون سال'}
          </p>
        </div>
        <Link
          href={`/admin/academic/timetable/${classData.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Calendar size={16} />
          تقسیم اوقات
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="شاگردان"
          value={formatNumber(classData.studentCount)}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatBox
          label="مضامین"
          value={formatNumber(subjects.length)}
          icon={BookOpen}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatBox
          label="معلم مسئول"
          value={classData.teacherName || '-'}
          icon={User}
          color="text-purple-600"
          bg="bg-purple-50"
          isText
        />
        <StatBox
          label="وضعیت"
          value={classData.is_active ? 'فعال' : 'غیرفعال'}
          icon={Home}
          color={classData.is_active ? 'text-green-600' : 'text-red-600'}
          bg={classData.is_active ? 'bg-green-50' : 'bg-red-50'}
          isText
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              مضامین این صنف
            </h3>
            <Link
              href="/admin/academic/academics/subjects"
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              مدیریت مضامین →
            </Link>
          </div>
          {subjects.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              هیچ مضمونی به این صنف متصل نیست
            </p>
          ) : (
            <div className="space-y-2">
              {subjects.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/academic/academics/subjects/${s.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {s.teachers.length === 0
                      ? 'معلم تعیین نشده'
                      : s.teachers[0].name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            دسترسی سریع
          </h3>
          <div className="space-y-2">
            <QuickLink
              label="تقسیم اوقات صنف"
              description="مشاهده و ویرایش جدول زمانی"
              icon={Calendar}
              href={`/admin/academic/timetable/${classData.id}`}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <QuickLink
              label="لیست شاگردان"
              description={`${classData.studentCount} شاگرد در این صنف`}
              icon={Users}
              href="/admin/academic/students"
              color="text-green-600"
              bg="bg-green-50"
            />
            <QuickLink
              label="امتحانات"
              description="امتحانات مربوط به این صنف"
              icon={Clock}
              href="/admin/academic/exams"
              color="text-purple-600"
              bg="bg-purple-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  bg,
  isText = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  isText?: boolean;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p
        className={`${
          isText ? 'text-base' : 'text-2xl'
        } font-bold ${color} truncate`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  label,
  description,
  icon: Icon,
  href,
  color,
  bg,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bg: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <ChevronLeft size={16} className="text-gray-400" />
    </Link>
  );
}
