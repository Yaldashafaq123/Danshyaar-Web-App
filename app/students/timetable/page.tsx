// app/student/timetable/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  User,
  Home,
  Printer,
  BookOpen,
  LayoutGrid,
  List,
  ChevronLeft,
} from 'lucide-react';
import { studentTimetableAPI } from '@/lib/api/student-portal';
import type { TimetableData, TimetableEntry } from '@/types/student-portal';
import {
  formatNumber,
  getSubjectColor,
} from '@/lib/utils/student-helpers';

type ViewMode = 'weekly' | 'day';

export default function TimetablePage() {
  const [data, setData] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentTimetableAPI.getWeekly();
      setData(res);
      // Set active day to first day with entries
      const daysWithEntries = res.days.filter((day) =>
        res.entries.some((e) => e.day === day)
      );
      setActiveDay(daysWithEntries[0] || res.days[0]);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت تقسیم اوقات';
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

  if (error && !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-700">
            خطا در بارگذاری
          </h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw size={16} />
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!data || data.entries.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-indigo-500" size={26} />
            تقسیم اوقات هفتگی
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {data?.classInfo.className || 'صنف شما'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">
            هنوز تقسیم اوقاتی برای صنف شما ثبت نشده است
          </p>
          <p className="text-xs text-gray-400 mt-2">
            لطفاً با معلم یا مدیر مکتب خود تماس بگیرید
          </p>
        </div>
      </div>
    );
  }

  // Group entries by day
  const entriesByDay: Record<string, TimetableEntry[]> = {};
  data.days.forEach((day) => {
    entriesByDay[day] = data.entries
      .filter((e) => e.day === day)
      .sort((a, b) => a.periodIndex - b.periodIndex);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-indigo-500" size={26} />
            تقسیم اوقات هفتگی
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {data.classInfo.className}
            {data.classInfo.section && ` - ${data.classInfo.section}`}
            {data.classInfo.AcademicYear && ` • ${data.classInfo.AcademicYear}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/timetable/today"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Clock size={16} />
            امروز
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Printer size={16} />
            چاپ
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">تقسیم اوقات هفتگی</h1>
        <p className="text-sm text-gray-600">
          {data.classInfo.className}
          {data.classInfo.section && ` - ${data.classInfo.section}`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-indigo-600" />
            <p className="text-xs text-gray-600">کل دوره‌ها</p>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {formatNumber(data.summary.totalClasses)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-blue-600" />
            <p className="text-xs text-gray-600">مجموع دقیقه</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatNumber(data.summary.totalMinutes)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-emerald-600" />
            <p className="text-xs text-gray-600">معلمان</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {formatNumber(data.summary.uniqueTeachers)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid size={16} className="text-purple-600" />
            <p className="text-xs text-gray-600">روزهای فعال</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatNumber(
              data.days.filter((d) => entriesByDay[d].length > 0).length
            )}
          </p>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 print:hidden">
        <button
          onClick={() => setViewMode('weekly')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            viewMode === 'weekly'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutGrid size={16} />
          نمایش هفتگی
        </button>
        <button
          onClick={() => setViewMode('day')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            viewMode === 'day'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <List size={16} />
          نمایش روزانه
        </button>
      </div>

      {/* Weekly grid view */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 w-32">
                    زمان
                  </th>
                  {data.days.map((day) => (
                    <th
                      key={day}
                      className={`text-center px-3 py-3 text-xs font-semibold ${
                        entriesByDay[day].length > 0
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.periods.map((period, periodIdx) => (
                  <tr key={periodIdx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium bg-gray-50/50">
                      {period}
                    </td>
                    {data.days.map((day) => {
                      const entry = entriesByDay[day].find(
                        (e) => e.periodIndex === periodIdx
                      );
                      return (
                        <td key={day} className="px-2 py-2 text-center">
                          {entry ? (
                            <div
                              className="rounded-lg p-2 text-white shadow-sm"
                              style={{
                                backgroundColor: entry.color,
                              }}
                              title={`${entry.subject} - ${entry.Teacher}`}
                            >
                              <p className="text-xs font-bold truncate">
                                {entry.subject}
                              </p>
                              <p className="text-[10px] opacity-90 truncate mt-0.5">
                                {entry.Teacher}
                              </p>
                              {entry.room && (
                                <p className="text-[10px] opacity-80 truncate">
                                  {entry.room}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="h-12 rounded-lg bg-gray-50 border border-dashed border-gray-200"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Day view */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day tabs */}
          <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
            {data.days.map((day) => {
              const count = entriesByDay[day].length;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    activeDay === day
                      ? 'bg-indigo-600 text-white'
                      : count > 0
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {day}
                  {count > 0 && (
                    <span
                      className={`inline-block mr-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                        activeDay === day
                          ? 'bg-white/20'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Entries for active day */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-lg font-bold text-gray-900">
                {activeDay}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {entriesByDay[activeDay].length === 0
                  ? 'تعطیل یا بدون کلاس'
                  : `${formatNumber(entriesByDay[activeDay].length)} دوره درسی`}
              </p>
            </div>

            {entriesByDay[activeDay].length === 0 ? (
              <div className="p-12 text-center">
                <Home className="mx-auto text-gray-300" size={48} />
                <p className="mt-3 text-gray-500 text-sm">
                  در این روز کلاسی وجود ندارد
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {entriesByDay[activeDay].map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Period badge */}
                    <div
                      className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: entry.color }}
                    >
                      <span className="text-xs opacity-90">دوره</span>
                      <span className="text-lg font-bold">
                        {entry.periodIndex + 1}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-base truncate">
                        {entry.subject}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600">
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
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {entry.startTime} - {entry.endTime}
                        </span>
                      </div>
                    </div>

                    <ChevronLeft
                      size={18}
                      className="text-gray-300 rotate-180"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden,
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}