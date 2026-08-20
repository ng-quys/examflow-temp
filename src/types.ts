export type UserRole = 'faculty' | 'student';

export type DashboardNavTab =
  | 'overview'
  | 'question-bank'
  | 'ai-generator'
  | 'exams'
  | 'exam-sessions'
  | 'classes'
  | 'students'
  | 'analytics'
  | 'settings';

export interface SlideData {
  id: number;
  tag: string;
  title: string;
  description: string;
  stats?: {
    label: string;
    value: string;
  }[];
  visualType: 'question-bank' | 'ai-generator' | 'exam-analytics';
}

export interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
}

export interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export type ExamStatus = 'completed' | 'upcoming' | 'ongoing';

export interface ExamRecord {
  id: string;
  title: string;
  subject: string;
  studentCount: number;
  avgScore: number | null;
  status: ExamStatus;
  examDate: string;
  durationMinutes: number;
  questionCount: number;
  roomCode?: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  changeText: string;
  changeType: 'positive' | 'neutral' | 'info';
  iconName: 'database' | 'file-text' | 'clock' | 'users';
}

export interface ScoreDistributionItem {
  range: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface PerformancePoint {
  month: string;
  avgScore: number;
  passRate: number;
  totalExams: number;
}
