import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  Copy,
  Check,
  QrCode,
  Users,
  Clock,
  ExternalLink,
  Lock,
  Unlock,
  Download,
  FileSpreadsheet,
  X,
  AlertCircle,
  Eye,
  CheckCircle2,
  Share2,
  FileText,
  Sliders,
  ShieldCheck,
  Camera,
  Monitor,
  AlertTriangle,
  Shuffle,
  Key,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  CheckSquare,
  Calendar,
  Hash,
  HelpCircle,
  Info,
} from 'lucide-react';
import { Course, ExamRecord } from '../../../types';
import { RECENT_EXAMS_DATA } from '../../../data/mockDashboardData';

export interface ExamSession {
  id: string;
  code: string;
  title: string;
  courseCode: string;
  courseName: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'upcoming' | 'completed';
  submissionCount: number;
  isOpenForSubmissions: boolean;
  shuffleQuestions: boolean;
  instantScore: boolean;
  submissions: StudentSubmission[];
  // Extended fields for exam linking, configuration & proctoring
  examId?: string;
  examTitle?: string;
  variantDistribution?: 'random' | 'fixed';
  fixedVariantCode?: string;
  shuffleOptions?: boolean;
  allowReviewAnswers?: boolean;
  showCountdownTimer?: boolean;
  showExplanationAfterExam?: boolean;
  requirePin?: boolean;
  pinCode?: string;
  maxAttempts?: number;
  fullScreenEnforced?: boolean;
  warnOnTabSwitch?: boolean;
  maxTabSwitches?: number;
  webcamSnapshot?: boolean;
  blockCopyPaste?: boolean;
  autoSubmitOnTimeout?: boolean;
}

export interface StudentSubmission {
  id: string;
  fullName: string;
  studentId: string;
  submittedAt: string;
  durationSpentMinutes: number;
  score: number;
  maxScore: number;
  status: 'graded' | 'pending';
}

const INITIAL_SESSIONS: ExamSession[] = [
  {
    id: 'session-1',
    code: 'AI-MIDTERM-01',
    title: 'Kiểm tra giữa kỳ - Cấu trúc dữ liệu & Giải thuật',
    courseCode: 'CS201',
    courseName: 'Cấu trúc dữ liệu & Giải thuật',
    durationMinutes: 60,
    startTime: '10:00 12/03/2026',
    endTime: '12:00 12/03/2026',
    status: 'active',
    submissionCount: 65,
    isOpenForSubmissions: true,
    shuffleQuestions: true,
    instantScore: true,
    examTitle: 'Cấu trúc dữ liệu & Giải thuật — Giữa kỳ',
    variantDistribution: 'random',
    fullScreenEnforced: true,
    warnOnTabSwitch: true,
    requirePin: false,
    submissions: [
      {
        id: 'sub-1',
        fullName: 'Nguyễn Văn An',
        studentId: 'B21DCCN045',
        submittedAt: '10:48 12/03/2026',
        durationSpentMinutes: 48,
        score: 8.5,
        maxScore: 10,
        status: 'graded',
      },
      {
        id: 'sub-2',
        fullName: 'Trần Thị Thảo Mai',
        studentId: 'B21DCCN120',
        submittedAt: '10:52 12/03/2026',
        durationSpentMinutes: 52,
        score: 9.2,
        maxScore: 10,
        status: 'graded',
      },
      {
        id: 'sub-3',
        fullName: 'Lê Hoàng Nam',
        studentId: 'B22DCCN540',
        submittedAt: '10:40 12/03/2026',
        durationSpentMinutes: 40,
        score: 7.8,
        maxScore: 10,
        status: 'graded',
      },
      {
        id: 'sub-4',
        fullName: 'Phạm Quỳnh Nga',
        studentId: 'B21DCCN389',
        submittedAt: '10:55 12/03/2026',
        durationSpentMinutes: 55,
        score: 8.8,
        maxScore: 10,
        status: 'graded',
      },
      {
        id: 'sub-5',
        fullName: 'Đỗ Minh Quân',
        studentId: 'B22DCCN102',
        submittedAt: '10:58 12/03/2026',
        durationSpentMinutes: 58,
        score: 6.5,
        maxScore: 10,
        status: 'graded',
      },
    ],
  },
  {
    id: 'session-2',
    code: 'WEB-QUIZ-02',
    title: 'Trắc nghiệm tuần 6 - Lập trình Web nâng cao',
    courseCode: 'INT310',
    courseName: 'Lập trình Web nâng cao',
    durationMinutes: 30,
    startTime: '08:00 12/03/2026',
    endTime: '23:59 12/03/2026',
    status: 'active',
    submissionCount: 58,
    isOpenForSubmissions: true,
    shuffleQuestions: true,
    instantScore: true,
    submissions: [
      {
        id: 'sub-21',
        fullName: 'Vũ Đức Thịnh',
        studentId: 'B22DCCN711',
        submittedAt: '14:22 12/03/2026',
        durationSpentMinutes: 24,
        score: 9.0,
        maxScore: 10,
        status: 'graded',
      },
      {
        id: 'sub-22',
        fullName: 'Ngô Thu Hà',
        studentId: 'B21DCCN412',
        submittedAt: '15:10 12/03/2026',
        durationSpentMinutes: 28,
        score: 8.0,
        maxScore: 10,
        status: 'graded',
      },
    ],
  },
  {
    id: 'session-3',
    code: 'DB-QUIZ-15M',
    title: 'Kiểm tra 15 phút - Hệ quản trị Cơ sở dữ liệu',
    courseCode: 'IT205',
    courseName: 'Cơ sở dữ liệu',
    durationMinutes: 15,
    startTime: '09:00 11/03/2026',
    endTime: '09:30 11/03/2026',
    status: 'completed',
    submissionCount: 85,
    isOpenForSubmissions: false,
    shuffleQuestions: true,
    instantScore: false,
    submissions: [],
  },
  {
    id: 'session-4',
    code: 'NET-FINAL-TEST',
    title: 'Thi thử kết thúc học phần - Mạng máy tính',
    courseCode: 'NET101',
    courseName: 'Mạng máy tính',
    durationMinutes: 45,
    startTime: '08:00 13/03/2026',
    endTime: '11:00 13/03/2026',
    status: 'upcoming',
    submissionCount: 0,
    isOpenForSubmissions: false,
    shuffleQuestions: true,
    instantScore: true,
    submissions: [],
  },
];

interface ExamSessionsPageProps {
  courses: Course[];
  exams?: ExamRecord[];
  initialExamTitle?: string | null;
  onClearInitialExam?: () => void;
  onShowToast: (msg: string) => void;
}

export const ExamSessionsPage: React.FC<ExamSessionsPageProps> = ({
  courses,
  exams,
  initialExamTitle,
  onClearInitialExam,
  onShowToast,
}) => {
  const availableExams = exams && exams.length > 0 ? exams : RECENT_EXAMS_DATA;

  const [sessions, setSessions] = useState<ExamSession[]>(INITIAL_SESSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Selected session for viewing submissions
  const [activeSubmissionsSession, setActiveSubmissionsSession] = useState<ExamSession | null>(null);
  const [submissionSearch, setSubmissionSearch] = useState('');

  // QR Modal
  const [qrModalSession, setQrModalSession] = useState<ExamSession | null>(null);

  // Create Session Modal & Tabs: 'select-exam' | 'exam-settings' | 'exam-process'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'select-exam' | 'exam-settings' | 'exam-process'>('select-exam');

  // Tab 1: Chọn đề thi
  const [selectedExamId, setSelectedExamId] = useState<string>(availableExams[0]?.id || 'custom');
  const [newTitle, setNewTitle] = useState(
    availableExams[0] ? `Ca thi: ${availableExams[0].title}` : 'Kiểm tra giữa kỳ'
  );
  const [newCourseCode, setNewCourseCode] = useState(courses[0]?.code || 'CS201');
  const [variantDistribution, setVariantDistribution] = useState<'random' | 'fixed'>('random');
  const [fixedVariantCode, setFixedVariantCode] = useState<string>('101');

  // Tab 2: Cài đặt đề
  const [newDuration, setNewDuration] = useState(availableExams[0]?.durationMinutes || 45);
  const [examDate, setExamDate] = useState('14/09/2026');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('11:30');
  const [newShuffle, setNewShuffle] = useState(true);
  const [newShuffleOptions, setNewShuffleOptions] = useState(true);
  const [allowReviewAnswers, setAllowReviewAnswers] = useState(true);
  const [showCountdownTimer, setShowCountdownTimer] = useState(true);
  const [newInstantScore, setNewInstantScore] = useState(true);
  const [showExplanationAfterExam, setShowExplanationAfterExam] = useState(true);

  // Tab 3: Quá trình thi & Giám sát
  const [requirePin, setRequirePin] = useState(false);
  const [pinCode, setPinCode] = useState('6868');
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [fullScreenEnforced, setFullScreenEnforced] = useState(true);
  const [warnOnTabSwitch, setWarnOnTabSwitch] = useState(true);
  const [maxTabSwitches, setMaxTabSwitches] = useState<number>(3);
  const [webcamSnapshot, setWebcamSnapshot] = useState(false);
  const [blockCopyPaste, setBlockCopyPaste] = useState(true);
  const [autoSubmitOnTimeout, setAutoSubmitOnTimeout] = useState(true);

  // Handler when selecting an exam
  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    if (examId === 'custom') {
      return;
    }
    const target = availableExams.find((e) => e.id === examId);
    if (target) {
      setNewTitle(`Ca thi: ${target.title}`);
      if (target.durationMinutes) {
        setNewDuration(target.durationMinutes);
      }
      const matchedCourse = courses.find(
        (c) =>
          c.name.toLowerCase().includes(target.subject.toLowerCase()) ||
          target.subject.toLowerCase().includes(c.name.toLowerCase())
      );
      if (matchedCourse) {
        setNewCourseCode(matchedCourse.code);
      }
    }
  };

  // Sync if opened with a preset exam title from Exam Management
  useEffect(() => {
    if (initialExamTitle) {
      const matched = availableExams.find(
        (e) => e.title.toLowerCase() === initialExamTitle.toLowerCase()
      );
      if (matched) {
        handleSelectExam(matched.id);
      } else {
        setSelectedExamId('custom');
        setNewTitle(`Ca thi: ${initialExamTitle}`);
      }
      setIsCreateModalOpen(true);
      setModalTab('select-exam');
      if (onClearInitialExam) {
        onClearInitialExam();
      }
    }
  }, [initialExamTitle]);

  const getJoinUrl = (code: string) => `${window.location.origin}/join/${code}`;

  const handleCopy = (code: string) => {
    const url = getJoinUrl(code);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedCode(code);
    onShowToast(`Đã sao chép link ca thi: ${url}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggleOpen = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const newState = !s.isOpenForSubmissions;
          onShowToast(newState ? `Đã mở nhận bài cho ca thi ${s.code}` : `Đã khóa nhận bài ca thi ${s.code}`);
          return { ...s, isOpenForSubmissions: newState };
        }
        return s;
      })
    );
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onShowToast('Vui lòng nhập tên ca thi');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `EXAM-${randomNum}`;
    const courseObj = courses.find((c) => c.code === newCourseCode) || {
      name: 'Môn học mới',
      code: newCourseCode,
    };

    const selectedExamObj = availableExams.find((e) => e.id === selectedExamId);

    const newSession: ExamSession = {
      id: `session-${Date.now()}`,
      code,
      title: newTitle.trim(),
      courseCode: newCourseCode,
      courseName: courseObj.name,
      durationMinutes: newDuration,
      startTime: `${startTime} ${examDate}`,
      endTime: `${endTime} ${examDate}`,
      status: 'active',
      submissionCount: 0,
      isOpenForSubmissions: true,
      shuffleQuestions: newShuffle,
      instantScore: newInstantScore,
      submissions: [],
      examId: selectedExamId !== 'custom' ? selectedExamId : undefined,
      examTitle: selectedExamObj ? selectedExamObj.title : newTitle.trim(),
      variantDistribution,
      fixedVariantCode: variantDistribution === 'fixed' ? fixedVariantCode : undefined,
      shuffleOptions: newShuffleOptions,
      allowReviewAnswers,
      showCountdownTimer,
      showExplanationAfterExam,
      requirePin,
      pinCode: requirePin ? pinCode : undefined,
      maxAttempts,
      fullScreenEnforced,
      warnOnTabSwitch,
      maxTabSwitches,
      webcamSnapshot,
      blockCopyPaste,
      autoSubmitOnTimeout,
    };

    setSessions([newSession, ...sessions]);
    setIsCreateModalOpen(false);
    onShowToast(`Đã tạo thành công ca thi mới: ${code}`);
  };

  const filteredSessions = sessions.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
            Ca thi / Đợt kiểm tra trực tuyến
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổ chức ca thi độc lập qua Link & Mã ca thi. Thí sinh chỉ cần truy cập link và điền Họ tên + MSSV để nộp bài.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer shrink-0"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="w-4 h-4" />
          <span>Tạo ca thi mới</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong className="font-semibold">Mô hình ca thi không phân lớp:</strong> Mỗi ca thi có một mã định danh duy nhất (VD: <code className="bg-white/80 px-1.5 py-0.5 rounded border border-emerald-300 font-mono text-emerald-800">AI-MIDTERM-01</code>) và đường link công khai. Giảng viên chỉ cần gửi link cho thí sinh; kết quả nộp bài sẽ tự động tổng hợp danh sách Họ tên và MSSV.
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài, mã ca thi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-md text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Tất cả ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Đang diễn ra ({sessions.filter((s) => s.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'upcoming'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Sắp mở ({sessions.filter((s) => s.status === 'upcoming').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Đã đóng ({sessions.filter((s) => s.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
          >
            <div>
              {/* Header: Title & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 tracking-wider">
                      {session.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Học phần: {session.courseCode}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                    {session.title}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 border ${
                    session.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : session.status === 'upcoming'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {session.status === 'active'
                    ? 'Đang diễn ra'
                    : session.status === 'upcoming'
                    ? 'Sắp mở'
                    : 'Đã hoàn thành'}
                </span>
              </div>

              {/* Linked Exam info */}
              {session.examTitle && (
                <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold truncate">{session.examTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {session.variantDistribution === 'fixed'
                      ? `Mã ${session.fixedVariantCode || '101'}`
                      : 'Đề ngẫu nhiên'}
                  </span>
                </div>
              )}

              {/* Proctoring & Security Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                {session.shuffleQuestions && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                    <Shuffle className="w-2.5 h-2.5" /> Xáo câu
                  </span>
                )}
                {session.fullScreenEnforced && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                    <Monitor className="w-2.5 h-2.5" /> Toàn màn hình
                  </span>
                )}
                {session.warnOnTabSwitch && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                    <ShieldCheck className="w-2.5 h-2.5" /> Chống chuyển tab
                  </span>
                )}
                {session.requirePin && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono font-medium">
                    <Key className="w-2.5 h-2.5" /> PIN: {session.pinCode}
                  </span>
                )}
              </div>

              {/* Join Link Bar */}
              <div className="mt-3 p-2 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 truncate text-slate-600 font-mono text-[11px]">
                  <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">/join/{session.code}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(session.code)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Sao chép link gửi cho thí sinh"
                  >
                    {copiedCode === session.code ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Chép link</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrModalSession(session)}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    title="Hiển thị mã QR chiếu lên máy chiếu"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Meta stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời lượng: <strong>{session.durationMinutes} phút</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Đã nộp:{' '}
                    <strong className="text-emerald-700 font-semibold">
                      {session.submissionCount} lượt
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => handleToggleOpen(session.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                  session.isOpenForSubmissions
                    ? 'text-emerald-700 hover:bg-emerald-50'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title={session.isOpenForSubmissions ? 'Đang mở nhận bài' : 'Đang khóa nộp bài'}
              >
                {session.isOpenForSubmissions ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Đang nhận bài</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Đã khóa</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveSubmissionsSession(session)}
                className="inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer"
                style={{ color: 'var(--primary)' }}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem bài nộp ({session.submissionCount})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-6">
          <CalendarClock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">Không tìm thấy ca thi nào</p>
          <p className="text-xs text-slate-500 mt-1">Thử đổi từ khóa tìm kiếm hoặc tạo ca thi mới.</p>
        </div>
      )}

      {/* MODAL: SUBMISSIONS LIST (Xem danh sách thí sinh nộp bài) */}
      {activeSubmissionsSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    {activeSubmissionsSession.code}
                  </span>
                  <span className="text-xs text-slate-500">
                    {activeSubmissionsSession.courseCode}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Danh sách bài nộp: {activeSubmissionsSession.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubmissionsSession(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500">Tổng lượt nộp</span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {activeSubmissionsSession.submissionCount}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500">Điểm trung bình</span>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    8.2 / 10
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500">Tỷ lệ đạt (&ge; 5.0)</span>
                  <div className="text-lg font-bold text-blue-700 mt-0.5">
                    94.8%
                  </div>
                </div>
              </div>

              {/* Search & Export */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    placeholder="Tìm theo Họ tên hoặc MSSV..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onShowToast(`Đã xuất kết quả ca thi ${activeSubmissionsSession.code} ra tệp Excel (.xlsx)`)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất bảng điểm (Excel)</span>
                </button>
              </div>

              {/* Submissions Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Họ và tên thí sinh</th>
                      <th className="py-2.5 px-3">MSSV</th>
                      <th className="py-2.5 px-3">Thời gian nộp</th>
                      <th className="py-2.5 px-3">Thời lượng làm</th>
                      <th className="py-2.5 px-3 text-right">Điểm số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeSubmissionsSession.submissions.length > 0 ? (
                      activeSubmissionsSession.submissions
                        .filter(
                          (sub) =>
                            sub.fullName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
                            sub.studentId.toLowerCase().includes(submissionSearch.toLowerCase())
                        )
                        .map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {sub.fullName}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                              {sub.studentId}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{sub.submittedAt}</td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {sub.durationSpentMinutes} phút
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                              {sub.score} / {sub.maxScore}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          Chưa có thí sinh nào nộp bài cho ca thi này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 flex justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveSubmissionsSession(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE ACCESS */}
      {qrModalSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Quét mã tham gia ca thi</h3>
              <button
                type="button"
                onClick={() => setQrModalSession(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Visual */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block">
              <div className="w-48 h-48 bg-white border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center relative">
                {/* SVG QR Code Pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  <rect x="0" y="0" width="30" height="30" rx="3" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" />

                  <rect x="70" y="0" width="30" height="30" rx="3" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" />

                  <rect x="0" y="70" width="30" height="30" rx="3" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" />

                  <rect x="40" y="10" width="10" height="10" />
                  <rect x="55" y="20" width="10" height="10" />
                  <rect x="40" y="40" width="20" height="20" rx="2" />
                  <rect x="70" y="45" width="15" height="10" />
                  <rect x="45" y="70" width="10" height="20" />
                  <rect x="70" y="75" width="20" height="15" />
                </svg>
              </div>
            </div>

            {/* Code */}
            <div>
              <div className="text-xs text-slate-500 mb-1">Mã ca thi</div>
              <div className="font-mono text-xl font-bold text-slate-900 tracking-wider">
                {qrModalSession.code}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Thí sinh quét mã hoặc vào link, điền <strong>Họ tên</strong> và <strong>MSSV</strong> để làm bài.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(qrModalSession.code)}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white cursor-pointer hover:opacity-95"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Sao chép đường link tham gia
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SESSION WITH 3 TABS: CHỌN ĐỀ THI, CÀI ĐẶT ĐỀ, QUÁ TRÌNH THI */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    Tạo ca thi trực tuyến mới
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn đề thi, cấu hình tham số làm bài và thiết lập cơ chế giám sát thí sinh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50/90 px-4 sm:px-6 pt-2.5 gap-1 shrink-0 overflow-x-auto">
              {/* Tab 1: Chọn đề thi */}
              <button
                type="button"
                onClick={() => setModalTab('select-exam')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === 'select-exam'
                    ? 'border-[var(--primary)] text-[var(--primary)] bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    modalTab === 'select-exam'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  1
                </span>
                <FileText className="w-3.5 h-3.5" />
                <span>1. Chọn đề thi</span>
              </button>

              {/* Tab 2: Cài đặt đề */}
              <button
                type="button"
                onClick={() => setModalTab('exam-settings')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === 'exam-settings'
                    ? 'border-[var(--primary)] text-[var(--primary)] bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    modalTab === 'exam-settings'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </span>
                <Sliders className="w-3.5 h-3.5" />
                <span>2. Cài đặt đề</span>
              </button>

              {/* Tab 3: Quá trình thi */}
              <button
                type="button"
                onClick={() => setModalTab('exam-process')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === 'exam-process'
                    ? 'border-[var(--primary)] text-[var(--primary)] bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    modalTab === 'exam-process'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3
                </span>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3. Quá trình thi</span>
              </button>
            </div>

            {/* Modal Body with Form */}
            <form onSubmit={handleCreateSession} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* ================= TAB 1: CHỌN ĐỀ THI ================= */}
                {modalTab === 'select-exam' && (
                  <div className="space-y-4">
                    {/* Identification */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Tên ca thi / Bài kiểm tra <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="VD: Kiểm tra giữa kỳ - Ca sáng 01..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[var(--primary)] shadow-2xs"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Học phần áp dụng
                        </label>
                        <select
                          value={newCourseCode}
                          onChange={(e) => setNewCourseCode(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[var(--primary)] shadow-2xs cursor-pointer"
                        >
                          {courses.map((c) => (
                            <option key={c.id} value={c.code}>
                              {c.code} - {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Mã định danh ca thi (Hệ thống cấp)
                        </label>
                        <div className="px-3 py-2 text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between">
                          <span>EXAM-****</span>
                          <span className="text-[11px] font-sans font-normal text-slate-400">
                            Tự động cấp mã duy nhất
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Choose Exam from Bank */}
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Đề thi áp dụng từ Ngân hàng đề <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedExamId}
                        onChange={(e) => handleSelectExam(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[var(--primary)] shadow-2xs cursor-pointer font-medium"
                      >
                        {availableExams.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            [{ex.id}] {ex.title} — {ex.subject} ({ex.questionCount} câu trắc nghiệm)
                          </option>
                        ))}
                        <option value="custom">+ Đề thi trắc nghiệm độc lập (Tự chọn câu hỏi)</option>
                      </select>
                    </div>

                    {/* Selected Exam Preview Card */}
                    {selectedExamId !== 'custom' && (() => {
                      const ex = availableExams.find((e) => e.id === selectedExamId);
                      if (!ex) return null;
                      return (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs">{ex.title}</h4>
                                <span className="text-[11px] text-slate-500">
                                  Học phần: {ex.subject} • Mã phòng đề xuất: {ex.roomCode || ex.id}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đã thẩm định OBE
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-200/80">
                            <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                              <span className="text-slate-400 block text-[10px]">Số lượng câu:</span>
                              <strong className="text-slate-800">{ex.questionCount} câu</strong>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                              <span className="text-slate-400 block text-[10px]">Thang điểm:</span>
                              <strong className="text-slate-800">10.0 điểm</strong>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                              <span className="text-slate-400 block text-[10px]">Thời lượng chuẩn:</span>
                              <strong className="text-slate-800">{ex.durationMinutes} phút</strong>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                              <span className="text-slate-400 block text-[10px]">Mã hoán vị:</span>
                              <strong className="text-slate-800 font-mono">101, 102, 103, 104</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                            <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>Mã đề hoán vị sẵn sàng:</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-[10px]">
                              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">101</span>
                              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">102</span>
                              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">103</span>
                              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">104</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Permutation variant distribution mode */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Cơ chế phân bổ mã đề hoán vị cho thí sinh:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                            variantDistribution === 'random'
                              ? 'bg-indigo-50/50 border-[var(--primary)] text-slate-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="variantDistribution"
                            checked={variantDistribution === 'random'}
                            onChange={() => setVariantDistribution('random')}
                            className="mt-0.5 text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-bold">Tự động phân bổ ngẫu nhiên</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Mỗi thí sinh vào thi nhận ngẫu nhiên 1 trong 4 mã đề (101-104) để chống nhìn bài tối đa.
                            </div>
                          </div>
                        </label>

                        <label
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                            variantDistribution === 'fixed'
                              ? 'bg-indigo-50/50 border-[var(--primary)] text-slate-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="variantDistribution"
                            checked={variantDistribution === 'fixed'}
                            onChange={() => setVariantDistribution('fixed')}
                            className="mt-0.5 text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div className="w-full">
                            <div className="text-xs font-bold">Cố định 1 mã đề chung</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 mb-1.5">
                              Tất cả thí sinh làm chung 1 mã đề:
                            </div>
                            <select
                              value={fixedVariantCode}
                              onChange={(e) => setFixedVariantCode(e.target.value)}
                              disabled={variantDistribution !== 'fixed'}
                              className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 disabled:opacity-50"
                            >
                              <option value="101">Mã đề 101</option>
                              <option value="102">Mã đề 102</option>
                              <option value="103">Mã đề 103</option>
                              <option value="104">Mã đề 104</option>
                            </select>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 2: CÀI ĐẶT ĐỀ ================= */}
                {modalTab === 'exam-settings' && (
                  <div className="space-y-4">
                    {/* Time & Duration */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span>Thời gian & Thời lượng làm bài</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Thời lượng làm bài (phút) <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={5}
                              max={300}
                              value={newDuration}
                              onChange={(e) => setNewDuration(Number(e.target.value))}
                              className="w-24 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[var(--primary)]"
                              required
                            />
                            <div className="flex items-center gap-1 flex-wrap">
                              {[15, 30, 45, 60, 90].map((d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => setNewDuration(d)}
                                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                                    newDuration === d
                                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {d}&apos;
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Khung giờ mở phòng thi
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              placeholder="08:00"
                              className="w-20 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 text-center font-mono"
                            />
                            <span className="text-xs text-slate-400">đến</span>
                            <input
                              type="text"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              placeholder="11:30"
                              className="w-20 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 text-center font-mono"
                            />
                            <input
                              type="text"
                              value={examDate}
                              onChange={(e) => setExamDate(e.target.value)}
                              placeholder="14/09/2026"
                              className="flex-1 min-w-[90px] px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 text-center font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question Display & Shuffling */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Shuffle className="w-4 h-4 text-slate-600" />
                        <span>Hiển thị & Xáo trộn đề thi</span>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newShuffle}
                            onChange={(e) => setNewShuffle(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Xáo trộn thứ tự câu hỏi (Shuffle Questions)
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Thứ tự các câu hỏi sẽ đảo ngẫu nhiên để các thí sinh ngồi gần nhau không có chung thứ tự.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newShuffleOptions}
                            onChange={(e) => setNewShuffleOptions(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Xáo trộn thứ tự các phương án (A, B, C, D)
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Đổi vị trí các đáp án lựa chọn trong từng câu hỏi.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowReviewAnswers}
                            onChange={(e) => setAllowReviewAnswers(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Cho phép xem lại và thay đổi đáp án trước khi nộp bài
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Thí sinh có thể chuyển qua lại giữa các câu hỏi và gắn cờ câu hỏi khó để kiểm tra lại.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showCountdownTimer}
                            onChange={(e) => setShowCountdownTimer(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Hiển thị đồng hồ đếm ngược thời gian làm bài
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Hiển thị đồng hồ trực quan ở góc màn hình và cảnh báo khi thời gian còn dưới 5 phút.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Grading & Result Display */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-200">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-slate-600" />
                        <span>Chế độ chấm điểm & Công bố kết quả</span>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newInstantScore}
                            onChange={(e) => setNewInstantScore(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Hiển thị điểm số ngay khi thí sinh nộp bài
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Hệ thống tự động chấm trắc nghiệm và thông báo điểm ngay sau khi nộp thành công.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showExplanationAfterExam}
                            onChange={(e) => setShowExplanationAfterExam(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Cho phép xem lại bài làm & giải thích sau khi ca thi đóng
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Chỉ cho phép xem đáp án và giải thích chi tiết sau khi kết thúc ca thi để tránh lộ đề.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 3: QUÁ TRÌNH THI ================= */}
                {modalTab === 'exam-process' && (
                  <div className="space-y-4">
                    {/* Identification & Access */}
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Quy định xác thực danh tính thí sinh vào phòng</span>
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        Thí sinh tham gia trực tiếp qua Link hoặc quét mã QR. Bắt buộc điền đúng <strong>Họ tên</strong> và <strong>Mã số sinh viên (MSSV)</strong> trước khi vào làm bài.
                      </p>

                      <div className="pt-2 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requirePin}
                            onChange={(e) => setRequirePin(e.target.checked)}
                            className="rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <span>Bật mã PIN bảo vệ phòng thi (Access PIN)</span>
                        </label>

                        {requirePin && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-600 font-medium">Mã PIN:</span>
                            <input
                              type="text"
                              value={pinCode}
                              onChange={(e) => setPinCode(e.target.value)}
                              placeholder="6868"
                              className="w-24 px-2 py-1 text-xs bg-white border border-emerald-300 rounded font-mono font-bold text-emerald-900 text-center tracking-widest"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Proctoring & Anti-Cheat Controls */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Kiểm soát & Giám sát chống gian lận trong lúc làm bài</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Cơ chế AI Proctoring
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* 1. Fullscreen */}
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fullScreenEnforced}
                            onChange={(e) => setFullScreenEnforced(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="text-xs font-bold text-slate-900">
                                Bắt buộc chế độ Toàn màn hình (Enforce Fullscreen)
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Tự động chuyển sang chế độ toàn màn hình khi bắt đầu làm bài và ghi nhận cảnh báo nếu thoát ra.
                            </span>
                          </div>
                        </label>

                        {/* 2. Tab Switch Warning */}
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={warnOnTabSwitch}
                            onChange={(e) => setWarnOnTabSwitch(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-xs font-bold text-slate-900">
                                  Cảnh báo & Giới hạn chuyển tab trình duyệt
                                </span>
                              </div>
                              {warnOnTabSwitch && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                                  Tối đa {maxTabSwitches} lần
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Hiển thị cảnh báo vi phạm khi chuyển tab hoặc mở ứng dụng khác. Tự động nộp bài nếu vi phạm quá 3 lần.
                            </span>
                          </div>
                        </label>

                        {/* 3. Anti-copy & Right-click */}
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={blockCopyPaste}
                            onChange={(e) => setBlockCopyPaste(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 text-slate-700" />
                              <span className="text-xs font-bold text-slate-900">
                                Chặn sao chép (Block Copy/Paste & Chuột phải)
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Vô hiệu hóa tính năng bôi đen văn bản, click chuột phải và phím tắt tìm kiếm thông tin trên mạng.
                            </span>
                          </div>
                        </label>

                        {/* 4. Webcam Snapshot */}
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={webcamSnapshot}
                            onChange={(e) => setWebcamSnapshot(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Camera className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-xs font-bold text-slate-900">
                                Chụp ảnh ngẫu nhiên qua Webcam (AI Snapshot)
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Tự động chụp ảnh định kỳ 3-5 lần ngẫu nhiên trong bài thi để lưu hồ sơ xác thực khuôn mặt thí sinh.
                            </span>
                          </div>
                        </label>

                        {/* 5. Auto Submit */}
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoSubmitOnTimeout}
                            onChange={(e) => setAutoSubmitOnTimeout(e.target.checked)}
                            className="mt-0.5 rounded text-[var(--primary)] focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-xs font-bold text-slate-900">
                                Tự động thu bài khi hết giờ (Auto-submit on Timeout)
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Khi thời gian đếm ngược kết thúc, bài làm sẽ tự động được đóng gói và nộp về máy chủ ngay lập tức.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with Stepper Controls */}
              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {modalTab === 'select-exam' && 'Bước 1 / 3: Chọn đề thi'}
                    {modalTab === 'exam-settings' && 'Bước 2 / 3: Cài đặt đề'}
                    {modalTab === 'exam-process' && 'Bước 3 / 3: Quá trình thi'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>

                  {/* Previous step */}
                  {modalTab === 'exam-settings' && (
                    <button
                      type="button"
                      onClick={() => setModalTab('select-exam')}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Quay lại</span>
                    </button>
                  )}

                  {modalTab === 'exam-process' && (
                    <button
                      type="button"
                      onClick={() => setModalTab('exam-settings')}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Quay lại</span>
                    </button>
                  )}

                  {/* Next step buttons */}
                  {modalTab === 'select-exam' && (
                    <button
                      type="button"
                      onClick={() => setModalTab('exam-settings')}
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <span>Tiếp: Cài đặt đề</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {modalTab === 'exam-settings' && (
                    <button
                      type="button"
                      onClick={() => setModalTab('exam-process')}
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <span>Tiếp: Quá trình thi</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Submit / Finish button */}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Khởi tạo & Lấy link ca thi</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
