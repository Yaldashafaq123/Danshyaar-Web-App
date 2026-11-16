// app/student/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  FileText,
  Calendar,
  DollarSign,
  BookOpen,
  Award,
} from 'lucide-react';
import {
  studentAssignmentsAPI,
  studentDashboardAPI,
} from '@/lib/api/student-portal';
import type { Assignment, UpcomingExam, RecentActivity } from '@/types/student-portal';
import {
  formatShamsiDate,
} from '@/lib/utils/student-helpers';

type NotificationType = 'homework' | 'exam' | 'attendance' | 'announcement' | 'fee';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  urgent?: boolean;
}

const TYPE_CONFIG: Record<
  NotificationType,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    bg: string;
  }
> = {
  homework: {
    icon: FileText,
    label: 'کارخانگی',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  exam: {
    icon: Calendar,
    label: 'امتحان',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  attendance: {
    icon: CheckCircle,
    label: 'حضور',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  announcement: {
    icon: Bell,
    label: 'اطلاعیه',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  fee: {
    icon: DollarSign,
    label: 'مالی',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assignmentsRes, examsRes, activitiesRes] = await Promise.all([
        studentAssignmentsAPI.list().catch(() => []),
        studentDashboardAPI.getUpcomingExams().catch(() => []),
        studentDashboardAPI.getRecentActivities().catch(() => []),
      ]);

      const notifs: Notification[] = [];

      // Homework
      (assignmentsRes as Assignment[])
        .filter((a) => !a.submission || a.submission.status === 'PENDING')
        .slice(0, 5)
        .forEach((a, i) => {
          const dueDate = new Date(a.dueDate);
          const now = new Date();
          const diffDays = Math.ceil(
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          notifs.push({
            id: `hw-${i}`,
            type: 'homework',
            title: 'کارخانگی در انتظار',
            message: `${a.title} — تاریخ تحویل ${formatShamsiDate(
              a.dueDate
            )}`,
            time:
              diffDays < 0
                ? 'گذشته شده'
                : diffDays === 0
                ? 'امروز'
                : diffDays === 1
                ? 'فردا'
                : `${diffDays} روز دیگر`,
            read: false,
            urgent: diffDays <= 1,
          });
        });

      // Exams
      (examsRes as UpcomingExam[]).slice(0, 5).forEach((e, i) => {
        const examDate = new Date(e.date);
        const now = new Date();
        const diffDays = Math.ceil(
          (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        notifs.push({
          id: `exam-${i}`,
          type: 'exam',
          title: 'امتحان پیش‌رو',
          message: `${e.title} — ${e.subject} • ${formatShamsiDate(e.date)}`,
          time:
            diffDays === 0
              ? 'امروز'
              : diffDays === 1
              ? 'فردا'
              : `${diffDays} روز دیگر`,
          read: false,
          urgent: diffDays <= 2,
        });
      });

      // Activities as announcements
      (activitiesRes as RecentActivity[]).slice(0, 5).forEach((a, i) => {
        notifs.push({
          id: `act-${i}`,
          type: 'announcement',
          title: 'فعالیت سیستم',
          message: a.action,
          time: a.time,
          read: true,
        });
      });

      // If nothing, add sample notifications
      if (notifs.length === 0) {
        notifs.push(
          {
            id: 'demo-1',
            type: 'announcement',
            title: 'به پورتال خوش آمدید',
            message:
              'سیستم مدیریت مکتب عصرا به زودی اطلاعیه‌ها و هشدارهای شما را اینجا نمایش می‌دهد.',
            time: 'اکنون',
            read: false,
          },
          {
            id: 'demo-2',
            type: 'exam',
            title: 'برنامه امتحانات',
            message:
              'برنامه امتحانات میان‌دوره به زودی از طرف مکتب منتشر می‌شود.',
            time: 'دیروز',
            read: true,
          }
        );
      }

      setNotifications(notifs);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعیه‌ها';
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

  const filtered =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Count by type
  const typeCounts = Object.keys(TYPE_CONFIG).reduce((acc, key) => {
    acc[key as NotificationType] = notifications.filter(
      (n) => n.type === key
    ).length;
    return acc;
  }, {} as Record<NotificationType, number>);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-indigo-500" size={26} />
            اطلاعیه‌ها و هشدارها
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-red-500 text-white rounded-full text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            آخرین هشدارها و یادآوری‌ها
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <CheckCircle size={16} />
              همه خوانده شد
            </button>
          )}
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          همه ({notifications.length})
        </button>
        {(Object.keys(TYPE_CONFIG) as NotificationType[]).map((type) => {
          const config = TYPE_CONFIG[type];
          const count = typeCounts[type] || 0;
          if (count === 0) return null;
          const Icon = config.icon;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                filter === type
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={14} />
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Bell className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">
            {filter === 'all'
              ? 'هیچ اطلاعیه‌ای وجود ندارد'
              : 'اطلاعیه‌ای در این دسته وجود ندارد'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {filtered.map((notif) => {
            const config = TYPE_CONFIG[notif.type];
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                className={`p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                  !notif.read ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}
                >
                  <Icon size={18} className={config.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className={`text-sm font-bold ${
                        notif.read ? 'text-gray-700' : 'text-gray-900'
                      }`}
                    >
                      {notif.title}
                    </p>
                    {notif.urgent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <AlertTriangle size={10} />
                        فوری
                      </span>
                    )}
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {notif.time}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}