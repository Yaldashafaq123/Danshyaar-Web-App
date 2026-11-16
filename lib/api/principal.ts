// lib/api/principal.ts
// ============================================
// PRINCIPAL / ACADEMIC API
// baseURL already ends with /api
// ============================================

import apiClient from './client';
import type {
  PrincipalProfile,
  DashboardSummary,
  Student,
  StudentDetail,
  Teacher,
  TeacherDetail,
  Class,
  Subject,
  Exam,
  EvaluationTemplate,
  Evaluation,
  AcademicYear,
  PromotionOptions,
  PerformanceReport,
  ClassReport,
  AttendanceReport,
  SuccessResponse,
  TimetableResponse,
} from '@/types/principal';

// ---------- Debug helper ----------
const log = (msg: string, data?: unknown) => {
  console.log(`🔵 [principalAPI] ${msg}`, data ?? '');
};

// Unwrap standard backend response { success, data, message? }
const unwrap = <T,>(res: { data?: SuccessResponse<T> | T }): T => {
  const body = res?.data as SuccessResponse<T> | T | undefined;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return (body as SuccessResponse<T>).data;
  }
  return body as T;
};

// ============================================
// PROFILE
// ============================================
export const principalProfileAPI = {
  getProfile: async (): Promise<PrincipalProfile> => {
    log('GET /principal/profile');
    const res = await apiClient.get('/principal/profile');
    return unwrap<PrincipalProfile>(res);
  },

  updateProfile: async (data: Partial<{
    fullName: string;
    phone: string;
    position: string;
    experience: string;
    qualification: string;
    profileImage: string;
  }>) => {
    log('PUT /principal/profile', data);
    const res = await apiClient.put('/principal/profile', data);
    return unwrap<unknown>(res);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    log('PUT /principal/change-password');
    const res = await apiClient.put('/principal/change-password', {
      currentPassword,
      newPassword,
    });
    return unwrap<unknown>(res);
  },
};

// ============================================
// DASHBOARD
// ============================================
export const principalDashboardAPI = {
  getDashboard: async (): Promise<DashboardSummary> => {
    log('GET /principal/dashboard');
    const res = await apiClient.get('/principal/dashboard');
    return unwrap<DashboardSummary>(res);
  },
};

// ============================================
// STUDENTS
// ============================================
export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: number | 'all';
  status?: string | 'all';
}

export const principalStudentsAPI = {
  list: async (params: StudentListParams = {}) => {
    log('GET /principal/students', params);
    const res = await apiClient.get('/principal/students', { params });
    return unwrap<{
      students: Student[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>(res);
  },

  getById: async (id: number): Promise<StudentDetail> => {
    log(`GET /principal/students/${id}`);
    const res = await apiClient.get(`/principal/students/${id}`);
    return unwrap<StudentDetail>(res);
  },

  update: async (id: number, data: Partial<StudentDetail>) => {
    log(`PUT /principal/students/${id}`, data);
    const res = await apiClient.put(`/principal/students/${id}`, data);
    return unwrap<unknown>(res);
  },

  promote: async (
    id: number,
    data: { toClassId: number; academicYearId: number; notes?: string }
  ) => {
    log(`POST /principal/students/${id}/promote`, data);
    const res = await apiClient.post(`/principal/students/${id}/promote`, data);
    return unwrap<unknown>(res);
  },
};

// ============================================
// PROMOTIONS
// ============================================
export const principalPromotionsAPI = {
  list: async (params: {
    status?: string;
    studentId?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /principal/promotions', params);
    const res = await apiClient.get('/principal/promotions', { params });
    return unwrap<unknown>(res);
  },

  update: async (
    id: number,
    data: { status: 'APPROVED' | 'REJECTED'; notes?: string }
  ) => {
    log(`PUT /principal/promotions/${id}`, data);
    const res = await apiClient.put(`/principal/promotions/${id}`, data);
    return unwrap<unknown>(res);
  },

  getPromotionOptions: async (academicYearId?: number): Promise<PromotionOptions> => {
    log('GET /principal/classes/promotion-options');
    const res = await apiClient.get('/principal/classes/promotion-options', {
      params: academicYearId ? { academicYearId } : {},
    });
    return unwrap<PromotionOptions>(res);
  },

  promoteClass: async (data: {
    fromClassId: number;
    toClassId?: number;
    createNewClass?: boolean;
    newClassName?: string;
    newGrade?: string;
    newSection?: string;
    academicYearId?: number;
    notes?: string;
  }) => {
    log('POST /principal/classes/promote', data);
    const res = await apiClient.post('/principal/classes/promote', data);
    return unwrap<unknown>(res);
  },

  history: async (classId: number) => {
    log(`GET /principal/classes/${classId}/promotion-history`);
    const res = await apiClient.get(`/principal/classes/${classId}/promotion-history`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// TEACHERS
// ============================================
export interface TeacherListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
}

export const principalTeachersAPI = {
  list: async (params: TeacherListParams = {}) => {
    log('GET /principal/teachers', params);
    const res = await apiClient.get('/principal/teachers', { params });
    return unwrap<{
      teachers: Teacher[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>(res);
  },

  getById: async (id: number): Promise<TeacherDetail> => {
    log(`GET /principal/teachers/${id}`);
    const res = await apiClient.get(`/principal/teachers/${id}`);
    return unwrap<TeacherDetail>(res);
  },

  update: async (
    id: number,
    data: Partial<Teacher> & {
      availability?: boolean;
      certification?: string;
      experience?: string;
      baseSalary?: number;
    }
  ) => {
    log(`PUT /principal/teachers/${id}`, data);
    const res = await apiClient.put(`/principal/teachers/${id}`, data);
    return unwrap<unknown>(res);
  },
};

// ============================================
// CLASSES
// ============================================
export const principalClassesAPI = {
  list: async (): Promise<Class[]> => {
    log('GET /principal/classes');
    const res = await apiClient.get('/principal/classes');
    return unwrap<Class[]>(res);
  },

  create: async (data: {
    name: string;
    section?: string;
    academicYearId: number;
    teacherId?: number;
    description?: string;
  }) => {
    log('POST /principal/classes', data);
    const res = await apiClient.post('/principal/classes', data);
    return unwrap<unknown>(res);
  },

  update: async (
    id: number,
    data: Partial<Class> & { academicYearId?: number; is_active?: boolean }
  ) => {
    log(`PUT /principal/classes/${id}`, data);
    const res = await apiClient.put(`/principal/classes/${id}`, data);
    return unwrap<unknown>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /principal/classes/${id}`);
    const res = await apiClient.delete(`/principal/classes/${id}`);
    return unwrap<unknown>(res);
  },

  grades: async (): Promise<string[]> => {
    log('GET /principal/grades');
    const res = await apiClient.get('/principal/grades');
    return unwrap<string[]>(res);
  },
};

// ============================================
// ACADEMIC YEARS
// ============================================
export const principalAcademicYearsAPI = {
  list: async (): Promise<AcademicYear[]> => {
    log('GET /principal/academic/years');
    const res = await apiClient.get('/principal/academic/years');
    return unwrap<AcademicYear[]>(res);
  },

  create: async (data: {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }) => {
    log('POST /principal/academic/years', data);
    const res = await apiClient.post('/principal/academic/years', data);
    return unwrap<unknown>(res);
  },

  update: async (id: number, data: Partial<AcademicYear>) => {
    log(`PUT /principal/academic/years/${id}`, data);
    const res = await apiClient.put(`/principal/academic/years/${id}`, data);
    return unwrap<unknown>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /principal/academic/years/${id}`);
    const res = await apiClient.delete(`/principal/academic/years/${id}`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// SUBJECTS
// ============================================
export const principalSubjectsAPI = {
  list: async (params: { search?: string; page?: number; limit?: number } = {}) => {
    log('GET /principal/academic/subjects', params);
    const res = await apiClient.get('/principal/academic/subjects', { params });
    return unwrap<{
      subjects: Subject[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);
  },

  create: async (data: { name: string; description?: string; teacherId?: number }) => {
    log('POST /principal/academic/subjects', data);
    const res = await apiClient.post('/principal/academic/subjects', data);
    return unwrap<unknown>(res);
  },

  update: async (
    id: number,
    data: { name?: string; description?: string; teacherId?: number }
  ) => {
    log(`PUT /principal/academic/subjects/${id}`, data);
    const res = await apiClient.put(`/principal/academic/subjects/${id}`, data);
    return unwrap<unknown>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /principal/academic/subjects/${id}`);
    const res = await apiClient.delete(`/principal/academic/subjects/${id}`);
    return unwrap<unknown>(res);
  },

  assignToClass: async (data: {
    subjectId: number;
    classId: number;
    teacherId?: number;
  }) => {
    log('POST /principal/academic/subjects/assign', data);
    const res = await apiClient.post('/principal/academic/subjects/assign', data);
    return unwrap<unknown>(res);
  },

  removeFromClass: async (subjectId: number, classId: number) => {
    log(`DELETE /principal/academic/subjects/${subjectId}/class/${classId}`);
    const res = await apiClient.delete(
      `/principal/academic/subjects/${subjectId}/class/${classId}`
    );
    return unwrap<unknown>(res);
  },

  byClass: async (classId: number) => {
    log(`GET /principal/academic/classes/${classId}/subjects`);
    const res = await apiClient.get(`/principal/academic/classes/${classId}/subjects`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// TIMETABLE
// ============================================
export const principalTimetableAPI = {
  get: async (classId: number, day: number): Promise<TimetableResponse> => {
    log(`GET /principal/academic/timetable/${classId}/${day}`);
    const res = await apiClient.get(`/principal/academic/timetable/${classId}/${day}`);
    return unwrap<TimetableResponse>(res);
  },

  save: async (data: {
    classId: number;
    day: number;
    period: number;
    subjectId: number;
    teacherId?: number;
    room?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    log('POST /principal/academic/timetable', data);
    const res = await apiClient.post('/principal/academic/timetable', data);
    return unwrap<unknown>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /principal/academic/timetable/${id}`);
    const res = await apiClient.delete(`/principal/academic/timetable/${id}`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// EXAMS
// ============================================
export const principalExamsAPI = {
  list: async (params: {
    status?: string;
    published?: boolean;
    search?: string;
    classId?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    log('GET /principal/academic/exams', params);
    const res = await apiClient.get('/principal/academic/exams', { params });
    return unwrap<{
      exams: Exam[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>(res);
  },

  create: async (data: {
    name: string;
    subject?: string;
    classId: number;
    date: string;
    startTime?: string;
    totalMarks?: number;
    passingMarks?: number;
    isPublished?: boolean;
    type?: string;
    month?: number;
    year?: number;
    description?: string;
    academicYearId?: number;
  }) => {
    log('POST /principal/academic/exams', data);
    const res = await apiClient.post('/principal/academic/exams', data);
    return unwrap<unknown>(res);
  },

  update: async (id: number, data: Partial<Exam>) => {
    log(`PUT /principal/academic/exams/${id}`, data);
    const res = await apiClient.put(`/principal/academic/exams/${id}`, data);
    return unwrap<unknown>(res);
  },

  delete: async (id: number) => {
    log(`DELETE /principal/academic/exams/${id}`);
    const res = await apiClient.delete(`/principal/academic/exams/${id}`);
    return unwrap<unknown>(res);
  },

  togglePublish: async (id: number) => {
    log(`PUT /principal/academic/exams/${id}/toggle-publish`);
    const res = await apiClient.put(`/principal/academic/exams/${id}/toggle-publish`);
    return unwrap<unknown>(res);
  },
};

// ============================================
// REPORTS
// ============================================
export const principalReportsAPI = {
  performance: async (academicYearId?: number): Promise<PerformanceReport> => {
    log('GET /principal/reports/performance');
    const res = await apiClient.get('/principal/reports/performance', {
      params: academicYearId ? { academicYearId } : {},
    });
    return unwrap<PerformanceReport>(res);
  },

  classes: async (academicYearId?: number): Promise<ClassReport> => {
    log('GET /principal/reports/classes');
    const res = await apiClient.get('/principal/reports/classes', {
      params: academicYearId ? { academicYearId } : {},
    });
    return unwrap<ClassReport>(res);
  },

  financial: async (params: { startDate?: string; endDate?: string } = {}) => {
    log('GET /principal/reports/financial', params);
    const res = await apiClient.get('/principal/reports/financial', { params });
    return unwrap<unknown>(res);
  },

  attendance: async (params: { month?: number; year?: number } = {}): Promise<AttendanceReport> => {
    log('GET /principal/reports/attendance', params);
    const res = await apiClient.get('/principal/reports/attendance', { params });
    return unwrap<AttendanceReport>(res);
  },
};

// ============================================
// TEACHER EVALUATIONS
// ============================================
export const principalEvaluationsAPI = {
  // Templates
  listTemplates: async (includeInactive = false): Promise<EvaluationTemplate[]> => {
    log('GET /principal/teacher-evaluations/templates');
    const res = await apiClient.get('/principal/teacher-evaluations/templates', {
      params: includeInactive ? { includeInactive: 'true' } : {},
    });
    return unwrap<EvaluationTemplate[]>(res);
  },

  getTemplate: async (id: number) => {
    log(`GET /principal/teacher-evaluations/templates/${id}`);
    const res = await apiClient.get(`/principal/teacher-evaluations/templates/${id}`);
    return unwrap<unknown>(res);
  },

  createTemplate: async (data: {
    name: string;
    description?: string;
    period?: string;
    academicYearId?: number;
    isDefault?: boolean;
    criteria?: unknown[];
  }) => {
    log('POST /principal/teacher-evaluations/templates', data);
    const res = await apiClient.post('/principal/teacher-evaluations/templates', data);
    return unwrap<unknown>(res);
  },

  createDefaultTemplate: async () => {
    log('POST /principal/teacher-evaluations/templates/default');
    const res = await apiClient.post('/principal/teacher-evaluations/templates/default');
    return unwrap<unknown>(res);
  },

  // Teachers
  listTeachers: async (params: {
    search?: string;
    classId?: number;
    subjectId?: number;
  } = {}) => {
    log('GET /principal/teacher-evaluations/teachers');
    const res = await apiClient.get('/principal/teacher-evaluations/teachers', { params });
    return unwrap<unknown>(res);
  },

  getTeacherEvaluations: async (
    teacherId: number,
    params: { period?: string; academicYearId?: number; status?: string } = {}
  ) => {
    log(`GET /principal/teacher-evaluations/teacher/${teacherId}`);
    const res = await apiClient.get(
      `/principal/teacher-evaluations/teacher/${teacherId}`,
      { params }
    );
    return unwrap<unknown>(res);
  },

  getTeacherPerformanceSummary: async (teacherId: number) => {
    log(`GET /principal/teacher-evaluations/teacher/${teacherId}/performance-summary`);
    const res = await apiClient.get(
      `/principal/teacher-evaluations/teacher/${teacherId}/performance-summary`
    );
    return unwrap<unknown>(res);
  },

  // Evaluations
  list: async (params: {
    status?: string;
    period?: string;
    teacherId?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    evaluations: Evaluation[];
    stats: {
      total: number;
      draft: number;
      pendingReview: number;
      submitted: number;
      acknowledged: number;
    };
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> => {
    log('GET /principal/teacher-evaluations', params);
    const res = await apiClient.get('/principal/teacher-evaluations', { params });
    return unwrap(res);
  },

  create: async (data: {
    teacherId: number;
    templateId: number;
    period?: string;
    term?: string;
    academicYearId?: number;
  }) => {
    log('POST /principal/teacher-evaluations', data);
    const res = await apiClient.post('/principal/teacher-evaluations', data);
    return unwrap<unknown>(res);
  },

  getById: async (id: number) => {
    log(`GET /principal/teacher-evaluations/${id}`);
    const res = await apiClient.get(`/principal/teacher-evaluations/${id}`);
    return unwrap<unknown>(res);
  },

  submitScores: async (
    id: number,
    data: {
      scores: { criteriaId: number; score: number; comment?: string }[];
      strengths?: string;
      weaknesses?: string;
      goals?: string;
      recommendations?: string;
      principalNotes?: string;
    }
  ) => {
    log(`POST /principal/teacher-evaluations/${id}/scores`);
    const res = await apiClient.post(`/principal/teacher-evaluations/${id}/scores`, data);
    return unwrap<unknown>(res);
  },

  submit: async (id: number) => {
    log(`POST /principal/teacher-evaluations/${id}/submit`);
    const res = await apiClient.post(`/principal/teacher-evaluations/${id}/submit`);
    return unwrap<unknown>(res);
  },

  getReportCard: async (id: number) => {
    log(`GET /principal/teacher-evaluations/report/${id}`);
    const res = await apiClient.get(`/principal/teacher-evaluations/report/${id}`);
    return unwrap<unknown>(res);
  },

  createActionPlan: async (
    id: number,
    data: {
      title: string;
      description?: string;
      category?: string;
      targetDate?: string;
    }
  ) => {
    log(`POST /principal/teacher-evaluations/${id}/action-plans`);
    const res = await apiClient.post(
      `/principal/teacher-evaluations/${id}/action-plans`,
      data
    );
    return unwrap<unknown>(res);
  },

  updateActionPlan: async (
    planId: number,
    data: { status?: string; progress?: number; outcome?: string }
  ) => {
    log(`PATCH /principal/teacher-evaluations/action-plans/${planId}`);
    const res = await apiClient.patch(
      `/principal/teacher-evaluations/action-plans/${planId}`,
      data
    );
    return unwrap<unknown>(res);
  },
    // In principalStudentsAPI, add:
  getAtRisk: async (threshold = 70) => {
    log('GET /principal/students/at-risk');
    const res = await apiClient.get('/principal/students/at-risk', {
      params: { threshold },
    });
    return unwrap<{
      students: (Student & {
        attendanceRate: number;
        gradeAverage: number;
        reasons: string[];
        riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
      })[];
      summary: {
        total: number;
        high: number;
        medium: number;
        low: number;
        analyzed: number;
      };
    }>(res);
  },

  getTopPerformers: async (limit = 20) => {
    log('GET /principal/students/top-performers');
    const res = await apiClient.get('/principal/students/top-performers', {
      params: { limit },
    });
    return unwrap<{
      students: (Student & {
        gradeAverage: number;
        attendanceRate: number;
        gradeCount: number;
        score: number;
        rank: number;
      })[];
      summary: {
        totalRanked: number;
        topScore: number;
        returned: number;
      };
    }>(res);
  },
  analytics: async (academicYearId?: number) => {
    log('GET /principal/teacher-evaluations/analytics');
    const res = await apiClient.get('/principal/teacher-evaluations/analytics', {
      params: academicYearId ? { academicYearId } : {},
    });
    return unwrap<unknown>(res);
  },
};

// ============================================
// NAMED DEFAULT EXPORT (fixes ESLint warning)
// ============================================
const principalAPI = {
  profile: principalProfileAPI,
  dashboard: principalDashboardAPI,
  students: principalStudentsAPI,
  promotions: principalPromotionsAPI,
  teachers: principalTeachersAPI,
  classes: principalClassesAPI,
  academicYears: principalAcademicYearsAPI,
  subjects: principalSubjectsAPI,
  timetable: principalTimetableAPI,
  exams: principalExamsAPI,
  reports: principalReportsAPI,
  evaluations: principalEvaluationsAPI,
};

export default principalAPI;