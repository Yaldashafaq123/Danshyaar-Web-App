// app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api/auth';
import apiClient, { API_URL } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { getDashboardRoute, getUserRole } from '@/lib/auth/roles';

// ============================================
// Helper: Type-safe error extractor
// ============================================
interface ApiError {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
}

function extractApiError(err: unknown): ApiError {
  if (typeof err === 'object' && err !== null) {
    return err as ApiError;
  }
  return { message: 'Unknown error' };
}

// ============================================
// Login Page Component
// ============================================
export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    hasHydrated,
    setAuth,
    logout,
    setLoading,
    isLoading,
  } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !token) return;

    const role = getUserRole(user);
    if (role && user?.isActive === true) {
      router.replace(getDashboardRoute(role));
      return;
    }

    setError(
      user?.isActive === false
        ? 'حساب کاربری شما غیرفعال است'
        : 'نقش حساب کاربری مشخص نیست؛ لطفاً با مدیر سیستم تماس بگیرید'
    );
    logout();
  }, [hasHydrated, isAuthenticated, logout, router, token, user]);

  // ============================================
  // Check backend connection on mount
  // ============================================
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiClient.get('/test');
        setBackendStatus('online');
      } catch {
        setBackendStatus('offline');
      }
    };

    checkBackend();
  }, []);

  // ============================================
  // Handle Login
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('لطفاً ایمیل و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      if (!response.token || !response.User) {
        setError('پاسخ سرور نامعتبر است');
        return;
      }

      if (response.User.isActive !== true) {
        setError('حساب کاربری شما غیرفعال است');
        return;
      }

      const role = getUserRole(response.User);
      if (!role) {
        setError('نقش حساب کاربری مشخص نیست؛ لطفاً با مدیر سیستم تماس بگیرید');
        return;
      }

      setAuth(response.User, response.token);
      router.replace(getDashboardRoute(role));
    } catch (err: unknown) {
      const apiError = extractApiError(err);

      // Detailed error handling
      if (apiError.code === 'ERR_NETWORK' || apiError.code === 'ECONNABORTED') {
        setError(
          'خطای شبکه: نمی‌توان به سرور متصل شد. لطفاً اتصال اینترنت خود را بررسی کنید.'
        );
      } else if (apiError.response?.status === 404) {
        setError('مسیر ورود یافت نشد. لطفاً با مدیر سیستم تماس بگیرید.');
      } else if (apiError.response?.status === 401) {
        setError(
          apiError.response?.data?.message || 'ایمیل یا رمز عبور اشتباه است'
        );
      } else if (apiError.response?.status === 403) {
        setError(
          apiError.response?.data?.message || 'حساب کاربری شما غیرفعال است'
        );
      } else if (apiError.response?.status === 500) {
        setError('خطای داخلی سرور. لطفاً بعداً دوباره تلاش کنید.');
      } else {
        setError(
          apiError.response?.data?.message ||
            apiError.message ||
            'خطا در ورود به سیستم'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            سیستم مدیریت مکاتب
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            وارد حساب کاربری خود شوید
          </p>

          {/* Backend Status Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            {backendStatus === 'checking' && (
              <>
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="text-yellow-600">
                  در حال بررسی اتصال سرور...
                </span>
              </>
            )}
            {backendStatus === 'online' && (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-600">متصل به سرور</span>
              </>
            )}
            {backendStatus === 'offline' && (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-red-600">سرور در دسترس نیست</span>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ایمیل
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="example@email.com"
                dir="ltr"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                رمز عبور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  dir="ltr"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="mr-2 block text-sm text-gray-900"
              >
                مرا به خاطر بسپار
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                رمز عبور را فراموش کرده‌اید؟
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || backendStatus === 'offline'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  در حال ورود...
                </span>
              ) : (
                'ورود'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            حساب کاربری ندارید؟{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ثبت نام کنید
            </Link>
          </p>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 font-mono">
            <p>
              <strong>API URL:</strong> {API_URL}
            </p>
            <p>
              <strong>Backend:</strong> {backendStatus}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}