// lib/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Role-specific types
// ============================================

export interface TeacherData {
  id: number;
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  certification?: string;
  availability?: boolean;
  rating?: number;
  isActive?: boolean;
  joiningDate?: string;
  teacherCode?: string;
  specialization?: string;
  baseSalary?: number;
  teachingExperience?: number;
  languageSkills?: string;
  awards?: string;
  publications?: string;
  contractEndDate?: string;
  overtimeRate?: number;
}

export interface StudentData {
  id: number;
  classId?: number;
  studentNumber?: string;
  status?: string;
  enrollmentDate?: string;
}

export interface ParentData {
  id: number;
  address?: string;
  emergencyContact?: string;
  occupation?: string;
  relationship?: string;
}

export interface FinanceStaffData {
  id: number;
  position?: string;
  department?: string;
  isActive?: boolean;
  joinDate?: string;
  salary?: number;
}

export interface PrincipalStaffData {
  id: number;
  position?: string;
  isActive?: boolean;
  joinDate?: string;
  experience?: string;
  qualification?: string;
}

export interface HRStaffData {
  id: number;
  position?: string;
  department?: string;
  isActive?: boolean;
  joinDate?: string;
  salary?: number;
}

// ============================================
// User type
// ============================================

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  userType?: string;
  verified: boolean;
  isActive: boolean;
  profileImage?: string;
  profile_image?: string;
  createdAt?: string;
  rfidCode?: string;

  // Role-specific data
  Teacher?: TeacherData | null;
  Student?: StudentData | null;
  Parent?: ParentData | null;
  FinanceStaff?: FinanceStaffData | null;
  PrincipalStaff?: PrincipalStaffData | null;
  HRStaff?: HRStaffData | null;

  // Aliases (backend returns lowercase versions too)
  finance?: FinanceStaffData | null;
  principal?: PrincipalStaffData | null;
  hr?: HRStaffData | null;
}

// ============================================
// Auth State
// ============================================

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

// ============================================
// Auth Store
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          hasHydrated: true,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          hasHydrated: true,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      updateUser: (updates) => {
        set((state) => {
          const nextUser = state.user ? { ...state.user, ...updates } : null;

          if (typeof window !== 'undefined' && nextUser) {
            localStorage.setItem('user', JSON.stringify(nextUser));
          }

          return { user: nextUser };
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);