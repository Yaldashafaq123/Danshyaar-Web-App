// lib/utils/afghan-helpers.ts

// Afghan Months (Shamsi)
export const AFGHAN_MONTHS = [
  { value: 'HAMAL', label: 'حمل' },
  { value: 'SAWR', label: 'ثور' },
  { value: 'JAWZA', label: 'جوزا' },
  { value: 'SARATAN', label: 'سرطان' },
  { value: 'ASAD', label: 'اسد' },
  { value: 'SUNBULA', label: 'سنبله' },
  { value: 'MIZAN', label: 'میزان' },
  { value: 'AQRAB', label: 'عقرب' },
  { value: 'QAWS', label: 'قوس' },
  { value: 'JADI', label: 'جدی' },
  { value: 'DALWA', label: 'دلو' },
  { value: 'HOOT', label: 'حوت' },
];

// Get current Afghan month
export const getCurrentAfghanMonth = () => {
  const now = new Date();
  // Simple mapping - in production use a proper calendar library
  const month = now.getMonth();
  return AFGHAN_MONTHS[month]?.value || 'HAMAL';
};

// Format date to Afghan format
export const formatAfghanDate = (date: Date | string) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fa-AF', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

// Get current year (Shamsi)
export const getShamsiYear = () => {
  const now = new Date();
  // Approximate conversion - in production use a proper library
  return now.getFullYear() - 621;
};

// Format currency (AFN)
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fa-AF', {
    style: 'currency',
    currency: 'AFN',
  }).format(amount);
};

// Get status color
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAID: 'bg-green-100 text-green-800',
    UNPAID: 'bg-red-100 text-red-800',
    OVERDUE: 'bg-red-100 text-red-800',
    PARTIAL: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    LATE: 'bg-yellow-100 text-yellow-800',
    EXCUSED: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get status badge (Persian)
export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: 'فعال',
    INACTIVE: 'غیرفعال',
    PENDING: 'در انتظار',
    APPROVED: 'تایید شده',
    REJECTED: 'رد شده',
    PAID: 'پرداخت شده',
    UNPAID: 'پرداخت نشده',
    OVERDUE: 'دیرکرد',
    PARTIAL: 'بخشی',
    CANCELLED: 'لغو شده',
    COMPLETED: 'تکمیل شده',
    DRAFT: 'پیش نویس',
    SCHEDULED: 'برنامه ریزی شده',
    PUBLISHED: 'منتشر شده',
    ARCHIVED: 'بایگانی شده',
    PRESENT: 'حاضر',
    ABSENT: 'غایب',
    LATE: 'تاخیر',
    EXCUSED: 'معذور',
  };
  return labels[status] || status;
};