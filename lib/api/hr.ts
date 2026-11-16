// lib/api/hr.ts
// ============================================
// HR API — baseURL already ends with /api
// All paths here start with /hr
// ============================================

import apiClient from './client';
import type {
  HRProfile,
  HRDashboard,
  HRDashboardDetails,
  StaffMember,
  StaffDetail,
  CreateStaffInput,
  AttendanceResponse,
  AttendanceReport,
  MonthlyAttendance,
  LeaveRequest,
  LeaveBalance,
  Salary,
  SalaryStats,
  Evaluation,
  HRDocument,
  IdCard,
  Warning,
  HRNotification,
  LeaveType,
  WarningType,
} from '@/types/hr';

// Debug
const log = (msg: string, data?: unknown) =>
  console.log(`🔵 [hrAPI] ${msg}`, data ?? '');

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
export const hrProfileAPI = {
  getProfile: async (): Promise<HRProfile> => {
    log('GET /hr/profile');
    const res = await apiClient.get('/hr/profile');
    return unwrap<HRProfile>(res);
  },

  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    position?: string;
    department?: string;
    salary?: number;
    profileImage?: string;
  }) => {
    log('PUT /hr/profile', data);
    const res = await apiClient.put('/hr/profile', data);
    return unwrap<unknown>(res);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    log('PUT /hr/change-password');
    const res = await apiClient.put('/hr/change-password', {
      currentPassword,
      newPassword,
    });
    return unwrap<unknown>(res);
  },
};

export const hrDashboardAPI = {
  getDashboard: async (): Promise<HRDashboard> => {
    log('GET /hr/dashboard');
    const res = await apiClient.get('/hr/dashboard');
    return unwrap<HRDashboard>(res);
  },

  getDetails: async (): Promise<HRDashboardDetails> => {
    log('GET /hr/dashboard/details');
    const res = await apiClient.get('/hr/dashboard/details');
    return unwrap<HRDashboardDetails>(res);
  },
};

// ============================================
// STAFF
// ============================================
export const hrStaffAPI = {
  list: async (params: {
    search?: string;
    role?: string;
    staffType?: string;
    status?: 'active' | 'inactive';
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /hr/staff', params);
    const res = await apiClient.get('/hr/staff', { params });
    return unwrap<{
      staff: StaffMember[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>(res);
  },

  getById: async (id: number): Promise<StaffDetail> => {
    log(`GET /hr/staff/${id}`);
    const res = await apiClient.get(`/hr/staff/${id}`);
    return unwrap<StaffDetail>(res);
  },

  create: async (data: CreateStaffInput) => {
    log('POST /hr/staff', data);
    const res = await apiClient.post('/hr/staff', data);
    return unwrap<StaffMember>(res);
  },

  update: async (id: number, data: Partial<CreateStaffInput>) => {
    log(`PUT /hr/staff/${id}`, data);
    const res = await apiClient.put(`/hr/staff/${id}`, data);
    return unwrap<StaffDetail>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /hr/staff/${id}`);
    const res = await apiClient.delete(`/hr/staff/${id}`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// ATTENDANCE
// ============================================
export const hrAttendanceAPI = {
  getToday: async (): Promise<AttendanceResponse> => {
    log('GET /hr/attendance/today');
    const res = await apiClient.get('/hr/attendance/today');
    return unwrap<AttendanceResponse>(res);
  },

  getByDate: async (date: string): Promise<AttendanceResponse> => {
    log('GET /hr/attendance/by-date', { date });
    const res = await apiClient.get('/hr/attendance/by-date', {
      params: { date },
    });
    return unwrap<AttendanceResponse>(res);
  },

  record: async (data: {
    staffId: number;
    punch: number;
    deviceName?: string;
  }) => {
    log('POST /hr/attendance', data);
    const res = await apiClient.post('/hr/attendance', data);
    return unwrap<unknown>(res);
  },

  getReport: async (params: {
    startDate?: string;
    endDate?: string;
    staffId?: number;
    staffType?: string;
    department?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<AttendanceReport> => {
    log('GET /hr/attendance/report', params);
    const res = await apiClient.get('/hr/attendance/report', { params });
    return unwrap<AttendanceReport>(res);
  },

  getMonthly: async (
    staffId: number,
    params: { year?: number; month?: number } = {}
  ): Promise<MonthlyAttendance> => {
    log(`GET /hr/attendance/staff/${staffId}/monthly`, params);
    const res = await apiClient.get(
      `/hr/attendance/staff/${staffId}/monthly`,
      { params }
    );
    return unwrap<MonthlyAttendance>(res);
  },

  exportReport: async (params: {
    startDate?: string;
    endDate?: string;
    staffType?: string;
  } = {}) => {
    log('GET /hr/attendance/export', params);
    const res = await apiClient.get('/hr/attendance/export', { params });
    return unwrap<{
      exportedAt: string;
      count: number;
      data: Record<string, unknown>[];
    }>(res);
  },

  getSummary: async (params: { month?: number; year?: number } = {}) => {
    log('GET /hr/attendance/summary', params);
    const res = await apiClient.get('/hr/attendance/summary', { params });
    return unwrap<{
      shamsiMonth: number;
      shamsiYear: number;
      shamsiMonthName: string;
      summary: {
        totalStaff: number;
        totalPresent: number;
        totalLate: number;
        averageAttendance: number;
        totalPunches: number;
      };
      staff: {
        staffId: number;
        name: string;
        role: string;
        daysPresent: number;
        lateDays: number;
        totalDays: number;
        attendanceRate: number;
        totalPunches: number;
        punchCounts: Record<string, number>;
      }[];
    }>(res);
  },
};

// ============================================
// SALARIES
// ============================================
export const hrSalariesAPI = {
  list: async (params: {
    month?: number;
    year?: number;
    status?: string;
    staffId?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /hr/salaries', params);
    const res = await apiClient.get('/hr/salaries', { params });
    return unwrap<{
      salaries: Salary[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
      summary: {
        pendingTotal: number;
        paidTotal: number;
        totalSalaries: number;
        pendingCount: number;
        paidCount: number;
      };
    }>(res);
  },

  generate: async (data: { month: number; year: number }) => {
    log('POST /hr/salaries/generate', data);
    const res = await apiClient.post('/hr/salaries/generate', data);
    return unwrap<{
      created: number;
      skipped: number;
      totalTeachers: number;
    }>(res);
  },

  pay: async (data: {
    salaryId: number;
    amount: number;
    paymentMethod?: string;
    referenceNo?: string;
    notes?: string;
  }) => {
    log('POST /hr/salaries/pay', data);
    const res = await apiClient.post('/hr/salaries/pay', data);
    return unwrap<unknown>(res);
  },

  getStats: async (params: { month?: number; year?: number } = {}): Promise<SalaryStats> => {
    log('GET /hr/salaries/stats', params);
    const res = await apiClient.get('/hr/salaries/stats', { params });
    return unwrap<SalaryStats>(res);
  },
};

// ============================================
// LEAVES
// ============================================
export const hrLeavesAPI = {
  list: async (params: {
    status?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /hr/leaves', params);
    const res = await apiClient.get('/hr/leaves', { params });
    return unwrap<{
      leaves: LeaveRequest[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);
  },

  create: async (data: {
    userId: number;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason?: string;
  }) => {
    log('POST /hr/leaves', data);
    const res = await apiClient.post('/hr/leaves', data);
    return unwrap<LeaveRequest>(res);
  },

  approve: async (id: number) => {
    log(`PUT /hr/leaves/${id}/approve`);
    const res = await apiClient.put(`/hr/leaves/${id}/approve`);
    return unwrap<LeaveRequest>(res);
  },

  reject: async (id: number, rejectionReason: string) => {
    log(`PUT /hr/leaves/${id}/reject`);
    const res = await apiClient.put(`/hr/leaves/${id}/reject`, {
      rejectionReason,
    });
    return unwrap<LeaveRequest>(res);
  },

  getBalance: async (userId: number, year?: number): Promise<LeaveBalance> => {
    log(`GET /hr/leaves/balance/${userId}`, { year });
    const res = await apiClient.get(`/hr/leaves/balance/${userId}`, {
      params: year ? { year } : {},
    });
    return unwrap<LeaveBalance>(res);
  },
};

// ============================================
// EVALUATIONS
// ============================================
export const hrEvaluationsAPI = {
  list: async (params: {
    userId?: number;
    period?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /hr/evaluations', params);
    const res = await apiClient.get('/hr/evaluations', { params });
    return unwrap<{
      evaluations: Evaluation[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);
  },

  create: async (data: {
    userId: number;
    period: string;
    teachingQuality?: number;
    attendanceScore?: number;
    studentFeedback?: number;
    teamworkScore?: number;
    punctualityScore?: number;
    strengths?: string;
    weaknesses?: string;
    goals?: string;
    recommendations?: string;
  }) => {
    log('POST /hr/evaluations', data);
    const res = await apiClient.post('/hr/evaluations', data);
    return unwrap<Evaluation>(res);
  },
};

// ============================================
// DOCUMENTS
// ============================================
export const hrDocumentsAPI = {
  list: async (params: {
    userId?: number;
    type?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /hr/documents', params);
    const res = await apiClient.get('/hr/documents', { params });
    return unwrap<{
      documents: HRDocument[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);
  },

  upload: async (data: {
    userId?: number;
    title: string;
    description?: string;
    type: string;
    fileUrl: string;
    isConfidential?: boolean;
    expiresAt?: string;
  }) => {
    log('POST /hr/documents', data);
    const res = await apiClient.post('/hr/documents', data);
    return unwrap<HRDocument>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /hr/documents/${id}`);
    const res = await apiClient.delete(`/hr/documents/${id}`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// ID CARDS
// ============================================
export const hrIdCardsAPI = {
  list: async (params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /hr/id-cards', params);
    const res = await apiClient.get('/hr/id-cards', { params });
    return unwrap<{
      cards: IdCard[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);
  },

  create: async (data: { userId: number; expiryDate?: string }) => {
    log('POST /hr/id-cards', data);
    const res = await apiClient.post('/hr/id-cards', data);
    return unwrap<IdCard>(res);
  },

  print: async (id: number) => {
    log(`PUT /hr/id-cards/${id}/print`);
    const res = await apiClient.put(`/hr/id-cards/${id}/print`);
    return unwrap<IdCard>(res);
  },
};

// ============================================
// WARNINGS
// ============================================
export const hrWarningsAPI = {
  list: async (params: {
    userId?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /hr/warnings', params);
    const res = await apiClient.get('/hr/warnings', { params });
    return unwrap<{
      warnings: Warning[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);
  },

  create: async (data: {
    userId: number;
    type: WarningType;
    title: string;
    description: string;
    documents?: unknown;
  }) => {
    log('POST /hr/warnings', data);
    const res = await apiClient.post('/hr/warnings', data);
    return unwrap<Warning>(res);
  },

  resolve: async (id: number, resolution: string) => {
    log(`PUT /hr/warnings/${id}/resolve`);
    const res = await apiClient.put(`/hr/warnings/${id}/resolve`, {
      resolution,
    });
    return unwrap<Warning>(res);
  },
};

// ============================================
// NOTIFICATIONS
// ============================================
export const hrNotificationsAPI = {
  list: async (params: {
    isRead?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /hr/notifications', params);
    const res = await apiClient.get('/hr/notifications', { params });
    return unwrap<{
      notifications: HRNotification[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);
  },
};

// ============================================
// DEFAULT EXPORT
// ============================================
const hrAPI = {
  profile: hrProfileAPI,
  dashboard: hrDashboardAPI,
  staff: hrStaffAPI,
  attendance: hrAttendanceAPI,
  salaries: hrSalariesAPI,
  leaves: hrLeavesAPI,
  evaluations: hrEvaluationsAPI,
  documents: hrDocumentsAPI,
  idCards: hrIdCardsAPI,
  warnings: hrWarningsAPI,
  notifications: hrNotificationsAPI,
};

export default hrAPI;