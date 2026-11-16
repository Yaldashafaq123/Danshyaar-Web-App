// app/admin/academic/evaluations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  UserCheck,
  BarChart3,
  Star,
  Plus,
} from 'lucide-react';
import { principalEvaluationsAPI } from '@/lib/api/principal';
import type { Evaluation } from '@/types/principal';
import {
  evaluationStatusLabels,
  evaluationStatusColors,
  formatNumber,
  formatDate,
  formatPercentage,
  gradeColors,
} from '@/lib/utils/principal-helpers';

export default function EvaluationsDashboard() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pendingReview: 0,
    submitted: 0,
    acknowledged: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    averagePercentage: number;
    completedEvaluations: number;
    byGrade: Record<string, number>;
    topTeachers: {
      rank: number;
      teacherName: string;
      teacherImage?: string;
      percentage: number;
      grade: string;
    }[];
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, analyticsRes] = await Promise.all([
        principalEvaluationsAPI.list({ limit: 10 }),
        principalEvaluationsAPI.analytics(),
      ]);

      setEvaluations(listRes.evaluations);
      setStats(listRes.stats);

      const a = analyticsRes as {
        summary?: { averagePercentage: number; completedEvaluations: number };
        byGrade?: Record<string, number>;
        topTeachers?: {
          rank: number;
          teacherName: string;
          teacherImage?: string;
          percentage: number;
          grade: string;
        }[];
      };

      setAnalytics({
        averagePercentage: a?.summary?.averagePercentage || 0,
        completedEvaluations: a?.summary?.completedEvaluations || 0,
        byGrade: a?.byGrade || {},
        topTeachers: a?.topTeachers || [],
      });
    } catch (err: unknown) {
      console.error('❌ [Evaluations] Error:', err);
      let message = 'خطا در دریافت اطلاعات ارزیابی';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-pink-500" size={26} />
            ارزیابی معلمان
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            سیستم جامع ارزیابی عملکرد معلمان
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/academic/evaluations/teachers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            ارزیابی جدید
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          label="مجموع ارزیابی‌ها"
          value={stats.total}
          icon={Award}
          color="text-pink-600"
          bg="bg-pink-50"
        />
        <MiniStat
          label="تکمیل شده"
          value={stats.submitted + stats.acknowledged}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
        <MiniStat
          label="در انتظار"
          value={stats.draft + stats.pendingReview}
          icon={Clock}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <MiniStat
          label="میانگین"
          value={Math.round(analytics?.averagePercentage || 0)}
          suffix="%"
          icon={TrendingUp}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NavCard
          title="قالب‌های ارزیابی"
          description="مدیریت و ویرایش معیارهای ارزیابی"
          icon={FileText}
          href="/admin/academic/evaluations/templates"
          count={stats.total}
          color="from-blue-500 to-blue-600"
        />
        <NavCard
          title="انتخاب معلم"
          description="شروع ارزیابی برای یک معلم"
          icon={UserCheck}
          href="/admin/academic/evaluations/teachers"
          count={0}
          color="from-pink-500 to-pink-600"
        />
        <NavCard
          title="مشاهده ارزیابی‌ها"
          description="لیست همه ارزیابی‌های انجام شده"
          icon={Award}
          href="/admin/academic/evaluations"
          count={stats.total}
          color="from-purple-500 to-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent evaluations */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              آخرین ارزیابی‌ها
            </h3>
            <Link
              href="/admin/academic/evaluations/teachers"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              همه ←
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin text-blue-500 mx-auto" size={28} />
            </div>
          ) : evaluations.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="mx-auto text-gray-300" size={48} />
              <p className="mt-3 text-gray-500">
                هنوز ارزیابی‌ای انجام نشده
              </p>
              <Link
                href="/admin/academic/evaluations/teachers"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
              >
                <Plus size={16} />
                شروع اولین ارزیابی
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {evaluations.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/academic/evaluations/${e.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 overflow-hidden flex-shrink-0">
                      {e.teacherImage ? (
                        <img
                          src={e.teacherImage}
                          alt={e.teacherName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {e.teacherName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {e.templateName} • {e.period}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {e.percentage !== undefined &&
                      e.percentage !== null &&
                      e.grade && (
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              gradeColors[e.grade]?.text || 'text-gray-700'
                            }`}
                          >
                            {formatPercentage(e.percentage, 1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {gradeColors[e.grade]?.label || e.grade}
                          </p>
                        </div>
                      )}
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        evaluationStatusColors[e.status] ||
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {evaluationStatusLabels[e.status] || e.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top teachers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-yellow-500" size={18} />
            <h3 className="text-base font-semibold text-gray-900">
              معلمان برتر
            </h3>
          </div>

          {!analytics || analytics.topTeachers.length === 0 ? (
            <div className="py-8 text-center">
              <Star className="mx-auto text-gray-300" size={32} />
              <p className="mt-2 text-sm text-gray-500">
                داده‌ای برای نمایش نیست
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topTeachers.slice(0, 5).map((t) => (
                <div
                  key={t.rank}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      t.rank === 1
                        ? 'bg-yellow-100 text-yellow-700'
                        : t.rank === 2
                        ? 'bg-gray-100 text-gray-700'
                        : t.rank === 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {t.rank}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden flex-shrink-0">
                    {t.teacherImage ? (
                      <img
                        src={t.teacherImage}
                        alt={t.teacherName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users size={14} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {t.teacherName}
                    </p>
                    <p
                      className={`text-xs ${
                        gradeColors[t.grade]?.text || 'text-gray-500'
                      }`}
                    >
                      {gradeColors[t.grade]?.label || t.grade}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {formatPercentage(t.percentage, 1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  color,
  bg,
  suffix = '',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  suffix?: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>
        {formatNumber(value)}
        {suffix}
      </p>
    </div>
  );
}

function NavCard({
  title,
  description,
  icon: Icon,
  href,
  count,
  color,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  count: number;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow group"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}
      >
        <Icon className="text-white" size={22} />
      </div>
      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      {count > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          {formatNumber(count)} مورد
        </p>
      )}
    </Link>
  );
}