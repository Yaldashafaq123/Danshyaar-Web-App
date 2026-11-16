// lib/api/dashboard.ts
import apiClient from './client';

export const dashboardAPI = {
  // Super Admin Dashboard
  getSuperAdminStats: async () => {
    const response = await apiClient.get('/super-admin/stats');
    return response.data;
  },

  getSchoolsList: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/admin/schools', { params });
    return response.data;
  },

  // Admin Dashboard
  getAdminStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await apiClient.get('/admin/recent-activity');
    return response.data;
  },

  // Teacher Dashboard
  getTeacherStats: async (): Promise<unknown> => {
    const response = await apiClient.get('/teacher/stats');
    return response.data;
  },

  getTeacherClasses: async (): Promise<unknown> => {
    const response = await apiClient.get('/teacher/classes');
    return response.data;
  },

  // Student Dashboard
  getStudentStats: async () => {
    const response = await apiClient.get('/student/stats');
    return response.data;
  },

  getStudentGrades: async () => {
    const response = await apiClient.get('/student/grades');
    return response.data;
  },
};