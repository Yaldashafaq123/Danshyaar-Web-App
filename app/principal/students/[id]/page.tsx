// app/admin/academic/students/[id]/page.tsx
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
  Home,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  ClipboardList,
} from 'lucide-react';
import { principalStudentsAPI } from '@/lib/api/principal';
import type { StudentDetail } from '@/types/principal';
import {
  studentStatusLabels,
  studentStatusColors,
  attendanceStatusLabels,
  attendanceStatusColors,
  formatDate,
  formatNumber,
  formatPercentage,
} from '@/lib/utils/principal-helpers';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params.id);

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (isNaN(studentId)) {
        setError('شناسه شاگرد نامعتبر است');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await principalStudentsAPI.getById(studentId);
        setStudent(data);
      } catch (err: unknown) {
        console.error('❌ [Student Detail] Error:', err);
        let message = 'خطا در دریافت اطلاعات شاگرد';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          message = e.response?.data?.message || e.message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-blue-500" size={40} />
          <p className="mt-4 text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
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

  // Compute attendance summary
  const totalAttendance = student.Attendance.length;
  const presentCount = student.Attendance.filter((a) => a.status === 'PRESENT').length;
  const absentCount = student.Attendance.filter((a) => a.status === 'ABSENT').length;
  const lateCount = student.Attendance.filter((a) => a.status === 'LATE').length;
  const excusedCount = student.Attendance.filter((a) => a.status === 'EXCUSED').length;
  const attendanceRate =
    totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Compute grade average
  const gradeAverage =
    student.Grade.length > 0
      ? student.Grade.reduce((s, g) => s + g.marks, 0) / student.Grade.length
      : 0;

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
              پروفایل شاگرد
            </h1>
            <p className="text-gray-500 text-sm">اطلاعات کامل شاگرد</p>
          </div>
        </div>
        <Link
          href={`/admin/academic/students/${student.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit3 size={16} />
          ویرایش
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                {student.User.profileImage ? (
                  <img
                    src={student.User.profileImage}
                    alt={student.User.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} />
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {student.User.fullName}
              </h2>
              {student.studentNumber && (
                <p className="text-sm text-gray-500 mt-1">
                  شماره شاگردی: {student.studentNumber}
                </p>
              )}
              <span
                className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  studentStatusColors[student.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {studentStatusLabels[student.status] || student.status}
              </span>

              <div className="mt-4 w-full space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{student.User.email}</span>
                </div>
                {student.User.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{student.User.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Home size={16} className="text-gray-400" />
                  <span>{student.Class?.name || 'بدون صنف'} {student.Class?.section || ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>ثبت: {formatDate(student.enrollmentDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              خلاصه
            </h3>
            <StatRow
              label="معدل نمرات"
              value={gradeAverage.toFixed(1)}
              icon={TrendingUp}
              color="text-blue-600"
            />
            <StatRow
              label="نرخ حضور"
              value={formatPercentage(attendanceRate)}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatRow
              label="تعداد امتحانات"
              value={formatNumber(student.Grade.length)}
              icon={ClipboardList}
              color="text-purple-600"
            />
            <StatRow
              label="تعداد والدین"
              value={formatNumber(student.ParentStudent.length)}
              icon={Users}
              color="text-orange-600"
            />
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance summary */}
          <SectionCard title="خلاصه حضور و غیاب">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniBox
                label="حاضر"
                value={presentCount}
                color="text-green-600"
                bg="bg-green-50"
              />
              <MiniBox
                label="غایب"
                value={absentCount}
                color="text-red-600"
                bg="bg-red-50"
              />
              <MiniBox
                label="تأخیر"
                value={lateCount}
                color="text-yellow-600"
                bg="bg-yellow-50"
              />
              <MiniBox
                label="معذور"
                value={excusedCount}
                color="text-blue-600"
                bg="bg-blue-50"
              />
            </div>

            {totalAttendance > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>نرخ حضور</span>
                  <span>{formatPercentage(attendanceRate)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* Recent grades */}
          <SectionCard title="آخرین نمرات">
            {student.Grade.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                نمره‌ای ثبت نشده
              </p>
            ) : (
              <div className="space-y-2">
                {student.Grade.slice(0, 8).map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {g.subject}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(g.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          g.marks >= 60
                            ? 'text-green-600'
                            : g.marks >= 40
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {g.marks}
                      </p>
                      {g.percentage !== undefined && (
                        <p className="text-xs text-gray-500">
                          {g.percentage.toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Parents */}
          <SectionCard title="والدین / سرپرستان">
            {student.ParentStudent.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                والدینی ثبت نشده
              </p>
            ) : (
              <div className="space-y-2">
                {student.ParentStudent.map((ps, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {ps.Parent.User.fullName || 'نامشخص'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ps.Parent.User.email}
                        {ps.Parent.User.phone && ` • ${ps.Parent.User.phone}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Fee summary (read-only, no finance edit) */}
          <SectionCard title="خلاصه مالی (فقط مشاهده)">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">مجموع</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(student.feeSummary.totalFees)}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">پرداخت شده</p>
                <p className="text-lg font-bold text-green-600">
                  {formatNumber(student.feeSummary.totalPaid)}
                </p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">باقی</p>
                <p className="text-lg font-bold text-red-600">
                  {formatNumber(student.feeSummary.totalBalance)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              برای مدیریت مالی به بخش مالی مراجعه کنید
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

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

function MiniBox({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-3 text-center`}>
      <p className={`text-2xl font-bold ${color}`}>{formatNumber(value)}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}