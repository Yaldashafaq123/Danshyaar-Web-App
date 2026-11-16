// lib/api/superAdmin.ts
import apiClient from './client';

export interface School {
  id: number;
  name: string;
  nameFarsi?: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  principalName?: string;
  establishedDate?: string;
  schoolType: string;
  status: string;
  timezone: string;
  _count?: {
    students: number;
    teachers: number;
    staff: number;
    users: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  schoolId: number;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  features: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  schoolId?: number;
  School?: {
    name: string;
  };
}

export const superAdminAPI = {
  // ============ Schools Management ============
  getAllSchools: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/super-admin/schools', { params });
    return response.data;
  },

  getSchoolById: async (id: number) => {
    const response = await apiClient.get(`/super-admin/schools/${id}`);
    return response.data;
  },

  createSchool: async (data: Partial<School>) => {
    const response = await apiClient.post('/super-admin/schools', data);
    return response.data;
  },

  updateSchool: async (id: number, data: Partial<School>) => {
    const response = await apiClient.put(`/super-admin/schools/${id}`, data);
    return response.data;
  },

  deleteSchool: async (id: number) => {
    const response = await apiClient.delete(`/super-admin/schools/${id}`);
    return response.data;
  },

  toggleSchoolStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/super-admin/schools/${id}/status`, { status });
    return response.data;
  },

  // ============ Global Dashboard Stats ============
  getDashboardStats: async () => {
    const response = await apiClient.get('/super-admin/stats');
    return response.data;
  },

  getGlobalCharts: async (params?: { 
    type?: 'monthly' | 'yearly';
    year?: number;
  }) => {
    const response = await apiClient.get('/super-admin/charts', { params });
    return response.data;
  },

  getRecentActivities: async (params?: { limit?: number }) => {
    const response = await apiClient.get('/super-admin/activities', { params });
    return response.data;
  },

  // ============ Subscription Management ============
  getAllSubscriptions: async (params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
  }) => {
    const response = await apiClient.get('/super-admin/subscriptions', { params });
    return response.data;
  },

  updateSubscription: async (id: number, data: Partial<Subscription>) => {
    const response = await apiClient.put(`/super-admin/subscriptions/${id}`, data);
    return response.data;
  },

  // ============ Global Users ============
  getAllUsers: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    role?: string;
    schoolId?: number;
  }) => {
    const response = await apiClient.get('/super-admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id: number, isActive: boolean) => {
    const response = await apiClient.patch(`/super-admin/users/${id}/status`, { isActive });
    return response.data;
  },

  // ============ System Monitoring ============
  getSystemHealth: async () => {
    const response = await apiClient.get('/super-admin/system/health');
    return response.data;
  },

  // ============ Audit Logs ============
  getAuditLogs: async (params?: { 
    page?: number; 
    limit?: number; 
    userId?: number;
    action?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await apiClient.get('/super-admin/audit-logs', { params });
    return response.data;
  },
};