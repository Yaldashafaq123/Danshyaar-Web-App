// app/student/assignments/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  ChevronLeft,
  Send,
} from 'lucide-react';
import { studentAssignmentsAPI } from '@/lib/api/student-portal';
import type { Assignment, AssignmentStats } from '@/types/student-portal';
import {
  formatNumber,
  formatShamsiDate,
  assignmentStatusLabels,
  assignmentStatusColors,
  getSubjectColor,
} from '@/lib/utils/student-helpers';

type FilterTab = 'all' | 'pending' | 'submitted' | 'graded' | 'late';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [listRes, statsRes] = await Promise.all([
        studentAssignmentsAPI.list(),
        studentAssignmentsAPI.getStats().catch(() => null),
      ]);

      setAssignments(listRes);
      if (statsRes) setStats(statsRes);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت کارخانگی‌ها';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute per-status counts locally in case stats endpoint fails
  const computedStats = stats || {
    total: assignments.length,
    pending: assignments.filter(
      (a) => !a.submission || a.submission.status === 'PENDING'
    ).length,
    submitted: assignments.filter(
      (a) => a.submission?.status === 'SUBMITTED'
    ).length,
    graded: assignments.filter((a) => a.submission?.status === 'GRADED').length,
    late: assignments.filter((a) => a.submission?.status === 'LATE').length,
  };

  const filtered = assignments.filter((a) => {
    // Tab filter
    if (tab === 'pending') {
      if (a.submission && a.submission.status !== 'PENDING') return false;
    } else if (tab === 'submitted') {
      if (a.submission?.status !== 'SUBMITTED') return false;
    } else if (tab === 'graded') {
      if (a.submission?.status !== 'GRADED') return false;
    } else if (tab === 'late') {
      if (a.submission?.status !== 'LATE') return false;
    }
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-indigo-500" size={26} />
            کارخانگی‌ها
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تکالیف درسی شما
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="کل کارخانگی"
          value={computedStats.total}
          icon={ClipboardList}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatsCard
          label="در انتظار"
          value={computedStats.pending}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatsCard
          label="ارسال شده"
          value={computedStats.submitted}
          icon={Send}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatsCard
          label="نمره گرفته"
          value={computedStats.graded}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
        {(
          [
            { key: 'all', label: 'همه', count: computedStats.total },
            { key: 'pending', label: 'در انتظار', count: computedStats.pending },
            { key: 'submitted', label: 'ارسال شده', count: computedStats.submitted },
            { key: 'graded', label: 'نمره گرفته', count: computedStats.graded },
            { key: 'late', label: 'دیر رسیده', count: computedStats.late },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
            <span
              className={`inline-block mr-2 px-2 py-0.5 rounded-full text-xs ${
                tab === t.key
                  ? 'bg-white/20'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی کارخانگی..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ClipboardList className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            {tab === 'all'
              ? 'هیچ کارخانگی‌ای ثبت نشده'
              : 'کارخانگی در این دسته وجود ندارد'}
          </p>
          {tab === 'pending' && (
            <p className="text-xs text-gray-400 mt-2">
              همه کارخانگی‌های خود را تکمیل کرده‌اید 🎉
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{formatNumber(value)}</p>
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const status = assignment.submission?.status || 'PENDING';
  const statusLabel = assignmentStatusLabels[status] || status;
  const statusColor =
    assignmentStatusColors[status] || 'bg-gray-100 text-gray-600';

  // Compute days remaining
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = diffDays < 0 && status === 'PENDING';
  const isDueSoon = diffDays >= 0 && diffDays <= 2 && status === 'PENDING';

  const subjectColor = getSubjectColor(
    assignment.Class?.name || assignment.title || ''
  );

  return (
    <Link
      href={`/student/assignments/${assignment.id}`}
      className={`block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border-l-4 ${
        isOverdue
          ? 'border-red-500'
          : isDueSoon
          ? 'border-amber-500'
          : status === 'GRADED'
          ? 'border-green-500'
          : 'border-indigo-500'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${subjectColor}20` }}
        >
          <FileText size={22} style={{ color: subjectColor }} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1">
              {assignment.title}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          {assignment.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {assignment.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {assignment.Teacher?.User && (
              <span className="flex items-center gap-1">
                <User size={12} />
                {assignment.Teacher.User.fullName}
              </span>
            )}
            {assignment.Class && (
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {assignment.Class.name}
                {assignment.Class.section && ` - ${assignment.Class.section}`}
              </span>
            )}
            {assignment.maxGrade && (
              <span className="flex items-center gap-1">
                <TrendingUp size={12} />
                از {assignment.maxGrade} نمره
              </span>
            )}
          </div>

          {/* Grade (if graded) */}
          {status === 'GRADED' && assignment.submission?.grade !== undefined && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg flex items-center justify-between">
              <span className="text-xs text-green-700 font-medium">
                نمره شما:
              </span>
              <span className="text-lg font-bold text-green-700">
                {assignment.submission.grade}
                {assignment.maxGrade && ` / ${assignment.maxGrade}`}
              </span>
            </div>
          )}

          {/* Feedback (if available) */}
          {status === 'GRADED' && assignment.submission?.feedback && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 line-clamp-2">
              <span className="font-medium">بازخورد: </span>
              {assignment.submission.feedback}
            </div>
          )}
        </div>

        {/* Due date */}
        <div className="text-right flex-shrink-0 md:w-32">
          <p className="text-xs text-gray-500 mb-1">تاریخ تحویل</p>
          <p
            className={`text-sm font-bold ${
              isOverdue
                ? 'text-red-600'
                : isDueSoon
                ? 'text-amber-600'
                : 'text-gray-900'
            }`}
          >
            {formatShamsiDate(assignment.dueDate)}
          </p>
          {status === 'PENDING' && diffDays >= 0 && (
            <p
              className={`text-xs mt-1 ${
                isDueSoon ? 'text-amber-600' : 'text-gray-500'
              }`}
            >
              {diffDays === 0
                ? 'امروز!'
                : diffDays === 1
                ? 'فردا'
                : `${diffDays} روز دیگر`}
            </p>
          )}
          {isOverdue && (
            <p className="text-xs mt-1 text-red-600 flex items-center gap-1 justify-end">
              <AlertTriangle size={10} />
              گذشته شده
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}