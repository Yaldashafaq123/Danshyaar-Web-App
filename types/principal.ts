// types/principal.ts
// ============================================
// SHARED TYPES FOR PRINCIPAL / ACADEMIC DASHBOARD
// ============================================

// ---------- Generic helpers ----------
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// ---------- Profile ----------
export interface PrincipalProfile {
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
  principalStaff: {
    id: number;
    position?: string;
    isActive: boolean;
    joinDate?: string;
    experience?: string;
    qualification?: string;
  };
  statistics: PrincipalStatistics;
}

export interface PrincipalStatistics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalParents: number;
  totalStaff: number;
  activeStudents: number;
  activeTeachers: number;
  totalSubjects: number;
  totalAssignments: number;
  totalExams: number;
}

// ---------- Dashboard ----------
export interface DashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalParents: number;
  totalStaff: number;
  activeStudents: number;
  activeTeachers: number;
  totalSubjects: number;
  totalAssignments: number;
  totalExams: number;
  totalFeeAssignments: number;
  totalOutstanding: number;
  monthlyCollection: number;
  todayAttendance: number;
  attendanceRate: number;
}

// ---------- Students ----------
export interface Student {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  studentNumber?: string;
  status: string;
  enrollmentDate?: string;
  className: string;
  classId?: number;
  hasFeePlan: boolean;
  feeStatus: string | null;
}

export interface StudentUserInfo {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

export interface StudentClassInfo {
  id: number;
  name: string;
  section?: string;
  Teacher?: {
    id: number;
    User: { fullName: string };
  } | null;
}

export interface StudentParentInfo {
  id: number;
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface StudentParentLink {
  Parent: {
    id: number;
    User: StudentParentInfo;
  };
}

export interface GradeRecord {
  id: number;
  examId: number;
  subject: string;
  marks: number;
  percentage?: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  classId: number;
}

export interface StudentFeeSummary {
  totalFees: number;
  totalPaid: number;
  totalBalance: number;
  collectionRate: number;
}

export interface StudentDetail {
  id: number;
  User: StudentUserInfo;
  Class: StudentClassInfo | null;
  studentNumber?: string;
  status: string;
  classId?: number;
  enrollmentDate?: string;
  graduationDate?: string;
  scholarship?: boolean;
  scholarshipPercentage?: number;
  feeWaiver?: boolean;
  feeWaiverReason?: string;
  FeeAssignment: unknown[];
  Grade: GradeRecord[];
  Attendance: AttendanceRecord[];
  ParentStudent: StudentParentLink[];
  feeSummary: StudentFeeSummary;
}

// ---------- Teachers ----------
export interface Teacher {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  teacherCode?: string;
  isActive: boolean;
  joiningDate?: string;
  specialization?: string;
  rating: number;
  subjects: string[];
  className: string | null;
}

export interface TeacherSubjectInfo {
  id: number;
  name: string;
}

export interface TeacherClassInfo {
  id: number;
  name: string;
  section?: string;
  _count?: { Student: number };
}

export interface SalaryRecord {
  id: number;
  baseSalary: number;
  finalAmount: number;
  month: number;
  year: number;
  status: string;
}

export interface TeacherDetail {
  id: number;
  userId: number;
  teacherCode?: string;
  specialization?: string;
  isActive: boolean;
  rating: number;
  User: StudentUserInfo;
  TeacherSubject: { Subject: TeacherSubjectInfo }[];
  Class: TeacherClassInfo[];
  Salary: SalaryRecord[];
}

// ---------- Classes ----------
export interface Class {
  id: number;
  name: string;
  section?: string;
  description?: string;
  is_active: boolean;
  studentCount: number;
  teacherCount: number;
  teacherName: string;
  teacherId?: number;
  academicYear?: string;
  academicYearId?: number;
}

// ---------- Subjects ----------
export interface Subject {
  id: number;
  name: string;
  description: string;
  teachers: {
    id: number;
    name: string;
    profileImage?: string;
    email?: string;
  }[];
  classes: {
    id: number;
    name: string;
    section?: string;
    isActive: boolean;
  }[];
  classCount: number;
  teacherCount: number;
}

// ---------- Exams ----------
export interface Exam {
  id: number;
  name: string;
  subject: string;
  className: string;
  classId: number;
  date: string;
  totalMarks: number;
  isPublished: boolean;
  type: string;
  month?: number;
  year?: number;
  studentCount: number;
  gradesCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
}

// ---------- Evaluations ----------
export interface EvaluationTemplate {
  id: number;
  name: string;
  description?: string;
  period: string;
  isActive: boolean;
  isDefault: boolean;
  academicYear?: string;
  academicYearId?: number;
  criteriaCount: number;
  evaluationsCount: number;
  createdBy?: string;
  createdAt: string;
}

export interface Evaluation {
  id: number;
  teacherId: number;
  teacherName: string;
  teacherImage?: string;
  templateName: string;
  period: string;
  term: string;
  academicYear?: string;
  evaluatorName: string;
  evaluatorRole: string;
  overallScore?: number;
  percentage?: number;
  grade: string;
  gradeLabel: string;
  status:
    | 'DRAFT'
    | 'PENDING_REVIEW'
    | 'SUBMITTED'
    | 'ACKNOWLEDGED'
    | 'DISPUTED'
    | 'ARCHIVED';
  evaluatedAt?: string;
  submittedAt?: string;
  createdAt: string;
}

// ---------- Evaluation Criteria ----------
export interface EvaluationCriteria {
  id: number;
  name: string;
  nameFarsi?: string;
  description?: string;
  category: string;
  weight: number;
  maxScore: number;
  sortOrder: number;
  isRequired: boolean;
}

export interface EvaluationScorePayload {
  criteriaId: number;
  score: number;
  comment?: string;
}

export interface EvaluationCriteriaWithScore extends EvaluationCriteria {
  score: number | null;
  comment: string | null;
  scoreId: number | null;
}

// ---------- Timetable ----------
export interface TimetableEntry {
  id: number | null;
  period: number;
  time: string;
  startTime: string;
  endTime: string;
  subject: string;
  subjectId: number | null;
  teacher: string;
  teacherId: number | null;
  teacherImage: string | null;
  room: string;
  isBreak: boolean;
  isActive: boolean;
  isEmpty?: boolean;
}

export interface TimetableResponse {
  class: {
    id: number;
    name: string;
    academicYear?: string;
  };
  day: {
    index: number;
    name: string;
  };
  periods: TimetableEntry[];
}

// ---------- Reports ----------
export interface PerformanceReport {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalPassed: number;
    totalFailed: number;
    passRate: number;
    averageScore: number;
  };
  topStudent: Student | null;
  topClass: Class | null;
}

export interface ClassReportRow {
  id: number;
  name: string;
  section?: string;
  studentCount: number;
  teacherName: string;
  totalFees: number;
  totalPaid: number;
  collectionRate: number;
}

export interface ClassReport {
  classes: ClassReportRow[];
  totalClasses: number;
  totalStudents: number;
  averageCollectionRate: number;
}

export interface AttendanceClassRow {
  className: string;
  section?: string;
  studentCount: number;
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

export interface AttendanceReport {
  month: number;
  year: number;
  monthName: string;
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalRecords: number;
    overallRate: number;
  };
  classAttendance: AttendanceClassRow[];
}

// ---------- Promotions ----------
export interface PromotionSuggestion {
  fromClassId: number;
  fromClassName: string;
  fromGrade: string;
  fromSection: string;
  fromStudentCount: number;
  fromTeacher: string;
  currentAcademicYear?: string;
  currentAcademicYearId?: number;
  nextGradeName: string | null;
  toClassId: number | null;
  toClassName: string | null;
  toStudentCount: number;
  toTeacher: string;
  toAcademicYear?: string;
  canPromote: boolean;
  hasStudents: boolean;
  needsNewClass: boolean;
  suggestedNewClassName: string | null;
  suggestedNewGrade: string | null;
  suggestedNewSection: string;
  targetAcademicYearId: number | null;
}

export interface PromotionOptions {
  classes: Class[];
  promotionSuggestions: PromotionSuggestion[];
  academicYears: AcademicYear[];
  gradeNames: string[];
}

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ---------- Generic response ----------
export interface SuccessResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}