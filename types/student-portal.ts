// types/student-portal.ts
// ============================================
// STUDENT PORTAL TYPES
// ============================================

// ---------- Profile ----------
export interface StudentProfile {
  User: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    profileImage?: string;
    role: string;
  };
  student: {
    id: number;
    userId: number;
    classId?: number;
    address?: string;
    bio?: string;
    birthDate?: string;
    parentContact?: string;
    status: string;
    studentNumber?: string;
    enrollmentDate?: string;
    Class?: {
      id: number;
      name: string;
      section?: string;
      AcademicYear?: { id: number; name: string; isActive: boolean };
      Teacher?: { User: { fullName: string } } | null;
    } | null;
  };
  stats: Record<string, unknown>;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  bio?: string;
  address?: string;
  birthDate?: string;
  parentContact?: string;
}

// ---------- Dashboard ----------
export interface StudentDashboardStats {
  total_courses: number;
  enrolled_courses: number;
  completed_courses: number;
  total_hours: number;
  certificates: number;
  assignments_pending: number;
  assignments_total: number;
  exams_upcoming: number;
  average_score: number;
  streak_days: number;
  attendance_rate: number;
}

export interface StudentCourse {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  teacher_name: string;
  teacher_id: number;
  class_id?: number;
  is_general: boolean;
  progress: number;
  enrolled: boolean;
  duration: number;
  subject: string;
  rating?: number;
}

export interface UpcomingExam {
  id: number;
  title: string;
  subject: string;
  date: string;
  time: string;
  type: string;
}

export interface RecentActivity {
  id: number;
  action: string;
  time: string;
  type: string;
}

export interface StudentDashboard {
  stats: StudentDashboardStats;
  recentActivities: RecentActivity[];
  upcomingExams: UpcomingExam[];
  myCourses: StudentCourse[];
  continueLearning: StudentCourse[];
}

// ---------- Timetable ----------
export interface TimetableEntry {
  id: number;
  day: string;
  dayIndex: number;
  period: string;
  periodIndex: number;
  subject: string;
  Teacher: string;
  teacherImage?: string | null;
  room: string;
  color: string;
  startTime: string;
  endTime: string;
  teacherId?: number;
  subjectId?: number;
}

export interface TimetableData {
  entries: TimetableEntry[];
  days: string[];
  periods: string[];
  summary: {
    totalClasses: number;
    totalMinutes: number;
    uniqueTeachers: number;
    subjectsPerDay: Record<string, number>;
  };
  classInfo: {
    className: string;
    section?: string;
    AcademicYear?: string;
  };
}

// ---------- Attendance ----------
export interface AttendanceRecord {
  date: string;
  originalDate: string;
  dayOfWeek: string;
  month: string;
  year: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  latenessMinutes?: number;
  note?: string;
}

export interface MonthlyAttendanceSummary {
  month: string;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

export interface AttendanceOverview {
  stats: {
    totalDays: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalExcused: number;
    averageRate: number;
  };
  dailyAttendance: AttendanceRecord[];
  monthlySummaries: MonthlyAttendanceSummary[];
  currentAfghanDate: {
    date: string;
    month: string;
    year: number;
    weekday: string;
  };
}

export interface AttendanceAnalytics {
  monthlyTrend: {
    labels: string[];
    data: number[];
  };
  comparison: {
    studentAverage: number;
    classAverage: number;
  };
  insights: {
    type: 'positive' | 'warning' | 'neutral';
    icon: string;
    text: string;
  }[];
  stats: {
    totalDays: number;
    present: number;
    attendanceRate: number;
  };
}

// ---------- Grades ----------
export interface SubjectGrade {
  id: number | string;
  subject: string;
  Teacher: string;
  monthly: number | null;
  halfYearly: number | null;
  final: number | null;
  monthlyMaxScore: number;
  halfYearlyMaxScore: number;
  finalMaxScore: number;
  total: number | null;
  average: number;
  halfYearlyLetter?: string;
  finalLetter?: string;
  totalLetter?: string;
  status: string;
  statusDisplay: string;
  rank: number;
  halfYearlyExamDetails?: ExamDetails | null;
  finalExamDetails?: ExamDetails | null;
}

export interface ExamDetails {
  id: number;
  name: string;
  date: string;
  maxScore: number;
  type: string;
}

export interface Term {
  id: number | string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface TermGrades {
  term: Term;
  subjects: SubjectGrade[];
  overallAverage: number;
  overallLetter: string;
  overallStatus: string;
  classRank: number;
  totalStudents: number;
  attendanceRate: number;
  passedCount?: number;
  failedCount?: number;
  hasPendingExams?: boolean;
}

export interface GradesResponse {
  terms: Term[];
  currentTermGrades: TermGrades | null;
  allTermsGrades: Record<string, TermGrades>;
}

// ---------- Library ----------
export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  categoryId: number;
  subject: string;
  grade?: number | null;
  pages: number;
  fileSize: string;
  fileFormat: string;
  fileUrl?: string;
  isFavorite: boolean;
  lastRead?: {
    page: number;
    date: string;
  } | null;
  readingProgress?: number;
}

export interface BookCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface LibraryData {
  books: Book[];
  categories: BookCategory[];
  recentReads: Book[];
  favorites: Book[];
  grades: number[];
}

// ---------- Assignments ----------
export interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  maxGrade: number;
  status: string;
  Class?: { id: number; name: string; section?: string };
  Teacher?: { User: { fullName: string; profileImage?: string } };
  submission?: {
    id: number;
    status: string;
    submittedAt?: string;
    grade?: number;
    feedback?: string;
    fileUrl?: string;
  } | null;
}

export interface AssignmentStats {
  total: number;
  pending: number;
  submitted: number;
  graded: number;
  late: number;
}

// ---------- Courses & Lessons ----------
export interface StudentSubject {
  id: number;
  name: string;
  description?: string;
  teacherName?: string;
  teacherImage?: string | null;
  progress?: number;
  average?: number;
}

export interface CourseLesson {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isFree: boolean;
  thumbnail?: string;
  isCompleted: boolean;
  lastPosition: number;
}

export interface LessonDetail {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isFree: boolean;
  thumbnail?: string;
  courseId: number;
  courseTitle: string;
  teacherName: string;
  teacherImage?: string;
  attachments: {
    id: number;
    title: string;
    type: string;
    url: string;
    fileSize?: string;
  }[];
  comments: {
    id: number;
    content: string;
    createdAt: string;
    User: { fullName: string; profileImage?: string };
  }[];
  quizzes: {
    id: number;
    question: string;
    options: unknown;
    correctAnswer: number;
    explanation?: string;
  }[];
  isCompleted: boolean;
  lastPosition: number;
  prevLesson: { id: number; title: string; order: number } | null;
  nextLesson: { id: number; title: string; order: number } | null;
  courseProgress: number;
}

// ---------- Evaluation ----------
export interface StudentEvaluation {
  academic: {
    subjects: {
      subject: string;
      average: number;
      letter: string;
      status: string;
    }[];
    overallAverage: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  behavior?: {
    respect: number;
    discipline: number;
    responsibility: number;
    teamwork: number;
    overall: number;
  };
  growth?: {
    improvementTracking: {
      month: string;
      score: number;
    }[];
    goals: string[];
  };
}