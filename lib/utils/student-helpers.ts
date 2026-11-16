// lib/utils/student-helpers.ts
// ============================================
// STUDENT HELPERS
// ============================================

// ---------- Numbers ----------
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

export const formatAFN = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '۰ افغانی';
  return `${Math.round(amount).toLocaleString('fa-IR')} افغانی`;
};

// ---------- Dates ----------
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

// ---------- Greeting ----------
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'صبح بخیر';
  if (hour < 17) return 'ظهر بخیر';
  return 'شب بخیر';
};

// ---------- Score colors ----------
export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreBg = (score: number): string => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-blue-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

// ---------- Grade letters ----------
export const gradeLetterColors: Record<string, string> = {
  الف: 'text-green-600 bg-green-50',
  ب: 'text-blue-600 bg-blue-50',
  ج: 'text-purple-600 bg-purple-50',
  د: 'text-yellow-600 bg-yellow-50',
  ه: 'text-red-600 bg-red-50',
  '-': 'text-gray-400 bg-gray-50',
};

export const gradeStatusColors: Record<string, string> = {
  EXCELLENT: 'bg-green-100 text-green-700',
  GOOD: 'bg-blue-100 text-blue-700',
  AVERAGE: 'bg-yellow-100 text-yellow-700',
  CONDITIONAL: 'bg-orange-100 text-orange-700',
  FAILED: 'bg-red-100 text-red-700',
  FAILED_HALF: 'bg-red-100 text-red-700',
  FAILED_TOTAL: 'bg-red-100 text-red-700',
  PENDING: 'bg-gray-100 text-gray-600',
  PENDING_FINAL: 'bg-gray-100 text-gray-600',
  PENDING_HALF: 'bg-gray-100 text-gray-600',
};

// ---------- Attendance status ----------
export const attendanceStatusLabels: Record<string, string> = {
  present: 'حاضر',
  absent: 'غایب',
  late: 'تأخیر',
  excused: 'معذور',
};

export const attendanceStatusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  excused: 'bg-blue-100 text-blue-700',
};

// ---------- Assignment status ----------
export const assignmentStatusLabels: Record<string, string> = {
  PENDING: 'در انتظار',
  SUBMITTED: 'ارسال شده',
  GRADED: 'نمره گرفته',
  LATE: 'دیر رسیده',
  DRAFT: 'پیش‌نویس',
  MISSING: 'ارسال نشده',
};

export const assignmentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  GRADED: 'bg-green-100 text-green-700',
  LATE: 'bg-orange-100 text-orange-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  MISSING: 'bg-red-100 text-red-700',
};

// ---------- Days & Months ----------
export const AFGHAN_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const;

export const AFGHAN_MONTHS = [
  'حمل',
  'ثور',
  'جوزا',
  'سرطان',
  'اسد',
  'سنبله',
  'میزان',
  'عقرب',
  'قوس',
  'جدی',
  'دلو',
  'حوت',
] as const;

export const getAfghanMonthName = (month: number): string =>
  AFGHAN_MONTHS[month - 1] || '';

export const getCurrentShamsiYear = (): number =>
  new Date().getFullYear() - 621;

// ---------- Subject colors ----------
export const subjectColors: Record<string, string> = {
  ریاضی: '#3B82F6',
  فیزیک: '#10B981',
  شیمی: '#F59E0B',
  ادبیات: '#8B5CF6',
  دینی: '#EC4899',
  'زبان انگلیسی': '#06B6D4',
  ورزش: '#22C55E',
  هنر: '#F97316',
  علوم: '#84CC16',
  'زبان عربی': '#14B8A6',
  کامپیوتر: '#6366F1',
  مطالعات: '#A855F7',
  تاریخ: '#8B5CF6',
  جغرافیا: '#84CC16',
  هندسه: '#3B82F6',
  آمار: '#F59E0B',
};

export const getSubjectColor = (subject: string): string =>
  subjectColors[subject] || '#6B7280';