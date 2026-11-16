// app/student/reports/[termId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Printer,
  Download,
  Award,
  Trophy,
  CheckCircle,
  XCircle,
  Star,
  User,
  Building2,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { studentGradesAPI, studentProfileAPI } from '@/lib/api/student-portal';
import type { TermGrades, StudentProfile } from '@/types/student-portal';
import {
  formatNumber,
  getScoreColor,
  getScoreBg,
  gradeLetterColors,
  gradeStatusColors,
} from '@/lib/utils/student-helpers';

export default function ReportCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const termId = params.termId as string;

  const [grades, setGrades] = useState<TermGrades | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!termId) {
        setError('شناسه ترم نامعتبر');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const [gradesRes, profileRes] = await Promise.all([
          studentGradesAPI.getTerm(termId),
          studentProfileAPI.getProfile().catch(() => null),
        ]);

        setGrades(gradesRes);
        if (profileRes) setProfile(profileRes);
      } catch (err: unknown) {
        console.error(err);
        let msg = 'خطا در دریافت کارنامه';
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
  }, [termId]);

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

  if (error || !grades) {
    return (
      <div className="space-y-4">
        <Link
          href="/student/reports"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 print:hidden"
        >
          <ArrowLeft size={18} />
          بازگشت
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error || 'یافت نشد'}</p>
        </div>
      </div>
    );
  }

  const subjects = grades.subjects || [];
  const passedSubjects = subjects.filter(
    (s) =>
      s.status === 'EXCELLENT' ||
      s.status === 'GOOD' ||
      s.status === 'AVERAGE'
  ).length;
  const failedSubjects = subjects.filter(
    (s) =>
      s.status === 'FAILED' ||
      s.status === 'FAILED_HALF' ||
      s.status === 'FAILED_TOTAL'
  ).length;

  const student = profile?.student;
  const user = profile?.User;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toolbar (hidden on print) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/student/reports"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Printer size={16} />
            چاپ
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Download size={16} />
            ذخیره PDF
          </button>
        </div>
      </div>

      {/* Report Card */}
      <div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Report header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Building2 size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">مکتب عصرا</h1>
                <p className="text-sm text-indigo-100">Asra Smart School</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-100">کارنامه تحصیلی</p>
              <p className="text-xl font-bold mt-1">{grades.term.name}</p>
              {(grades.term.startDate || grades.term.endDate) && (
                <p className="text-xs text-indigo-100 mt-1">
                  {grades.term.startDate}
                  {grades.term.endDate && ` - ${grades.term.endDate}`}
                </p>
              )}
            </div>
          </div>

          {/* Student info bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/20">
            <div>
              <p className="text-xs text-indigo-100 mb-1">نام شاگرد</p>
              <p className="font-bold">{user?.fullName || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-100 mb-1">شماره شاگردی</p>
              <p className="font-bold">{student?.studentNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-100 mb-1">صنف</p>
              <p className="font-bold">
                {student?.Class
                  ? `${student.Class.name} ${
                      student.Class.section || ''
                    }`.trim()
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Overall summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-100">
          <SummaryBox
            label="معدل کل"
            value={grades.overallAverage.toString()}
            icon={TrendingUp}
            color={getScoreColor(grades.overallAverage)}
          />
          <SummaryBox
            label="رتبه در صنف"
            value={`${grades.classRank} / ${grades.totalStudents}`}
            icon={Trophy}
            color="text-blue-600"
          />
          <SummaryBox
            label="مضامین قبول"
            value={passedSubjects.toString()}
            icon={CheckCircle}
            color="text-green-600"
          />
          <SummaryBox
            label="مضامین ناکام"
            value={failedSubjects.toString()}
            icon={XCircle}
            color="text-red-600"
          />
        </div>

        {/* Grades table */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-indigo-500" />
            نمرات به تفکیک مضمون
          </h3>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-700">
                    #
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-700">
                    مضمون
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-gray-700">
                    ماهانه
                    <br />
                    <span className="text-gray-500 font-normal">(۲۰)</span>
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-gray-700">
                    نیم‌سال
                    <br />
                    <span className="text-gray-500 font-normal">(۴۰)</span>
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-gray-700">
                    سالانه
                    <br />
                    <span className="text-gray-500 font-normal">(۶۰)</span>
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-gray-700">
                    مجموع
                    <br />
                    <span className="text-gray-500 font-normal">(۱۰۰)</span>
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-gray-700">
                    درجه
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-gray-700">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjects.map((subject, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {subject.subject}
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold">
                      {subject.monthly !== null &&
                      subject.monthly !== undefined ? (
                        <span
                          className={getScoreColor(
                            (subject.monthly /
                              (subject.monthlyMaxScore || 20)) *
                              100
                          )}
                        >
                          {subject.monthly}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold">
                      {subject.halfYearly !== null &&
                      subject.halfYearly !== undefined ? (
                        <span
                          className={getScoreColor(
                            (subject.halfYearly /
                              (subject.halfYearlyMaxScore || 40)) *
                              100
                          )}
                        >
                          {subject.halfYearly}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold">
                      {subject.final !== null &&
                      subject.final !== undefined ? (
                        <span
                          className={getScoreColor(
                            (subject.final /
                              (subject.finalMaxScore || 60)) *
                              100
                          )}
                        >
                          {subject.final}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {subject.total !== null &&
                      subject.total !== undefined ? (
                        <span
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-white ${getScoreBg(
                            subject.total
                          )}`}
                        >
                          {subject.total}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {subject.totalLetter ? (
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            gradeLetterColors[subject.totalLetter] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {subject.totalLetter}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          gradeStatusColors[subject.status] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {subject.statusDisplay || subject.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-600 mb-2">
              تاریخ صدور: {new Date().toLocaleDateString('fa-IR')}
            </p>
            <p className="text-xs text-gray-500">
              این کارنامه به‌صورت خودکار توسط سیستم مدیریت مکتب عصرا تولید شده است
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function SummaryBox({
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
    <div className="bg-white rounded-lg p-3 text-center">
      <Icon size={16} className={`mx-auto mb-1 ${color}`} />
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}