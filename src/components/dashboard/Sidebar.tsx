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
  ChevronLeft,
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const mainNavItems: NavItem[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'courses', label: 'Quản lý học phần', icon: BookOpen },
    { id: 'question-bank', label: 'Ngân hàng câu hỏi', icon: Database },
    {
      id: 'ai-generator',
      label: 'AI sinh câu hỏi',
      icon: Sparkles,
      badge: 'AI',
      isAI: true,
    },
    { id: 'exams', label: 'Ma trận đề thi', icon: FileSpreadsheet },
    { id: 'exam-sessions', label: 'Ca thi / Đợt kiểm tra', icon: CalendarClock },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleItemClick = (id: DashboardNavTab) => {
    onTabChange(id);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderContent = (collapsed: boolean) => (
    <div className="relative flex flex-col h-full bg-white border-r border-slate-200 select-none transition-all duration-200">
      {/* Desktop Collapse/Expand Toggle Button on the border */}
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 rounded-full bg-white border border-slate-300 shadow-xs items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 z-40 transition-colors cursor-pointer"
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Top Logo & App Title (Logo reduced by ~15-20%) */}
      <div
        className={`h-14 border-b border-slate-100 flex items-center ${
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg text-white flex items-center justify-center flex-shrink-0 shadow-xs"
            style={{ backgroundColor: 'var(--primary)' }}
            title="ExamFlow AI"
          >
            <GraduationCap className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex items-baseline gap-1 min-w-0 truncate">
              <span className="font-bold text-[17px] text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                ExamFlow
              </span>
              <span
                className="text-[9px] font-bold px-1 py-0.2 rounded text-white tracking-wider uppercase"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                AI
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className={`flex-1 py-3 space-y-1 overflow-y-auto custom-scrollbar ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
          <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Chính
          </div>
        )}

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (collapsed) {
            return (
              <div key={item.id} className="relative group flex justify-center">
                <button
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${
                    isActive
                      ? 'font-semibold'
                      : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </button>

                {/* Floating Tooltip when collapsed */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                  <div className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap">
                    {item.label}
                    {item.badge && (
                      <span
                        className="ml-1.5 text-[10px] text-white px-1 py-0.2 rounded font-bold"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (item.isAI) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full h-11 flex items-center justify-between px-3 rounded-lg text-[15px] font-medium transition-colors group cursor-pointer border ${
                  isActive
                    ? 'font-semibold shadow-2xs'
                    : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                    style={
                      isActive
                        ? { backgroundColor: 'var(--primary)', color: '#FFFFFF' }
                        : { backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }
                    }
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
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
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full h-11 flex items-center justify-between px-3 rounded-lg text-[15px] font-medium transition-colors group cursor-pointer border ${
                isActive
                  ? 'font-semibold shadow-2xs'
                  : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                  style={isActive ? { color: 'var(--primary)' } : undefined}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && (
                <div
                  className="w-1.5 h-3.5 rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* AI Generator Quota Card (Compact) */}
      {!collapsed ? (
        <div className="px-3 py-2.5 mx-3 mb-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              AI Generator
            </span>
            <span className="text-[11px] text-slate-500 font-medium">86/200</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full w-[43%]"
              style={{ backgroundColor: 'var(--primary)' }}
            />
          </div>
          <div className="mt-1 flex justify-between items-center text-[10px] text-slate-500">
            <span>Hạn mức tháng</span>
            <button
              type="button"
              className="font-semibold cursor-pointer hover:underline"
              style={{ color: 'var(--primary)' }}
              onClick={onOpenAIGenerator}
            >
              Tạo thêm
            </button>
          </div>
        </div>
      ) : (
        <div className="px-2 pb-2 flex justify-center">
          <button
            type="button"
            onClick={onOpenAIGenerator}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer border"
            style={{
              backgroundColor: 'var(--primary-light)',
              borderColor: 'var(--primary-border)',
              color: 'var(--primary)',
            }}
            title="AI Generator (86/200 câu)"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Section: Logout */}
      <div className={`p-2 border-t border-slate-100 ${collapsed ? 'px-2' : 'px-3'}`}>
        {collapsed ? (
          <div className="relative group flex justify-center">
            <button
              type="button"
              onClick={onLogout}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
              <div className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap">
                Đăng xuất
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className="w-full h-10 flex items-center gap-2.5 px-3 rounded-lg text-[14px] font-medium text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px] text-rose-500" />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block h-screen fixed left-0 top-0 z-30 flex-shrink-0 transition-[width] duration-200 ${
          isCollapsed ? 'w-[76px]' : 'w-[235px]'
        }`}
      >
        {renderContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-[235px] max-w-[85vw] h-full shadow-xl z-10">
            {renderContent(false)}
          </div>
        </div>
      )}
    </>
  );
};
