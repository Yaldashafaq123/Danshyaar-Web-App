import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12" dir="rtl">
      <section className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold text-gray-900">ایجاد حساب کاربری</h1>
        <p className="leading-7 text-gray-600">
          برای جلوگیری از ایجاد حساب با نقش یا دسترسی نادرست، ثبت‌نام عمومی از
          این صفحه انجام نمی‌شود. لطفاً برای ساخت حساب با مدیر مکتب تماس بگیرید.
        </p>
        <Link href="/login" className="inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
          بازگشت به ورود
        </Link>
      </section>
    </main>
  );
}
