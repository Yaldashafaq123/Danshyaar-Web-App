// lib/api/admin.ts
import apiClient from './client';

// ============================================
// TYPES
// ============================================

export interface Activity {
  id: number;
  user: string;
  userImage?: string | null;
  action: string;
  details: string;
  time: string;
  timestamp: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalUsers: number;
  activeUsers: number;
  totalClasses: number;
  totalRevenue: number;
  pendingFees: number;
  attendanceRate: number;
  studentsChange: number;
  revenueChange: number;
  systemHealth: number;
  recentActivities: Activity[];
}

// ============================================
// DASHBOARD API
// NOTE: baseURL already ends with /api
//       so paths here start with /admin, /teacher, etc.
// ============================================

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    console.log('🔵 [adminAPI] GET /admin/dashboard/stats');
    const response = await apiClient.get('/admin/dashboard/stats');
    console.log('🟢 [adminAPI] Response:', response.data);
    return response.data.data;
  },

  getRecentActivities: async (limit = 10): Promise<Activity[]> => {
    console.log('🔵 [adminAPI] GET /admin/activities/recent');
    const response = await apiClient.get(`/admin/activities/recent?limit=${limit}`);
    console.log('🟢 [adminAPI] Activities:', response.data);
    return response.data.data;
  },
};

export default dashboardAPI;