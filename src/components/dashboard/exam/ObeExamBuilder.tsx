import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  RefreshCw,
  FileText,
  Download,
  Printer,
  Radio as RadioIcon,
  Copy,
  Check,
  Clock,
  Layers,
  ShieldCheck,
  Shuffle,
  BookOpen,
  X,
  Send,
  ExternalLink,
  Trash2,
  ChevronDown,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import {
  Course,
  CourseChapter,
  CourseCLO,
  QuestionItem,
  Bloom3Level,
  ExamRecord,
} from '../../../types';
import { BLOOM_3_CONFIG } from '../../../data/mockAcademicData';
import { exportExamToDocx } from '../../../utils/docxExport';

interface ObeExamBuilderProps {
  courses: Course[];
  chapters: CourseChapter[];
  clos: CourseCLO[];
  questions: QuestionItem[];
  onUpdateQuestions: React.Dispatch<React.SetStateAction<QuestionItem[]>>;
  onSaveExam: (newExam: ExamRecord) => void;
  onCancel: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToOnlineSession: (examTitle: string, roomCode: string) => void;
}

// Knowledge unit row in the matrix
interface MatrixRowConfig {
  rowId: string;
  chapterId: string;
  chapterName: string;
  topicId: string;
  topicName: string;
  cloId: string;
  cloCode: string;
  cloDesc: string;
  // Requested quantities per Bloom level
  reqRemember: number;
  reqUnderstand: number;
  reqApply: number;
}

// Track picked question with point
interface PickedQuestion {
  question: QuestionItem;
  points: number;
  bloom: Bloom3Level;
  cloCode: string;
  rowId: string;
}

// Stepper component for Bloom level quantities in matrix
const BloomQtyStepper: React.FC<{
  value: number;
  disabled: boolean;
  colorClass: string;
  badgeBg: string;
  onChange: (val: number) => void;
}> = ({ value, disabled, colorClass, badgeBg, onChange }) => {
  return (
    <div
      className={`inline-flex items-center rounded-lg border transition-all ${
        disabled
          ? 'bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed select-none'
          : `bg-white border-slate-200 hover:border-slate-300 shadow-2xs ${badgeBg}`
      }`}
    >
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-6 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-l-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
      >
        -
      </button>
      <input
        type="number"
        min={0}
        max={50}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className={`w-9 h-7 text-center text-xs font-black bg-transparent outline-none ${colorClass} ${
          disabled ? 'cursor-not-allowed' : ''
        }`}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="w-6 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-r-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
      >
        +
      </button>
    </div>
  );
};

export const ObeExamBuilder: React.FC<ObeExamBuilderProps> = ({
  courses,
  chapters,
  clos,
  questions,
  onUpdateQuestions,
  onSaveExam,
  onCancel,
  onShowToast,
  onNavigateToOnlineSession,
}) => {
  // 4 Steps: 1 -> 2 -> 3 -> 4
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1: GENERAL INFO
  const [examTitle, setExamTitle] = useState<string>(
    'Kiểm tra giữa kỳ - Học phần Trí tuệ nhân tạo'
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || 'course-ti01'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  // SCORING STRATEGY
  // 'equal' = Chia đều toàn đề (Thang 10 / Tổng số câu)
  // 'bloomWeight' = Tính điểm theo trọng số từng mức độ Bloom (Tổng 10 điểm)
  const [scoringStrategy, setScoringStrategy] = useState<'equal' | 'bloomWeight'>('equal');
  const [bloomWeights, setBloomWeights] = useState<{
    remember: number;
    understand: number;
    apply: number;
  }>({
    remember: 3.0,
    understand: 4.0,
    apply: 3.0,
  });

  // Current selected course entity
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseChapters = useMemo(
    () => chapters.filter((ch) => ch.courseId === selectedCourseId),
    [chapters, selectedCourseId]
  );
  const courseClos = useMemo(
    () => clos.filter((cl) => cl.courseId === selectedCourseId),
    [clos, selectedCourseId]
  );

  // Chapters actively included in the matrix
  interface MatrixChapterItem {
    id: string;
    code: string;
    name: string;
  }

  const [matrixChapters, setMatrixChapters] = useState<MatrixChapterItem[]>(() => {
    const initialCourseId = courses[0]?.id || 'course-ti01';
    const chaps = chapters.filter((ch) => ch.courseId === initialCourseId);
    if (chaps.length > 0) {
      return chaps.map((c) => ({ id: c.id, code: c.code, name: c.name }));
    }
    return [
      { id: 'chap-ti01-1', code: 'Chương 1', name: 'Giới thiệu AI & Tác tử' },
      { id: 'chap-ti01-2', code: 'Chương 2', name: 'Không gian trạng thái & Tìm kiếm' },
      { id: 'chap-ti01-3', code: 'Chương 3', name: 'Biểu diễn tri thức & Logic' },
    ];
  });

  const [activeClos, setActiveClos] = useState<CourseCLO[]>(() =>
    clos.filter((cl) => cl.courseId === (courses[0]?.id || 'course-ti01'))
  );

  // Confirmation Modal for Deleting Topic or Chapter
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    type: 'topic' | 'chapter';
    targetId: string;
    targetName: string;
  } | null>(null);

  // Modal: Add Chapter
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState<boolean>(false);
  const [selectedExistingChapterId, setSelectedExistingChapterId] = useState<string>('');
  const [newChapterCode, setNewChapterCode] = useState<string>('');
  const [newChapterName, setNewChapterName] = useState<string>('');

  // Modal: CLO Management
  const [isCloManageModalOpen, setIsCloManageModalOpen] = useState<boolean>(false);
  const [newCloCode, setNewCloCode] = useState<string>('');
  const [newCloDesc, setNewCloDesc] = useState<string>('');
  const [newCloBloom, setNewCloBloom] = useState<Bloom3Level>('remember');

  // Initialize Matrix Rows based on Course Chapters & Topics
  const [matrixRows, setMatrixRows] = useState<MatrixRowConfig[]>(() => {
    // Generate initial realistic rows for first course
    return [
      {
        rowId: 'row-1',
        chapterId: 'chap-ti01-1',
        chapterName: 'Chương 1: Giới thiệu AI & Tác tử',
        topicId: 'top-ti01-1-1',
        topicName: '1.1 Định nghĩa AI & Phân loại Agent',
        cloId: 'clo-ti01-1',
        cloCode: 'CLO 1.1',
        cloDesc: 'Trình bày các khái niệm cơ bản về AI và Agent',
        reqRemember: 2,
        reqUnderstand: 2,
        reqApply: 0,
      },
      {
        rowId: 'row-2',
        chapterId: 'chap-ti01-1',
        chapterName: 'Chương 1: Giới thiệu AI & Tác tử',
        topicId: 'top-ti01-1-2',
        topicName: '1.2 Môi trường tác tử & Kiến trúc PEAS',
        cloId: 'clo-ti01-2',
        cloCode: 'CLO 1.2',
        cloDesc: 'Phân tích môi trường tác tử và kiến trúc thông minh',
        reqRemember: 2,
        reqUnderstand: 2,
        reqApply: 1,
      },
      {
        rowId: 'row-3',
        chapterId: 'chap-ti01-2',
        chapterName: 'Chương 2: Không gian trạng thái & Tìm kiếm',
        topicId: 'top-ti01-2-1',
        topicName: '2.1 Tìm kiếm mù BFS & DFS',
        cloId: 'clo-ti01-3',
        cloCode: 'CLO 2.1',
        cloDesc: 'Áp dụng thuật toán tìm kiếm giải quyết bài toán',
        reqRemember: 2,
        reqUnderstand: 2,
        reqApply: 1,
      },
      {
        rowId: 'row-4',
        chapterId: 'chap-ti01-2',
        chapterName: 'Chương 2: Không gian trạng thái & Tìm kiếm',
        topicId: 'top-ti01-2-2',
        topicName: '2.2 Heuristic & Tìm kiếm A*',
        cloId: 'clo-ti01-3',
        cloCode: 'CLO 2.1',
        cloDesc: 'Áp dụng thuật toán tìm kiếm tối ưu',
        reqRemember: 1,
        reqUnderstand: 2,
        reqApply: 2,
      },
      {
        rowId: 'row-5',
        chapterId: 'chap-ti01-3',
        chapterName: 'Chương 3: Biểu diễn tri thức & Logic',
        topicId: 'top-ti01-3-1',
        topicName: '3.1 Logic mệnh đề & Bảng chân trị',
        cloId: 'clo-ti01-4',
        cloCode: 'CLO 2.2',
        cloDesc: 'Vận dụng mô hình suy diễn logic',
        reqRemember: 1,
        reqUnderstand: 1,
        reqApply: 1,
      },
    ];
  });

  // Helper to fetch available topics for a chapter
  const getAvailableTopicsForChapter = (chapId: string) => {
    const foundChap = chapters.find((c) => c.id === chapId);
    if (foundChap && foundChap.topics && foundChap.topics.length > 0) {
      return foundChap.topics;
    }
    return [
      { id: `${chapId}-top-1`, chapterId: chapId, code: '1.1', name: 'Khái niệm & Nguyên lý cơ bản', questionCount: 5 },
      { id: `${chapId}-top-2`, chapterId: chapId, code: '1.2', name: 'Thuật toán & Ứng dụng thực tế', questionCount: 4 },
      { id: `${chapId}-top-3`, chapterId: chapId, code: '1.3', name: 'Đánh giá & Tối ưu hóa hiệu năng', questionCount: 3 },
    ];
  };

  // Handle topic selection on a matrix row
  const handleTopicSelect = (rowId: string, topicId: string) => {
    setMatrixRows((prev) =>
      prev.map((r) => {
        if (r.rowId === rowId) {
          if (!topicId) {
            return {
              ...r,
              topicId: '',
              topicName: '',
              reqRemember: 0,
              reqUnderstand: 0,
              reqApply: 0,
            };
          }
          const allTops = getAvailableTopicsForChapter(r.chapterId);
          const topObj = allTops.find((t) => t.id === topicId);
          return {
            ...r,
            topicId,
            topicName: topObj ? `${topObj.code ? `${topObj.code} ` : ''}${topObj.name}` : topicId,
            reqRemember: r.reqRemember > 0 ? r.reqRemember : 1,
            reqUnderstand: r.reqUnderstand > 0 ? r.reqUnderstand : 1,
          };
        }
        return r;
      })
    );
  };

  // Handle CLO selection on a matrix row
  const handleCloSelect = (rowId: string, cloId: string) => {
    setMatrixRows((prev) =>
      prev.map((r) => {
        if (r.rowId === rowId) {
          const cloObj = activeClos.find((c) => c.id === cloId);
          return {
            ...r,
            cloId,
            cloCode: cloObj?.code || 'CLO',
            cloDesc: cloObj?.description || '',
          };
        }
        return r;
      })
    );
  };

  // Handle adding knowledge unit into a chapter
  const handleAddTopicToChapter = (chapterId: string, chapterName: string) => {
    const newRow: MatrixRowConfig = {
      rowId: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      chapterId,
      chapterName,
      topicId: '',
      topicName: '',
      cloId: activeClos[0]?.id || '',
      cloCode: activeClos[0]?.code || 'CLO 1.1',
      cloDesc: activeClos[0]?.description || '',
      reqRemember: 0,
      reqUnderstand: 0,
      reqApply: 0,
    };
    setMatrixRows((prev) => [...prev, newRow]);
    onShowToast('Đã thêm 1 dòng đơn vị kiến thức mới. Vui lòng chọn ĐVKT từ dropdown.');
  };

  // Handle adding a brand new chapter
  const handleAddNewChapter = () => {
    let chapId = `chap-custom-${Date.now()}`;
    let chapCode = newChapterCode.trim() || `Chương ${matrixChapters.length + 1}`;
    let chapName = newChapterName.trim();

    if (selectedExistingChapterId) {
      const existing = courseChapters.find((c) => c.id === selectedExistingChapterId);
      if (existing) {
        chapId = existing.id;
        chapCode = existing.code;
        chapName = existing.name;
      }
    }

    if (!chapName) {
      onShowToast('Vui lòng nhập tên chương / chủ đề!');
      return;
    }

    if (matrixChapters.some((c) => c.id === chapId)) {
      onShowToast('Chương này đã có trong ma trận đề thi!');
      return;
    }

    setMatrixChapters((prev) => [...prev, { id: chapId, code: chapCode, name: chapName }]);

    // Add initial row with empty topic
    const initialRow: MatrixRowConfig = {
      rowId: `row-${chapId}-${Date.now()}`,
      chapterId: chapId,
      chapterName: `${chapCode}: ${chapName}`,
      topicId: '',
      topicName: '',
      cloId: activeClos[0]?.id || '',
      cloCode: activeClos[0]?.code || 'CLO 1.1',
      cloDesc: activeClos[0]?.description || '',
      reqRemember: 0,
      reqUnderstand: 0,
      reqApply: 0,
    };
    setMatrixRows((prev) => [...prev, initialRow]);

    setIsAddChapterModalOpen(false);
    setNewChapterCode('');
    setNewChapterName('');
    setSelectedExistingChapterId('');
    onShowToast(`Đã thêm ${chapCode} vào ma trận đề thi!`);
  };

  // Handle adding new CLO
  const handleAddNewClo = () => {
    if (!newCloCode.trim() || !newCloDesc.trim()) {
      onShowToast('Vui lòng nhập đầy đủ Mã CLO và Mô tả chuẩn đầu ra!');
      return;
    }
    const newClo: CourseCLO = {
      id: `clo-custom-${Date.now()}`,
      courseId: selectedCourseId,
      code: newCloCode.trim(),
      description: newCloDesc.trim(),
      defaultBloom: newCloBloom,
      status: 'active',
    };
    setActiveClos((prev) => [...prev, newClo]);
    setNewCloCode('');
    setNewCloDesc('');
    onShowToast(`Đã thêm chuẩn ${newClo.code} thành công!`);
  };

  // Handle Bloom Weight change
  const handleBloomWeightChange = (key: 'remember' | 'understand' | 'apply', val: number) => {
    setBloomWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.round(val * 10) / 10),
    }));
  };

  // Scoring Validation: sum must equal 10.0 if strategy is bloomWeight
  const sumBloomWeights = useMemo(
    () =>
      Math.round(
        (Number(bloomWeights.remember || 0) +
          Number(bloomWeights.understand || 0) +
          Number(bloomWeights.apply || 0)) *
          10
      ) / 10,
    [bloomWeights]
  );
  const isWeightValid = scoringStrategy === 'equal' || Math.abs(sumBloomWeights - 10.0) < 0.001;

  // When course changes, regenerate appropriate matrix rows
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const newCourse = courses.find((c) => c.id === courseId);
    if (newCourse) {
      setExamTitle(`Kiểm tra giữa kỳ - Học phần ${newCourse.name}`);
    }
    const newChaps = chapters.filter((ch) => ch.courseId === courseId);
    const newClos = clos.filter((cl) => cl.courseId === courseId);
    setActiveClos(newClos);
    setMatrixChapters(newChaps.map((c) => ({ id: c.id, code: c.code, name: c.name })));

    const generatedRows: MatrixRowConfig[] = [];
    newChaps.forEach((ch, cIndex) => {
      if (ch.topics && ch.topics.length > 0) {
        ch.topics.forEach((top, tIndex) => {
          const assignedClo = newClos[(cIndex + tIndex) % (newClos.length || 1)] || {
            id: 'clo-default',
            code: 'CLO 1.1',
            description: 'Chuẩn đầu ra học phần',
          };
          generatedRows.push({
            rowId: `row-${courseId}-${ch.id}-${top.id}`,
            chapterId: ch.id,
            chapterName: `${ch.code}: ${ch.name}`,
            topicId: top.id,
            topicName: top.name,
            cloId: assignedClo.id,
            cloCode: assignedClo.code,
            cloDesc: assignedClo.description,
            reqRemember: 2,
            reqUnderstand: 2,
            reqApply: 1,
          });
        });
      } else {
        generatedRows.push({
          rowId: `row-${courseId}-${ch.id}-init`,
          chapterId: ch.id,
          chapterName: `${ch.code}: ${ch.name}`,
          topicId: '',
          topicName: '',
          cloId: newClos[0]?.id || 'clo-default',
          cloCode: newClos[0]?.code || 'CLO 1.1',
          cloDesc: newClos[0]?.description || 'Chuẩn đầu ra học phần',
          reqRemember: 0,
          reqUnderstand: 0,
          reqApply: 0,
        });
      }
    });

    if (generatedRows.length > 0) {
      setMatrixRows(generatedRows);
    }
  };

  // Matrix Totals Calculation
  const totalRemember = useMemo(
    () => matrixRows.reduce((sum, r) => sum + Number(r.reqRemember || 0), 0),
    [matrixRows]
  );
  const totalUnderstand = useMemo(
    () => matrixRows.reduce((sum, r) => sum + Number(r.reqUnderstand || 0), 0),
    [matrixRows]
  );
  const totalApply = useMemo(
    () => matrixRows.reduce((sum, r) => sum + Number(r.reqApply || 0), 0),
    [matrixRows]
  );
  const totalExamQuestions = totalRemember + totalUnderstand + totalApply;

  // Single question point calculated based on chosen strategy
  const getQuestionPoint = (bloom: Bloom3Level) => {
    if (totalExamQuestions <= 0) return 0;
    if (scoringStrategy === 'equal') {
      return Number((10 / totalExamQuestions).toFixed(2));
    }
    // bloomWeight
    if (bloom === 'remember') {
      return totalRemember > 0 ? Number((bloomWeights.remember / totalRemember).toFixed(2)) : 0;
    }
    if (bloom === 'understand') {
      return totalUnderstand > 0
        ? Number((bloomWeights.understand / totalUnderstand).toFixed(2))
        : 0;
    }
    return totalApply > 0 ? Number((bloomWeights.apply / totalApply).toFixed(2)) : 0;
  };

  // STEP 2: AVAILABILITY CHECK & EXTRACTION STATE
  // Quick manual add modal state
  const [manualModalCell, setManualModalCell] = useState<{
    row: MatrixRowConfig;
    bloom: Bloom3Level;
  } | null>(null);
  const [manualContent, setManualContent] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrectIndex, setManualCorrectIndex] = useState(0);

  // AI Generation loading indicator per row/bloom
  const [aiGeneratingCell, setAiGeneratingCell] = useState<string | null>(null);

  // Helper: Get available approved questions in bank for a specific row & bloom
  const getAvailableApprovedQuestions = (row: MatrixRowConfig, bloom: Bloom3Level) => {
    return questions.filter((q) => {
      // Must be approved
      if (q.status !== 'approved') return false;
      // Must match course
      if (q.courseId !== selectedCourseId) return false;
      // Must match Bloom level
      if (q.bloom !== bloom) return false;
      // Match CLO or Chapter
      const matchClo = q.cloId === row.cloId;
      const matchChapter = q.chapterId === row.chapterId;
      return matchClo || matchChapter;
    });
  };

  // Check availability status across all matrix cells
  const cellAvailabilityStatus = useMemo(() => {
    let allSufficient = true;
    let totalMissing = 0;

    const details = matrixRows.map((row) => {
      const availRem = getAvailableApprovedQuestions(row, 'remember').length;
      const availUnd = getAvailableApprovedQuestions(row, 'understand').length;
      const availApp = getAvailableApprovedQuestions(row, 'apply').length;

      const diffRem = row.reqRemember - availRem;
      const diffUnd = row.reqUnderstand - availUnd;
      const diffApp = row.reqApply - availApp;

      if (diffRem > 0) {
        allSufficient = false;
        totalMissing += diffRem;
      }
      if (diffUnd > 0) {
        allSufficient = false;
        totalMissing += diffUnd;
      }
      if (diffApp > 0) {
        allSufficient = false;
        totalMissing += diffApp;
      }

      return {
        rowId: row.rowId,
        remember: { req: row.reqRemember, avail: availRem, missing: Math.max(0, diffRem) },
        understand: { req: row.reqUnderstand, avail: availUnd, missing: Math.max(0, diffUnd) },
        apply: { req: row.reqApply, avail: availApp, missing: Math.max(0, diffApp) },
      };
    });

    return { allSufficient, totalMissing, details };
  }, [matrixRows, questions, selectedCourseId]);

  // Handle AI Auto-fulfill missing question for a cell
  const handleAISupplementCell = (row: MatrixRowConfig, bloom: Bloom3Level, countNeeded: number) => {
    const cellKey = `${row.rowId}-${bloom}`;
    setAiGeneratingCell(cellKey);

    setTimeout(() => {
      const bloomLabel = BLOOM_3_CONFIG[bloom].label;
      const newItems: QuestionItem[] = [];

      for (let i = 1; i <= countNeeded; i++) {
        const newId = `ai-gen-${Date.now()}-${i}`;
        newItems.push({
          id: newId,
          courseId: selectedCourseId,
          chapterId: row.chapterId,
          topicId: row.topicId,
          cloId: row.cloId,
          bloom,
          content: `[AI Đã chuẩn hóa] Câu hỏi về ${row.topicName} (Chuẩn ${row.cloCode} - Mức ${bloomLabel} số ${i}): Phân tích nguyên lý và ứng dụng thực tế trong hệ thống?`,
          options: [
            `Phương án tối ưu hóa theo mô hình ${row.cloCode}`,
            `Cơ chế phân loại và xử lý luồng sự kiện`,
            `Thuật toán heuristic bám sát điều kiện biên`,
            `Phương thức kiểm tra đánh giá độ tin cậy`,
          ],
          correctIndex: 0,
          explanation: `Giải thích chi tiết theo giáo trình học phần: Đáp án A bám sát chuẩn đầu ra ${row.cloCode} ở mức nhận thức ${bloomLabel}.`,
          status: 'approved', // Automatically approved
          source: 'ai',
          updatedAt: 'Vừa xong',
          default_score: getQuestionPoint(bloom),
        });
      }

      onUpdateQuestions((prev) => [...newItems, ...prev]);
      setAiGeneratingCell(null);
      onShowToast(`AI đã sinh bổ sung thành công ${countNeeded} câu hỏi [Đã duyệt] cho ${row.cloCode}!`);
    }, 900);
  };

  // Handle Manual Question Creation for a cell
  const handleSaveManualQuestion = () => {
    if (!manualModalCell || !manualContent.trim()) {
      onShowToast('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    const { row, bloom } = manualModalCell;
    const newQ: QuestionItem = {
      id: `manual-q-${Date.now()}`,
      courseId: selectedCourseId,
      chapterId: row.chapterId,
      topicId: row.topicId,
      cloId: row.cloId,
      bloom,
      content: manualContent.trim(),
      options: manualOptions.map((opt, i) =>
        opt.trim() ? opt.trim() : `Phương án ${String.fromCharCode(65 + i)}`
      ),
      correctIndex: manualCorrectIndex,
      explanation: `Giải thích theo chuẩn ${row.cloCode}`,
      status: 'approved',
      source: 'manual',
      updatedAt: 'Vừa xong',
      default_score: getQuestionPoint(bloom),
    };

    onUpdateQuestions((prev) => [newQ, ...prev]);
    setManualModalCell(null);
    setManualContent('');
    setManualOptions(['', '', '', '']);
    onShowToast(`Đã thêm câu hỏi thủ công [Đã duyệt] cho ô ${row.cloCode} thành công!`);
  };

  // STEP 3: PICKED QUESTIONS & SHUFFLING
  const [pickedQuestions, setPickedQuestions] = useState<PickedQuestion[]>([]);
  const [examCodeCount, setExamCodeCount] = useState<1 | 2 | 4>(4);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [previewCodeTab, setPreviewCodeTab] = useState<string>('101');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<string, boolean>>({});

  const toggleQuestionExpand = (questionId: string) => {
    setExpandedQuestionIds((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleToggleAllQuestions = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    if (expand) {
      pickedQuestions.forEach((pq) => {
        next[pq.question.id] = true;
      });
    }
    setExpandedQuestionIds(next);
  };

  // Trigger Automatic Extraction when moving from Step 1 -> Step 2 or inside Step 2
  const performAutoExtraction = () => {
    const selected: PickedQuestion[] = [];
    const usedIds = new Set<string>();

    matrixRows.forEach((row) => {
      // Remember
      const poolRem = getAvailableApprovedQuestions(row, 'remember');
      let pickedCountRem = 0;
      for (const q of poolRem) {
        if (!usedIds.has(q.id) && pickedCountRem < row.reqRemember) {
          usedIds.add(q.id);
          selected.push({
            question: q,
            points: getQuestionPoint('remember'),
            bloom: 'remember',
            cloCode: row.cloCode,
            rowId: row.rowId,
          });
          pickedCountRem++;
        }
      }

      // Understand
      const poolUnd = getAvailableApprovedQuestions(row, 'understand');
      let pickedCountUnd = 0;
      for (const q of poolUnd) {
        if (!usedIds.has(q.id) && pickedCountUnd < row.reqUnderstand) {
          usedIds.add(q.id);
          selected.push({
            question: q,
            points: getQuestionPoint('understand'),
            bloom: 'understand',
            cloCode: row.cloCode,
            rowId: row.rowId,
          });
          pickedCountUnd++;
        }
      }

      // Apply
      const poolApp = getAvailableApprovedQuestions(row, 'apply');
      let pickedCountApp = 0;
      for (const q of poolApp) {
        if (!usedIds.has(q.id) && pickedCountApp < row.reqApply) {
          usedIds.add(q.id);
          selected.push({
            question: q,
            points: getQuestionPoint('apply'),
            bloom: 'apply',
            cloCode: row.cloCode,
            rowId: row.rowId,
          });
          pickedCountApp++;
        }
      }
    });

    setPickedQuestions(selected);
  };

  // Replace individual question with equivalent in bank
  const handleReplaceEquivalentQuestion = (targetIndex: number) => {
    const target = pickedQuestions[targetIndex];
    if (!target) return;

    const alreadyPickedIds = new Set(pickedQuestions.map((p) => p.question.id));

    // Find candidate in approved questions with SAME clo and SAME bloom
    const candidates = questions.filter(
      (q) =>
        q.status === 'approved' &&
        q.courseId === selectedCourseId &&
        q.bloom === target.bloom &&
        q.cloId === target.question.cloId &&
        !alreadyPickedIds.has(q.id)
    );

    if (candidates.length > 0) {
      // Pick random candidate
      const replacement = candidates[Math.floor(Math.random() * candidates.length)];
      setPickedQuestions((prev) => {
        const clone = [...prev];
        clone[targetIndex] = {
          ...clone[targetIndex],
          question: replacement,
        };
        return clone;
      });
      onShowToast(`Đã đổi thành công sang câu hỏi tương đương cùng chuẩn ${target.cloCode}!`);
    } else {
      // If none available, generate equivalent question
      const newGen: QuestionItem = {
        id: `ai-replace-${Date.now()}`,
        courseId: selectedCourseId,
        chapterId: target.question.chapterId,
        topicId: target.question.topicId,
        cloId: target.question.cloId,
        bloom: target.bloom,
        content: `[Tương đương] Câu hỏi hoán đổi tương đương về nội dung ${target.cloCode}: Đánh giá trường hợp tối ưu và giải pháp tương thích?`,
        options: [
          `Phương án giải pháp tương thích theo chuẩn ${target.cloCode}`,
          `Tiêu chuẩn đánh giá thời gian phản hồi`,
          `Mô hình phân tán và khả năng chịu lỗi`,
          `Cấu hình tham số ngưỡng phát hiện bất thường`,
        ],
        correctIndex: 0,
        explanation: `Giải thích chi tiết: Câu hỏi tương đương cùng chuẩn ${target.cloCode}.`,
        status: 'approved',
        source: 'ai',
        updatedAt: 'Vừa xong',
      };
      onUpdateQuestions((prev) => [newGen, ...prev]);
      setPickedQuestions((prev) => {
        const clone = [...prev];
        clone[targetIndex] = {
          ...clone[targetIndex],
          question: newGen,
        };
        return clone;
      });
      onShowToast(`Đã tự động tạo và hoán đổi câu hỏi tương đương cùng chuẩn ${target.cloCode}!`);
    }
  };

  // STEP 4: PUBLISH & EXPORT MODALS & OPTIONS
  type ExportContentType = 'student' | 'answer_key' | 'instructor';
  type ExportCodeChoice = 'all' | string;

  const [exportContentType, setExportContentType] = useState<ExportContentType>('student');
  const [selectedExportCode, setSelectedExportCode] = useState<ExportCodeChoice>('all');
  const [exportLoading, setExportLoading] = useState<'word' | 'pdf' | 'excel' | null>(null);

  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const [generatedRoomCode, setGeneratedRoomCode] = useState(`OBE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [onlineStartTime, setOnlineStartTime] = useState('08:00');
  const [onlineEndTime, setOnlineEndTime] = useState('09:30');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [onlineShuffle, setOnlineShuffle] = useState(true);
  const [onlineShowScore, setOnlineShowScore] = useState(true);
  const [onlineSnapshot, setOnlineSnapshot] = useState(false);

  const availableExamCodes = useMemo(() => {
    return examCodeCount === 4 ? ['101', '102', '103', '104'] : examCodeCount === 2 ? ['101', '102'] : ['101'];
  }, [examCodeCount]);

  // Permuted Questions for a specific code
  const getPermutedQuestionsForCode = (code: string) => {
    const codeNum = parseInt(code, 10) || 101;
    const offset = codeNum - 101;

    let list = pickedQuestions.map((pq, idx) => ({
      originalIndex: idx,
      question: pq.question,
      options: [...pq.question.options],
      correctIndex: pq.question.correctIndex,
      bloom: pq.bloom,
      cloCode: pq.cloCode,
      points: pq.points,
    }));

    if (shuffleQuestions && offset > 0) {
      list = list.map((item, idx) => {
        const newIdx = (idx + offset * 3) % list.length;
        return { item, newIdx };
      }).sort((a, b) => a.newIdx - b.newIdx).map((x) => x.item);
    }

    if (shuffleOptions && offset > 0) {
      list = list.map((item, qIdx) => {
        const shift = (offset + qIdx) % item.options.length;
        if (shift === 0) return item;
        const newOptions: string[] = [];
        let newCorrectIndex = 0;
        for (let i = 0; i < item.options.length; i++) {
          const origOptIdx = (i + shift) % item.options.length;
          newOptions.push(item.options[origOptIdx]);
          if (origOptIdx === item.correctIndex) {
            newCorrectIndex = i;
          }
        }
        return {
          ...item,
          options: newOptions,
          correctIndex: newCorrectIndex,
        };
      });
    }

    return list;
  };

  // 1. Xuất file Word (.docx) chuẩn format học thuật sử dụng thư viện docx & file-saver
  const handleExportWord = async () => {
    setExportLoading('word');
    onShowToast('Đang khởi tạo tài liệu Word (.docx) chuẩn học viện...');

    try {
      const bloomLabels: Record<Bloom3Level, string> = {
        remember: BLOOM_3_CONFIG.remember.label,
        understand: BLOOM_3_CONFIG.understand.label,
        apply: BLOOM_3_CONFIG.apply.label,
      };

      const fileName = await exportExamToDocx({
        examTitle,
        course: currentCourse,
        durationMinutes,
        exportContentType,
        selectedExportCode,
        availableExamCodes,
        bloomLabels,
        getPermutedQuestionsForCode,
      });

      onShowToast(`✓ Đã tải thành công file [${fileName}] về máy tính!`);
    } catch (err) {
      console.error('Lỗi khi xuất file docx:', err);
      onShowToast('Có lỗi xảy ra khi tạo file Word. Vui lòng thử lại!');
    } finally {
      setExportLoading(null);
    }
  };

  // 2. Xuất bản in PDF (chuẩn A4 print dialog / PDF download)
  const handleExportPdf = () => {
    setExportLoading('pdf');
    onShowToast('Đang chuẩn bị trang in PDF A4 chuyên dụng...');

    setTimeout(() => {
      setExportLoading(null);
      window.print();
      onShowToast('✓ Đã kích hoạt bản in PDF A4 chuẩn sẵn sàng lưu/in ấn!');
    }, 700);
  };

  // 3. Xuất file Excel (.xlsx) chuẩn dữ liệu khảo thí
  const handleExportExcel = () => {
    setExportLoading('excel');
    onShowToast('Đang kết xuất tài liệu Excel (.xlsx)...');

    setTimeout(() => {
      const targetCodes = selectedExportCode === 'all' ? availableExamCodes : [selectedExportCode];
      const safeTitle = examTitle.replace(/[^\p{L}\p{N}_-]+/gu, '_');

      let excelHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; }
            th { background-color: #059669; color: #ffffff; font-weight: bold; border: 1px solid #000; padding: 6px 10px; }
            td { border: 1px solid #d1d5db; padding: 5px 8px; vertical-align: middle; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .title-cell { font-size: 16pt; font-weight: bold; color: #064e3b; }
          </style>
        </head>
        <body>
      `;

      if (exportContentType === 'answer_key') {
        // Excel Bảng đáp án chấm thi
        excelHtml += `
          <table>
            <tr><td colspan="${4 + targetCodes.length}" class="title-cell center">BẢNG ĐÁP ÁN CHẤM THI CHUẨN MA TRẬN OBE</td></tr>
            <tr><td colspan="${4 + targetCodes.length}" class="center">Học phần: <b>${currentCourse.code} - ${currentCourse.name}</b> | Bài thi: <b>${examTitle}</b></td></tr>
            <tr><td colspan="${4 + targetCodes.length}" class="center">Ngày kết xuất: ${new Date().toLocaleDateString('vi-VN')} | Tổng số câu: ${pickedQuestions.length} | Thang điểm: 10.0</td></tr>
            <tr></tr>
            <thead>
              <tr>
                <th>STT</th>
                ${targetCodes.map((c) => `<th>Mã đề ${c}</th>`).join('')}
                <th>Chuẩn CLO</th>
                <th>Mức Bloom</th>
                <th>Thang điểm</th>
              </tr>
            </thead>
            <tbody>
              ${pickedQuestions.map((pq, idx) => {
                return `
                  <tr>
                    <td class="center bold">${idx + 1}</td>
                    ${targetCodes.map((c) => {
                      const permuted = getPermutedQuestionsForCode(c);
                      const item = permuted[idx];
                      return `<td class="center bold" style="color: #047857; font-size: 12pt;">${String.fromCharCode(65 + (item ? item.correctIndex : pq.question.correctIndex))}</td>`;
                    }).join('')}
                    <td class="center">${pq.cloCode}</td>
                    <td class="center">${BLOOM_3_CONFIG[pq.bloom].label}</td>
                    <td class="center">${pq.points}</td>
                  </tr>
                `;
              }).join('')}
              <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td class="center">TỔNG</td>
                ${targetCodes.map(() => `<td class="center">${pickedQuestions.length} câu</td>`).join('')}
                <td class="center">OBE</td>
                <td class="center">3 Mức</td>
                <td class="center">10.0 đ</td>
              </tr>
            </tbody>
          </table>
        `;
      } else {
        // Excel Dữ liệu thô câu hỏi & phương án
        excelHtml += `
          <table>
            <tr><td colspan="12" class="title-cell center">DỮ LIỆU ĐỀ THI CHI TIẾT - CHUẨN MA TRẬN OBE</td></tr>
            <tr><td colspan="12" class="center">Học phần: <b>${currentCourse.code} - ${currentCourse.name}</b> | ${examTitle}</td></tr>
            <tr></tr>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã đề</th>
                <th>Nội dung câu hỏi</th>
                <th>Phương án A</th>
                <th>Phương án B</th>
                <th>Phương án C</th>
                <th>Phương án D</th>
                <th>Đáp án đúng</th>
                <th>Chuẩn CLO</th>
                <th>Mức Bloom</th>
                <th>Điểm</th>
                <th>Giải thích chi tiết</th>
              </tr>
            </thead>
            <tbody>
              ${targetCodes.map((code) => {
                const permuted = getPermutedQuestionsForCode(code);
                return permuted.map((pq, idx) => `
                  <tr>
                    <td class="center">${idx + 1}</td>
                    <td class="center bold">${code}</td>
                    <td>${pq.question.content}</td>
                    <td>${pq.options[0]}</td>
                    <td>${pq.options[1]}</td>
                    <td>${pq.options[2]}</td>
                    <td>${pq.options[3]}</td>
                    <td class="center bold" style="color: #059669;">${String.fromCharCode(65 + pq.correctIndex)}</td>
                    <td class="center">${pq.cloCode}</td>
                    <td class="center">${BLOOM_3_CONFIG[pq.bloom].label}</td>
                    <td class="center">${pq.points}</td>
                    <td>${pq.question.explanation || ''}</td>
                  </tr>
                `).join('');
              }).join('')}
            </tbody>
          </table>
        `;
      }

      excelHtml += `</body></html>`;

      const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const typeSuffix = exportContentType === 'answer_key' ? 'Bang_Dap_An' : 'Du_Lieu_De_Thi';
      const fileName = `${safeTitle}_${typeSuffix}_Ma_${selectedExportCode}.xlsx`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      setExportLoading(null);
      onShowToast(`✓ Đã xuất thành công file [${fileName}] theo tùy chọn!`);
    }, 900);
  };

  // Save Final Exam Record
  const handleFinishExamCreation = () => {
    const newRecord: ExamRecord = {
      id: `exam-${Date.now()}`,
      title: examTitle,
      subject: `${currentCourse.code} - ${currentCourse.name}`,
      studentCount: 0,
      avgScore: null,
      status: 'completed',
      examDate: new Date().toLocaleDateString('vi-VN'),
      durationMinutes,
      questionCount: pickedQuestions.length,
      roomCode: generatedRoomCode,
    };
    onSaveExam(newRecord);
    onShowToast(`Đã xuất bản đề thi "${examTitle}" thành công!`);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Quản lý đề thi</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Tạo đề thi chuẩn theo Ma trận OBE
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              Quy trình 4 bước
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình chuẩn hóa rút trích câu hỏi bám sát chuẩn đầu ra (CLO), mức nhận thức Bloom và sinh mã đề hoán vị
          </p>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl self-start sm:self-auto shadow-2xs">
          {[
            { step: 1, label: '1. Ma trận OBE' },
            { step: 2, label: '2. Bốc câu hỏi' },
            { step: 3, label: '3. Hoán vị mã đề' },
            { step: 4, label: '4. Xuất bản' },
          ].map((s) => (
            <div
              key={s.step}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentStep === s.step
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs border border-slate-200/80'
                  : currentStep > s.step
                  ? 'text-emerald-700'
                  : 'text-slate-400'
              }`}
            >
              {currentStep > s.step ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    currentStep === s.step
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s.step}
                </span>
              )}
              <span className="hidden md:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BƯỚC 1: THIẾT LẬP THÔNG TIN & MA TRẬN ĐỀ THI */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-5">
          {/* Card 1: Thông tin chung */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Thông tin chung của đề thi
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Tên bài thi */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên bài thi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="VD: Kiểm tra giữa kỳ - Học phần Trí tuệ nhân tạo"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium text-slate-900"
                />
              </div>

              {/* Thời gian làm bài */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thời gian làm bài (phút) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium text-slate-900"
                  >
                    <option value={30}>30 phút</option>
                    <option value={45}>45 phút (Tiêu chuẩn)</option>
                    <option value={60}>60 phút</option>
                    <option value={90}>90 phút (Học kỳ)</option>
                    <option value={120}>120 phút</option>
                  </select>
                </div>
              </div>

              {/* Học phần mục tiêu */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Học phần mục tiêu <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium text-slate-900"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({c.credits} tín chỉ • {c.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Cấu hình Bảng Ma trận đề thi */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    2. Cấu hình bảng Ma trận đề thi (Chương/Chủ đề &rarr; Đơn vị kiến thức &rarr; CLO)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tách biệt và liên kết giữa Chương & Đơn vị kiến thức. Nhập số lượng câu hỏi Bloom cho từng ĐVKT đã chọn.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddChapterModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ Thêm Chương/Chủ đề</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCloManageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>+ Quản lý/Thêm CLO</span>
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3 w-[22%]">Chương / Chủ đề</th>
                    <th className="py-3 px-3 w-[25%]">Đơn vị kiến thức</th>
                    <th className="py-3 px-3 w-[18%]">Chuẩn đầu ra (CLO)</th>
                    <th className="py-3 px-2 text-center w-[10%]">
                      <div className="inline-flex items-center gap-1 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Nhận biết</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 text-center w-[10%]">
                      <div className="inline-flex items-center gap-1 text-blue-700">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Thông hiểu</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 text-center w-[10%]">
                      <div className="inline-flex items-center gap-1 text-indigo-700">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span>Vận dụng</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center w-[8%]">Tổng câu</th>
                    <th className="py-3 px-2 text-center w-[4%]">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {matrixChapters.map((chapter) => {
                    const rowsInChapter = matrixRows.filter((r) => r.chapterId === chapter.id);

                    if (rowsInChapter.length === 0) {
                      return (
                        <tr key={`empty-chap-${chapter.id}`} className="border-b border-slate-200">
                          <td className="py-3 px-3 align-top bg-slate-50/50 border-r border-slate-200">
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                                  {chapter.code}
                                </span>
                                <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                                  {chapter.name}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    type: 'chapter',
                                    targetId: chapter.id,
                                    targetName: `${chapter.code}: ${chapter.name}`,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
                                title="Xóa Chương"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td colSpan={7} className="py-4 px-4 text-center bg-slate-50/30">
                            <p className="text-xs text-slate-400 italic mb-2">
                              Chưa có đơn vị kiến thức nào trong chương này
                            </p>
                            <button
                              type="button"
                              onClick={() => handleAddTopicToChapter(chapter.id, chapter.name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>➕ Thêm đơn vị kiến thức vào chương này</span>
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <React.Fragment key={`chap-group-${chapter.id}`}>
                        {rowsInChapter.map((row, rIdx) => {
                          const isRowDisabled = !row.topicId || row.topicId.trim() === '';
                          const rowTotal =
                            Number(row.reqRemember || 0) +
                            Number(row.reqUnderstand || 0) +
                            Number(row.reqApply || 0);

                          return (
                            <tr
                              key={row.rowId}
                              className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                            >
                              {/* CỘT CHƯƠNG / CHỦ ĐỀ VỚI ROWSPAN */}
                              {rIdx === 0 && (
                                <td
                                  rowSpan={rowsInChapter.length + 1}
                                  className="py-3 px-3 align-top bg-slate-50/50 border-r border-slate-200"
                                >
                                  <div className="space-y-1.5 sticky top-2">
                                    <div className="flex items-start justify-between gap-1.5">
                                      <div>
                                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                                          {chapter.code}
                                        </span>
                                        <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                                          {chapter.name}
                                        </h4>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteConfirmModal({
                                            type: 'chapter',
                                            targetId: chapter.id,
                                            targetName: `${chapter.code}: ${chapter.name}`,
                                          })
                                        }
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
                                        title="Xóa Chương"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium">
                                      {rowsInChapter.filter((r) => r.topicId).length} đơn vị kiến thức
                                    </div>
                                  </div>
                                </td>
                              )}

                              {/* ĐƠN VỊ KIẾN THỨC DROPDOWN */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={row.topicId || ''}
                                  onChange={(e) => handleTopicSelect(row.rowId, e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all font-medium ${
                                    !row.topicId
                                      ? 'border-amber-300 bg-amber-50/60 text-amber-900 font-semibold'
                                      : 'border-slate-300 bg-white text-slate-800'
                                  }`}
                                >
                                  <option value="">-- Chọn đơn vị kiến thức --</option>
                                  {getAvailableTopicsForChapter(chapter.id).map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.code ? `${t.code} ` : ''}
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* CHUẨN ĐẦU RA (CLO) DROPDOWN */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={row.cloId || ''}
                                  onChange={(e) => handleCloSelect(row.rowId, e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                                >
                                  {activeClos.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.code} - {c.description}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* NHẬN BIẾT STEPPER */}
                              <td className="py-2.5 px-2 text-center">
                                <BloomQtyStepper
                                  value={row.reqRemember}
                                  disabled={isRowDisabled}
                                  colorClass="text-emerald-700"
                                  badgeBg="hover:bg-emerald-50/40"
                                  onChange={(val) => {
                                    setMatrixRows((prev) =>
                                      prev.map((r) =>
                                        r.rowId === row.rowId ? { ...r, reqRemember: val } : r
                                      )
                                    );
                                  }}
                                />
                              </td>

                              {/* THÔNG HIỂU STEPPER */}
                              <td className="py-2.5 px-2 text-center">
                                <BloomQtyStepper
                                  value={row.reqUnderstand}
                                  disabled={isRowDisabled}
                                  colorClass="text-blue-700"
                                  badgeBg="hover:bg-blue-50/40"
                                  onChange={(val) => {
                                    setMatrixRows((prev) =>
                                      prev.map((r) =>
                                        r.rowId === row.rowId ? { ...r, reqUnderstand: val } : r
                                      )
                                    );
                                  }}
                                />
                              </td>

                              {/* VẬN DỤNG STEPPER */}
                              <td className="py-2.5 px-2 text-center">
                                <BloomQtyStepper
                                  value={row.reqApply}
                                  disabled={isRowDisabled}
                                  colorClass="text-indigo-700"
                                  badgeBg="hover:bg-indigo-50/40"
                                  onChange={(val) => {
                                    setMatrixRows((prev) =>
                                      prev.map((r) =>
                                        r.rowId === row.rowId ? { ...r, reqApply: val } : r
                                      )
                                    );
                                  }}
                                />
                              </td>

                              {/* TỔNG CÂU ROW */}
                              <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                                {rowTotal} câu
                              </td>

                              {/* ICON THÙNG RÁC XÓA ĐVKT */}
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirmModal({
                                      type: 'topic',
                                      targetId: row.rowId,
                                      targetName: row.topicName || 'Đơn vị kiến thức này',
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                  title="Xóa đơn vị kiến thức"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {/* NÚT BẤM THÊM ĐVKT VÀO CHƯƠNG NÀY (HÀNG THỨ N+1) */}
                        <tr
                          key={`add-row-${chapter.id}`}
                          className="bg-slate-50/30 border-b border-slate-200"
                        >
                          <td colSpan={7} className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => handleAddTopicToChapter(chapter.id, chapter.name)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>➕ Thêm đơn vị kiến thức vào chương này</span>
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>

                <tfoot>
                  {/* DÒNG KẾ CUỐI - TỔNG SỐ LƯỢNG CÂU HỎI */}
                  <tr className="bg-slate-100/90 border-t-2 border-slate-300 text-xs font-extrabold text-slate-900">
                    <td colSpan={3} className="py-3.5 px-4 uppercase tracking-wider text-slate-800 font-black">
                      TỔNG SỐ LƯỢNG CÂU HỎI TOÀN ĐỀ
                    </td>
                    <td className="py-3.5 px-2 text-center text-emerald-800 font-black bg-emerald-50/60">
                      {totalRemember} câu
                    </td>
                    <td className="py-3.5 px-2 text-center text-blue-800 font-black bg-blue-50/60">
                      {totalUnderstand} câu
                    </td>
                    <td className="py-3.5 px-2 text-center text-indigo-800 font-black bg-indigo-50/60">
                      {totalApply} câu
                    </td>
                    <td className="py-3.5 px-3 text-center text-indigo-950 font-black text-sm bg-indigo-100/70">
                      {totalExamQuestions} câu
                    </td>
                    <td className="py-3.5 px-2"></td>
                  </tr>

                  {/* DÒNG DƯỚI CÙNG - CƠ CHẾ CHIA ĐIỂM ĐỀ THI (THANG ĐIỂM 10) */}
                  <tr
                    className={`transition-colors border-t-2 ${
                      !isWeightValid
                        ? 'bg-red-50 border-red-400'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <td colSpan={8} className="p-4 sm:p-5">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <RadioIcon
                              className={`w-4 h-4 ${!isWeightValid ? 'text-red-600' : 'text-indigo-600'}`}
                            />
                            <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                              Cơ chế chia điểm đề thi (Thang điểm 10):
                            </span>
                          </div>

                          {/* Cảnh báo nếu tổng điểm !== 10 */}
                          {!isWeightValid && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 border border-red-300 text-red-800 text-xs font-bold animate-pulse">
                              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>
                                ⚠️ Tổng trọng số hiện tại là {sumBloomWeights}/10 điểm! Vui lòng điều chỉnh đúng chính xác 10.0 điểm để tiếp tục.
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {/* Tùy chọn 1: Chia đều toàn đề */}
                          <label
                            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                              scoringStrategy === 'equal'
                                ? 'bg-white border-indigo-400 ring-2 ring-indigo-200 shadow-2xs'
                                : 'bg-white/70 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="tfootScoringStrategy"
                              checked={scoringStrategy === 'equal'}
                              onChange={() => setScoringStrategy('equal')}
                              className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                                <span>Chia đều toàn đề</span>
                                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  Tự động
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 mt-1 font-medium">
                                (10 điểm / Tổng{' '}
                                <strong className="text-indigo-700 font-bold">{totalExamQuestions}</strong> câu ={' '}
                                <strong className="text-indigo-700 font-extrabold">
                                  {totalExamQuestions > 0 ? (10 / totalExamQuestions).toFixed(2) : 0}
                                </strong>{' '}
                                điểm/câu)
                              </div>
                            </div>
                          </label>

                          {/* Tùy chọn 2: Chia theo phần (Thang 10) */}
                          <div
                            className={`p-3.5 rounded-xl border transition-all ${
                              scoringStrategy === 'bloomWeight'
                                ? !isWeightValid
                                  ? 'bg-white border-red-400 ring-2 ring-red-200 shadow-2xs'
                                  : 'bg-white border-indigo-400 ring-2 ring-indigo-200 shadow-2xs'
                                : 'bg-white/70 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name="tfootScoringStrategy"
                                checked={scoringStrategy === 'bloomWeight'}
                                onChange={() => setScoringStrategy('bloomWeight')}
                                className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <div className="flex-1">
                                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                                  <span>Chia theo phần (Thang 10)</span>
                                  <span
                                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                                      !isWeightValid
                                        ? 'bg-red-100 text-red-700 border border-red-300'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}
                                  >
                                    Tổng: {sumBloomWeights}/10.0đ
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Nhập số điểm trực tiếp cho 3 mức Bloom (Tổng phải đúng 10.0đ)
                                </p>
                              </div>
                            </label>

                            {/* 3 Steppers / Inputs cho 3 mức Bloom */}
                            {scoringStrategy === 'bloomWeight' && (
                              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                                {/* Nhận biết */}
                                <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-center">
                                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide mb-1.5 flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span>Nhận biết</span>
                                  </div>
                                  <div className="inline-flex items-center gap-1 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => handleBloomWeightChange('remember', bloomWeights.remember - 0.5)}
                                      disabled={bloomWeights.remember <= 0}
                                      className="w-6 h-6 rounded border border-emerald-300 bg-white text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-30 cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="10"
                                      value={bloomWeights.remember}
                                      onChange={(e) => handleBloomWeightChange('remember', parseFloat(e.target.value) || 0)}
                                      className="w-12 h-6 text-center text-xs font-black rounded border border-emerald-300 bg-white text-emerald-900"
                                    />
                                    <span className="text-xs font-bold text-emerald-800">đ</span>
                                    <button
                                      type="button"
                                      onClick={() => handleBloomWeightChange('remember', bloomWeights.remember + 0.5)}
                                      disabled={bloomWeights.remember >= 10}
                                      className="w-6 h-6 rounded border border-emerald-300 bg-white text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-30 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Thông hiểu */}
                                <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-200 text-center">
                                  <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wide mb-1.5 flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    <span>Thông hiểu</span>
                                  </div>
                                  <div className="inline-flex items-center gap-1 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => handleBloomWeightChange('understand', bloomWeights.understand - 0.5)}
                                      disabled={bloomWeights.understand <= 0}
                                      className="w-6 h-6 rounded border border-blue-300 bg-white text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-30 cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="10"
                                      value={bloomWeights.understand}
                                      onChange={(e) => handleBloomWeightChange('understand', parseFloat(e.target.value) || 0)}
                                      className="w-12 h-6 text-center text-xs font-black rounded border border-blue-300 bg-white text-blue-900"
                                    />
                                    <span className="text-xs font-bold text-blue-800">đ</span>
                                    <button
                                      type="button"
                                      onClick={() => handleBloomWeightChange('understand', bloomWeights.understand + 0.5)}
                                      disabled={bloomWeights.understand >= 10}
                                      className="w-6 h-6 rounded border border-blue-300 bg-white text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-30 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Vận dụng */}
                                <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-200 text-center">
                                  <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide mb-1.5 flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    <span>Vận dụng</span>
                                  </div>
                                  <div className="inline-flex items-center gap-1 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => handleBloomWeightChange('apply', bloomWeights.apply - 0.5)}
                                      disabled={bloomWeights.apply <= 0}
                                      className="w-6 h-6 rounded border border-indigo-300 bg-white text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-30 cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="10"
                                      value={bloomWeights.apply}
                                      onChange={(e) => handleBloomWeightChange('apply', parseFloat(e.target.value) || 0)}
                                      className="w-12 h-6 text-center text-xs font-black rounded border border-indigo-300 bg-white text-indigo-900"
                                    />
                                    <span className="text-xs font-bold text-indigo-800">đ</span>
                                    <button
                                      type="button"
                                      onClick={() => handleBloomWeightChange('apply', bloomWeights.apply + 0.5)}
                                      disabled={bloomWeights.apply >= 10}
                                      className="w-6 h-6 rounded border border-indigo-300 bg-white text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-30 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* CTA Step 1 Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-3">
              {!isWeightValid && scoringStrategy === 'bloomWeight' && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  ⚠️ Tổng trọng số hiện tại là {sumBloomWeights}/10đ! Vui lòng chỉnh đúng 10.0đ.
                </span>
              )}

              <button
                type="button"
                disabled={totalExamQuestions === 0 || !examTitle.trim() || !isWeightValid}
                onClick={() => {
                  performAutoExtraction();
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <span>Tiếp tục: Bốc câu hỏi tự động</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MODAL 1: CẢNH BÁO XÓA ĐVKT HOẶC CHƯƠNG */}
          {deleteConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                onClick={() => setDeleteConfirmModal(null)}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md z-10 p-5 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      deleteConfirmModal.type === 'chapter'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-base font-bold ${
                        deleteConfirmModal.type === 'chapter' ? 'text-rose-900' : 'text-slate-900'
                      }`}
                    >
                      {deleteConfirmModal.type === 'chapter'
                        ? 'Xác nhận xóa Chương / Chủ đề'
                        : 'Xác nhận xóa Đơn vị kiến thức'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Mục tiêu: <strong className="text-slate-800">{deleteConfirmModal.targetName}</strong>
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    deleteConfirmModal.type === 'chapter'
                      ? 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {deleteConfirmModal.type === 'chapter' ? (
                    <span>
                      ⚠️ <strong>CẢNH BÁO:</strong> Xóa chương này sẽ đồng thời xóa toàn bộ các đơn vị kiến thức trực thuộc bên trong. Bạn có chắc chắn muốn tiếp tục?
                    </span>
                  ) : (
                    <span>
                      Bạn có chắc chắn muốn xóa đơn vị kiến thức này khỏi ma trận đề thi?
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmModal(null)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (deleteConfirmModal.type === 'topic') {
                        setMatrixRows((prev) => prev.filter((r) => r.rowId !== deleteConfirmModal.targetId));
                        onShowToast('Đã xóa đơn vị kiến thức khỏi ma trận.');
                      } else {
                        setMatrixChapters((prev) => prev.filter((c) => c.id !== deleteConfirmModal.targetId));
                        setMatrixRows((prev) => prev.filter((r) => r.chapterId !== deleteConfirmModal.targetId));
                        onShowToast('Đã xóa chương và toàn bộ các đơn vị kiến thức trực thuộc.');
                      }
                      setDeleteConfirmModal(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                      deleteConfirmModal.type === 'chapter'
                        ? 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                        : 'bg-slate-800 hover:bg-slate-900 active:scale-95'
                    }`}
                  >
                    {deleteConfirmModal.type === 'chapter' ? 'Xác nhận xóa Chương' : 'Xác nhận xóa ĐVKT'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 2: THÊM CHƯƠNG / CHỦ ĐỀ MỚI */}
          {isAddChapterModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                onClick={() => setIsAddChapterModalOpen(false)}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md z-10 p-5 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase">
                      Thêm Chương / Chủ đề vào Ma trận
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddChapterModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {courseChapters.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chọn nhanh từ chương của học phần:
                      </label>
                      <select
                        value={selectedExistingChapterId}
                        onChange={(e) => setSelectedExistingChapterId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      >
                        <option value="">-- Hoặc nhập mã & tên chương mới bên dưới --</option>
                        {courseChapters.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            {ch.code}: {ch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mã chương (VD: Chương 4)
                    </label>
                    <input
                      type="text"
                      value={newChapterCode}
                      onChange={(e) => setNewChapterCode(e.target.value)}
                      placeholder="Chương 4"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên chương / chủ đề
                    </label>
                    <input
                      type="text"
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      placeholder="VD: Học máy & Phân loại dữ liệu"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddChapterModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewChapter}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Thêm vào ma trận
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 3: QUẢN LÝ / THÊM CLO */}
          {isCloManageModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                onClick={() => setIsCloManageModalOpen(false)}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg z-10 p-5 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase">
                      Quản lý Chuẩn đầu ra (CLO)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCloManageModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Danh sách CLO hiện tại */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    Danh sách CLO hiện tại của học phần ({activeClos.length}):
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {activeClos.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs flex items-start gap-2.5"
                      >
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px] shrink-0">
                          {c.code}
                        </span>
                        <div className="flex-1 text-slate-700">
                          <div className="font-medium">{c.description}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Mức Bloom mặc định:{' '}
                            {c.defaultBloom === 'remember'
                              ? 'Nhận biết'
                              : c.defaultBloom === 'understand'
                              ? 'Thông hiểu'
                              : 'Vận dụng'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form thêm CLO mới */}
                <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
                  <div className="text-xs font-bold text-indigo-900">
                    ➕ Thêm chuẩn CLO mới cho học phần
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mã CLO</label>
                      <input
                        type="text"
                        value={newCloCode}
                        onChange={(e) => setNewCloCode(e.target.value)}
                        placeholder="VD: CLO 3.1"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mô tả chuẩn đầu ra</label>
                      <input
                        type="text"
                        value={newCloDesc}
                        onChange={(e) => setNewCloDesc(e.target.value)}
                        placeholder="VD: Vận dụng logic vị từ và suy diễn..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-700">Mức Bloom:</label>
                      <select
                        value={newCloBloom}
                        onChange={(e) => setNewCloBloom(e.target.value as Bloom3Level)}
                        className="px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      >
                        <option value="remember">Nhận biết</option>
                        <option value="understand">Thông hiểu</option>
                        <option value="apply">Vận dụng</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewClo}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                    >
                      Lưu chuẩn CLO
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCloManageModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 2: KIỂM TRA KHẢ DỤNG & BỐC CÂU HỎI TỰ ĐỘNG */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-5">
          {/* Status banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              cellAvailabilityStatus.allSufficient
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {cellAvailabilityStatus.allSufficient ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-sm font-bold">
                  {cellAvailabilityStatus.allSufficient
                    ? 'Ngân hàng câu hỏi [Đã duyệt] hoàn toàn đủ đáp ứng ma trận OBE!'
                    : `Cảnh báo: Kho câu hỏi đang thiếu ${cellAvailabilityStatus.totalMissing} câu ở trạng thái [Đã duyệt]`}
                </h3>
                <p className="text-xs mt-0.5 opacity-90">
                  {cellAvailabilityStatus.allSufficient
                    ? `Đã tự động gom ngẫu nhiên đủ ${totalExamQuestions} câu hỏi bám sát cấu trúc từng hàng ma trận.`
                    : 'Vui lòng bổ sung số câu còn thiếu bằng cách bấm [+ Tạo thủ công] hoặc [🤖 AI sinh bổ sung] trực tiếp tại các ô cảnh báo dưới đây.'}
                </p>
              </div>
            </div>

            {/* Quick Auto-Fill All button if missing */}
            {!cellAvailabilityStatus.allSufficient && (
              <button
                type="button"
                onClick={() => {
                  cellAvailabilityStatus.details.forEach((item) => {
                    const row = matrixRows.find((r) => r.rowId === item.rowId);
                    if (!row) return;
                    if (item.remember.missing > 0) {
                      handleAISupplementCell(row, 'remember', item.remember.missing);
                    }
                    if (item.understand.missing > 0) {
                      handleAISupplementCell(row, 'understand', item.understand.missing);
                    }
                    if (item.apply.missing > 0) {
                      handleAISupplementCell(row, 'apply', item.apply.missing);
                    }
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI sinh bù tất cả câu thiếu</span>
              </button>
            )}
          </div>

          {/* Availability Details Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Chi tiết quét cơ sở dữ liệu câu hỏi [Đã duyệt] theo ma trận
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hệ thống đối soát từng ô yêu cầu với số lượng thực tế trong kho đã duyệt
                </p>
              </div>
              <button
                type="button"
                onClick={performAutoExtraction}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Quét lại</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {matrixRows.map((row) => {
                const statusDetail = cellAvailabilityStatus.details.find(
                  (d) => d.rowId === row.rowId
                );
                if (!statusDetail) return null;

                return (
                  <div key={row.rowId} className="p-4 hover:bg-slate-50/50 transition-colors">
                    {/* Row Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          {row.chapterName}
                        </span>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {row.topicName}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
                        {row.cloCode}
                      </span>
                    </div>

                    {/* 3 Bloom Cells Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* 1. Nhận biết */}
                      <div
                        className={`p-3 rounded-lg border text-xs transition-all ${
                          statusDetail.remember.missing === 0
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/50 border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Nhận biết: {row.reqRemember} câu
                          </span>
                          {statusDetail.remember.missing === 0 ? (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Đủ câu ({statusDetail.remember.avail} sẵn có)
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Thiếu {statusDetail.remember.missing} câu
                            </span>
                          )}
                        </div>

                        {statusDetail.remember.missing > 0 && (
                          <div className="mt-2 pt-2 border-t border-rose-200 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setManualModalCell({ row, bloom: 'remember' })}
                              className="flex-1 py-1 px-2 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Tạo thủ công</span>
                            </button>
                            <button
                              type="button"
                              disabled={aiGeneratingCell === `${row.rowId}-remember`}
                              onClick={() =>
                                handleAISupplementCell(row, 'remember', statusDetail.remember.missing)
                              }
                              className="flex-1 py-1 px-2 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>
                                {aiGeneratingCell === `${row.rowId}-remember`
                                  ? 'Đang sinh...'
                                  : '🤖 AI sinh bổ sung'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 2. Thông hiểu */}
                      <div
                        className={`p-3 rounded-lg border text-xs transition-all ${
                          statusDetail.understand.missing === 0
                            ? 'bg-blue-50/40 border-blue-200'
                            : 'bg-rose-50/50 border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Thông hiểu: {row.reqUnderstand} câu
                          </span>
                          {statusDetail.understand.missing === 0 ? (
                            <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Đủ câu ({statusDetail.understand.avail} sẵn có)
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Thiếu {statusDetail.understand.missing} câu
                            </span>
                          )}
                        </div>

                        {statusDetail.understand.missing > 0 && (
                          <div className="mt-2 pt-2 border-t border-rose-200 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setManualModalCell({ row, bloom: 'understand' })}
                              className="flex-1 py-1 px-2 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Tạo thủ công</span>
                            </button>
                            <button
                              type="button"
                              disabled={aiGeneratingCell === `${row.rowId}-understand`}
                              onClick={() =>
                                handleAISupplementCell(row, 'understand', statusDetail.understand.missing)
                              }
                              className="flex-1 py-1 px-2 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>
                                {aiGeneratingCell === `${row.rowId}-understand`
                                  ? 'Đang sinh...'
                                  : '🤖 AI sinh bổ sung'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 3. Vận dụng */}
                      <div
                        className={`p-3 rounded-lg border text-xs transition-all ${
                          statusDetail.apply.missing === 0
                            ? 'bg-indigo-50/40 border-indigo-200'
                            : 'bg-rose-50/50 border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Vận dụng: {row.reqApply} câu
                          </span>
                          {statusDetail.apply.missing === 0 ? (
                            <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Đủ câu ({statusDetail.apply.avail} sẵn có)
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Thiếu {statusDetail.apply.missing} câu
                            </span>
                          )}
                        </div>

                        {statusDetail.apply.missing > 0 && (
                          <div className="mt-2 pt-2 border-t border-rose-200 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setManualModalCell({ row, bloom: 'apply' })}
                              className="flex-1 py-1 px-2 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Tạo thủ công</span>
                            </button>
                            <button
                              type="button"
                              disabled={aiGeneratingCell === `${row.rowId}-apply`}
                              onClick={() =>
                                handleAISupplementCell(row, 'apply', statusDetail.apply.missing)
                              }
                              className="flex-1 py-1 px-2 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>
                                {aiGeneratingCell === `${row.rowId}-apply`
                                  ? 'Đang sinh...'
                                  : '🤖 AI sinh bổ sung'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Step 2 Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Bước 1</span>
            </button>

            <button
              type="button"
              disabled={!cellAvailabilityStatus.allSufficient}
              onClick={() => {
                performAutoExtraction();
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--primary)' }}
              title={
                !cellAvailabilityStatus.allSufficient
                  ? 'Vui lòng bổ sung đầy đủ các câu hỏi còn thiếu trước khi tiếp tục'
                  : ''
              }
            >
              <span>Tiếp tục: Xem trước & Tinh chỉnh</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 3: XEM TRƯỚC, ĐỔI CÂU TƯƠNG ĐƯƠNG & TRỘN MÃ ĐỀ */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-5">
          {/* Card: Cấu hình trộn đề (Hoán vị) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Cấu hình trộn đề thi (Hoán vị mã đề)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Tổng cộng: <strong className="text-slate-900">{pickedQuestions.length} câu hỏi</strong> • Thang điểm 10.0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chọn số lượng mã đề sinh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số lượng mã đề cần sinh hoán vị
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { count: 1, label: '1 mã đề (Gốc)' },
                    { count: 2, label: '2 mã đề (101, 102)' },
                    { count: 4, label: '4 mã đề (101-104)' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setExamCodeCount(item.count as 1 | 2 | 4)}
                      className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        examCodeCount === item.count
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-1 ring-indigo-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tùy chọn hoán vị */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tùy chọn xáo trộn nội dung
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={(e) => setShuffleQuestions(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>[✓] Tự động đảo thứ tự câu hỏi</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>[✓] Tự động hoán vị thứ tự 4 đáp án A, B, C, D</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tab selector for previewing code */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span>Xem trước theo mã đề:</span>
                {(examCodeCount === 4 ? ['101', '102', '103', '104'] : examCodeCount === 2 ? ['101', '102'] : ['101']).map(
                  (code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setPreviewCodeTab(code)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                        previewCodeTab === code
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Mã {code}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="hidden md:inline">
                  * Nhấp vào câu hỏi để xem chi tiết đáp án & giải thích
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleAllQuestions(
                      Object.keys(expandedQuestionIds).filter((k) => expandedQuestionIds[k]).length <
                        pickedQuestions.length
                    )
                  }
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  {Object.keys(expandedQuestionIds).filter((k) => expandedQuestionIds[k]).length ===
                  pickedQuestions.length
                    ? 'Thu gọn tất cả'
                    : 'Mở rộng tất cả'}
                </button>
              </div>
            </div>
          </div>

          {/* Questions Cards List - ClassMarker Style Click-to-Toggle */}
          <div className="space-y-3">
            {pickedQuestions.map((item, index) => {
              const bloomConf = BLOOM_3_CONFIG[item.bloom];
              const isExpanded = !!expandedQuestionIds[item.question.id];

              return (
                <div
                  key={item.question.id}
                  className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs transition-all hover:border-slate-300"
                >
                  {/* Card Header: Số thứ tự, badge CLO, Bloom, điểm số, nút Đổi câu khác */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.cloCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold border ${bloomConf.bgClass} ${bloomConf.textClass} ${bloomConf.borderClass}`}
                      >
                        {bloomConf.label}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.points} điểm
                      </span>
                    </div>

                    {/* Button Đổi câu khác */}
                    <button
                      type="button"
                      onClick={() => handleReplaceEquivalentQuestion(index)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                      title="Hệ thống tự bốc câu khác trong kho có cùng CLO và mức Bloom để thay thế"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>🔄 Đổi câu khác</span>
                    </button>
                  </div>

                  {/* Question Content (Click-to-Toggle directly) */}
                  <div
                    onClick={() => toggleQuestionExpand(item.question.id)}
                    className="p-2 -mx-2 mt-2 rounded-lg cursor-pointer hover:bg-slate-50/80 transition-all select-none group"
                    title={isExpanded ? 'Nhấn để thu gọn chi tiết' : 'Nhấn để xem chi tiết 4 đáp án và giải thích'}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <p
                        className={`text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed transition-colors group-hover:text-indigo-950 ${
                          isExpanded ? '' : 'line-clamp-2'
                        }`}
                      >
                        {item.question.content}
                      </p>
                      <span
                        className={`shrink-0 text-slate-400 group-hover:text-indigo-600 p-0.5 rounded transition-transform duration-200 mt-0.5 ${
                          isExpanded ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail View: 4 Options A, B, C, D & Academic Blockquote Explanation */}
                  {isExpanded && (
                    <div className="pt-2 pb-1 space-y-2.5 animate-in fade-in duration-150">
                      {/* 4 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {item.question.options.map((opt, optIndex) => {
                          const isCorrect = optIndex === item.question.correctIndex;
                          return (
                            <div
                              key={optIndex}
                              className={`p-2.5 rounded-lg border text-xs leading-snug flex items-start gap-2 transition-colors ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-200/60'
                                  : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isCorrect && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Đúng</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Khung Giải thích chi tiết dạng blockquote màu cam chuẩn học thuật */}
                      {item.question.explanation && (
                        <blockquote className="my-2 p-3.5 pl-4 pr-3.5 bg-amber-50/40 border-l-4 border-amber-500 rounded-r-lg border-y border-r border-slate-200/60 shadow-2xs">
                          <div className="flex items-center gap-1.5 font-semibold italic text-amber-900 text-sm mb-1">
                            <span className="not-italic">💡</span>
                            <span>Lưu ý / Giải thích chi tiết:</span>
                          </div>
                          <p className="italic text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                            {item.question.explanation}
                          </p>
                        </blockquote>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Step 3 Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Bước 2</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(4);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span>Tiếp tục: Xuất bản đề thi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 4: XUẤT BẢN ĐỀ THI (2 PHƯƠNG ÁN ĐẦU RA) */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* Exam Summary Header Card with Dynamic Theme Gradient */}
          <div
            className="text-white p-6 rounded-2xl shadow-md space-y-4 transition-all"
            style={{ background: 'linear-gradient(135deg, var(--banner-from), var(--banner-to))' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: 'var(--banner-tag-bg)',
                    color: 'var(--banner-tag-text)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Chuẩn hóa cấu trúc Ma trận OBE
                </span>
                <h2 className="text-xl font-bold mt-2 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  {examTitle}
                </h2>
                <p className="text-xs text-white/80 mt-1">
                  Học phần: <b>{currentCourse.code} - {currentCourse.name}</b> • Thời lượng: <b>{durationMinutes} phút</b>
                </p>
              </div>

              <div className="flex items-center gap-2.5 sm:self-center">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">Số lượng câu</span>
                  <span className="text-xl font-black text-white">{pickedQuestions.length} câu</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">Mã đề hoán vị</span>
                  <span className="text-xl font-black text-white" style={{ color: 'var(--banner-tag-text)' }}>
                    {examCodeCount} mã
                  </span>
                </div>
              </div>
            </div>

            {/* Generated Exam Codes Tags */}
            <div className="pt-3 border-t border-white/15 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-white/80 font-medium">Các mã đề thi chính thức:</span>
              {availableExamCodes.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-0.5 rounded font-mono font-bold border transition-all text-xs"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                  }}
                >
                  Mã {c}
                </span>
              ))}
            </div>
          </div>

          {/* 2 Output Options Grid: Balanced Equal Height Layout */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 items-stretch">
            {/* ================================================================= */}
            {/* CỘT TRÁI - PHƯƠNG ÁN 1: THI TRÊN GIẤY (OFFLINE)                  */}
            {/* ================================================================= */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-5 transition-all">
              <div className="space-y-4">
                {/* Header Card 1 */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold border shrink-0 transition-colors"
                    style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderColor: 'var(--primary-border)',
                    }}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Phương án 1: Thi trên giấy (Offline)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tự động dàn trang in ấn & lưu trữ khảo thí theo chuẩn học viện
                    </p>
                  </div>
                </div>

                {/* 1. LỰA CHỌN NỘI DUNG XUẤT */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        1
                      </span>
                      Lựa chọn nội dung xuất:
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {exportContentType === 'student'
                        ? 'Đề thi sạch cho SV'
                        : exportContentType === 'answer_key'
                        ? 'Bảng soi đáp án'
                        : 'Bản lưu trữ đầy đủ'}
                    </span>
                  </label>
                  <div className="space-y-2">
                    {/* Option 1: Đề thi chuẩn cho sinh viên */}
                    <div
                      onClick={() => setExportContentType('student')}
                      style={
                        exportContentType === 'student'
                          ? {
                              backgroundColor: 'var(--primary-light)',
                              borderColor: 'var(--primary)',
                              boxShadow: '0 0 0 1px var(--primary-border)',
                            }
                          : undefined
                      }
                      className={`group relative flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        exportContentType === 'student'
                          ? 'text-slate-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                        style={
                          exportContentType === 'student'
                            ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary)' }
                            : { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' }
                        }
                      >
                        {exportContentType === 'student' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold block text-slate-900">
                          Đề thi chuẩn cho sinh viên
                        </span>
                        <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                          Chỉ có câu hỏi + 4 phương án lựa chọn, không lộ đáp án & giải thích
                        </span>
                      </div>
                    </div>

                    {/* Option 2: Bảng đáp án chấm thi */}
                    <div
                      onClick={() => setExportContentType('answer_key')}
                      style={
                        exportContentType === 'answer_key'
                          ? {
                              backgroundColor: 'var(--primary-light)',
                              borderColor: 'var(--primary)',
                              boxShadow: '0 0 0 1px var(--primary-border)',
                            }
                          : undefined
                      }
                      className={`group relative flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        exportContentType === 'answer_key'
                          ? 'text-slate-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                        style={
                          exportContentType === 'answer_key'
                            ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary)' }
                            : { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' }
                        }
                      >
                        {exportContentType === 'answer_key' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold block text-slate-900">
                          Bảng đáp án chấm thi (Answer Key)
                        </span>
                        <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                          Phiếu soi đáp án theo từng mã đề (101, 102...) kèm chuẩn CLO, Bloom và điểm số
                        </span>
                      </div>
                    </div>

                    {/* Option 3: Đề thi hoàn chỉnh kèm đáp án & giải thích */}
                    <div
                      onClick={() => setExportContentType('instructor')}
                      style={
                        exportContentType === 'instructor'
                          ? {
                              backgroundColor: 'var(--primary-light)',
                              borderColor: 'var(--primary)',
                              boxShadow: '0 0 0 1px var(--primary-border)',
                            }
                          : undefined
                      }
                      className={`group relative flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        exportContentType === 'instructor'
                          ? 'text-slate-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                        style={
                          exportContentType === 'instructor'
                            ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary)' }
                            : { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' }
                        }
                      >
                        {exportContentType === 'instructor' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold block text-slate-900">
                          Đề thi hoàn chỉnh kèm đáp án & giải thích
                        </span>
                        <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                          Dành cho Giảng viên lưu trữ, thanh tra khảo thí kèm khung giải thích chi tiết
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. LỰA CHỌN MÃ ĐỀ XUẤT */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        2
                      </span>
                      Lựa chọn mã đề xuất:
                    </span>
                    <span className="text-[11px] font-normal text-slate-500 font-mono">
                      {selectedExportCode === 'all'
                        ? `Tất cả (${availableExamCodes.length} mã)`
                        : `Mã đề: ${selectedExportCode}`}
                    </span>
                  </label>
                  <div className="p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedExportCode('all')}
                      style={
                        selectedExportCode === 'all'
                          ? {
                              backgroundColor: 'var(--primary)',
                              color: 'var(--primary-text)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }
                          : undefined
                      }
                      className={`flex-1 min-w-[110px] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all text-center ${
                        selectedExportCode === 'all'
                          ? 'font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      Tất cả mã đề ({availableExamCodes.join(', ')})
                    </button>
                    {availableExamCodes.map((code) => {
                      const isSelected = selectedExportCode === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setSelectedExportCode(code)}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: 'var(--primary)',
                                  color: 'var(--primary-text)',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                }
                              : undefined
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                            isSelected
                              ? 'font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                          }`}
                        >
                          MĐ {code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. BỘ NÚT XUẤT FILE (WORD, PDF, EXCEL) - PINNED TO BOTTOM */}
              <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Chọn định dạng xuất tài liệu:</span>
                  <span className="text-slate-400 lowercase font-normal">nhấn để tải file</span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {/* Nút 1: Word (.docx) */}
                  <button
                    type="button"
                    disabled={exportLoading !== null}
                    onClick={handleExportWord}
                    className="h-11 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 hover:brightness-95 active:scale-[0.98]"
                    style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderColor: 'var(--primary-border)',
                    }}
                    title="Tải file Word (.docx) chuẩn format học viện"
                  >
                    {exportLoading === 'word' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span className="truncate">Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 shrink-0" />
                        <span className="truncate whitespace-nowrap">📄 Word (.docx)</span>
                      </>
                    )}
                  </button>

                  {/* Nút 2: PDF */}
                  <button
                    type="button"
                    disabled={exportLoading !== null}
                    onClick={handleExportPdf}
                    className="h-11 px-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/90 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    title="In ấn và xem trước bản PDF"
                  >
                    {exportLoading === 'pdf' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span className="truncate">Đang mở...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="w-4 h-4 shrink-0" />
                        <span className="truncate whitespace-nowrap">🖨️ Xuất PDF</span>
                      </>
                    )}
                  </button>

                  {/* Nút 3: Excel (.xlsx) */}
                  <button
                    type="button"
                    disabled={exportLoading !== null}
                    onClick={handleExportExcel}
                    className="h-11 px-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/90 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    title="Xuất bảng ma trận đáp án soi chấm thi"
                  >
                    {exportLoading === 'excel' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span className="truncate">Đang xuất...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4 shrink-0" />
                        <span className="truncate whitespace-nowrap">📊 Excel (.xlsx)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* CỘT PHẢI - PHƯƠNG ÁN 2: THI TRỰC TUYẾN (ONLINE QUA LINK/MSSV)    */}
            {/* ================================================================= */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-5 transition-all">
              <div className="space-y-4">
                {/* Header Card 2 */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold border shrink-0 transition-colors"
                    style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderColor: 'var(--primary-border)',
                    }}
                  >
                    <RadioIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Phương án 2: Thi trực tuyến (Online qua Link/MSSV)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sinh link phòng thi tự động, thí sinh đăng nhập bằng MSSV & Họ tên thi ngay
                    </p>
                  </div>
                </div>

                {/* Khối tóm tắt thông số ca thi */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Thời gian thi
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {durationMinutes} phút
                    </span>
                  </div>
                  <div className="space-y-0.5 border-x border-slate-200/70">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Tổng số câu
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {pickedQuestions.length} câu
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Đăng nhập
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      MSSV + Họ tên
                    </span>
                  </div>
                </div>

                {/* Khối cấp Mã & Đường dẫn phòng thi */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        •
                      </span>
                      Đường dẫn & Mã phòng thi:
                    </label>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black border transition-all"
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary-border)',
                      }}
                    >
                      Mã ca thi: {generatedRoomCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        readOnly
                        value={`https://examflow.ai/join/${generatedRoomCode}`}
                        className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 select-all focus:outline-hidden focus:border-slate-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `https://examflow.ai/join/${generatedRoomCode}`;
                        navigator.clipboard?.writeText(url);
                        setCopiedLink(true);
                        onShowToast('✓ Đã sao chép link phòng thi vào bộ nhớ tạm!');
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                      style={
                        copiedLink
                          ? { backgroundColor: '#10B981', color: '#FFFFFF', borderColor: '#059669' }
                          : {
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              borderColor: 'var(--primary-border)',
                            }
                      }
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>📋 Sao chép Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Khối cấu hình bảo mật nhanh ca thi */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cấu hình bảo mật & Giám sát ca thi:</span>
                  </div>
                  <div className="space-y-1 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 text-xs">
                    {/* Checkbox 1: Xáo trộn câu hỏi & đáp án */}
                    <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none hover:text-slate-900 py-0.5">
                      <input
                        type="checkbox"
                        checked={onlineShuffle}
                        onChange={(e) => setOnlineShuffle(e.target.checked)}
                        style={{ accentColor: 'var(--primary)' }}
                        className="rounded cursor-pointer w-4 h-4"
                      />
                      <span className="font-medium">
                        Tự động xáo trộn thứ tự câu hỏi và đáp án giữa các thí sinh
                      </span>
                    </label>

                    {/* Checkbox 2: Cho phép xem điểm số ngay sau khi nộp bài */}
                    <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none hover:text-slate-900 py-0.5">
                      <input
                        type="checkbox"
                        checked={onlineShowScore}
                        onChange={(e) => setOnlineShowScore(e.target.checked)}
                        style={{ accentColor: 'var(--primary)' }}
                        className="rounded cursor-pointer w-4 h-4"
                      />
                      <span className="font-medium">
                        Cho phép xem điểm số ngay sau khi nộp bài
                      </span>
                    </label>

                    {/* Checkbox 3: Bật chế độ chụp snapshot định kỳ giám sát gian lận */}
                    <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer select-none hover:text-slate-900 py-0.5">
                      <input
                        type="checkbox"
                        checked={onlineSnapshot}
                        onChange={(e) => setOnlineSnapshot(e.target.checked)}
                        style={{ accentColor: 'var(--primary)' }}
                        className="rounded cursor-pointer w-4 h-4"
                      />
                      <span className="font-medium">
                        Bật chế độ chụp snapshot định kỳ giám sát gian lận
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Khối nút hành động chính của Cột Phải - PINNED TO BOTTOM */}
              <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Kích hoạt phòng thi:</span>
                  <span className="text-slate-400 lowercase font-normal">mở phòng ngay lập tức</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOnlineModalOpen(true)}
                  className="h-11 w-full px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:brightness-95 active:scale-[0.98] cursor-pointer"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Send className="w-4 h-4" />
                  <span>🚀 Tạo & Kích hoạt Ca thi trực tuyến</span>
                </button>
              </div>
            </div>
          </div>

          {/* Done & Return Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Bước 3</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleFinishExamCreation();
                onCancel();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer hover:brightness-95 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              ✓ Hoàn tất & Quay lại Quản lý đề thi
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK MANUAL QUESTION CREATION MODAL (Step 2) */}
      {/* ========================================================================= */}
      {manualModalCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setManualModalCell(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg z-10 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {manualModalCell.row.cloCode} • {BLOOM_3_CONFIG[manualModalCell.bloom].label}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Tạo câu hỏi thủ công bổ sung
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManualModalCell(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4 Phương án trả lời (chọn radio đáp án đúng)
                </label>
                <div className="space-y-1.5">
                  {manualOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="manualCorrect"
                        checked={manualCorrectIndex === i}
                        onChange={() => setManualCorrectIndex(i)}
                        className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        title="Đặt làm đáp án đúng"
                      />
                      <span className="w-4 font-bold text-slate-500">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setManualOptions((prev) => {
                            const cl = [...prev];
                            cl[i] = val;
                            return cl;
                          });
                        }}
                        placeholder={`Nội dung phương án ${String.fromCharCode(65 + i)}`}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-slate-200 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/60">
              <button
                type="button"
                onClick={() => setManualModalCell(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveManualQuestion}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs cursor-pointer"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Lưu vào kho & Duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONLINE EXAM SESSION MODAL (Step 4) */}
      {/* ========================================================================= */}
      {onlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setOnlineModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md z-10 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <RadioIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Khởi tạo ca thi trực tuyến
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sinh link phòng thi và mã ca thi cho sinh viên
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOnlineModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Exam code display */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80">
                <div className="text-[11px] font-bold text-indigo-900 uppercase">
                  Mã ca thi (Exam Code)
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xl font-black text-indigo-700 tracking-wider">
                    {generatedRoomCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedRoomCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-50 cursor-pointer shadow-2xs"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Link phong thi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đường dẫn phòng thi (Gửi cho sinh viên)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={`https://examflow.ai/join/${generatedRoomCode}`}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://examflow.ai/join/${generatedRoomCode}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer shrink-0"
                  >
                    {copiedLink ? 'Đã sao chép' : 'Copy link'}
                  </button>
                </div>
              </div>

              {/* Thời gian mở/đóng ca */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giờ mở phòng
                  </label>
                  <input
                    type="time"
                    value={onlineStartTime}
                    onChange={(e) => setOnlineStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giờ đóng phòng
                  </label>
                  <input
                    type="time"
                    value={onlineEndTime}
                    onChange={(e) => setOnlineEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setOnlineModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setOnlineModalOpen(false);
                  handleFinishExamCreation();
                  onNavigateToOnlineSession(examTitle, generatedRoomCode);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <span>Mở ca thi & Đến màn hình giám sát</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KHỐI KẾT XUẤT IN ẤN CHUYÊN DỤNG CHO PDF (PRINT-ONLY)                      */}
      {/* ========================================================================= */}
      <div className="print-only">
        {exportContentType === 'answer_key' ? (
          <div className="p-4 space-y-4 font-serif text-black">
            <div className="flex justify-between items-start text-xs border-b-2 border-black pb-2 text-center">
              <div className="w-1/2">
                <p className="font-bold">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                <p className="font-bold">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN</p>
                <p>KHOA CÔNG NGHỆ THÔNG TIN</p>
              </div>
              <div className="w-1/2">
                <p className="font-bold">BẢNG ĐÁP ÁN CHẤM THI CHÍNH THỨC</p>
                <p className="font-bold text-emerald-800">CHUẨN MA TRẬN OBE</p>
                <p>Học kỳ I - Năm học 2024-2025</p>
              </div>
            </div>

            <div className="text-center my-3">
              <h2 className="text-base font-bold uppercase">{examTitle}</h2>
              <p className="text-xs">
                Học phần: <b>{currentCourse.code} - {currentCourse.name}</b> • Tổng số câu: <b>{pickedQuestions.length}</b> • Thang điểm: <b>10.0</b>
              </p>
            </div>

            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 text-center">STT</th>
                  {(selectedExportCode === 'all' ? availableExamCodes : [selectedExportCode]).map((c) => (
                    <th key={c} className="border border-black p-1.5 text-center">Mã {c}</th>
                  ))}
                  <th className="border border-black p-1.5 text-center">Chuẩn CLO</th>
                  <th className="border border-black p-1.5 text-center">Mức Bloom</th>
                  <th className="border border-black p-1.5 text-center">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {pickedQuestions.map((pq, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                    {(selectedExportCode === 'all' ? availableExamCodes : [selectedExportCode]).map((c) => {
                      const permuted = getPermutedQuestionsForCode(c);
                      const item = permuted[idx];
                      return (
                        <td key={c} className="border border-black p-1.5 text-center font-bold text-sm text-emerald-800">
                          {String.fromCharCode(65 + (item ? item.correctIndex : pq.question.correctIndex))}
                        </td>
                      );
                    })}
                    <td className="border border-black p-1.5 text-center">{pq.cloCode}</td>
                    <td className="border border-black p-1.5 text-center">{BLOOM_3_CONFIG[pq.bloom].label}</td>
                    <td className="border border-black p-1.5 text-center font-semibold">{pq.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          (selectedExportCode === 'all' ? availableExamCodes : [selectedExportCode]).map((code, cIdx) => {
            const permuted = getPermutedQuestionsForCode(code);
            return (
              <div key={code} className={`p-4 font-serif text-black ${cIdx > 0 ? 'print-page-break' : ''}`}>
                {/* Header */}
                <div className="flex justify-between items-start text-xs border-b-2 border-black pb-2 text-center">
                  <div className="w-1/2">
                    <p className="font-bold">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                    <p className="font-bold">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN</p>
                    <p>KHOA CÔNG NGHỆ THÔNG TIN</p>
                  </div>
                  <div className="w-1/2">
                    <p className="font-bold">ĐỀ THI KẾT THÚC HỌC PHẦN (CHUẨN OBE)</p>
                    {exportContentType === 'instructor' && (
                      <p className="text-red-600 font-bold">[BẢN DÀNH CHO GIẢNG VIÊN / LƯU TRỮ]</p>
                    )}
                    <p>Học kỳ I - Năm học 2024-2025</p>
                  </div>
                </div>

                <div className="text-center my-3">
                  <h2 className="text-base font-bold uppercase">{examTitle}</h2>
                  <p className="text-xs">
                    Môn học: <b>{currentCourse.code} - {currentCourse.name}</b> • Thời gian làm bài: <b>{durationMinutes} phút</b>
                  </p>
                  <div className="inline-block border-2 border-black px-3 py-1 font-bold text-xs mt-1">
                    MÃ ĐỀ THI: {code}
                  </div>
                </div>

                {/* Student Info Box */}
                <div className="border border-black p-2 my-2 text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Họ và tên thí sinh: ................................................................</span>
                    <span>MSSV: ............................</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phòng thi: .................... Số báo danh: ........................</span>
                    <span>Chữ ký Giám thị: ...........................</span>
                  </div>
                </div>

                <div className="font-bold text-xs my-2 border-b border-black pb-1">
                  NỘI DUNG ĐỀ THI ({permuted.length} CÂU HỎI TRẮC NGHIỆM - THANG ĐIỂM 10.0)
                </div>

                {/* Question List */}
                <div className="space-y-3 text-xs">
                  {permuted.map((pq, qIdx) => (
                    <div key={qIdx} className="print-avoid-break">
                      <p className="font-bold">
                        Câu {qIdx + 1} ({pq.points} đ) [{pq.cloCode} - {BLOOM_3_CONFIG[pq.bloom].label}]:
                      </p>
                      <p className="mb-1">{pq.question.content}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {pq.options.map((opt, optIdx) => {
                          const isCorrect = pq.correctIndex === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={exportContentType === 'instructor' && isCorrect ? 'font-bold underline text-emerald-800' : ''}
                            >
                              <b>{String.fromCharCode(65 + optIdx)}.</b> {opt}
                              {exportContentType === 'instructor' && isCorrect && ' ✔'}
                            </div>
                          );
                        })}
                      </div>
                      {exportContentType === 'instructor' && pq.question.explanation && (
                        <div className="mt-1.5 p-2 bg-amber-50/50 border-l-4 border-amber-500 italic text-[11px]">
                          <b>💡 Lưu ý / Giải thích chi tiết:</b> {pq.question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6 text-xs font-bold">
                  --- HẾT (MÃ ĐỀ {code}) ---
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
