'use client';

import { AlertCircle, UserRound } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import RoleLogoutButton from '@/components/RoleLogoutButton';

export default function ParentDashboardPage() {
  const { user } = useAuthStore();
  const parent = user?.Parent ?? null;

  return (
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-l from-emerald-700 to-teal-600 p-8 text-white">
          <div>
            <p className="text-sm text-emerald-100">داشبورد والدین</p>
            <h1 className="mt-2 text-3xl font-bold">
              خوش آمدید، {user?.fullName || 'والد گرامی'}
            </h1>
            <p className="mt-2 text-emerald-100">
              از این صفحه می‌توانید وضعیت حساب والدین خود را مشاهده کنید.
            </p>
          </div>
          <RoleLogoutButton />
        </header>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-50 p-3 text-emerald-700">
              <UserRound size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">اطلاعات حساب</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          {parent?.relationship && (
            <p className="mt-5 border-t pt-4 text-sm text-gray-600">
              نسبت: {parent.relationship}
            </p>
          )}
        </section>

        <section
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"
          role="status"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-6">
            اطلاعات فرزندان و گزارش‌های والدین در پاسخ ورود یا APIهای وب موجود
            در این پروژه ارائه نشده است؛ برای نمایش این داده‌ها باید مسیرهای
            مربوط در API والدین مشخص و متصل شوند.
          </p>
        </section>
      </div>
    </main>
  );
}
