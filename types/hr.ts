// types/hr.ts
// ============================================
// HR TYPES — Complete
// ============================================

// ---------- Generic ----------
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------- HR Profile ----------
export interface HRProfile {
  user: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
    profileImage?: string;
    isActive: boolean;
    createdAt: string;
  };
  hrStaff: {
    id: number;
    position?: string;
    department?: string;
    isActive: boolean;
    joinDate?: string;
    salary?: number | null;
  };
  statistics: HRStatistics;
}

export interface HRStatistics {
  totalStaff: number;
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
  activeStaff: number;
  onLeave: number;
  pendingRequests: number;
  totalDepartments: number;
}

// ---------- Dashboard ----------
export interface HRDashboard {
  summary: {
    totalStaff: number;
    activeStaff: number;
    onLeave: number;
    totalTeachers: number;
    totalStudents: number;
    totalParents: number;
    pendingRequests: number;
    todayAttendance: number;
    totalDepartments: number;
    attendanceRate: number;
  };
}

export interface HRDashboardDetails extends HRDashboard {
  summary: HRDashboard['summary'] & {
    expiringContracts: number;
    totalWarnings: number;
    monthAttendance: number;
  };
  recentLeaves: LeaveRequest[];
}

// ---------- Staff ----------
export type StaffType =
  | 'TEACHER'
  | 'ADMIN'
  | 'FINANCE'
  | 'HR'
  | 'PRINCIPAL'
  | 'CHEF'
  | 'GUARD'
  | 'DRIVER'
  | 'CLEANER'
  | 'SECURITY'
  | 'MAINTENANCE'
  | 'LIBRARIAN'
  | 'NURSE'
  | 'COUNSELOR'
  | 'COACH'
  | 'OTHER';

export interface StaffMember {
  id: number;
  fullName: string;
  nameFarsi?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  verified: boolean;
  createdAt: string;
  profileImage?: string | null;
  fatherName?: string | null;
  fatherNameFarsi?: string | null;
  grandfatherName?: string | null;
  civilId?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  currentAddress?: string | null;
  permanentAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  sex?: string | null;
  maritalStatus?: string | null;
  bloodType?: string | null;
  nationality?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  insuranceNumber?: string | null;
  insuranceProvider?: string | null;
  hasInsurance: boolean;
  staffType: StaffType | string;
  position?: string | null;
  department?: string | null;
  joinDate?: string | null;
  salary?: number | null;
  staffNotes?: string | null;
  specialization?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  contractFile?: string | null;
  idCardFile?: string | null;
  photoFile?: string | null;
  isStaffActive?: boolean;
  attendanceCount: number;
}

export interface StaffDetail extends StaffMember {
  rfidCode?: string | null;
  civilIdIssueDate?: string | null;
  civilIdExpiryDate?: string | null;
  emergencyContactRelation?: string | null;
  educationInstitution?: string | null;
  graduationYear?: number | null;
  workExperience?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  contractType?: string | null;
  workSchedule?: string | null;
  workShift?: string | null;
  baseSalary?: number | null;
  salaryCurrency?: string | null;
  hasContract: boolean;
  notes?: string | null;
  staff?: {
    id: number;
    staffType: StaffType | string;
    position?: string | null;
    department?: string | null;
    isActive: boolean;
    joinDate?: string | null;
    salary?: number | null;
    notes?: string | null;
    specialization?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    contractFile?: string | null;
    idCardFile?: string | null;
    photoFile?: string | null;
  } | null;
  Teacher?: TeacherData | null;
  FinanceStaff?: StaffRoleData | null;
  PrincipalStaff?: PrincipalRoleData | null;
  HRStaff?: StaffRoleData | null;
  // Aggregated fields from controller
  staffType_?: StaffType | string;
  experience?: string | null;
  qualification?: string | null;
}

export interface TeacherData {
  id: number;
  bio?: string | null;
  experience?: string | null;
  hourlyRate?: number | null;
  certification?: string | null;
  availability?: boolean;
  rating?: number;
  isActive: boolean;
  joiningDate?: string | null;
  teacherCode?: string | null;
  specialization?: string | null;
  baseSalary?: number | null;
  teachingExperience?: number | null;
  languageSkills?: string | null;
  awards?: string | null;
  publications?: string | null;
  contractEndDate?: string | null;
  overtimeRate?: number | null;
  TeacherSubject?: {
    Subject: {
      id: number;
      name: string;
    };
  }[];
}

export interface StaffRoleData {
  id: number;
  position?: string | null;
  department?: string | null;
  isActive: boolean;
  joinDate?: string | null;
  salary?: number | null;
}

export interface PrincipalRoleData {
  id: number;
  position?: string | null;
  isActive: boolean;
  joinDate?: string | null;
  experience?: string | null;
  qualification?: string | null;
}

// ---------- Attendance ----------
export interface PunchRecord {
  punchType: number | null;
  label: string;
  labelFa: string;
  time: string;
  device: string;
}

export interface AttendanceRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'present' | 'late' | 'absent';
  hasCheckIn: boolean;
  hasCheckOut: boolean;
  isLate: boolean;
  isOnTime: boolean;
  lateStatus: string;
  schoolStartTime: string;
  firstCheckIn: { time: string; dateShamsi: string } | null;
  lastPunch: {
    type: number | null;
    label: string;
    labelFa: string;
    time: string;
    dateShamsi: string | null;
  } | null;
  totalPunches: number;
  punchCounts: Record<string, number>;
  records: PunchRecord[];
}

export interface AttendanceResponse {
  date: string;
  dateShamsi: string;
  dateShamsiFull: string;
  shamsiMonth: number;
  shamsiYear: number;
  shamsiMonthName: string;
  shamsiWeekday: string;
  schoolStartTime: string;
  summary: {
    present: number;
    late: number;
    absent: number;
    checkedIn: number;
    checkedOut: number;
    total: number;
    totalPunches: number;
    onTime: number;
  };
  attendance: AttendanceRow[];
}

export interface AttendanceReportRow {
  staffId: number;
  fullName: string;
  nameFarsi?: string | null;
  role: string;
  staffType: string;
  position?: string | null;
  department?: string | null;
  isActive: boolean;
  teacherCode?: string | null;
  stats: {
    totalRecords: number;
    presentDays: number;
    totalWorkingDays: number;
    attendanceRate: number;
    firstScan: string | null;
    firstScanShamsi: string | null;
    firstScanTime: string | null;
    lastScan: string | null;
    lastScanShamsi: string | null;
    lastScanTime: string | null;
    punchCounts: Record<string, number>;
  };
}

export interface AttendanceReport {
  report: AttendanceReportRow[];
  summary: {
    totalStaff: number;
    activeStaff: number;
    totalPresent: number;
    averageAttendance: number;
    totalRecords: number;
  };
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
}

// ---------- Monthly Attendance ----------
export interface DailyAttendanceRow {
  date: string;
  dateShamsi: string;
  dayOfWeek: string;
  dayNumber: number;
  isPresent: boolean;
  isLate: boolean;
  lateStatus: string;
  recordCount: number;
  firstScan: string | null;
  firstScanShamsi: string | null;
  lastScan: string | null;
  lastScanShamsi: string | null;
  punchIn: number;
  punchOut: number;
  punchBreakdown: Record<string, number>;
  isFriday: boolean;
  records: {
    time: string;
    punchType: number | null;
    label: string;
    labelFa: string;
    device: string;
  }[];
}

export interface MonthlyAttendance {
  staff: {
    id: number;
    fullName: string;
    nameFarsi?: string | null;
    role: string;
    staffType?: string;
    position?: string | null;
    department?: string | null;
    teacherCode?: string | null;
  };
  shamsiMonth: number;
  shamsiYear: number;
  shamsiMonthName: string;
  gregorianStart: string;
  gregorianEnd: string;
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    onTimeDays: number;
    fridayDays: number;
    attendanceRate: number;
    workingDays: number;
    totalRecords: number;
    totalPunchIn: number;
    totalPunchOut: number;
    punchSummary: Record<string, number>;
  };
  daily: DailyAttendanceRow[];
}

// ---------- Leaves ----------
export type LeaveType = 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'MATERNITY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: number;
  userId: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string | null;
  status: LeaveStatus;
  approvedBy?: number | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  User: {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
    profileImage?: string | null;
    role: string;
  };
  Approver?: {
    id: number;
    fullName: string;
  } | null;
}

export interface LeaveBalance {
  userId: number;
  year: number;
  annualLeave: number;
  sickLeave: number;
  emergencyLeave: number;
  maternityLeave: number;
  usedAnnual: number;
  usedSick: number;
  usedEmergency: number;
  usedMaternity: number;
  remainingAnnual: number;
  remainingSick: number;
  remainingEmergency: number;
  remainingMaternity: number;
}

// ---------- Salary ----------
export type SalaryStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';

export interface Salary {
  id: number;
  teacherId: number;
  teacherName: string;
  teacherRole: string;
  amount: number;
  baseSalary: number;
  bonusAmount: number;
  deductionAmount: number;
  overtimeAmount: number;
  overtimeHours: number;
  finalAmount: number;
  month: number;
  year: number;
  status: SalaryStatus;
  notes?: string | null;
  paidAt?: string | null;
  payments: {
    id: number;
    amount: number;
    paidAt: string;
    paymentMethod: string;
    referenceNo?: string | null;
    User?: { fullName: string };
  }[];
  createdAt: string;
}

export interface SalaryStats {
  month: number;
  year: number;
  summary: {
    totalSalaries: number;
    pendingSalaries: number;
    paidSalaries: number;
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
    collectionRate: number;
  };
}

// ---------- Evaluations ----------
export interface Evaluation {
  id: number;
  userId: number;
  evaluatorId: number;
  period: string;
  date: string;
  teachingQuality?: number | null;
  attendanceScore?: number | null;
  studentFeedback?: number | null;
  teamworkScore?: number | null;
  punctualityScore?: number | null;
  overallScore?: number | null;
  strengths?: string | null;
  weaknesses?: string | null;
  goals?: string | null;
  recommendations?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  User: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  Evaluator: {
    id: number;
    fullName: string;
  };
}

// ---------- Documents ----------
export interface HRDocument {
  id: number;
  userId?: number | null;
  title: string;
  description?: string | null;
  type: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedBy: number;
  isConfidential: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: number;
    fullName: string;
  } | null;
  Uploader: {
    id: number;
    fullName: string;
  };
}

// ---------- ID Cards ----------
export interface IdCard {
  id: number;
  userId: number;
  cardNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  qrCode?: string | null;
  printedBy?: number | null;
  printedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  User: {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
    profileImage?: string | null;
    role: string;
  };
}

// ---------- Warnings ----------
export type WarningType = 'VERBAL' | 'WRITTEN' | 'FINAL' | 'TERMINATION';
export type WarningStatus = 'ACTIVE' | 'RESOLVED' | 'EXPIRED';

export interface Warning {
  id: number;
  userId: number;
  issuedBy: number;
  type: WarningType;
  title: string;
  description: string;
  issuedDate: string;
  resolution?: string | null;
  resolvedAt?: string | null;
  status: WarningStatus;
  documents?: unknown;
  createdAt: string;
  updatedAt: string;
  User: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  Issuer: {
    id: number;
    fullName: string;
  };
}

// ---------- Notifications ----------
export interface HRNotification {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  publishedAt?: string | null;
  User: {
    fullName: string;
  };
}

// ---------- Form inputs ----------
export interface CreateStaffInput {
  fullName: string;
  nameFarsi?: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
  staffType: StaffType;
  position?: string;
  department?: string;
  joinDate?: string;
  salary?: number;
  isActive?: boolean;
  notes?: string;
  fatherName?: string;
  fatherNameFarsi?: string;
  grandfatherName?: string;
  sex?: string;
  maritalStatus?: string;
  bloodType?: string;
  civilId?: string;
  civilIdIssueDate?: string;
  civilIdExpiryDate?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  educationLevel?: string;
  educationField?: string;
  educationInstitution?: string;
  graduationYear?: number;
  workExperience?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractType?: string;
  workSchedule?: string;
  workShift?: string;
  baseSalary?: number;
  salaryCurrency?: string;
  bankAccountNumber?: string;
  bankName?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
  hasInsurance?: boolean;
  hasContract?: boolean;
}