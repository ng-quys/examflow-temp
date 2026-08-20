import React from 'react';
import {
  LayoutDashboard,
  Database,
  Sparkles,
  FileSpreadsheet,
  CalendarClock,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  X,
  ChevronRight,
} from 'lucide-react';
import { DashboardNavTab } from '../../types';

interface SidebarProps {
  activeTab: DashboardNavTab;
  onTabChange: (tab: DashboardNavTab) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onOpenAIGenerator: () => void;
}

interface NavItem {
  id: DashboardNavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  isAI?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  isMobileOpen = false,
  onMobileClose,
  onOpenAIGenerator,
}) => {
  const mainNavItems: NavItem[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'question-bank', label: 'Ngân hàng câu hỏi', icon: Database },
    {
      id: 'ai-generator',
      label: 'AI sinh câu hỏi',
      icon: Sparkles,
      badge: 'AI',
      isAI: true,
    },
    { id: 'exams', label: 'Đề thi', icon: FileSpreadsheet },
    { id: 'exam-sessions', label: 'Ca thi', icon: CalendarClock },
    { id: 'classes', label: 'Lớp học', icon: BookOpen },
    { id: 'students', label: 'Sinh viên', icon: Users },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3 },
  ];

  const handleItemClick = (id: DashboardNavTab, isAI?: boolean) => {
    if (isAI) {
      onOpenAIGenerator();
    }
    onTabChange(id);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const content = (
    <div className="flex flex-col h-full app-bg-card border-r app-border select-none">
      {/* Top Logo & App Title */}
      <div className="h-16 px-5 flex items-center justify-between border-b app-border-subtle">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-md"
            style={{ backgroundColor: 'var(--primary)', boxShadow: '0 4px 12px var(--primary-glow)' }}
          >
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-xl app-text-main tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              ExamFlow
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white tracking-wide uppercase"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              AI
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Chính
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAI) {
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id, true)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'border shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary-border)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={
                      isActive
                        ? { backgroundColor: 'var(--primary)', color: '#FFFFFF' }
                        : { backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }
                    }
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <span
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-text)',
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'font-semibold border shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderColor: 'var(--primary-border)',
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={
                    isActive
                      ? { backgroundColor: 'var(--primary)', color: '#FFFFFF' }
                      : { backgroundColor: 'transparent', color: 'inherit' }
                  }
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div
                  className="w-1.5 h-4 rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Status / AI Quota Pill */}
      <div
        className="px-4 py-3 mx-3 mb-2 rounded-xl border"
        style={{
          backgroundColor: 'var(--primary-light)',
          borderColor: 'var(--primary-border)',
        }}
      >
        <div className="flex items-center justify-between text-xs font-bold mb-1" style={{ color: 'var(--primary)' }}>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Generator
          </span>
          <span className="font-semibold text-[11px]">86/200</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full w-[43%]"
            style={{ backgroundColor: 'var(--primary)' }}
          />
        </div>
        <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-500 font-medium">
          <span>Hạn mức tháng này</span>
          <span
            className="font-bold cursor-pointer hover:underline"
            style={{ color: 'var(--primary)' }}
            onClick={onOpenAIGenerator}
          >
            Tạo thêm
          </span>
        </div>
      </div>

      {/* Bottom Section: Settings & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={() => handleItemClick('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-slate-100 text-slate-900 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400">
            <Settings className="w-4 h-4" />
          </div>
          <span>Cài đặt</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 group-hover:bg-rose-100">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-60 h-screen fixed left-0 top-0 z-30 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
