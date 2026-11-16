// app/admin/academic/students/at-risk/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  RefreshCw,
  User,
  Eye,
  Loader2,
  TrendingDown,
  Award,
} from 'lucide-react';
import { principalStudentsAPI, principalReportsAPI } from '@/lib/api/principal';
import type { Student } from '@/types/principal';
import { formatNumber, formatPercentage } from '@/lib/utils/principal-helpers';

interface AtRiskStudent extends Student {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  attendanceRate: number;
  gradeAverage: number;
  reasons: string[];
}

export default function AtRiskStudentsPage() {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all students
      const studentRes = await principalStudentsAPI.list({
        status: 'ACTIVE',
        limit: 200,
      });

      // Get attendance report to detect issues
      const attendanceReport = await principalReportsAPI.attendance({});

      // Analyze each student
      const analyzed: AtRiskStudent[] = [];
      for (const s of studentRes.students) {
        try {
          const detail = await principalStudentsAPI.getById(s.id);
          const attendance = detail.Attendance || [];
          const grades = detail.Grade || [];

          const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
          const absentCount = attendance.filter((a) => a.status === 'ABSENT').length;
          const attendanceRate =
            attendance.length > 0
              ? Math.round((presentCount / attendance.length) * 100)
              : 100;

          const gradeAverage =
            grades.length > 0
              ? grades.reduce((sum, g) => sum + g.marks, 0) / grades.length
              : 100;

          const reasons: string[] = [];
          if (attendanceRate < 60) reasons.push('حضور پایین');
          if (attendanceRate < 80 && attendanceRate >= 60)
            reasons.push('حضور متوسط');
          if (gradeAverage < 40) reasons.push('نمرات ضعیف');
          if (gradeAverage < 60 && gradeAverage >= 40)
            reasons.push('نمرات متوسط');
          if (absentCount >= 5) reasons.push('غیبت زیاد');

          let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (reasons.length >= 2 || attendanceRate < 60 || gradeAverage < 40) {
            riskLevel = 'HIGH';
          } else if (reasons.length === 1) {
            riskLevel = 'MEDIUM';
          }

          if (riskLevel !== 'LOW') {
            analyzed.push({
              ...s,
              riskLevel,
              attendanceRate,
              gradeAverage,
              reasons,
            });
          }
        } catch {
          // Skip students that fail to load
        }
      }

      // Sort by risk level (HIGH first)
      analyzed.sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.riskLevel] - order[b.riskLevel];
      });

      setStudents(analyzed);
    } catch (err: unknown) {
      console.error('❌ [At-Risk] Error:', err);
      let message = 'خطا در تحلیل شاگردان';
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

  const filteredStudents =
    filter === 'ALL' ? students : students.filter((s) => s.riskLevel === filter);

  const highCount = students.filter((s) => s.riskLevel === 'HIGH').length;
  const mediumCount = students.filter((s) => s.riskLevel === 'MEDIUM').length;
  const lowCount = students.filter((s) => s.riskLevel === 'LOW').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={26} />
            شاگردان در خطر
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            شاگردانی که نیاز به توجه و پیگیری ویژه دارند
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بازتحلیل
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <RiskCard
          label="در خطر بالا"
          count={highCount}
          color="text-red-600"
          bg="bg-red-50"
          borderColor="border-red-300"
        />
        <RiskCard
          label="در خطر متوسط"
          count={mediumCount}
          color="text-orange-600"
          bg="bg-orange-50"
          borderColor="border-orange-300"
        />
        <RiskCard
          label="در خطر پایین"
          count={lowCount}
          color="text-yellow-600"
          bg="bg-yellow-50"
          borderColor="border-yellow-300"
        />
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-1">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f === 'ALL'
              ? `همه (${formatNumber(students.length)})`
              : f === 'HIGH'
              ? `بالا (${formatNumber(highCount)})`
              : f === 'MEDIUM'
              ? `متوسط (${formatNumber(mediumCount)})`
              : `پایین (${formatNumber(lowCount)})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
            <p className="mt-3 text-gray-500 text-sm">
              در حال تحلیل داده‌ها...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="mx-auto text-green-300" size={48} />
            <p className="mt-3 text-gray-500">
              هیچ شاگردی در این دسته نیست 🎉
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden flex-shrink-0">
                      {s.profileImage ? (
                        <img
                          src={s.profileImage}
                          alt={s.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{s.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {s.className} • {s.email}
                      </p>
                    </div>
                  </div>

                  {/* Risk level */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        s.riskLevel === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : s.riskLevel === 'MEDIUM'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      <AlertTriangle size={12} />
                      {s.riskLevel === 'HIGH'
                        ? 'خطر بالا'
                        : s.riskLevel === 'MEDIUM'
                        ? 'خطر متوسط'
                        : 'خطر پایین'}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">حضور</p>
                      <p
                        className={`text-sm font-bold ${
                          s.attendanceRate >= 80
                            ? 'text-green-600'
                            : s.attendanceRate >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(s.attendanceRate)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">معدل</p>
                      <p
                        className={`text-sm font-bold ${
                          s.gradeAverage >= 60
                            ? 'text-green-600'
                            : s.gradeAverage >= 40
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {s.gradeAverage.toFixed(1)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/academic/students/${s.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye size={14} />
                      مشاهده
                    </Link>
                  </div>
                </div>

                {/* Reasons */}
                {s.reasons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pl-15">
                    {s.reasons.map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        <TrendingDown size={10} />
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RiskCard({
  label,
  count,
  color,
  bg,
  borderColor,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  borderColor: string;
}) {
  return (
    <div className={`${bg} border-l-4 ${borderColor} rounded-xl p-5`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{formatNumber(count)}</p>
    </div>
  );
}