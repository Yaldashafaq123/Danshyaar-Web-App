// app/student/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  Clock,
  Send,
  Search,
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  Inbox,
} from 'lucide-react';
import { studentDashboardAPI } from '@/lib/api/student-portal';
import type { RecentActivity } from '@/types/student-portal';
import { formatDateTime } from '@/lib/utils/student-helpers';

interface Message {
  id: number;
  from: string;
  role: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use recent activities as fallback; in production there'd be a messages endpoint
      const activities = await studentDashboardAPI
        .getRecentActivities()
        .catch(() => []);

      const mapped: Message[] = (activities as RecentActivity[]).map(
        (a, i) => ({
          id: a.id || i,
          from: 'سیستم مکتب',
          role: 'سیستم',
          subject: 'فعالیت سیستم',
          content: a.action,
          date: a.time,
          read: true,
          type: 'info',
        })
      );

      // Add demo messages if empty
      if (mapped.length === 0) {
        mapped.push(
          {
            id: 1,
            from: 'استاد احمد رحیمی',
            role: 'معلم ریاضی',
            subject: 'کارخانگی ریاضی',
            content:
              'کارخانگی فصل ۳ را تا روز پنجشنبه ارسال کنید. حتماً تمرین‌های اضافی را هم انجام دهید.',
            date: '۲ روز پیش',
            read: false,
            type: 'info',
          },
          {
            id: 2,
            from: 'مدیریت مکتب',
            role: 'مدیر',
            subject: 'جلسه والدین',
            content:
              'جلسه والدین روز یکشنبه ساعت ۱۰ صبح در سالن اجتماعات برگزار می‌شود. حضور والدین گرامی الزامی است.',
            date: '۳ روز پیش',
            read: false,
            type: 'info',
          },
          {
            id: 3,
            from: 'استاد زهرا کریمی',
            role: 'معلم دری',
            subject: 'نتیجه امتحان',
            content:
              'نمره امتحان دری شما ثبت شد. عملکرد خوبی داشتید. تبریک می‌گویم!',
            date: '۵ روز پیش',
            read: true,
            type: 'success',
          }
        );
      }

      setMessages(mapped);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت پیام‌ها';
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

  const filtered = messages.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.from.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q)
    );
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-indigo-500" size={26} />
            پیام‌ها
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} پیام خوانده نشده`
              : 'همه پیام‌ها خوانده شده'}
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی پیام..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Inbox className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">پیامی یافت نشد</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {filtered.map((msg) => {
            const Icon =
              msg.type === 'warning'
                ? AlertTriangle
                : msg.type === 'success'
                ? CheckCircle
                : Info;
            const iconColor =
              msg.type === 'warning'
                ? 'text-amber-500'
                : msg.type === 'success'
                ? 'text-green-500'
                : 'text-blue-500';
            const iconBg =
              msg.type === 'warning'
                ? 'bg-amber-50'
                : msg.type === 'success'
                ? 'bg-green-50'
                : 'bg-blue-50';

            return (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`w-full text-right p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                  !msg.read ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
                >
                  <Icon size={18} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className={`text-sm font-bold truncate ${
                        msg.read ? 'text-gray-700' : 'text-gray-900'
                      }`}
                    >
                      {msg.subject}
                    </p>
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {msg.from}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                    {msg.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {msg.date}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedMessage.subject}
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User size={12} />
                <span>{selectedMessage.from}</span>
                <span>•</span>
                <Clock size={12} />
                <span>{selectedMessage.date}</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}