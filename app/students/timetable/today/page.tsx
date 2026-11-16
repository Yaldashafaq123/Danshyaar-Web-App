// app/student/timetable/today/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  Home,
  Calendar,
  CheckCircle,
  BookOpen,
  Coffee,
  Sun,
  Sunset,
} from 'lucide-react';
import { studentTimetableAPI } from '@/lib/api/student-portal';
import type { TimetableData, TimetableEntry } from '@/types/student-portal';
import {
  formatNumber,
  getSubjectColor,
} from '@/lib/utils/student-helpers';

// Afghan weekdays in order (Saturday first)
const AFGHAN_WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

// Get today's Afghan weekday
function getTodayAfghanWeekday(): string {
  const today = new Date();
  const jsDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  // Convert: JS Sunday=0 → Afghan یکشنبه=1; JS Saturday=6 → Afghan شنبه=0
  const afghanIndex = jsDay === 6 ? 0 : jsDay + 1;
  return AFGHAN_WEEKDAYS[afghanIndex] || AFGHAN_WEEKDAYS[0];
}

// Get current time in HH:MM
function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
}

// Parse time like "7:30" or "07:30"
function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Determine if a period is:
// - past (finished)
// - current (in progress)
// - upcoming
function getPeriodStatus(
  startTime: string,
  endTime: string,
  nowMinutes: number
): 'past' | 'current' | 'upcoming' {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (nowMinutes >= end) return 'past';
  if (nowMinutes >= start && nowMinutes < end) return 'current';
  return 'upcoming';
}

export default function TodayTimetablePage() {
  const [data, setData] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayEntries, setTodayEntries] = useState<TimetableEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  const todayAfghan = getTodayAfghanWeekday();
  const isFriday = todayAfghan === 'جمعه';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentTimetableAPI.getWeekly();
      setData(res);
      const entries = res.entries
        .filter((e) => e.day === todayAfghan)
        .sort((a, b) => a.periodIndex - b.periodIndex);
      setTodayEntries(entries);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات';
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

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/student/timetable"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          بازگشت
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const nowMinutes = parseTime(currentTime);
  const nextEntry = todayEntries.find((e) => {
    const status = getPeriodStatus(e.startTime, e.endTime, nowMinutes);
    return status === 'upcoming';
  });
  const currentEntry = todayEntries.find((e) => {
    const status = getPeriodStatus(e.startTime, e.endTime, nowMinutes);
    return status === 'current';
  });

  const completedCount = todayEntries.filter((e) => {
    const status = getPeriodStatus(e.startTime, e.endTime, nowMinutes);
    return status === 'past';
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/student/timetable"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-indigo-500" size={26} />
            برنامه امروز
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {todayAfghan} • ساعت {currentTime}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Friday message */}
      {isFriday && (
        <div className="bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-200 rounded-2xl p-8 text-center">
          <Coffee className="mx-auto text-amber-500 mb-3" size={48} />
          <h2 className="text-2xl font-bold text-amber-800 mb-2">
            جمعه مبارک! 🎉
          </h2>
          <p className="text-amber-700">
            امروز روز تعطیل هفتگی است. استراحت کنید و انرژیتان را برای هفته آینده
            ذخیره کنید.
          </p>
        </div>
      )}

      {!isFriday && (
        <>
          {/* Status cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-blue-600" />
                <p className="text-xs text-gray-600">کل دوره‌های امروز</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(todayEntries.length)}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-xs text-gray-600">تکمیل شده</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(completedCount)}
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-amber-600" />
                <p className="text-xs text-gray-600">باقی‌مانده</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {formatNumber(todayEntries.length - completedCount)}
              </p>
            </div>
          </div>

          {/* Current / Next class highlight */}
          {(currentEntry || nextEntry) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentEntry && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-medium">
                      در حال برگزاری
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-2">
                    {currentEntry.subject}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <User size={14} />
                      {currentEntry.Teacher}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} />
                      {currentEntry.startTime} - {currentEntry.endTime}
                    </p>
                    {currentEntry.room && (
                      <p className="flex items-center gap-2">
                        <Home size={14} />
                        {currentEntry.room}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {nextEntry && (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={18} />
                    <span className="text-sm font-medium">
                      دوره بعدی
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-2">
                    {nextEntry.subject}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <User size={14} />
                      {nextEntry.Teacher}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} />
                      {nextEntry.startTime} - {nextEntry.endTime}
                    </p>
                    {nextEntry.room && (
                      <p className="flex items-center gap-2">
                        <Home size={14} />
                        {nextEntry.room}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All periods today */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-lg font-bold text-gray-900">
                برنامه کامل امروز
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {todayEntries.length === 0
                  ? 'امروز کلاسی ندارید'
                  : `${formatNumber(todayEntries.length)} دوره درسی`}
              </p>
            </div>

            {todayEntries.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto text-gray-300" size={48} />
                <p className="mt-3 text-gray-500 text-sm">
                  امروز هیچ کلاسی در برنامه شما نیست
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  از اوقات فراغت خود برای مطالعه استفاده کنید 📚
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {todayEntries.map((entry) => {
                  const status = getPeriodStatus(
                    entry.startTime,
                    entry.endTime,
                    nowMinutes
                  );
                  const isPast = status === 'past';
                  const isCurrent = status === 'current';

                  return (
                    <div
                      key={entry.id}
                      className={`p-4 flex items-center gap-4 transition-colors ${
                        isCurrent
                          ? 'bg-green-50 border-r-4 border-green-500'
                          : isPast
                          ? 'opacity-60 bg-gray-50/50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Period badge */}
                      <div
                        className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-sm ${
                          isPast ? 'grayscale' : ''
                        }`}
                        style={{ backgroundColor: entry.color }}
                      >
                        <span className="text-xs opacity-90">دوره</span>
                        <span className="text-lg font-bold">
                          {entry.periodIndex + 1}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-bold text-base truncate ${
                              isPast ? 'text-gray-500' : 'text-gray-900'
                            }`}
                          >
                            {entry.subject}
                          </p>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full animate-pulse">
                              الان
                            </span>
                          )}
                          {isPast && (
                            <CheckCircle
                              size={14}
                              className="text-green-500 flex-shrink-0"
                            />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-gray-400" />
                            {entry.Teacher}
                          </span>
                          {entry.room && (
                            <span className="flex items-center gap-1">
                              <Home size={12} className="text-gray-400" />
                              {entry.room}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-sm font-bold ${
                            isPast
                              ? 'text-gray-400'
                              : isCurrent
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {entry.startTime}
                        </p>
                        <p className="text-xs text-gray-500">
                          تا {entry.endTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}