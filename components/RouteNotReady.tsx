export default function RouteNotReady({ title }: { title: string }) {
  return (
    <main className="min-h-[60vh] p-6" dir="rtl">
      <section
        className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm"
        role="status"
      >
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-4 leading-7 text-gray-600">
          این بخش هنوز در وب‌سایت پیاده‌سازی نشده است. هیچ اطلاعات آزمایشی
          نمایش داده نمی‌شود؛ لطفاً با مدیر سیستم تماس بگیرید.
        </p>
      </section>
    </main>
  );
}
