// lib/api/auth.ts
import apiClient from './client';
import { useAuthStore } from '@/lib/store/authStore';
import type {
  TeacherData,
  StudentData,
  ParentData,
  FinanceStaffData,
  PrincipalStaffData,
  HRStaffData,
} from '@/lib/store/authStore';

// ============================================
// Types
// ============================================

interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponseUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  userType?: string;
  verified: boolean;
  isActive: boolean;
  createdAt?: string;
  profile_image?: string;
  profileImage?: string;
  rfidCode?: string;

  Teacher?: TeacherData | null;
  Student?: StudentData | null;
  Parent?: ParentData | null;
  FinanceStaff?: FinanceStaffData | null;
  PrincipalStaff?: PrincipalStaffData | null;
  HRStaff?: HRStaffData | null;

  finance?: FinanceStaffData | null;
  principal?: PrincipalStaffData | null;
  hr?: HRStaffData | null;
}

export interface LoginResponse {
  message: string;
  token: string;
  User: LoginResponseUser;
}

export interface MessageResponse {
  message: string;
}

// ============================================
// Auth API
// ============================================

export const authAPI = {
  /**
   * POST /api/auth/login
   */
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  },

  /**
   * POST /api/auth/verify-code
   */
  verifyCode: async (email: string, code: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      '/auth/verify-code',
      { email, code }
    );
    return response.data;
  },

  /**
   * POST /api/auth/reset-password
   */
  resetPassword: async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      '/auth/reset-password',
      { email, code, newPassword }
    );
    return response.data;
  },

  /**
   * Client-side logout (JWT is stateless — no backend call)
   */
  logout: (): void => {
    useAuthStore.getState().logout();
  },
};