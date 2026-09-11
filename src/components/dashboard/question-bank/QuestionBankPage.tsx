import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  RotateCcw,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Check,
  X,
  AlertCircle,
  Layers,
  Brain,
  HelpCircle,
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

  const hasActiveFilters =
    selectedCourseId !== 'all' ||
    selectedTopicId !== 'all' ||
    selectedCLOId !== 'all' ||
    selectedBloom !== 'all' ||
    selectedStatus !== 'all' ||
    searchQuery.trim() !== '';

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
          {/* AI Generator button */}
          <button
            type="button"
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI sinh câu hỏi</span>
          </button>

          {/* Add question button */}
          <button
            type="button"
            onClick={() => {
              setQuestionToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm câu hỏi</span>
          </button>
        </div>
      </div>

      {/* 2. MULTI-DIMENSIONAL FILTER BAR */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span>Bộ lọc đa chiều (AND)</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Filter 1: Học phần */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Học phần
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseFilterChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả học phần</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Chương / Chủ đề (phụ thuộc Học phần) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Chủ đề kiến thức
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
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
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Chuẩn đầu ra (CLO)
            </label>
            <select
              value={selectedCLOId}
              onChange={(e) => setSelectedCLOId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
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
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Mức độ Bloom
            </label>
            <select
              value={selectedBloom}
              onChange={(e) => setSelectedBloom(e.target.value as Bloom3Level | 'all')}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả mức Bloom</option>
              <option value="remember">Nhận biết (Remember)</option>
              <option value="understand">Thông hiểu (Understand)</option>
              <option value="apply">Vận dụng (Apply)</option>
            </select>
          </div>

          {/* Filter 5: Trạng thái kiểm duyệt */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Trạng thái duyệt
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as 'all' | 'approved' | 'pending')
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt (Pending)</option>
            </select>
          </div>
        </div>

        {/* Live Search & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nội dung câu hỏi, đáp án, giải thích..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Đã tìm thấy <strong className="text-slate-900 font-bold">{filteredQuestions.length}</strong> câu hỏi phù hợp
          </div>
        </div>
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
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const course = courses.find((c) => c.id === q.courseId);
            const topic = chapters
              .flatMap((ch) => ch.topics)
              .find((t) => t.id === q.topicId);
            const clo = clos.find((c) => c.id === q.cloId);
            const bloomCfg = BLOOM_3_CONFIG[q.bloom];

            const isPending = q.status === 'pending';

            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-2xs space-y-3 transition-all ${
                  isPending ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/90'
                }`}
              >
                {/* Top: 3 Metadata Badges + Status + Date + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Badge 1: Chủ đề kiến thức */}
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                      title={`Học phần: ${course?.name || ''}`}
                    >
                      {topic ? `${topic.code} ${topic.name}` : 'Chủ đề'}
                    </span>

                    {/* Badge 2: Chuẩn đầu ra CLO */}
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold border"
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary-border)',
                      }}
                      title={clo?.description}
                    >
                      {clo ? clo.code : 'CLO'}
                    </span>

                    {/* Badge 3: Mức độ nhận thức Bloom */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${bloomCfg.bgClass} ${bloomCfg.textClass} ${bloomCfg.borderClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${bloomCfg.dotClass}`} />
                      <span>{bloomCfg.label}</span>
                    </span>

                    {/* Source: AI or Manual */}
                    {q.source === 'ai' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI sinh
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Thủ công</span>
                    )}

                    {/* Status badge */}
                    {isPending ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Chờ duyệt
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Đã duyệt
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[11px] text-slate-400">
                      Cập nhật: {q.updatedAt}
                    </span>

                    {/* Quick Approve / Reject for Pending questions */}
                    {isPending && (
                      <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleApproveQuestion(q.id)}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Duyệt câu hỏi này vào ngân hàng chính thức"
                        >
                          <Check className="w-3 h-3" />
                          <span>Duyệt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectQuestion(q.id)}
                          className="px-2 py-1 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold cursor-pointer"
                          title="Từ chối câu hỏi AI"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setQuestionToEdit(q);
                        setIsFormModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="text-xs font-semibold text-slate-900 leading-relaxed">
                  <span className="font-bold text-slate-500 mr-2">Câu {idx + 1}.</span>
                  {q.content}
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctIndex;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg border text-xs leading-snug flex items-start gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-1.5">
                    <span className="font-bold text-slate-700 shrink-0">💡 Giải thích:</span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
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
