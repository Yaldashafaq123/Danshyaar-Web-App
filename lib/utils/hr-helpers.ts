// lib/utils/hr-helpers.ts

// ---------- Number & Currency ----------
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString('fa-IR');
};

export const formatAFN = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '۰ افغانی';
  return `${Math.round(amount).toLocaleString('fa-IR')} افغانی`;
};

export const formatPercentage = (
  value: number | null | undefined,
  decimals = 0
): string => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// ---------- Dates (Shamsi) ----------
export const formatShamsiDate = (
  date: string | Date | null | undefined
): string => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('fa-IR');
  } catch {
    return '-';
  }
};

export const formatDateTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleString('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '-';
  }
};

export const formatTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

// ---------- Afghan/Shamsi months ----------
export const AFGHAN_MONTHS = [
  'حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله',
  'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت',
] as const;

export const getShamsiMonthName = (month: number): string =>
  AFGHAN_MONTHS[month - 1] || `ماه ${month}`;

export const getCurrentShamsiYear = (): number => {
  const now = new Date();
  // Approximate: Gregorian year - 621
  return now.getFullYear() - 621;
};

// ---------- Staff Type Labels ----------
export const staffTypeLabels: Record<string, string> = {
  TEACHER: 'معلم',
  ADMIN: 'مدیر',
  FINANCE: 'مالی',
  HR: 'منابع بشری',
  PRINCIPAL: 'مدیر مکتب',
  CHEF: 'آشپز',
  GUARD: 'نگهبان',
  DRIVER: 'راننده',
  CLEANER: 'نظافتچی',
  SECURITY: 'امنیت',
  MAINTENANCE: 'تعمیرات',
  LIBRARIAN: 'کتابدار',
  NURSE: 'پرستار',
  COUNSELOR: 'مشاور',
  COACH: 'مربی',
  OTHER: 'سایر',
};

export const staffTypeColors: Record<string, string> = {
  TEACHER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  FINANCE: 'bg-emerald-100 text-emerald-700',
  HR: 'bg-pink-100 text-pink-700',
  PRINCIPAL: 'bg-indigo-100 text-indigo-700',
  CHEF: 'bg-orange-100 text-orange-700',
  GUARD: 'bg-gray-100 text-gray-700',
  DRIVER: 'bg-yellow-100 text-yellow-700',
  CLEANER: 'bg-cyan-100 text-cyan-700',
  SECURITY: 'bg-red-100 text-red-700',
  MAINTENANCE: 'bg-slate-100 text-slate-700',
  OTHER: 'bg-gray-100 text-gray-600',
};

// ---------- Leave ----------
export const leaveTypeLabels: Record<string, string> = {
  ANNUAL: 'رخصتی سالانه',
  SICK: 'رخصتی مریضی',
  EMERGENCY: 'رخصتی اضطراری',
  MATERNITY: 'رخصتی زایمان',
  UNPAID: 'رخصتی بدون معاش',
};

export const leaveStatusLabels: Record<string, string> = {
  PENDING: 'در انتظار',
  APPROVED: 'تأیید شده',
  REJECTED: 'رد شده',
  CANCELLED: 'لغو شده',
};

export const leaveStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

// ---------- Attendance ----------
export const attendanceStatusLabels: Record<string, string> = {
  present: 'حاضر',
  late: 'تأخیر',
  absent: 'غایب',
  on_time: 'به وقت',
  no_checkin: 'بدون ورود',
  grace_period: 'داخل مهلت',
};

export const attendanceStatusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  late: 'bg-yellow-100 text-yellow-700',
  absent: 'bg-red-100 text-red-700',
};

export const punchLabelsFa: Record<string, string> = {
  IN: 'ورود',
  OUT: 'خروج',
  BREAK_OUT: 'خروج استراحت',
  BREAK_IN: 'ورود استراحت',
  OVERTIME_IN: 'ورود اضافه‌کار',
  OVERTIME_OUT: 'خروج اضافه‌کار',
  UNKNOWN: 'نامشخص',
};

// ---------- Salary ----------
export const salaryStatusLabels: Record<string, string> = {
  PENDING: 'در انتظار',
  PAID: 'پرداخت شده',
  PARTIAL: 'ناقص',
  CANCELLED: 'لغو شده',
};

export const salaryStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

// ---------- Warning ----------
export const warningTypeLabels: Record<string, string> = {
  VERBAL: 'شفاهی',
  WRITTEN: 'کتبی',
  FINAL: 'نهایی',
  TERMINATION: 'اخراج',
};

export const warningStatusLabels: Record<string, string> = {
  ACTIVE: 'فعال',
  RESOLVED: 'حل شده',
  EXPIRED: 'منقضی',
};

export const warningStatusColors: Record<string, string> = {
  ACTIVE: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
};

export const warningTypeColors: Record<string, string> = {
  VERBAL: 'bg-yellow-100 text-yellow-700',
  WRITTEN: 'bg-orange-100 text-orange-700',
  FINAL: 'bg-red-100 text-red-700',
  TERMINATION: 'bg-red-200 text-red-800',
};

// ---------- Payment Method ----------
export const paymentMethodLabels: Record<string, string> = {
  CASH: 'نقدی',
  BANK_TRANSFER: 'انتقال بانکی',
  CARD: 'کارت',
  MOBILE_MONEY: 'پول موبایل',
  CHECK: 'چک',
};

// ---------- Document Type ----------
export const documentTypeLabels: Record<string, string> = {
  CONTRACT: 'قرارداد',
  CERTIFICATE: 'گواهی‌نامه',
  RECOMMENDATION: 'توصیه‌نامه',
  WARNING: 'اخطار',
  POLICY: 'سیاست',
  OTHER: 'سایر',
};

// ---------- Sex / Marital ----------
export const sexLabels: Record<string, string> = {
  MALE: 'مرد',
  FEMALE: 'زن',
  OTHER: 'سایر',
};

export const maritalStatusLabels: Record<string, string> = {
  SINGLE: 'مجرد',
  MARRIED: 'متأهل',
  DIVORCED: 'طلاق داده',
  WIDOWED: 'بیوه',
};

export const educationLevelLabels: Record<string, string> = {
  NO_FORMAL: 'بدون تحصیلات',
  PRIMARY: 'ابتدایی',
  SECONDARY: 'متوسطه',
  HIGH_SCHOOL: 'دیپلم',
  BACHELORS: 'لیسانس',
  MASTERS: 'فوق لیسانس',
  DOCTORATE: 'دکترا',
  OTHER: 'سایر',
};

// ---------- Colors for attendance rate ----------
export const attendanceRateColor = (rate: number): string => {
  if (rate >= 90) return 'text-green-600';
  if (rate >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

export const attendanceRateBg = (rate: number): string => {
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};