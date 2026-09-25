import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  RotateCcw,
  Plus,
  Sparkles,
  Edit2,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Check,
  X,
  AlertCircle,
  Layers,
  Brain,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  QuestionItem,
  Course,
  CourseChapter,
  CourseCLO,
  Bloom3Level,
} from '../../../types';
import { BLOOM_3_CONFIG } from '../../../data/mockAcademicData';
import { QuestionFormModal } from './QuestionFormModal';
import { QuestionBankCard } from './QuestionBankCard';

interface QuestionBankPageProps {
  questions: QuestionItem[];
  courses: Course[];
  chapters: CourseChapter[];
  clos: CourseCLO[];
  onUpdateQuestions: (newQuestions: QuestionItem[]) => void;
  onOpenAIGenerator: () => void;
  onShowToast: (msg: string) => void;
  initialCourseFilter?: string;
  initialTopicFilter?: string;
}

export const QuestionBankPage: React.FC<QuestionBankPageProps> = ({
  questions,
  courses,
  chapters,
  clos,
  onUpdateQuestions,
  onOpenAIGenerator,
  onShowToast,
  initialCourseFilter,
  initialTopicFilter,
}) => {
  // Multi-Filter State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseFilter || 'all'
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicFilter || 'all'
  );
  const [selectedCLOId, setSelectedCLOId] = useState<string>('all');
  const [selectedBloom, setSelectedBloom] = useState<Bloom3Level | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter Drawer & Method Selector States
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isCreateMethodModalOpen, setIsCreateMethodModalOpen] = useState<boolean>(false);

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [questionToEdit, setQuestionToEdit] = useState<QuestionItem | null>(null);

  // Dependent Filter Options:
  // When course is selected, only show topics and CLOs of that course
  const availableChapters = useMemo(() => {
    if (selectedCourseId === 'all') return chapters;
    return chapters.filter((c) => c.courseId === selectedCourseId);
  }, [chapters, selectedCourseId]);

  const availableTopics = useMemo(() => {
    return availableChapters.flatMap((c) => c.topics);
  }, [availableChapters]);

  const availableCLOs = useMemo(() => {
    if (selectedCourseId === 'all') return clos;
    return clos.filter((c) => c.courseId === selectedCourseId);
  }, [clos, selectedCourseId]);

  // Handle Course filter change (reset topic and clo if needed)
  const handleCourseFilterChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedTopicId('all');
    setSelectedCLOId('all');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCourseId('all');
    setSelectedTopicId('all');
    setSelectedCLOId('all');
    setSelectedBloom('all');
    setSelectedStatus('all');
    setSearchQuery('');
    onShowToast('Đã xóa tất cả bộ lọc');
  };

  // Live AND Multi-filter logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Course
      if (selectedCourseId !== 'all' && q.courseId !== selectedCourseId) {
        return false;
      }
      // 2. Topic
      if (selectedTopicId !== 'all' && q.topicId !== selectedTopicId) {
        return false;
      }
      // 3. CLO
      if (selectedCLOId !== 'all' && q.cloId !== selectedCLOId) {
        return false;
      }
      // 4. Bloom
      if (selectedBloom !== 'all' && q.bloom !== selectedBloom) {
        return false;
      }
      // 5. Status
      if (selectedStatus !== 'all' && q.status !== selectedStatus) {
        return false;
      }
      // 6. Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchContent = q.content.toLowerCase().includes(query);
        const matchOptions = q.options.some((opt) => opt.toLowerCase().includes(query));
        const matchExplanation = q.explanation ? q.explanation.toLowerCase().includes(query) : false;
        if (!matchContent && !matchOptions && !matchExplanation) {
          return false;
        }
      }
      return true;
    });
  }, [
    questions,
    selectedCourseId,
    selectedTopicId,
    selectedCLOId,
    selectedBloom,
    selectedStatus,
    searchQuery,
  ]);

  // Question Actions
  const handleSaveQuestion = (savedQ: QuestionItem) => {
    if (questionToEdit) {
      onUpdateQuestions(questions.map((q) => (q.id === savedQ.id ? savedQ : q)));
      onShowToast('Đã cập nhật câu hỏi');
    } else {
      onUpdateQuestions([savedQ, ...questions]);
      onShowToast('Đã thêm câu hỏi mới vào ngân hàng');
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) {
      onUpdateQuestions(questions.filter((q) => q.id !== id));
      onShowToast('Đã xóa câu hỏi');
    }
  };

  const handleApproveQuestion = (id: string) => {
    onUpdateQuestions(
      questions.map((q) => (q.id === id ? { ...q, status: 'approved' as const } : q))
    );
    onShowToast('Đã duyệt câu hỏi vào ngân hàng chính thức');
  };

  const handleRejectQuestion = (id: string) => {
    if (window.confirm('Từ chối và gỡ bỏ câu hỏi AI này?')) {
      onUpdateQuestions(questions.filter((q) => q.id !== id));
      onShowToast('Đã từ chối câu hỏi AI');
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCourseId !== 'all') count++;
    if (selectedTopicId !== 'all') count++;
    if (selectedCLOId !== 'all') count++;
    if (selectedBloom !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    return count;
  }, [selectedCourseId, selectedTopicId, selectedCLOId, selectedBloom, selectedStatus]);

  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== '';

  const pendingCount = questions.filter((q) => q.status === 'pending').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
              <Database className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span>Ngân hàng câu hỏi</span>
            </h2>
            {pendingCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>{pendingCount} chờ duyệt</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý và tra cứu câu hỏi theo mô hình 3 chiều: Chủ đề kiến thức, Chuẩn đầu ra CLO và Thang đo Bloom
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Add question button (Primary action) */}
          <button
            type="button"
            onClick={() => setIsCreateMethodModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT SEARCH & COLLAPSIBLE FILTER TOOLBAR */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
        <div className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input + Filter Toggle Button */}
          <div className="flex items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo nội dung câu hỏi, đáp án, giải thích..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[var(--primary)] text-slate-800 placeholder:text-slate-400 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none shrink-0"
              style={
                isFilterOpen || activeFilterCount > 0
                  ? {
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderColor: 'var(--primary-border)',
                      boxShadow: '0 0 0 1px var(--primary-border)',
                    }
                  : {
                      backgroundColor: '#FFFFFF',
                      color: '#334155',
                      borderColor: '#E2E8F0',
                    }
              }
              title="Bật/Tắt bảng chọn bộ lọc đa chiều"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-black text-white ml-0.5"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isFilterOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Result Count */}
          <div className="text-xs text-slate-600 font-medium shrink-0 flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
            <span>
              Đã tìm thấy <strong className="text-slate-900 font-bold">{filteredQuestions.length}</strong> câu hỏi phù hợp
            </span>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <div className="border-t border-slate-150 bg-slate-50/70 p-4 sm:p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Filter className="w-3 h-3" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Bộ lọc đa chiều (AND)
                </span>
                {activeFilterCount > 0 && (
                  <span className="text-[11px] font-medium text-slate-500">
                    ({activeFilterCount} điều kiện đang lọc)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Xóa bộ lọc</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Đóng bộ lọc</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {/* Filter 1: Học phần */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Học phần
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseFilterChange(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white font-medium focus:outline-hidden transition-all ${
                    selectedCourseId !== 'all'
                      ? 'border-[var(--primary)] ring-1 ring-[var(--primary-border)]'
                      : 'border-slate-200 focus:border-[var(--primary)]'
                  }`}
                >
                  <option value="all">Tất cả học phần</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Chương / Chủ đề */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Chủ đề kiến thức
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white font-medium focus:outline-hidden transition-all ${
                    selectedTopicId !== 'all'
                      ? 'border-[var(--primary)] ring-1 ring-[var(--primary-border)]'
                      : 'border-slate-200 focus:border-[var(--primary)]'
                  }`}
                >
                  <option value="all">Tất cả chủ đề</option>
                  {availableChapters.map((chap) => (
                    <optgroup key={chap.id} label={`${chap.code}: ${chap.name}`}>
                      {chap.topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.code} {t.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Filter 3: Chuẩn đầu ra CLO */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Chuẩn đầu ra (CLO)
                </label>
                <select
                  value={selectedCLOId}
                  onChange={(e) => setSelectedCLOId(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white font-medium focus:outline-hidden transition-all ${
                    selectedCLOId !== 'all'
                      ? 'border-[var(--primary)] ring-1 ring-[var(--primary-border)]'
                      : 'border-slate-200 focus:border-[var(--primary)]'
                  }`}
                >
                  <option value="all">Tất cả chuẩn CLO</option>
                  {availableCLOs.map((clo) => (
                    <option key={clo.id} value={clo.id}>
                      {clo.code} ({clo.description.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 4: Mức độ Bloom */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Mức độ Bloom
                </label>
                <select
                  value={selectedBloom}
                  onChange={(e) => setSelectedBloom(e.target.value as Bloom3Level | 'all')}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white font-medium focus:outline-hidden transition-all ${
                    selectedBloom !== 'all'
                      ? 'border-[var(--primary)] ring-1 ring-[var(--primary-border)]'
                      : 'border-slate-200 focus:border-[var(--primary)]'
                  }`}
                >
                  <option value="all">Tất cả mức Bloom</option>
                  <option value="remember">Nhận biết (Remember)</option>
                  <option value="understand">Thông hiểu (Understand)</option>
                  <option value="apply">Vận dụng (Apply)</option>
                </select>
              </div>

              {/* Filter 5: Trạng thái kiểm duyệt */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Trạng thái duyệt
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as 'all' | 'approved' | 'pending')
                  }
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white font-medium focus:outline-hidden transition-all ${
                    selectedStatus !== 'all'
                      ? 'border-[var(--primary)] ring-1 ring-[var(--primary-border)]'
                      : 'border-slate-200 focus:border-[var(--primary)]'
                  }`}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="pending">Chờ duyệt (Pending)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. QUESTION LIST (CARD / ROW) */}
      {filteredQuestions.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-800">Không tìm thấy câu hỏi phù hợp</div>
          <p className="text-xs text-slate-500">
            Hãy thử thay đổi điều kiện bộ lọc hoặc bấm "Xóa bộ lọc" để hiển thị toàn bộ ngân hàng.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredQuestions.map((q, idx) => {
            const course = courses.find((c) => c.id === q.courseId);
            const chapter = chapters.find(
              (ch) => ch.topics.some((t) => t.id === q.topicId) || ch.courseId === q.courseId
            );
            const topic = chapters
              .flatMap((ch) => ch.topics)
              .find((t) => t.id === q.topicId);
            const clo = clos.find((c) => c.id === q.cloId);

            return (
              <QuestionBankCard
                key={q.id}
                question={q}
                index={idx}
                course={course}
                chapter={chapter}
                topicName={topic ? `${topic.code} ${topic.name}` : undefined}
                clo={clo}
                onSave={handleSaveQuestion}
                onDelete={handleDeleteQuestion}
                onApprove={handleApproveQuestion}
                onReject={handleRejectQuestion}
                onShowToast={onShowToast}
              />
            );
          })}
        </div>
      )}

      {/* Modal: Chọn phương thức tạo câu hỏi (Thêm thủ công vs Sinh bằng AI) */}
      {isCreateMethodModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsCreateMethodModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 relative animate-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsCreateMethodModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Bạn muốn tạo câu hỏi bằng cách nào?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Chọn phương thức tạo câu hỏi để bắt đầu thêm vào ngân hàng dữ liệu.
              </p>
            </div>

            {/* Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Card 1: Thêm thủ công */}
              <div
                onClick={() => {
                  setIsCreateMethodModalOpen(false);
                  setQuestionToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-[var(--primary)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Nhập liệu
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors group-hover:bg-slate-100">
                      <Edit3 className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-[var(--primary)] transition-colors">
                    Thêm thủ công
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Tạo câu hỏi trắc nghiệm và nhập đáp án trực tiếp vào ngân hàng câu hỏi.
                  </p>
                </div>
                <div
                  className="pt-3 flex items-center text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}
                >
                  <span>Mở trình nhập thủ công</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Card 2: Sinh bằng AI */}
              <div
                onClick={() => {
                  setIsCreateMethodModalOpen(false);
                  onOpenAIGenerator();
                }}
                className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-[var(--primary)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary-border)',
                      }}
                    >
                      AI Trợ lý
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        borderColor: 'var(--primary-border)',
                        color: 'var(--primary)',
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-[var(--primary)] transition-colors">
                    Sinh bằng AI
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Sinh câu hỏi từ văn bản hoặc tài liệu bằng AI và đưa vào trạng thái chờ duyệt.
                  </p>
                </div>
                <div
                  className="pt-3 flex items-center text-xs font-semibold"
                  style={{ color: 'var(--primary)' }}
                >
                  <span>Mở trình sinh AI</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setQuestionToEdit(null);
        }}
        questionToEdit={questionToEdit}
        courses={courses}
        chapters={chapters}
        clos={clos}
        onSave={handleSaveQuestion}
        defaultCourseId={selectedCourseId !== 'all' ? selectedCourseId : undefined}
        defaultTopicId={selectedTopicId !== 'all' ? selectedTopicId : undefined}
      />
    </div>
  );
};
