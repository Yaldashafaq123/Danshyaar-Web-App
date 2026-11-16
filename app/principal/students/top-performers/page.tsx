// app/admin/academic/students/top-performers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  RefreshCw,
  User,
  Eye,
  Loader2,
  TrendingUp,
  Award,
  Crown,
  Medal,
  Star,
} from 'lucide-react';
import { principalStudentsAPI } from '@/lib/api/principal';
import type { Student } from '@/types/principal';
import { formatNumber, formatPercentage } from '@/lib/utils/principal-helpers';

interface TopStudent extends Student {
  score: number;
  gradeAverage: number;
  attendanceRate: number;
  rank: number;
  gradeCount: number;
}

export default function TopPerformersPage() {
  const [students, setStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const studentRes = await principalStudentsAPI.list({
        status: 'ACTIVE',
        limit: 200,
      });

      const analyzed: Omit<TopStudent, 'rank'>[] = [];
      for (const s of studentRes.students) {
        try {
          const detail = await principalStudentsAPI.getById(s.id);
          const attendance = detail.Attendance || [];
          const grades = detail.Grade || [];

          if (grades.length === 0) continue;

          const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
          const attendanceRate =
            attendance.length > 0
              ? Math.round((presentCount / attendance.length) * 100)
              : 100;

          const gradeAverage =
            grades.reduce((sum, g) => sum + g.marks, 0) / grades.length;

          // Weighted score: 70% grades + 30% attendance
          const score = gradeAverage * 0.7 + attendanceRate * 0.3;

          analyzed.push({
            ...s,
            score,
            gradeAverage,
            attendanceRate,
            gradeCount: grades.length,
          });
        } catch {
          // skip
        }
      }

      analyzed.sort((a, b) => b.score - a.score);

      const ranked: TopStudent[] = analyzed.map((s, i) => ({
        ...s,
        rank: i + 1,
      }));

      setStudents(ranked);
    } catch (err: unknown) {
      console.error('❌ [Top Performers] Error:', err);
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

  const displayed = students.slice(0, limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={26} />
            شاگردان برتر
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            رتبه‌بندی بر اساس معدل نمرات و نرخ حضور
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
          <Award size={18} />
          {error}
        </div>
      )}

      {/* Podium — Top 3 */}
      {!loading && students.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PodiumCard student={students[1]} medal="silver" order={2} />
          <PodiumCard student={students[0]} medal="gold" order={1} />
          <PodiumCard student={students[2]} medal="bronze" order={3} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
          <p className="mt-3 text-gray-500 text-sm">
            در حال تحلیل نمرات...
          </p>
        </div>
      )}

      {/* List */}
      {!loading && students.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Trophy className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            هنوز نمره‌ای برای شاگردان ثبت نشده
          </p>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              رتبه‌بندی کامل
            </h3>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>۱۰ نفر اول</option>
              <option value={20}>۲۰ نفر اول</option>
              <option value={50}>۵۰ نفر اول</option>
              <option value={200}>همه</option>
            </select>
          </div>

          <div className="divide-y divide-gray-100">
            {displayed.map((s) => (
              <div
                key={s.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      s.rank === 1
                        ? 'bg-yellow-100 text-yellow-700'
                        : s.rank === 2
                        ? 'bg-gray-100 text-gray-700'
                        : s.rank === 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {s.rank <= 3 ? (
                      s.rank === 1 ? (
                        <Crown size={20} />
                      ) : (
                        <Medal size={20} />
                      )
                    ) : (
                      s.rank
                    )}
                  </div>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden flex-shrink-0">
                      {s.profileImage ? (
                        <img
                          src={s.profileImage}
                          alt={s.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {s.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.className} • {formatNumber(s.gradeCount)} نمره
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">معدل</p>
                      <p className="text-sm font-bold text-blue-600">
                        {s.gradeAverage.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">حضور</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatPercentage(s.attendanceRate)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">امتیاز کل</p>
                      <p className="text-sm font-bold text-purple-600 flex items-center gap-1">
                        <TrendingUp size={12} />
                        {s.score.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/admin/academic/students/${s.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0"
                  >
                    <Eye size={14} />
                    <span className="hidden sm:inline">مشاهده</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PodiumCard({
  student,
  medal,
  order,
}: {
  student: TopStudent;
  medal: 'gold' | 'silver' | 'bronze';
  order: number;
}) {
  const config = {
    gold: {
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
      text: 'text-yellow-900',
      icon: Crown,
      label: 'اول',
      border: 'border-yellow-300',
      height: 'md:mt-0',
    },
    silver: {
      bg: 'bg-gradient-to-br from-gray-300 to-gray-400',
      text: 'text-gray-800',
      icon: Medal,
      label: 'دوم',
      border: 'border-gray-200',
      height: 'md:mt-6',
    },
    bronze: {
      bg: 'bg-gradient-to-br from-orange-400 to-orange-500',
      text: 'text-orange-900',
      icon: Star,
      label: 'سوم',
      border: 'border-orange-300',
      height: 'md:mt-6',
    },
  };

  const c = config[medal];
  const Icon = c.icon;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-6 border-2 ${c.border} ${c.height}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`${c.bg} w-16 h-16 rounded-full flex items-center justify-center mb-3`}>
          <Icon className="text-white" size={28} />
        </div>
        <span className={`text-xs font-bold ${c.text} mb-2`}>
          رتبه {c.label}
        </span>

        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden mb-2">
          {student.profileImage ? (
            <img
              src={student.profileImage}
              alt={student.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={28} />
          )}
        </div>

        <p className="font-bold text-gray-900">{student.fullName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{student.className}</p>

        <div className="flex items-center gap-3 mt-4 text-sm">
          <div className="text-center">
            <p className="text-xs text-gray-500">معدل</p>
            <p className="font-bold text-blue-600">
              {student.gradeAverage.toFixed(1)}
            </p>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="text-center">
            <p className="text-xs text-gray-500">حضور</p>
            <p className="font-bold text-green-600">
              {formatPercentage(student.attendanceRate)}
            </p>
          </div>
        </div>

        <Link
          href={`/admin/academic/students/${student.id}`}
          className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Eye size={14} />
          مشاهده پروفایل
        </Link>
      </div>
    </div>
  );
}