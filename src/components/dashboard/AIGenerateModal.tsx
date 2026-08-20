import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Wand2,
  CheckCircle2,
  BookOpen,
  Sliders,
  FileText,
  Plus,
  RefreshCw,
  Copy,
  Layers,
} from 'lucide-react';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSave?: (count: number) => void;
}

const SAMPLE_GENERATED_QUESTIONS = [
  {
    id: 1,
    question: 'Trong Java, phương thức nào của Interface được phép có phần thân (body) từ Java 8 trở đi?',
    options: [
      'A. Abstract method và Static method',
      'B. Default method và Static method',
      'C. Final method và Private method',
      'D. Synchronized method và Protected method',
    ],
    correctIndex: 1,
    difficulty: 'Trung bình',
    explanation: 'Từ Java 8, interface cho phép định nghĩa default method (với từ khóa default) và static method có sẵn implementation.',
  },
  {
    id: 2,
    question: 'Tính chất đa hình (Polymorphism) trong lập trình hướng đối tượng chủ yếu được thực hiện thông qua cơ chế nào?',
    options: [
      'A. Method Overloading và Method Overriding',
      'B. Encapsulation và Information Hiding',
      'C. Data Abstraction và Constructors',
      'D. Package Access và Finalizers',
    ],
    correctIndex: 0,
    difficulty: 'Dễ',
    explanation: 'Compile-time polymorphism thực hiện qua Overloading, Runtime polymorphism thực hiện qua Overriding.',
  },
  {
    id: 3,
    question: 'Cấu trúc dữ liệu nào trong Java Collections Framework đảm bảo các phần tử là duy nhất và duy trì thứ tự chèn (insertion order)?',
    options: [
      'A. HashSet',
      'B. TreeSet',
      'C. LinkedHashSet',
      'D. ArrayList',
    ],
    correctIndex: 2,
    difficulty: 'Khó',
    explanation: 'LinkedHashSet vừa đảm bảo tính duy nhất của Set, vừa duy trì thứ tự chèn nhờ danh sách liên kết đôi nội bộ.',
  },
];

export const AIGenerateModal: React.FC<AIGenerateModalProps> = ({
  isOpen,
  onClose,
  onSuccessSave,
}) => {
  const [subject, setSubject] = useState('Lập trình Java');
  const [topicPrompt, setTopicPrompt] = useState('Đa hình, Interface & Java Collections Framework');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<typeof SAMPLE_GENERATED_QUESTIONS | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedList(null);
    setIsSaved(false);

    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedList(SAMPLE_GENERATED_QUESTIONS);
    }, 1200);
  };

  const handleSaveToBank = () => {
    setIsSaved(true);
    setTimeout(() => {
      onSuccessSave?.(generatedList ? generatedList.length : 3);
      onClose();
      setIsSaved(false);
      setGeneratedList(null);
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
                    <span>AI Sinh Câu Hỏi Trắc Nghiệm</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Gemini Pro
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tự động tạo câu hỏi trắc nghiệm 4 đáp án kèm lời giải chi tiết và phân loại độ khó
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {!generatedList ? (
                <form onSubmit={handleGenerate} className="space-y-4">
                  {/* Subject selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Môn học
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="Lập trình Java">Lập trình Java (CS201)</option>
                      <option value="Cơ sở dữ liệu">Cơ sở dữ liệu (CS204)</option>
                      <option value="Mạng máy tính">Mạng máy tính (CS301)</option>
                      <option value="Trí tuệ nhân tạo cơ bản">Trí tuệ nhân tạo cơ bản (CS401)</option>
                      <option value="Cấu trúc dữ liệu & Giải thuật">Cấu trúc dữ liệu & Giải thuật (CS102)</option>
                    </select>
                  </div>

                  {/* Topic / Prompt */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Chủ đề / Đoạn nội dung bài học
                    </label>
                    <textarea
                      rows={3}
                      value={topicPrompt}
                      onChange={(e) => setTopicPrompt(e.target.value)}
                      placeholder="Ví dụ: Đa hình, Abstract class, Interface, Functional interface và Stream API..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none placeholder-slate-400"
                    />
                  </div>

                  {/* Difficulty & Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mức độ nhận thức
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setDifficulty(lvl)}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer capitalize ${
                              difficulty === lvl
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {lvl === 'easy' ? 'Dễ' : lvl === 'medium' ? 'Trung bình' : 'Khó'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Số lượng câu cần sinh
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[5, 10, 20].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setQuestionCount(cnt)}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              questionCount === cnt
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {cnt} câu
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI đang phân tích và sinh câu hỏi...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Bắt đầu sinh {questionCount} câu hỏi AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đã tạo thành công 3 câu hỏi mẫu chất lượng cao</span>
                    </div>
                    <button
                      onClick={() => setGeneratedList(null)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sinh lại
                    </button>
                  </div>

                  {/* List of generated questions */}
                  <div className="space-y-3">
                    {generatedList.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 leading-snug">
                            Câu {idx + 1}: {q.question}
                          </span>
                          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {q.difficulty}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg border text-[11px] font-medium ${
                                oIdx === q.correctIndex
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>

                        <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900">
                          <span className="font-bold text-indigo-700 mr-1">💡 Giải thích AI:</span>
                          {q.explanation}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setGeneratedList(null)}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Điều chỉnh tham số
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveToBank}
                      disabled={isSaved}
                      className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isSaved ? 'Đã lưu vào kho!' : 'Thêm vào ngân hàng câu hỏi'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
