// app/student/profile/id-card/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Loader2,
  AlertCircle,
  Printer,
  User,
  Building2,
  Hash,
  Calendar,
  Home,
  Phone,
  Download,
} from 'lucide-react';
import { studentProfileAPI } from '@/lib/api/student-portal';
import type { StudentProfile } from '@/types/student-portal';
import { formatShamsiDate } from '@/lib/utils/student-helpers';

export default function StudentIdCardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await studentProfileAPI.getProfile();
        setProfile(res);
      } catch (err: unknown) {
        console.error(err);
        let msg = 'خطا در دریافت اطلاعات';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          msg = e.response?.data?.message || e.message || msg;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <Link
          href="/student/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight size={18} />
          بازگشت
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error || 'یافت نشد'}</p>
        </div>
      </div>
    );
  }

  const student = profile.student;
  const user = profile.User;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <Link
          href="/student/profile"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-indigo-500" size={26} />
            کارت شناسایی شاگرد
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            مشاهده و چاپ کارت
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          <Printer size={16} />
          چاپ کارت
        </button>
      </div>

      {/* Info banner (hidden on print) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 print:hidden">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">راهنمای چاپ</p>
          <p>
            برای چاپ بهتر، از گزینه «تنظیمات چاپ» گزینه‌های «چاپ پس‌زمینه» را فعال کنید و حاشیه را روی «حاشیه پیش‌فرض» تنظیم کنید.
          </p>
        </div>
      </div>

      {/* ID Card */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          id="student-id-card"
          className="w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        >
          {/* Card header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="font-bold">مکتب عصرا</p>
                  <p className="text-xs text-indigo-100">
                    Asra Smart School
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-100">سال تحصیلی</p>
                <p className="text-sm font-bold">
                  {student.Class?.AcademicYear?.name || '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-white/20">
              <p className="text-xs text-indigo-100">کارت شناسایی شاگرد</p>
              <div className="flex-1 h-px bg-white/30" />
            </div>
          </div>

          {/* Card body */}
          <div className="p-5 flex items-start gap-4">
            {/* Photo */}
            <div className="w-24 h-28 rounded-xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-indigo-300" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">نام و تخلص</p>
                <p className="font-bold text-gray-900 text-base truncate">
                  {user.fullName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Hash size={10} />
                    شماره شاگردی
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {student.studentNumber || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Building2 size={10} />
                    صنف
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {student.Class
                      ? `${student.Class.name} ${
                          student.Class.section || ''
                        }`.trim()
                      : '—'}
                  </p>
                </div>
              </div>

              {student.birthDate && (
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={10} />
                    تاریخ تولد
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatShamsiDate(student.birthDate)}
                  </p>
                </div>
              )}

              {user.phone && (
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={10} />
                    شماره تماس
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card footer */}
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Home size={12} />
              <span className="truncate max-w-[200px]">
                {student.address || 'آدرس ثبت نشده'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {student.studentNumber?.slice(-6) || 'ID'}
            </p>
          </div>

          {/* Bottom accent */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600" />
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #student-id-card,
          #student-id-card * {
            visibility: visible;
          }
          #student-id-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none;
            border: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}