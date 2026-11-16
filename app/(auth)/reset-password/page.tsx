'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api/auth';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.resetPassword(email.trim(), code.trim(), newPassword);
      setMessage(response.message || 'رمز عبور با موفقیت تغییر کرد.');
    } catch (requestError: unknown) {
      const responseMessage =
        typeof requestError === 'object' &&
        requestError !== null &&
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
      setError(responseMessage || 'تغییر رمز انجام نشد. کد را بررسی و دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12" dir="rtl">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تغییر رمز عبور</h1>
          <p className="mt-2 text-sm text-gray-600">ایمیل، کد بازیابی و رمز عبور جدید را وارد کنید.</p>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          ایمیل
          <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          کد بازیابی
          <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          رمز عبور جدید
          <input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        {message && <p role="status" className="text-sm text-green-700">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'در حال تغییر...' : 'ثبت رمز جدید'}
        </button>
        <Link href="/forgot-password" className="block text-sm text-blue-700 hover:underline">درخواست کد جدید</Link>
        <Link href="/login" className="block text-sm text-blue-700 hover:underline">بازگشت به ورود</Link>
      </form>
    </main>
  );
}
