// lib/utils/principal-helpers.ts
// ============================================
// HELPERS FOR PRINCIPAL / ACADEMIC DASHBOARD
// ============================================

// ---------- Grade colors ----------
export const gradeColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  EXCELLENT: { bg: 'bg-green-100', text: 'text-green-700', label: 'عالی' },
  VERY_GOOD: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'خیلی خوب' },
  GOOD: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'خوب' },
  SATISFACTORY: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    label: 'قابل قبول',
  },
  NEEDS_IMPROVEMENT: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'نیاز به بهبود',
  },
  UNSATISFACTORY: { bg: 'bg-red-200', text: 'text-red-800', label: 'ضعیف' },
};

// ---------- Evaluation status labels ----------
export const evaluationStatusLabels: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  PENDING_REVIEW: 'در انتظار بازبینی',
  SUBMITTED: 'ارسال شده',
  ACKNOWLEDGED: 'تأیید شده',
  DISPUTED: 'اعتراض شده',
  ARCHIVED: 'بایگانی شده',
};

export const evaluationStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  ACKNOWLEDGED: 'bg-green-100 text-green-700',
  DISPUTED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-200 text-gray-600',
};

// ---------- Exam status labels ----------
export const examStatusLabels: Record<string, string> = {
  upcoming: 'پیش‌رو',
  ongoing: 'در جریان',
  completed: 'تمام شده',
};

export const examStatusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};

// ---------- Student status labels ----------
export const studentStatusLabels: Record<string, string> = {
  ACTIVE: 'فعال',
  GRADUATED: 'فارغ‌التحصیل',
  SUSPENDED: 'تعلیق',
  LEFT: 'ترک تحصیل',
};

export const studentStatusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  GRADUATED: 'bg-blue-100 text-blue-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  LEFT: 'bg-gray-100 text-gray-700',
};

// ---------- Attendance status labels ----------
export const attendanceStatusLabels: Record<string, string> = {
  PRESENT: 'حاضر',
  ABSENT: 'غایب',
  LATE: 'تأخیر',
  EXCUSED: 'معذور',
};

export const attendanceStatusColors: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  LATE: 'bg-yellow-100 text-yellow-700',
  EXCUSED: 'bg-blue-100 text-blue-700',
};

// ---------- Evaluation period labels ----------
export const evaluationPeriodLabels: Record<string, string> = {
  MONTHLY: 'ماهانه',
  QUARTERLY: 'فصلی',
  SEMESTER: 'سمستر',
  ANNUAL: 'سالانه',
  PROBATION: 'دوره آزمایشی',
  SPECIAL: 'ویژه',
};

// ---------- Term labels ----------
export const termLabels: Record<string, string> = {
  FIRST: 'چهارونیم‌ماهه اول',
  SECOND: 'چهارونیم‌ماهه دوم',
  THIRD: 'چهارونیم‌ماهه سوم',
  SUMMER: 'تابستانی',
};

// ---------- Evaluation category labels ----------
export const evaluationCategoryLabels: Record<string, string> = {
  TEACHING: 'تدریس',
  DISCIPLINE: 'نظم و انضباط',
  COMMUNICATION: 'ارتباطات',
  PROFESSIONAL: 'حرفه‌ای',
  STUDENT_RELATION: 'رابطه با شاگردان',
  ADMINISTRATIVE: 'اداری',
  COLLABORATION: 'همکاری',
  ATTENDANCE: 'حضور',
  PUNCTUALITY: 'وقت‌شناسی',
  OTHER: 'سایر',
};

// ---------- Days of week ----------
export const dayNames = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

// ---------- Grade calculation helpers ----------
export const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'EXCELLENT';
  if (percentage >= 80) return 'VERY_GOOD';
  if (percentage >= 70) return 'GOOD';
  if (percentage >= 60) return 'SATISFACTORY';
  if (percentage >= 50) return 'NEEDS_IMPROVEMENT';
  return 'UNSATISFACTORY';
};

export const getGradeLabel = (grade: string): string =>
  gradeColors[grade]?.label ?? grade;

export const getPerformanceLevel = (percentage: number) => {
  if (percentage >= 90) {
    return { level: 'OUTSTANDING', label: 'برجسته', color: '#10b981' };
  }
  if (percentage >= 80) {
    return { level: 'EXCELLENT', label: 'عالی', color: '#3b82f6' };
  }
  if (percentage >= 70) {
    return { level: 'GOOD', label: 'خوب', color: '#f59e0b' };
  }
  if (percentage >= 60) {
    return { level: 'SATISFACTORY', label: 'قابل قبول', color: '#f97316' };
  }
  if (percentage >= 50) {
    return { level: 'NEEDS_IMPROVEMENT', label: 'نیاز به بهبود', color: '#ef4444' };
  }
  return { level: 'UNSATISFACTORY', label: 'ضعیف', color: '#dc2626' };
};

// ---------- Formatting ----------
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