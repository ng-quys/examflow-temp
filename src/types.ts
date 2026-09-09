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

export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze';

export interface CLOItem {
  id: string;
  code: string;
  description: string;
  bloomLevel: BloomLevel;
  weightPercent: number;
}

export interface UploadedDocFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'pptx' | 'other';
  uploadDate: string;
  status: 'ready' | 'processing';
}

export type WizardStepId = 1 | 2 | 3 | 4 | 5;

export interface ExamWizardData {
  // Step 1: Knowledge & CLO
  subjectId: string;
  semesterId: string;
  examTitle: string;
  examCode: string;
  durationMinutes: number;
  totalQuestions: number;
  uploadedFiles: UploadedDocFile[];
  clos: CLOItem[];
  saveCLOToDatabase: boolean;
  // Step 2: Matrix
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  // Step 3: Questions
  // Step 4: Customization
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  antiCheatingMode: boolean;
  scoringScale: string;
}
