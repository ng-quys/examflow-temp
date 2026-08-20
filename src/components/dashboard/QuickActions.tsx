import React from 'react';
import { Sparkles, FilePlus2, CalendarPlus, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface QuickActionsProps {
  onOpenAIGenerator: () => void;
  onCreateExam: () => void;
  onCreateSession: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenAIGenerator,
  onCreateExam,
  onCreateSession,
}) => {
  return (
    <div className="app-bg-card rounded-2xl p-5 sm:p-6 border app-border shadow-xs flex flex-col justify-between h-full">
      <div className="pb-3 border-b app-border-subtle flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold app-text-main font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
            Thao tác nhanh
          </h3>
          <p className="text-xs app-text-muted mt-0.5">
            Lối tắt hỗ trợ tạo nội dung và tổ chức thi tiện lợi
          </p>
        </div>
      </div>

      <div className="space-y-3 my-auto py-2">
        {/* Action 1: AI tạo câu hỏi */}
        <button
          onClick={onOpenAIGenerator}
          className="w-full text-left p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden"
          style={{
            backgroundColor: 'var(--primary-light)',
            borderColor: 'var(--primary-border)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'var(--primary)',
                  boxShadow: '0 4px 12px var(--primary-glow)',
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className="text-sm font-bold transition-colors"
                    style={{ color: 'var(--primary)' }}
                  >
                    AI tạo câu hỏi
                  </h4>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    AI Fast
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sinh câu hỏi từ tài liệu hoặc nội dung bài học tự động với độ khó tùy chỉnh.
                </p>
              </div>
            </div>
            <div
              className="w-7 h-7 rounded-lg bg-white/90 border flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0 mt-1"
              style={{
                borderColor: 'var(--primary-border)',
                color: 'var(--primary)',
              }}
            >
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Action 2: Tạo đề thi */}
        <button
          onClick={onCreateExam}
          className="w-full text-left p-3.5 rounded-xl app-bg-card border app-border hover:bg-slate-50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors"
                style={{
                  backgroundColor: 'var(--primary-light)',
                  borderColor: 'var(--primary-border)',
                  color: 'var(--primary)',
                }}
              >
                <FilePlus2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold app-text-main group-hover:opacity-80 transition-opacity">
                  Tạo đề thi
                </h4>
                <p className="text-[11px] sm:text-xs app-text-muted mt-0.5">
                  Tạo đề từ ngân hàng câu hỏi hoặc ma trận đề thi.
                </p>
              </div>
            </div>
            <div
              className="w-6 h-6 rounded-lg group-hover:translate-x-0.5 transition-all shrink-0 flex items-center justify-center"
              style={{ color: 'var(--primary)' }}
            >
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Action 3: Tạo ca thi */}
        <button
          onClick={onCreateSession}
          className="w-full text-left p-3.5 rounded-xl app-bg-card border app-border hover:bg-slate-50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors"
                style={{
                  backgroundColor: 'var(--accent-bg-subtle)',
                  borderColor: 'var(--accent-border)',
                  color: 'var(--accent-text)',
                }}
              >
                <CalendarPlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold app-text-main group-hover:opacity-80 transition-opacity">
                  Tạo ca thi
                </h4>
                <p className="text-[11px] sm:text-xs app-text-muted mt-0.5">
                  Lên lịch và cấu hình thời gian, phòng máy, mã ca thi.
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-lg text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t app-border-subtle">
        <span>Gợi ý: Dùng phím tắt để thao tác nhanh</span>
        <span className="font-semibold text-slate-500">⌘K Tìm kiếm</span>
      </div>
    </div>
  );
};
