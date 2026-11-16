// app/admin/hr/staff/[id]/page.tsx
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
  Home,
  Calendar,
  Briefcase,
  DollarSign,
  FileText,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  Clock,
  Award,
  Shield,
  Download,
} from 'lucide-react';
import { hrStaffAPI } from '@/lib/api/hr';
import type { StaffDetail } from '@/types/hr';
import {
  formatNumber,
  formatAFN,
  formatShamsiDate,
  staffTypeLabels,
  staffTypeColors,
  sexLabels,
  maritalStatusLabels,
  educationLevelLabels,
  formatTime,
} from '@/lib/utils/hr-helpers';

export default function StaffProfilePage() {
  const params = useParams();
  const router = useRouter();
  const staffId = Number(params.id);

  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      if (isNaN(staffId)) {
        setError('شناسه نامعتبر است');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await hrStaffAPI.getById(staffId);
        setStaff(data);
      } catch (err: unknown) {
        console.error('❌ [Staff Detail] Error:', err);
        let message = 'خطا در دریافت اطلاعات کارمند';
        if (err && typeof err === 'object' && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          message = e.response?.data?.message || e.message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [staffId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  if (error || !staff) {
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
              پروفایل کارمند
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              اطلاعات کامل و ۳۶۰ درجه
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/hr/attendance/report?staffId=${staff.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Clock size={16} />
            حضور و غیاب
          </Link>
          <Link
            href={`/admin/hr/staff/${staff.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Edit3 size={16} />
            ویرایش
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden">
                {staff.profileImage ? (
                  <img
                    src={staff.profileImage}
                    alt={staff.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} />
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {staff.fullName}
              </h2>
              {staff.nameFarsi && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {staff.nameFarsi}
                </p>
              )}

              <span
                className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  staffTypeColors[staff.staffType] ||
                  'bg-gray-100 text-gray-700'
                }`}
              >
                {staffTypeLabels[staff.staffType] || staff.staffType}
              </span>

              {staff.position && (
                <p className="mt-2 text-sm text-gray-600">{staff.position}</p>
              )}

              <div className="mt-4 w-full space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{staff.email}</span>
                </div>
                {staff.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{staff.phone}</span>
                  </div>
                )}
                {staff.department && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 size={16} className="text-gray-400" />
                    <span>{staff.department}</span>
                  </div>
                )}
                {staff.joinDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>شمولیت: {formatShamsiDate(staff.joinDate)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 w-full flex justify-center">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    staff.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {staff.isActive ? (
                    <>
                      <CheckCircle size={12} /> فعال
                    </>
                  ) : (
                    <>
                      <XCircle size={12} /> غیرفعال
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              خلاصه
            </h3>
            <div className="space-y-3">
              <StatRow
                label="معاش"
                value={staff.salary ? formatAFN(Number(staff.salary)) : '—'}
                icon={DollarSign}
                color="text-emerald-600"
              />
              <StatRow
                label="سابقه حضور"
                value={`${formatNumber(staff.attendanceCount || 0)} ثبت`}
                icon={Clock}
                color="text-blue-600"
              />
              <StatRow
                label="بیمه"
                value={staff.hasInsurance ? 'دارد' : 'ندارد'}
                icon={Shield}
                color={staff.hasInsurance ? 'text-green-600' : 'text-gray-400'}
              />
              <StatRow
                label="قرارداد"
                value={staff.hasContract ? 'دارد' : 'ندارد'}
                icon={FileText}
                color={staff.hasContract ? 'text-green-600' : 'text-gray-400'}
              />
            </div>
          </div>

          {/* Action Links */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-2">
            <Link
              href={`/admin/hr/staff/${staff.id}/documents`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-pink-500" />
                <span className="text-sm text-gray-700">اسناد کارمند</span>
              </div>
              <ArrowRight size={14} className="text-gray-400 rotate-180" />
            </Link>
            <Link
              href={`/admin/hr/id-cards`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-pink-500" />
                <span className="text-sm text-gray-700">کارت شناسایی</span>
              </div>
              <ArrowRight size={14} className="text-gray-400 rotate-180" />
            </Link>
            <Link
              href={`/admin/hr/evaluations/new?userId=${staff.id}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <Award size={16} className="text-pink-500" />
                <span className="text-sm text-gray-700">ارزیابی عملکرد</span>
              </div>
              <ArrowRight size={14} className="text-gray-400 rotate-180" />
            </Link>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <SectionCard title="اطلاعات شخصی" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <InfoRow label="نام پدر" value={staff.fatherName || '—'} />
              <InfoRow label="نام پدر (فارسی)" value={staff.fatherNameFarsi || '—'} />
              <InfoRow label="نام پدرکلان" value={staff.grandfatherName || '—'} />
              <InfoRow label="جنسیت" value={staff.sex ? sexLabels[staff.sex] || staff.sex : '—'} />
              <InfoRow
                label="وضعیت تأهل"
                value={
                  staff.maritalStatus
                    ? maritalStatusLabels[staff.maritalStatus] || staff.maritalStatus
                    : '—'
                }
              />
              <InfoRow label="گروه خون" value={staff.bloodType?.replace('_', ' ') || '—'} />
              <InfoRow label="شماره تذکره" value={staff.civilId || '—'} />
              <InfoRow
                label="تاریخ تولد"
                value={staff.birthDate ? formatShamsiDate(staff.birthDate) : '—'}
              />
              <InfoRow label="محل تولد" value={staff.birthPlace || '—'} />
              <InfoRow label="تابعیت" value={staff.nationality || '—'} />
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard title="تماس و آدرس" icon={MapPin}>
            <div className="space-y-3 text-sm">
              <InfoRow label="آدرس فعلی" value={staff.currentAddress || '—'} />
              <InfoRow label="آدرس دائمی" value={staff.permanentAddress || '—'} />
              <InfoRow
                label="نام تماس اضطراری"
                value={staff.emergencyContactName || '—'}
              />
              <InfoRow
                label="شماره تماس اضطراری"
                value={staff.emergencyContactPhone || '—'}
              />
              <InfoRow
                label="نسبت"
                value={staff.emergencyContactRelation || '—'}
              />
            </div>
          </SectionCard>

          {/* Job & Contract */}
          <SectionCard title="موقعیت شغلی" icon={Briefcase}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <InfoRow label="نوع کارمند" value={staffTypeLabels[staff.staffType] || staff.staffType} />
              <InfoRow label="سمت" value={staff.position || '—'} />
              <InfoRow label="بخش" value={staff.department || '—'} />
              <InfoRow
                label="تاریخ شمولیت"
                value={staff.joinDate ? formatShamsiDate(staff.joinDate) : '—'}
              />
              <InfoRow
                label="معاش پایه"
                value={staff.baseSalary ? formatAFN(Number(staff.baseSalary)) : '—'}
              />
              <InfoRow label="واحد پول" value={staff.salaryCurrency || 'AFN'} />
              <InfoRow
                label="نوع قرارداد"
                value={staff.contractType || '—'}
              />
              <InfoRow
                label="شروع قرارداد"
                value={staff.contractStartDate ? formatShamsiDate(staff.contractStartDate) : '—'}
              />
              <InfoRow
                label="پایان قرارداد"
                value={staff.contractEndDate ? formatShamsiDate(staff.contractEndDate) : '—'}
              />
              <InfoRow label="نوبت کاری" value={staff.workShift || '—'} />
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard title="تحصیلات" icon={Building2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <InfoRow
                label="سطح تحصیل"
                value={
                  staff.educationLevel
                    ? educationLevelLabels[staff.educationLevel] || staff.educationLevel
                    : '—'
                }
              />
              <InfoRow label="رشته" value={staff.educationField || '—'} />
              <InfoRow label="مؤسسه" value={staff.educationInstitution || '—'} />
              <InfoRow
                label="سال فراغت"
                value={staff.graduationYear?.toString() || '—'}
              />
              <div className="md:col-span-2">
                <InfoRow label="سابقه کاری" value={staff.workExperience || '—'} />
              </div>
            </div>
          </SectionCard>

          {/* Bank & Insurance */}
          <SectionCard title="بانک و بیمه" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <InfoRow label="نام بانک" value={staff.bankName || '—'} />
              <InfoRow label="شماره حساب" value={staff.bankAccountNumber || '—'} />
              <InfoRow label="شرکت بیمه" value={staff.insuranceProvider || '—'} />
              <InfoRow label="شماره بیمه" value={staff.insuranceNumber || '—'} />
            </div>
          </SectionCard>

          {/* Teacher-specific */}
          {staff.Teacher && (
            <SectionCard title="اطلاعات معلمی" icon={Award}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <InfoRow label="کد معلم" value={staff.Teacher.teacherCode || '—'} />
                <InfoRow
                  label="تخصص"
                  value={staff.Teacher.specialization || '—'}
                />
                <InfoRow
                  label="سابقه تدریس"
                  value={staff.Teacher.teachingExperience?.toString() || '—'}
                />
                <InfoRow
                  label="امتیاز"
                  value={staff.Teacher.rating?.toFixed(1) || '0.0'}
                />
                {staff.Teacher.TeacherSubject &&
                  staff.Teacher.TeacherSubject.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">مضامین:</p>
                      <div className="flex flex-wrap gap-1">
                        {staff.Teacher.TeacherSubject.map((ts, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {ts.Subject.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </SectionCard>
          )}

          {/* Notes */}
          {staff.notes && (
            <SectionCard title="یادداشت" icon={FileText}>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {staff.notes}
              </p>
            </SectionCard>
          )}
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
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon size={18} className="text-pink-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <span className="text-gray-500 flex-shrink-0">{label}:</span>
      <span className="text-gray-900 font-medium text-left break-words">
        {value}
      </span>
    </div>
  );
}