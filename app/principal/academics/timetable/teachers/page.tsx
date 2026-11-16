// app/admin/academic/timetable/teachers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  ArrowRight,
  Home,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { principalTeachersAPI, principalClassesAPI, principalTimetableAPI } from '@/lib/api/principal';
import type { Teacher, Class, TimetableResponse } from '@/types/principal';
import { dayNames } from '@/lib/utils/principal-helpers';

interface TeacherScheduleEntry {
  day: number;
  period: number;
  time: string;
  subject: string;
  className: string;
  room: string;
}

export default function TeacherTimetablePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [schedule, setSchedule] = useState<TeacherScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const [t, c] = await Promise.all([
        principalTeachersAPI.list({ limit: 200, status: 'active' }),
        principalClassesAPI.list(),
      ]);
      setTeachers(t.teachers);
      setClasses(c);
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
    loadLists();
  }, []);

  const loadTeacherSchedule = async (teacher: Teacher) => {
    try {
      setSelectedTeacher(teacher);
      setLoadingSchedule(true);
      setSchedule([]);

      const entries: TeacherScheduleEntry[] = [];

      // Loop through all classes and all days, find entries for this teacher
      for (const cls of classes) {
        for (let day = 0; day < 6; day++) {
          try {
            const res: TimetableResponse = await principalTimetableAPI.get(
              cls.id,
              day
            );
            for (const p of res.periods) {
              if (p.teacherId === teacher.id) {
                entries.push({
                  day,
                  period: p.period,
                  time: p.time,
                  subject: p.subject,
                  className: `${cls.name} ${cls.section || ''}`.trim(),
                  room: p.room,
                });
              }
            }
          } catch {
            // skip class+day that has no timetable
          }
        }
      }

      entries.sort((a, b) => a.day - b.day || a.period - b.period);
      setSchedule(entries);
    } catch (err) {
      console.error(err);
      setError('خطا در بارگذاری جدول معلم');
    } finally {
      setLoadingSchedule(false);
    }
  };

  const filtered = teachers.filter((t) =>
    `${t.fullName} ${t.teacherCode || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Group schedule by day
  const byDay: Record<number, TeacherScheduleEntry[]> = {};
  for (let i = 0; i < 6; i++) byDay[i] = [];
  schedule.forEach((s) => byDay[s.day].push(s));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/academic/timetable"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="text-purple-500" size={26} />
              جدول زمانی معلمان
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              مشاهده برنامه هفتگی هر معلم
            </p>
          </div>
        </div>
        <button
          onClick={loadLists}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher list */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-4">
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی معلم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">
              معلمی یافت نشد
            </p>
          ) : (
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => loadTeacherSchedule(t)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
                    selectedTeacher?.id === t.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 overflow-hidden flex-shrink-0">
                    {t.profileImage ? (
                      <img
                        src={t.profileImage}
                        alt={t.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {t.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {t.specialization || t.teacherCode || 'معلم'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="lg:col-span-2">
          {!selectedTeacher ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Calendar className="mx-auto text-gray-300" size={48} />
              <p className="mt-3 text-gray-500">
                یک معلم را برای مشاهده جدول انتخاب کنید
              </p>
            </div>
          ) : loadingSchedule ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
              <p className="mt-3 text-gray-500 text-sm">
                در حال بارگذاری جدول...
              </p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Calendar className="mx-auto text-gray-300" size={48} />
              <p className="mt-3 text-gray-500">
                این معلم در هیچ جدولی ثبت نشده
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  جدول هفتگی: {selectedTeacher.fullName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  مجموع {schedule.length} دوره در هفته
                </p>
              </div>

              <div className="p-4 space-y-4">
                {dayNames.slice(0, 6).map((day, idx) => {
                  const dayEntries = byDay[idx] || [];
                  return (
                    <div key={idx}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        {day}
                      </h4>
                      {dayEntries.length === 0 ? (
                        <p className="text-xs text-gray-400 py-2">
                          بدون دوره
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {dayEntries.map((entry, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 text-xs">
                                {entry.period + 1}
                              </div>
                              <div className="w-24 flex-shrink-0">
                                <p className="text-xs text-gray-600">
                                  {entry.time}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 flex-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                                  <BookOpen size={10} />
                                  {entry.subject}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                  <Home size={10} />
                                  {entry.className}
                                </span>
                                {entry.room && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    {entry.room}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}