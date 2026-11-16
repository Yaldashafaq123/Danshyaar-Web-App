// lib/utils/finance-helpers.ts

// ---------- Currency ----------
export const formatAFN = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '۰ افغانی';
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('fa-IR')} افغانی`;
};

export const formatAFNCompact = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '۰';
  const num = Math.round(amount);
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString('fa-IR');
};

export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString('fa-IR');
};

export const formatPercentage = (
  value: number | null | undefined,
  decimals = 0
): string => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('fa-IR');
  } catch {
    return '-';
  }
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
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

// ---------- Afghan Months ----------
export const AFGHAN_MONTHS = [
  'HAMAL',
  'SAWR',
  'JAWZA',
  'SARATAN',
  'ASAD',
  'SUNBULA',
  'MIZAN',
  'AQRAB',
  'QAWS',
  'JADI',
  'DALWA',
  'HOOT',
] as const;

export const AFGHAN_MONTH_NAMES: Record<string, string> = {
  HAMAL: 'حمل',
  SAWR: 'ثور',
  JAWZA: 'جوزا',
  SARATAN: 'سرطان',
  ASAD: 'اسد',
  SUNBULA: 'سنبله',
  MIZAN: 'میزان',
  AQRAB: 'عقرب',
  QAWS: 'قوس',
  JADI: 'جدی',
  DALWA: 'دلو',
  HOOT: 'حوت',
};

export const getAfghanMonthName = (key: string): string =>
  AFGHAN_MONTH_NAMES[key] || key;

// ---------- Status Colors ----------
export const feeStatusLabels: Record<string, string> = {
  PENDING: 'در انتظار',
  PAID: 'پرداخت شده',
  PARTIAL: 'ناقص',
  OVERDUE: 'معوق',
  CANCELLED: 'لغو شده',
};

export const feeStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export const assignmentStatusLabels: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  ACTIVE: 'فعال',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
};

export const assignmentStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const paymentMethodLabels: Record<string, string> = {
  CASH: 'نقدی',
  BANK_TRANSFER: 'انتقال بانکی',
  CARD: 'کارت',
  MOBILE_MONEY: 'پول موبایل',
  CHECK: 'چک',
};

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

export const feeTypeLabels: Record<string, string> = {
  MONTHLY_TUITION: 'شهریه ماهانه',
  MONTHLY_TRANSPORT: 'حمل و نقل ماهانه',
  ONE_TIME_ADMISSION: 'هزینه پذیرش',
  ONE_TIME_REGISTRATION: 'هزینه ثبت نام',
  ONE_TIME_BOOKS: 'کتاب‌ها',
  ONE_TIME_UNIFORM: 'یونیفورم',
  ONE_TIME_EXAM: 'هزینه امتحانات',
  ANNUAL: 'هزینه سالانه',
  OTHER: 'سایر',
};

export const classTimeLabels: Record<number, string> = {
  0: 'صبح',
  1: 'بعد از ظهر',
};

// ---------- Collection Rate Color ----------
export const collectionRateColor = (rate: number): string => {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const collectionRateBg = (rate: number): string => {
  if (rate >= 80) return 'bg-green-500';
  if (rate >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};