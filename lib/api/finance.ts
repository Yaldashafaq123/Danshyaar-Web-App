// lib/api/finance.ts
// ============================================
// FINANCE API — baseURL already ends with /api
// All paths here start with /finance
// ============================================

import apiClient from './client';
import type {
  FinanceProfile,
  DashboardSummary,
  FeeStatistics,
  AcademicYear,
  FeeTemplate,
  FeeAssignment,
  StudentFeeInfo,
  OutstandingFees,
  StudentPendingFee,
  BulkCollectionStudent,
  Payment,
  Expense,
  ExpenseCategory,
  Salary,
  DailyCollection,
  MonthlyCollectionRow,
  IncomeStatement,
  FeeCategory,
  AfghanMonthOption,
  PaymentMethod,
} from '@/types/finance';

// Debug
const log = (msg: string, data?: unknown) =>
  console.log(`🔵 [financeAPI] ${msg}`, data ?? '');

// Unwrap { success, data, message? }
const unwrap = <T,>(res: { data?: unknown }): T => {
  const body = res?.data as { success?: boolean; data?: T } | T | undefined;
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    'data' in body
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
};

// ============================================
// PROFILE & DASHBOARD
// ============================================
export const financeProfileAPI = {
  getProfile: async (): Promise<FinanceProfile> => {
    log('GET /finance/profile');
    const res = await apiClient.get('/finance/profile');
    return unwrap<FinanceProfile>(res);
  },

  getStats: async (): Promise<{ summary: FeeStatistics; financeStaff?: unknown }> => {
    log('GET /finance/stats');
    const res = await apiClient.get('/finance/stats');
    return unwrap(res);
  },

  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    position?: string;
    department?: string;
    salary?: number;
    profileImage?: string;
  }) => {
    log('PUT /finance/profile', data);
    const res = await apiClient.put('/finance/profile', data);
    return unwrap<unknown>(res);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    log('PUT /finance/change-password');
    const res = await apiClient.put('/finance/change-password', {
      currentPassword,
      newPassword,
    });
    return unwrap<unknown>(res);
  },
};

export const financeDashboardAPI = {
  getSummary: async (): Promise<DashboardSummary> => {
    log('GET /finance/dashboard/summary');
    const res = await apiClient.get('/finance/dashboard/summary');
    return unwrap<DashboardSummary>(res);
  },

  getFeeStatistics: async (): Promise<FeeStatistics> => {
    log('GET /finance/fee-statistics');
    const res = await apiClient.get('/finance/fee-statistics');
    return unwrap<FeeStatistics>(res);
  },
};

// ============================================
// ACADEMIC YEARS
// ============================================
export const financeAcademicYearsAPI = {
  list: async (): Promise<AcademicYear[]> => {
    log('GET /finance/academic-years');
    const res = await apiClient.get('/finance/academic-years');
    return unwrap<AcademicYear[]>(res);
  },

  create: async (data: {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }) => {
    log('POST /finance/academic-years', data);
    const res = await apiClient.post('/finance/academic-years', data);
    return unwrap<unknown>(res);
  },
};

// ============================================
// FEE TEMPLATES
// ============================================
export const financeTemplatesAPI = {
  list: async (params: {
    classId?: number;
    academicYearId?: number;
    isActive?: boolean;
  } = {}): Promise<FeeTemplate[]> => {
    log('GET /finance/fee-templates', params);
    const res = await apiClient.get('/finance/fee-templates', { params });
    return unwrap<FeeTemplate[]>(res);
  },

  getById: async (id: number): Promise<FeeTemplate> => {
    log(`GET /finance/fee-templates/${id}`);
    const res = await apiClient.get(`/finance/fee-templates/${id}`);
    return unwrap<FeeTemplate>(res);
  },

  create: async (data: {
    name: string;
    classId?: number | null;
    academicYearId: number;
    description?: string;
    isActive?: boolean;
    items: {
      feeType: string;
      name: string;
      amount: number;
      isRecurring?: boolean;
      isMandatory?: boolean;
      description?: string;
    }[];
  }) => {
    log('POST /finance/fee-templates', data);
    const res = await apiClient.post('/finance/fee-templates', data);
    return unwrap<FeeTemplate>(res);
  },

  update: async (id: number, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
    items?: {
      feeType: string;
      name: string;
      amount: number;
      isRecurring?: boolean;
      isMandatory?: boolean;
    }[];
  }) => {
    log(`PUT /finance/fee-templates/${id}`, data);
    const res = await apiClient.put(`/finance/fee-templates/${id}`, data);
    return unwrap<FeeTemplate>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /finance/fee-templates/${id}`);
    const res = await apiClient.delete(`/finance/fee-templates/${id}`);
    return unwrap<unknown>(res);
  },

  getStudents: async (id: number) => {
    log(`GET /finance/fee-templates/${id}/students`);
    const res = await apiClient.get(`/finance/fee-templates/${id}/students`);
    return unwrap<{
      students: {
        id: number;
        name: string;
        phone: string;
        rollNumber: string;
        selected: boolean;
        existingFee: boolean;
        feeStatus: string | null;
        feeId: number | null;
      }[];
      totalStudents: number;
      hasExistingFees: number;
    }>(res);
  },

  assign: async (data: {
    templateId: number;
    studentIds: number[];
    academicYearId?: number;
  }) => {
    log('POST /finance/fee-templates/assign', data);
    const res = await apiClient.post('/finance/fee-templates/assign', data);
    return unwrap<{
      created: number;
      updated: number;
      errors: number;
      total: number;
    }>(res);
  },

  getStats: async (id: number) => {
    log(`GET /finance/fee-templates/${id}/stats`);
    const res = await apiClient.get(`/finance/fee-templates/${id}/stats`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// FEE CATEGORIES (metadata)
// ============================================
export const financeCategoriesAPI = {
  list: async (): Promise<FeeCategory[]> => {
    log('GET /finance/fee-categories');
    const res = await apiClient.get('/finance/fee-categories');
    return unwrap<FeeCategory[]>(res);
  },
};

// ============================================
// FEE ASSIGNMENTS
// ============================================
export const financeAssignmentsAPI = {
  list: async (params: {
    studentId?: number;
    academicYearId?: number;
    classId?: number;
    status?: string;
  } = {}): Promise<FeeAssignment[]> => {
    log('GET /finance/fee-assignments', params);
    const res = await apiClient.get('/finance/fee-assignments', { params });
    return unwrap<FeeAssignment[]>(res);
  },

  getById: async (id: number) => {
    log(`GET /finance/fee-assignments/${id}`);
    const res = await apiClient.get(`/finance/fee-assignments/${id}`);
    return unwrap<FeeAssignment>(res);
  },

  create: async (data: {
    studentId: number;
    academicYearId: number;
    feeTemplateId?: number;
    items?: {
      feeType: string;
      name: string;
      amount: number;
      isRecurring?: boolean;
      finalAmount?: number;
    }[];
    notes?: string;
  }) => {
    log('POST /finance/fee-assignments', data);
    const res = await apiClient.post('/finance/fee-assignments', data);
    return unwrap<FeeAssignment>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /finance/fee-assignments/${id}`);
    const res = await apiClient.delete(`/finance/fee-assignments/${id}`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// STUDENTS
// ============================================
export const financeStudentsAPI = {
  search: async (query: string) => {
    log('GET /finance/students/search', { q: query });
    const res = await apiClient.get('/finance/students/search', {
      params: { q: query },
    });
    return unwrap<
      {
        id: number;
        userId: number;
        classId: number;
        status: string;
        studentNumber?: string;
        user: { fullName: string; email: string; phone: string };
        class: { id: number; name: string; section: string | null } | null;
      }[]
    >(res);
  },

  getById: async (id: number) => {
    log(`GET /finance/students/${id}`);
    const res = await apiClient.get(`/finance/students/${id}`);
    return unwrap<{
      id: number;
      fullName: string;
      phone?: string;
      email?: string;
      profileImage?: string | null;
      status: string;
      class: { id: number; name: string; section: string | null } | null;
      hasFeePlan: boolean;
      totalFees: number;
      totalPaid: number;
      totalBalance: number;
      feePlan: unknown;
    }>(res);
  },

  getFeeInfo: async (id: number): Promise<StudentFeeInfo> => {
    log(`GET /finance/students/${id}/fee-info`);
    const res = await apiClient.get(`/finance/students/${id}/fee-info`);
    return unwrap<StudentFeeInfo>(res);
  },

  getFeeSummary: async (id: number) => {
    log(`GET /finance/students/${id}/fee-summary`);
    const res = await apiClient.get(`/finance/students/${id}/fee-summary`);
    return unwrap<unknown[]>(res);
  },

  getFeeHistory: async (studentId: number) => {
    log(`GET /finance/students/${studentId}/fee-history`);
    const res = await apiClient.get(`/finance/students/${studentId}/fee-history`);
    return unwrap<
      {
        id: number;
        date: string;
        month: string;
        monthName: string;
        year: number;
        tuitionFee: number;
        transportFee: number;
        otherFees: number;
        discount: number;
        payment: number;
        balance: number;
        details: string;
        billNo: string;
        confirmedBy: string;
        paymentMethod: PaymentMethod;
      }[]
    >(res);
  },

  getInstallments: async (studentId: number, academicYearId?: number) => {
    log(`GET /finance/students/${studentId}/installments`);
    const res = await apiClient.get(
      `/finance/students/${studentId}/installments`,
      { params: academicYearId ? { academicYearId } : {} }
    );
    return unwrap<unknown[]>(res);
  },

  getByClass: async (classId: number) => {
    log(`GET /finance/students-by-class/${classId}`);
    const res = await apiClient.get(`/finance/students-by-class/${classId}`);
    return unwrap<unknown[]>(res);
  },

  getByClassForCollection: async (classId: number) => {
    log(`GET /finance/students/by-class/${classId}/collection`);
    const res = await apiClient.get(
      `/finance/students/by-class/${classId}/collection`
    );
    return unwrap<
      {
        id: number;
        name: string;
        fatherName: string;
        phone: string;
        classTime: number;
        hasFeePlan: boolean;
        feePlanId: number | null;
      }[]
    >(res);
  },

  getPendingFees: async (classId?: number): Promise<{
    data: StudentPendingFee[];
    summary?: {
      totalStudents: number;
      studentsWithPending: number;
      totalPendingAmount: number;
      averagePending: number;
    };
  }> => {
    log('GET /finance/students-pending-fees');
    const res = await apiClient.get('/finance/students-pending-fees', {
      params: classId ? { classId } : {},
    });
    const body = res.data as {
      data?: StudentPendingFee[];
      summary?: {
        totalStudents: number;
        studentsWithPending: number;
        totalPendingAmount: number;
        averagePending: number;
      };
    };
    return {
      data: body?.data || [],
      summary: body?.summary,
    };
  },
};

// ============================================
// PAYMENTS
// ============================================
export const financePaymentsAPI = {
  recordStudentFeePayment: async (data: {
    studentId: number;
    academicYearId: number;
    month: number;
    year: number;
    tuitionFee: number;
    transportFee?: number;
    otherFees?: number;
    admissionFee?: number;
    discount?: number;
    payment: number;
    paymentMethod: PaymentMethod;
    details?: string;
    billNo?: string;
  }) => {
    log('POST /finance/student-fee-payment', data);
    const res = await apiClient.post('/finance/student-fee-payment', data);
    return unwrap<unknown>(res);
  },

  recordMonthlyPayment: async (data: {
    monthlyFeeRecordId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNo?: string;
    notes?: string;
  }) => {
    log('POST /finance/monthly-payments', data);
    const res = await apiClient.post('/finance/monthly-payments', data);
    return unwrap<unknown>(res);
  },

  recordOneTimePayment: async (data: {
    feeAssignmentItemId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNo?: string;
    notes?: string;
  }) => {
    log('POST /finance/one-time-payments', data);
    const res = await apiClient.post('/finance/one-time-payments', data);
    return unwrap<unknown>(res);
  },

  getHistory: async (params: {
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    studentId?: number;
    paymentMethod?: PaymentMethod;
  } = {}): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    summary: {
      monthlyCount: number;
      oneTimeCount: number;
      totalAmount: number;
    };
  }> => {
    log('GET /finance/payment-history', params);
    const res = await apiClient.get('/finance/payment-history', { params });
    return unwrap(res);
  },

  getBillNumber: async (): Promise<{ billNo: string }> => {
    log('GET /finance/generate-bill-number');
    const res = await apiClient.get('/finance/generate-bill-number');
    return unwrap<{ billNo: string }>(res);
  },
};

// ============================================
// DISCOUNTS
// ============================================
export const financeDiscountsAPI = {
  apply: async (data: {
    feeAssignmentId: number;
    feeAssignmentItemId?: number;
    amount: number;
    reason: string;
  }) => {
    log('POST /finance/discounts', data);
    const res = await apiClient.post('/finance/discounts', data);
    return unwrap<unknown>(res);
  },
};

// ============================================
// OUTSTANDING / DEFAULTERS
// ============================================
export const financeOutstandingAPI = {
  list: async (params: { classId?: number; studentId?: number } = {}): Promise<OutstandingFees> => {
    log('GET /finance/outstanding-fees', params);
    const res = await apiClient.get('/finance/outstanding-fees', { params });
    return unwrap<OutstandingFees>(res);
  },
};

// ============================================
// BULK COLLECTION
// ============================================
export const financeBulkAPI = {
  getClasses: async () => {
    log('GET /finance/classes-list');
    const res = await apiClient.get('/finance/classes-list');
    return unwrap<{
      id: number;
      name: string;
      section: string;
      studentCount: number;
    }[]>(res);
  },

  getStudents: async (classId: number): Promise<{
    data: BulkCollectionStudent[];
    summary?: { totalStudents: number; totalPending: number };
  }> => {
    log('GET /finance/bulk-collection-students', { classId });
    const res = await apiClient.get('/finance/bulk-collection-students', {
      params: { classId },
    });
    const body = res.data as {
      data?: BulkCollectionStudent[];
      summary?: { totalStudents: number; totalPending: number };
    };
    return {
      data: body?.data || [],
      summary: body?.summary,
    };
  },

  submit: async (data: {
    payments: {
      studentId: number;
      amount: number;
      paymentMethod: PaymentMethod;
      feeAssignmentId?: number;
    }[];
  }) => {
    log('POST /finance/bulk-payments', data);
    const res = await apiClient.post('/finance/bulk-payments', data);
    return unwrap<{
      totalAmount: number;
      successCount: number;
      errorCount: number;
      total: number;
    }>(res);
  },
};

// ============================================
// EXPENSES
// ============================================
export const financeExpensesAPI = {
  list: async (params: { startDate?: string; endDate?: string } = {}) => {
    log('GET /finance/expenses', params);
    const res = await apiClient.get('/finance/expenses', { params });
    return unwrap<Expense[]>(res);
  },

  create: async (data: {
    categoryId: number;
    amount: number;
    description?: string;
    date?: string;
  }) => {
    log('POST /finance/expenses', data);
    const res = await apiClient.post('/finance/expenses', data);
    return unwrap<Expense>(res);
  },

  getCategories: async (): Promise<ExpenseCategory[]> => {
    log('GET /finance/expense-categories');
    const res = await apiClient.get('/finance/expense-categories');
    return unwrap<ExpenseCategory[]>(res);
  },

  createCategory: async (data: { name: string; description?: string }) => {
    log('POST /finance/expense-categories', data);
    const res = await apiClient.post('/finance/expense-categories', data);
    return unwrap<ExpenseCategory>(res);
  },

  updateCategory: async (id: number, data: { name?: string; description?: string }) => {
    log(`PUT /finance/expense-categories/${id}`, data);
    const res = await apiClient.put(`/finance/expense-categories/${id}`, data);
    return unwrap<ExpenseCategory>(res);
  },

  deleteCategory: async (id: number) => {
    log(`DELETE /finance/expense-categories/${id}`);
    const res = await apiClient.delete(`/finance/expense-categories/${id}`);
    return unwrap<unknown>(res);
  },

  getStatistics: async () => {
    log('GET /finance/expense-statistics');
    const res = await apiClient.get('/finance/expense-statistics');
    return unwrap<{
      totalThisMonth: number;
      totalThisYear: number;
      averageDaily: number;
    }>(res);
  },
};

// ============================================
// SALARIES
// ============================================
export const financeSalariesAPI = {
  list: async (params: { month?: number; year?: number; status?: string } = {}) => {
    log('GET /finance/salaries', params);
    const res = await apiClient.get('/finance/salaries', { params });
    return unwrap<Salary[]>(res);
  },

  create: async (data: {
    teacherId: number;
    amount: number;
    baseSalary: number;
    finalAmount: number;
    month: number;
    year: number;
    bonusAmount?: number;
    deductionAmount?: number;
    overtimeAmount?: number;
    overtimeHours?: number;
    notes?: string;
  }) => {
    log('POST /finance/salaries', data);
    const res = await apiClient.post('/finance/salaries', data);
    return unwrap<Salary>(res);
  },

  generate: async (data: { month: number; year: number }) => {
    log('POST /finance/salaries/generate', data);
    const res = await apiClient.post('/finance/salaries/generate', data);
    return unwrap<{ generated: number }>(res);
  },

  recordPayment: async (data: {
    salaryId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    log('POST /finance/salaries/payment', data);
    const res = await apiClient.post('/finance/salaries/payment', data);
    return unwrap<unknown>(res);
  },
};

// ============================================
// REPORTS
// ============================================
export const financeReportsAPI = {
  getDailyCollection: async (date?: string): Promise<DailyCollection> => {
    log('GET /finance/reports/daily-collection', { date });
    const res = await apiClient.get('/finance/reports/daily-collection', {
      params: date ? { date } : {},
    });
    return unwrap<DailyCollection>(res);
  },

  getMonthlyCollection: async (year?: number) => {
    log('GET /finance/reports/monthly-collection', { year });
    const res = await apiClient.get('/finance/reports/monthly-collection', {
      params: year ? { year } : {},
    });
    return unwrap<{ monthly: MonthlyCollectionRow[] }>(res);
  },

  getCashFlow: async (params: { startDate?: string; endDate?: string } = {}) => {
    log('GET /finance/reports/cash-flow', params);
    const res = await apiClient.get('/finance/reports/cash-flow', { params });
    return unwrap<{
      summary: { totalIncome: number; totalExpense: number; balance: number };
    }>(res);
  },

  getIncomeStatement: async (params: { startDate?: string; endDate?: string } = {}): Promise<IncomeStatement> => {
    log('GET /finance/reports/income-statement', params);
    const res = await apiClient.get('/finance/reports/income-statement', { params });
    return unwrap<IncomeStatement>(res);
  },

  getCollectionsByClass: async () => {
    log('GET /finance/reports/collections-by-class');
    const res = await apiClient.get('/finance/reports/collections-by-class');
    return unwrap<unknown[]>(res);
  },

  getOutstandingAging: async () => {
    log('GET /finance/reports/outstanding-aging');
    const res = await apiClient.get('/finance/reports/outstanding-aging');
    return unwrap<unknown>(res);
  },

  export: async (params: { type: string; startDate?: string; endDate?: string }) => {
    log('GET /finance/reports/export', params);
    const res = await apiClient.get('/finance/reports/export', { params });
    return unwrap<unknown>(res);
  },
};

// ============================================
// MISC
// ============================================
export const financeMiscAPI = {
  getAfghanMonths: async (): Promise<AfghanMonthOption[]> => {
    log('GET /finance/afghan-months');
    const res = await apiClient.get('/finance/afghan-months');
    return unwrap<AfghanMonthOption[]>(res);
  },

  getClassTimeOptions: async () => {
    log('GET /finance/class-time-options');
    const res = await apiClient.get('/finance/class-time-options');
    return unwrap<{ value: number; label: string }[]>(res);
  },

  getSchoolFeeSettings: async () => {
    log('GET /finance/school-fee-settings');
    const res = await apiClient.get('/finance/school-fee-settings');
    return unwrap<{
      feesType: number;
      eduType: number;
      discountAllowness: number;
      feesPayment: number;
    }>(res);
  },
};

// ============================================
// DEFAULT EXPORT
// ============================================
const financeAPI = {
  profile: financeProfileAPI,
  dashboard: financeDashboardAPI,
  academicYears: financeAcademicYearsAPI,
  templates: financeTemplatesAPI,
  categories: financeCategoriesAPI,
  assignments: financeAssignmentsAPI,
  students: financeStudentsAPI,
  payments: financePaymentsAPI,
  discounts: financeDiscountsAPI,
  outstanding: financeOutstandingAPI,
  bulk: financeBulkAPI,
  expenses: financeExpensesAPI,
  salaries: financeSalariesAPI,
  reports: financeReportsAPI,
  misc: financeMiscAPI,
};

export default financeAPI;