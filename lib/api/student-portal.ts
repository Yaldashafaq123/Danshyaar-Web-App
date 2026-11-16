// lib/api/student-portal.ts
// ============================================
// STUDENT PORTAL API — baseURL already ends with /api
// All paths here start with /student
// ============================================

import apiClient from './client';
import type {
  StudentProfile,
  UpdateProfileInput,
  StudentDashboard,
  TimetableData,
  TimetableEntry,
  AttendanceOverview,
  AttendanceRecord,
  MonthlyAttendanceSummary,
  AttendanceAnalytics,
  GradesResponse,
  TermGrades,
  Term,
  LibraryData,
  Book,
  BookCategory,
  Assignment,
  AssignmentStats,
  StudentSubject,
  CourseLesson,
  LessonDetail,
  StudentCourse,
} from '@/types/student-portal';

// Debug
const log = (msg: string, data?: unknown) =>
  console.log(`🟢 [studentAPI] ${msg}`, data ?? '');

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
// DASHBOARD
// ============================================
export const studentDashboardAPI = {
  getDashboard: async (): Promise<StudentDashboard> => {
    log('GET /student/dashboard');
    const res = await apiClient.get('/student/dashboard');
    return unwrap<StudentDashboard>(res);
  },

  getStats: async () => {
    log('GET /student/stats');
    const res = await apiClient.get('/student/stats');
    return unwrap<unknown>(res);
  },

  getUpcomingExams: async () => {
    log('GET /student/exams/upcoming');
    const res = await apiClient.get('/student/exams/upcoming');
    return unwrap<unknown[]>(res);
  },

  getRecentActivities: async () => {
    log('GET /student/activities/recent');
    const res = await apiClient.get('/student/activities/recent');
    return unwrap<unknown[]>(res);
  },

  getContinueLearning: async (): Promise<StudentCourse[]> => {
    log('GET /student/courses/continue');
    const res = await apiClient.get('/student/courses/continue');
    return unwrap<StudentCourse[]>(res);
  },
};

// ============================================
// PROFILE
// ============================================
export const studentProfileAPI = {
  getProfile: async (): Promise<StudentProfile> => {
    log('GET /student/profile');
    const res = await apiClient.get('/student/profile');
    return unwrap<StudentProfile>(res);
  },

  updateProfile: async (data: UpdateProfileInput) => {
    log('PUT /student/profile', data);
    const res = await apiClient.put('/student/profile', data);
    return unwrap<unknown>(res);
  },

  uploadImage: async (file: File) => {
    log('POST /student/profile/image');
    const formData = new FormData();
    formData.append('profile_image', file);
    const res = await apiClient.post('/student/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap<{ image: string }>(res);
  },
};

// ============================================
// TIMETABLE
// ============================================
export const studentTimetableAPI = {
  getWeekly: async (): Promise<TimetableData> => {
    log('GET /student/timetable/weekly');
    const res = await apiClient.get('/student/timetable/weekly');
    return unwrap<TimetableData>(res);
  },

  getCurrentWeek: async (): Promise<TimetableData> => {
    log('GET /student/timetable/current');
    const res = await apiClient.get('/student/timetable/current');
    return unwrap<TimetableData>(res);
  },

  getDay: async (day: string): Promise<TimetableEntry[]> => {
    log(`GET /student/timetable/day/${day}`);
    const res = await apiClient.get(`/student/timetable/day/${day}`);
    return unwrap<TimetableEntry[]>(res);
  },
};

// ============================================
// ATTENDANCE
// ============================================
export const studentAttendanceAPI = {
  getOverview: async (): Promise<AttendanceOverview> => {
    log('GET /student/attendance/overview');
    const res = await apiClient.get('/student/attendance/overview');
    return unwrap<AttendanceOverview>(res);
  },

  getDaily: async (params: { month?: string; year?: number } = {}): Promise<AttendanceRecord[]> => {
    log('GET /student/attendance/daily', params);
    const res = await apiClient.get('/student/attendance/daily', { params });
    return unwrap<AttendanceRecord[]>(res);
  },

  getMonthly: async (): Promise<MonthlyAttendanceSummary[]> => {
    log('GET /student/attendance/monthly');
    const res = await apiClient.get('/student/attendance/monthly');
    return unwrap<MonthlyAttendanceSummary[]>(res);
  },

  getAnalytics: async (): Promise<AttendanceAnalytics> => {
    log('GET /student/attendance/analytics');
    const res = await apiClient.get('/student/attendance/analytics');
    return unwrap<AttendanceAnalytics>(res);
  },

  getByDate: async (date: string) => {
    log(`GET /student/attendance/date/${date}`);
    const res = await apiClient.get(`/student/attendance/date/${date}`);
    return unwrap<AttendanceRecord>(res);
  },
};

// ============================================
// GRADES
// ============================================
export const studentGradesAPI = {
  getAll: async (): Promise<GradesResponse> => {
    log('GET /student/grades');
    const res = await apiClient.get('/student/grades');
    return unwrap<GradesResponse>(res);
  },

  getTerms: async (): Promise<Term[]> => {
    log('GET /student/grades/terms');
    const res = await apiClient.get('/student/grades/terms');
    return unwrap<Term[]>(res);
  },

  getTerm: async (termId: number | string): Promise<TermGrades> => {
    log(`GET /student/grades/term/${termId}`);
    const res = await apiClient.get(`/student/grades/term/${termId}`);
    return unwrap<TermGrades>(res);
  },

  getCurrent: async (): Promise<TermGrades | null> => {
    log('GET /student/grades/current');
    const res = await apiClient.get('/student/grades/current');
    return unwrap<TermGrades | null>(res);
  },
};

// ============================================
// LIBRARY
// ============================================
export const studentLibraryAPI = {
  getLibrary: async (): Promise<LibraryData> => {
    log('GET /student/library');
    const res = await apiClient.get('/student/library');
    return unwrap<LibraryData>(res);
  },

  getByCategory: async (categoryId: number): Promise<Book[]> => {
    log(`GET /student/library/category/${categoryId}`);
    const res = await apiClient.get(`/student/library/category/${categoryId}`);
    return unwrap<Book[]>(res);
  },

  search: async (q: string): Promise<Book[]> => {
    log('GET /student/library/search', { q });
    const res = await apiClient.get('/student/library/search', {
      params: { q },
    });
    return unwrap<Book[]>(res);
  },

  getByGrade: async (grade: number): Promise<Book[]> => {
    log(`GET /student/library/grade/${grade}`);
    const res = await apiClient.get(`/student/library/grade/${grade}`);
    return unwrap<Book[]>(res);
  },

  toggleFavorite: async (bookId: number) => {
    log(`POST /student/library/favorite/${bookId}`);
    const res = await apiClient.post(`/student/library/favorite/${bookId}`);
    return unwrap<{ isFavorite: boolean }>(res);
  },

  updateReadingProgress: async (
    bookId: number,
    data: { page: number; completed?: boolean }
  ) => {
    log(`POST /student/library/read/${bookId}`, data);
    const res = await apiClient.post(`/student/library/read/${bookId}`, data);
    return unwrap<unknown>(res);
  },

  getFavorites: async (): Promise<Book[]> => {
    log('GET /student/library/favorites');
    const res = await apiClient.get('/student/library/favorites');
    return unwrap<Book[]>(res);
  },

  getRecentReads: async (): Promise<Book[]> => {
    log('GET /student/library/recent');
    const res = await apiClient.get('/student/library/recent');
    return unwrap<Book[]>(res);
  },
};

// ============================================
// ASSIGNMENTS (کارخانگی)
// ============================================
export const studentAssignmentsAPI = {
  list: async (): Promise<Assignment[]> => {
    log('GET /student/assignments');
    const res = await apiClient.get('/student/assignments');
    return unwrap<Assignment[]>(res);
  },

  getStats: async (): Promise<AssignmentStats> => {
    log('GET /student/assignments/stats');
    const res = await apiClient.get('/student/assignments/stats');
    return unwrap<AssignmentStats>(res);
  },

  getByStatus: async (status: string): Promise<Assignment[]> => {
    log(`GET /student/assignments/status/${status}`);
    const res = await apiClient.get(`/student/assignments/status/${status}`);
    return unwrap<Assignment[]>(res);
  },

  getById: async (id: number): Promise<Assignment> => {
    log(`GET /student/assignments/${id}`);
    const res = await apiClient.get(`/student/assignments/${id}`);
    return unwrap<Assignment>(res);
  },

  submit: async (id: number, data: { content?: string; fileUrl?: string }) => {
    log(`POST /student/assignments/${id}/submit`, data);
    const res = await apiClient.post(`/student/assignments/${id}/submit`, data);
    return unwrap<unknown>(res);
  },
};

// ============================================
// COURSES & SUBJECTS
// ============================================
export const studentCoursesAPI = {
  getMyCourses: async (): Promise<StudentCourse[]> => {
    log('GET /student/courses');
    const res = await apiClient.get('/student/courses');
    return unwrap<StudentCourse[]>(res);
  },

  getEnrolled: async (): Promise<StudentCourse[]> => {
    log('GET /student/courses/enrolled');
    const res = await apiClient.get('/student/courses/enrolled');
    return unwrap<StudentCourse[]>(res);
  },

  getBrowse: async (params: { page?: number; limit?: number } = {}) => {
    log('GET /student/courses/browse', params);
    const res = await apiClient.get('/student/courses/browse', { params });
    return unwrap<{
      items: StudentCourse[];
      total: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    }>(res);
  },

  search: async (params: { search?: string; page?: number; limit?: number } = {}) => {
    log('GET /student/courses/search', params);
    const res = await apiClient.get('/student/courses/search', { params });
    return unwrap<{
      items: StudentCourse[];
      total: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    }>(res);
  },

  getById: async (id: number) => {
    log(`GET /student/courses/${id}`);
    const res = await apiClient.get(`/student/courses/${id}`);
    return unwrap<unknown>(res);
  },

  enroll: async (id: number) => {
    log(`POST /student/courses/${id}/enroll`);
    const res = await apiClient.post(`/student/courses/${id}/enroll`);
    return unwrap<unknown>(res);
  },

  getStats: async () => {
    log('GET /student/courses/stats');
    const res = await apiClient.get('/student/courses/stats');
    return unwrap<{
      total: number;
      enrolled: number;
      completed: number;
      in_progress: number;
    }>(res);
  },

  getSubjects: async (): Promise<StudentSubject[]> => {
    log('GET /student/courses/subjects');
    const res = await apiClient.get('/student/courses/subjects');
    return unwrap<StudentSubject[]>(res);
  },

  getSubjectsByClass: async (classId: number): Promise<StudentSubject[]> => {
    log(`GET /student/courses/subjects/class/${classId}`);
    const res = await apiClient.get(`/student/courses/subjects/class/${classId}`);
    return unwrap<StudentSubject[]>(res);
  },
};

// ============================================
// LESSONS
// ============================================
export const studentLessonsAPI = {
  getCourseLessons: async (courseId: number): Promise<CourseLesson[]> => {
    log(`GET /student/courses/${courseId}/lessons`);
    const res = await apiClient.get(`/student/courses/${courseId}/lessons`);
    return unwrap<CourseLesson[]>(res);
  },

  getDetail: async (id: number): Promise<LessonDetail> => {
    log(`GET /student/lessons/${id}`);
    const res = await apiClient.get(`/student/lessons/${id}`);
    return unwrap<LessonDetail>(res);
  },

  complete: async (id: number, lastPosition = 0) => {
    log(`POST /student/lessons/${id}/complete`);
    const res = await apiClient.post(`/student/lessons/${id}/complete`, {
      lastPosition,
    });
    return unwrap<{ courseCompleted: boolean }>(res);
  },

  saveProgress: async (id: number, lastPosition: number) => {
    log(`POST /student/lessons/${id}/progress`);
    const res = await apiClient.post(`/student/lessons/${id}/progress`, {
      lastPosition,
    });
    return unwrap<unknown>(res);
  },

  addComment: async (id: number, content: string) => {
    log(`POST /student/lessons/${id}/comments`);
    const res = await apiClient.post(`/student/lessons/${id}/comments`, {
      content,
    });
    return unwrap<unknown>(res);
  },

  submitQuiz: async (id: number, quizId: number, answer: number) => {
    log(`POST /student/lessons/${id}/quiz`);
    const res = await apiClient.post(`/student/lessons/${id}/quiz`, {
      quizId,
      answer,
    });
    return unwrap<{
      isCorrect: boolean;
      correctAnswer: number;
      explanation?: string;
    }>(res);
  },
};

// ============================================
// DEFAULT EXPORT
// ============================================
const studentAPI = {
  dashboard: studentDashboardAPI,
  profile: studentProfileAPI,
  timetable: studentTimetableAPI,
  attendance: studentAttendanceAPI,
  grades: studentGradesAPI,
  library: studentLibraryAPI,
  assignments: studentAssignmentsAPI,
  courses: studentCoursesAPI,
  lessons: studentLessonsAPI,
};

export default studentAPI;