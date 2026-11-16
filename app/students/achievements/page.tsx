// app/student/achievements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Star,
  Medal,
  Crown,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  BookOpen,
  Users,
  Heart,
  Lightbulb,
  CheckCircle,
  Download,
  Printer,
  Sparkles,
  Target,
} from 'lucide-react';
import { studentGradesAPI, studentAttendanceAPI } from '@/lib/api/student-portal';
import type { TermGrades, AttendanceOverview } from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
  formatShamsiDate,
} from '@/lib/utils/student-helpers';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'award' | 'certificate' | 'milestone' | 'competition';
  icon: React.ElementType;
  gradient: string;
  date?: string;
  earned: boolean;
  progress?: number;
}

export default function AchievementsPage() {
  const [grades, setGrades] = useState<TermGrades | null>(null);
  const [attendance, setAttendance] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [gradesRes, attendanceRes] = await Promise.all([
        studentGradesAPI.getCurrent().catch(() => null),
        studentAttendanceAPI.getOverview().catch(() => null),
      ]);

      setGrades(gradesRes);
      setAttendance(attendanceRes);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت دستاوردها';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  // Build achievements based on real data
  const overallAvg = grades?.overallAverage || 0;
  const attendanceRate = attendance?.stats.averageRate || 0;
  const classRank = grades?.classRank || 0;
  const totalStudents = grades?.totalStudents || 0;
  const subjects = grades?.subjects || [];
  const topSubjects = subjects.filter((s) => s.average >= 90).length;

  const achievements: Achievement[] = [
    {
      id: 'avg-90',
      title: 'شاگرد ممتاز',
      description: 'کسب معدل ۹۰ یا بالاتر',
      type: 'award',
      icon: Crown,
      gradient: 'from-yellow-400 to-orange-500',
      earned: overallAvg >= 90,
      progress: Math.min((overallAvg / 90) * 100, 100),
    },
    {
      id: 'avg-80',
      title: 'شاگرد برتر',
      description: 'کسب معدل ۸۰ یا بالاتر',
      type: 'award',
      icon: Trophy,
      gradient: 'from-amber-500 to-yellow-600',
      earned: overallAvg >= 80,
      progress: Math.min((overallAvg / 80) * 100, 100),
    },
    {
      id: 'attendance-95',
      title: 'حضور عالی',
      description: 'حضور ۹۵٪ یا بالاتر',
      type: 'certificate',
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      earned: attendanceRate >= 95,
      progress: Math.min((attendanceRate / 95) * 100, 100),
    },
    {
      id: 'rank-3',
      title: 'رتبه برتر صنف',
      description: 'کسب یکی از ۳ رتبه اول صنف',
      type: 'award',
      icon: Medal,
      gradient: 'from-purple-500 to-indigo-600',
      earned: classRank > 0 && classRank <= 3,
      progress: classRank > 0 ? Math.min(((totalStudents - classRank + 1) / totalStudents) * 100, 100) : 0,
    },
    {
      id: 'subject-star',
      title: 'ستاره مضامین',
      description: 'کسب نمره ۹۰ یا بالاتر در ۳ مضمون یا بیشتر',
      type: 'milestone',
      icon: Star,
      gradient: 'from-pink-500 to-rose-600',
      earned: topSubjects >= 3,
      progress: Math.min((topSubjects / 3) * 100, 100),
    },
    {
      id: 'perfect-attendance',
      title: 'حضور کامل',
      description: 'حضور ۱۰۰٪ در یک ماه',
      type: 'certificate',
      icon: Award,
      gradient: 'from-cyan-500 to-blue-600',
      earned: attendanceRate >= 100,
      progress: Math.min(attendanceRate, 100),
    },
  ];

  const earnedAchievements = achievements.filter((a) => a.earned);
  const inProgressAchievements = achievements.filter(
    (a) => !a.earned && (a.progress || 0) > 0
  );
  const lockedAchievements = achievements.filter(
    (a) => !a.earned && (a.progress || 0) === 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={26} />
            دستاوردهای من
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            جوایز، گواهی‌نامه‌ها و افتخارات
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={20} />
            <p className="text-sm">دستاوردهای کسب شده</p>
          </div>
          <p className="text-4xl font-bold">{earnedAchievements.length}</p>
          <p className="text-xs mt-2 opacity-90">
            از {achievements.length} دستاورد ممکن
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} />
            <p className="text-sm">در حال پیشرفت</p>
          </div>
          <p className="text-4xl font-bold">{inProgressAchievements.length}</p>
          <p className="text-xs mt-2 opacity-90">دستاورد در راه است</p>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star size={20} />
            <p className="text-sm">قفل شده</p>
          </div>
          <p className="text-4xl font-bold">{lockedAchievements.length}</p>
          <p className="text-xs mt-2 opacity-90">هنوز شروع نشده</p>
        </div>
      </div>

      {/* Earned achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={20} />
            دستاوردهای کسب شده
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isEarned
              />
            ))}
          </div>
        </div>
      )}

      {/* In progress achievements */}
      {inProgressAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="text-indigo-500" size={20} />
            در حال پیشرفت
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isEarned={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="text-gray-400" size={20} />
            دستاوردهای آینده
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isEarned={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Overall achievement rate */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Award className="text-indigo-500" size={18} />
              نرخ کلی دستاورد
            </h3>
            <span className="text-2xl font-bold text-indigo-600">
              {Math.round(
                (earnedAchievements.length / achievements.length) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (earnedAchievements.length / achievements.length) * 100
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            با تلاش بیشتر می‌توانید دستاوردهای جدید کسب کنید
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function AchievementCard({
  achievement,
  isEarned,
}: {
  achievement: Achievement;
  isEarned: boolean;
}) {
  const Icon = achievement.icon;
  const progress = achievement.progress || 0;

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
        isEarned ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      {/* Earned badge */}
      {isEarned && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold shadow-md">
            <CheckCircle size={12} />
            کسب شده
          </span>
        </div>
      )}

      {/* Icon area */}
      <div
        className={`relative h-32 bg-gradient-to-br ${
          isEarned
            ? achievement.gradient
            : 'from-gray-200 to-gray-300'
        } flex items-center justify-center ${
          isEarned ? '' : 'opacity-60'
        }`}
      >
        {isEarned && (
          <div className="absolute inset-0 bg-white/10"></div>
        )}
        <Icon
          className={`relative text-white ${isEarned ? '' : 'opacity-50'}`}
          size={48}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h4
          className={`font-bold mb-1 ${
            isEarned ? 'text-gray-900' : 'text-gray-600'
          }`}
        >
          {achievement.title}
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          {achievement.description}
        </p>

        {/* Progress (if not earned) */}
        {!isEarned && progress > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>پیشرفت</span>
              <span className="font-bold text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Locked */}
        {!isEarned && progress === 0 && (
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Star size={12} />
            قفل شده — نیاز به پیشرفت دارد
          </div>
        )}

        {/* Earned date placeholder */}
        {isEarned && (
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle size={12} />
            افتخار کسب شده
          </div>
        )}
      </div>
    </div>
  );
}