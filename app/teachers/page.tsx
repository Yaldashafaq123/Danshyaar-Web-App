'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BookOpen, Loader2, RefreshCw, Users } from 'lucide-react';
import { dashboardAPI } from '@/lib/api/dashboard';
import { useAuthStore } from '@/lib/store/authStore';
import RoleLogoutButton from '@/components/RoleLogoutButton';

type DashboardRecord = Record<string, unknown>;

function isRecord(value: unknown): value is DashboardRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function displayValue(value: unknown): string {
  if (typeof value === 'number' || typeof value === 'string') {
    return String(value);
  }
  return '';
}

function itemLabel(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (!isRecord(value)) return '';
  for (const key of ['name', 'className', 'subject', 'title', 'nameFarsi']) {
    const label = displayValue(value[key]);
    if (label) return label;
  }
  return '';
}

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardRecord | null>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResult, classesResult] = await Promise.all([
        dashboardAPI.getTeacherStats(),
        dashboardAPI.getTeacherClasses(),
      ]);

      setStats(isRecord(statsResult) ? statsResult : null);
      const classItems = Array.isArray(classesResult)
        ? classesResult
        : isRecord(classesResult) && Array.isArray(classesResult.classes)
          ? classesResult.classes
          : [];
      setClasses(classItems.map(itemLabel).filter(Boolean));
    } catch (requestError: unknown) {
      const responseMessage =
        typeof requestError === 'object' && requestError !== null &&
        'response' in requestError &&
        typeof requestError.response === 'object' &&
        requestError.response !== null &&
        'data' in requestError.response &&
        typeof requestError.response.data === 'object' &&
        requestError.response.data !== null &&
        'message' in requestError.response.data &&
        typeof requestError.response.data.message === 'string'
          ? requestError.response.data.message
          : null;
      setError(
        responseMessage ||
          'اطلاعات داشبورد دریافت نشد. لطفاً اتصال سرور را بررسی و دوباره تلاش کنید.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-l from-blue-700 to-indigo-600 p-8 text-white">
          <div>
            <p className="text-sm text-blue-100">داشبورد معلم</p>
            <h1 className="mt-2 text-3xl font-bold">
              خوش آمدید، {user?.fullName || 'معلم'}
            </h1>
          </div>
          <RoleLogoutButton />
        </header>

        {error && (
          <section
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => void loadDashboard()}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-800"
                >
                  <RefreshCw size={16} />
                  تلاش دوباره
                </button>
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex min-h-40 items-center justify-center gap-3 text-gray-600">
            <Loader2 className="animate-spin" size={24} />
            در حال بارگذاری داشبورد...
          </div>
        ) : (
          <>
            {stats && Object.keys(stats).length > 0 && (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(stats)
                  .filter(([, value]) => displayValue(value) !== '')
                  .map(([key, value]) => (
                    <article
                      key={key}
                      className="rounded-xl border bg-white p-5 shadow-sm"
                    >
                      <p className="text-sm text-gray-500">{key}</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {displayValue(value)}
                      </p>
                    </article>
                  ))}
              </section>
            )}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Users className="text-indigo-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  صنف‌ها و گروه‌های من
                </h2>
              </div>
              {classes.length ? (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {classes.map((className, index) => (
                    <li
                      key={`${className}-${index}`}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 text-gray-700"
                    >
                      <BookOpen size={18} className="text-indigo-600" />
                      {className}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  {stats
                    ? 'صنفی برای نمایش ثبت نشده است.'
                    : 'سرور هنوز اطلاعاتی برای داشبورد معلم برنگردانده است.'}
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
