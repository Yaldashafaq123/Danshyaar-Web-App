// types/finance.ts
// ============================================
// FINANCE TYPES — Complete
// ============================================

// ---------- Generic ----------
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

// ---------- Finance Profile ----------
export interface FinanceStaffInfo {
  id: number;
  position?: string;
  department?: string;
  isActive: boolean;
  joinDate?: string;
  salary?: number | null;
}

export interface FinanceProfile {
  user: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
    profileImage?: string;
    isActive: boolean;
    createdAt: string;
  };
  financeStaff: FinanceStaffInfo;
  statistics: FinanceStatistics;
}

export interface FinanceStatistics {
  totalStudents: number;
  totalTeachers?: number;
  totalClasses?: number;
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  collectionRate: number;
  totalOutstanding: number;
  monthlyCollection: number;
  monthlyExpenses?: number;
  pendingFees: number;
  overdueRecords: number;
}

// ---------- Dashboard ----------
export interface DashboardSummary {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  completionRate: number;
  totalOutstanding: number;
  monthlyCollection: number;
  totalStudents: number;
  totalMonthlyRecords: number;
  overdueRecords: number;
  pendingStudents: number;
}

export interface FeeStatistics {
  todayCollection: number;
  todayCount: number;
  weekCollection: number;
  monthCollection: number;
  yearCollection: number;
  pendingFees: number;
  pendingCount: number;
  overdueCount: number;
  totalStudents: number;
  collectionRate: number;
  totalAssignments: number;
  paidAssignments: number;
}

// ---------- Academic Year ----------
export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  studentCount?: number;
  templateCount?: number;
  classCount?: number;
}

// ---------- Fee Categories ----------
export type FeeType =
  | 'MONTHLY_TUITION'
  | 'MONTHLY_TRANSPORT'
  | 'ONE_TIME_ADMISSION'
  | 'ONE_TIME_REGISTRATION'
  | 'ONE_TIME_BOOKS'
  | 'ONE_TIME_UNIFORM'
  | 'ONE_TIME_EXAM'
  | 'ANNUAL'
  | 'OTHER';

export interface FeeCategory {
  value: FeeType;
  label: string;
  icon: string;
  type: 'MONTHLY' | 'ONE_TIME' | 'ANNUAL' | 'OTHER';
  isRecurring: boolean;
}

// ---------- Fee Template ----------
export interface FeeTemplateItem {
  id?: number;
  feeType: FeeType;
  name: string;
  amount: number;
  isRecurring: boolean;
  isMandatory: boolean;
  description?: string | null;
}

export interface FeeTemplate {
  id: number;
  name: string;
  academicYearId: number;
  academicYearName?: string;
  classId: number | null;
  className: string;
  studentCount: number;
  itemCount: number;
  assignedCount: number;
  isActive: boolean;
  description?: string | null;
  items: FeeTemplateItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ---------- Fee Assignment ----------
export interface StudentBrief {
  id: number;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
  class: {
    id: number;
    name: string;
    section?: string | null;
  } | null;
  status: string;
}

export interface FeeAssignmentItem {
  id: number;
  feeType: FeeType;
  name: string;
  amount: number;
  isRecurring: boolean;
  finalAmount: number;
  paidAmount?: number;
  discountAmount?: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  MonthlyFeeRecord?: MonthlyFeeRecord[];
}

export interface FeeAssignment {
  id: number;
  studentId: number;
  academicYearId: number;
  feeTemplateId?: number | null;
  assignedDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  student: StudentBrief | null;
  academicYear?: AcademicYear;
  feeItems: FeeAssignmentItem[];
  feeTemplate?: { id: number; name: string } | null;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
  collectionRate: number;
}

// ---------- Monthly Fee Record ----------
export interface MonthlyFeeRecord {
  id: number;
  month: string; // "HAMAL", "SAWR", etc.
  monthName?: string;
  year: number;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  dueDate?: string | null;
  paidDate?: string | null;
}

// ---------- Student Fee Info ----------
export interface StudentFeeInfo {
  student: {
    id: number;
    fullName: string;
    fatherName?: string;
    phone?: string;
    photo?: string | null;
    admissionDate?: string;
    class: { name: string; section?: string | null };
    classTime: number; // 0 = morning, 1 = afternoon
  };
  feeDetails: {
    admissionFee: number;
    tuitionFee: number;
    transportFee: number;
    otherFees: number;
    totalFees: number;
    paidAmount: number;
    balance: number;
  };
  monthlyFees: {
    id: number;
    month: string;
    monthName: string;
    year: number;
    amount: number;
    paid: number;
    balance: number;
    status: string;
    dueDate?: string | null;
  }[];
  oneTimeFees: {
    id: number;
    name: string;
    feeType: FeeType;
    amount: number;
    paid: number;
    balance: number;
    status: string;
    isRecurring: false;
  }[];
  academicYear: AcademicYear | null;
}

// ---------- Payment ----------
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' | 'CHECK';

export interface Payment {
  id: number;
  type: 'monthly' | 'one-time';
  studentId?: number;
  studentName: string;
  studentPhone?: string;
  className: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  feeTitle: string;
  confirmedBy: string;
  referenceNo?: string | null;
  notes?: string | null;
  feePlanId?: number;
  AcademicYear?: string;
  transactionId?: number;
}

// ---------- Outstanding Fee ----------
export interface OutstandingStudent {
  studentId: number;
  studentName: string;
  studentPhone?: string;
  className?: string;
  AcademicYear: string;
  totalBalance: number;
  pendingItems: {
    type: 'monthly' | 'one-time';
    name: string;
    month?: string;
    year?: number;
    monthName?: string;
    balanceAmount: number;
    recordId?: number;
    itemId?: number;
    dueDate?: string | null;
  }[];
}

export interface OutstandingFees {
  totalOutstanding: number;
  totalStudents: number;
  students: OutstandingStudent[];
}

// ---------- Student with Pending Fees ----------
export interface StudentPendingFee {
  id: number;
  name: string;
  phone?: string;
  className: string;
  classSection?: string | null;
  classId: number;
  totalFees: number;
  totalPaid: number;
  totalPending: number;
  pendingFees: {
    id: number;
    type?: 'monthly' | 'one-time';
    AcademicYear: string;
    academicYearId: number;
    amount: number;
    paidAmount: number;
    balanceAmount: number;
    discountAmount: number;
    status: string;
    createdAt: string;
    month?: string;
    monthName?: string;
    year?: number;
    name?: string;
  }[];
  pendingCount: number;
  hasFeePlan: boolean;
  feePlanId: number | null;
  feeStatus: string | null;
}

// ---------- Bulk Collection ----------
export interface BulkCollectionStudent {
  id: number;
  name: string;
  rollNumber?: string;
  amount: number;
  feeId: number | null;
  defaultAmount: number;
}

// ---------- Expense ----------
export interface Expense {
  id: number;
  categoryId: number;
  categoryName?: string;
  amount: number;
  description?: string | null;
  date: string;
  receiptUrl?: string | null;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string | null;
  isDeleted: boolean;
}

// ---------- Salary ----------
export interface Salary {
  id: number;
  teacherId: number;
  teacherName?: string;
  baseSalary: number;
  finalAmount: number;
  amount: number;
  paidAmount: number;
  month: number;
  year: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';
  bonusAmount?: number;
  deductionAmount?: number;
  overtimeAmount?: number;
  overtimeHours?: number;
  paidAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

// ---------- Report ----------
export interface DailyCollection {
  totalAmount: number;
  totalPayments: number;
  payments: Payment[];
}

export interface MonthlyCollectionRow {
  month: string;
  monthName: string;
  year: number;
  expected: number;
  collected: number;
  rate: number;
}

export interface IncomeStatement {
  income: { total: number; items?: { name: string; amount: number }[] };
  expenses: { total: number; items?: { name: string; amount: number }[] };
  netIncome: number;
}

// ---------- Afghan Months ----------
export interface AfghanMonthOption {
  key: string;
  name: string;
  number: number;
  isCurrent: boolean;
}