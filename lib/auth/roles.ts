import type { User } from '@/lib/store/authStore';

export type AppRole =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'finance'
  | 'hr';

const dashboardRoutes: Record<AppRole, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  principal: '/principal',
  teacher: '/teachers',
  student: '/students',
  parent: '/parents',
  finance: '/finance',
  hr: '/hr',
};

export function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== 'string') return null;

  const normalized = value.toLowerCase().replace(/[\s_-]/g, '');

  switch (normalized) {
    case 'superadmin':
      return 'super_admin';
    case 'admin':
      return 'admin';
    case 'principal':
      return 'principal';
    case 'teacher':
      return 'teacher';
    case 'student':
      return 'student';
    case 'parent':
      return 'parent';
    case 'finance':
      return 'finance';
    case 'hr':
      return 'hr';
    default:
      return null;
  }
}

export function getUserRole(
  user: Pick<User, 'role' | 'userType'> | null | undefined
): AppRole | null {
  return normalizeRole(user?.role) ?? normalizeRole(user?.userType);
}

export function getDashboardRoute(role: AppRole): string {
  return dashboardRoutes[role];
}
