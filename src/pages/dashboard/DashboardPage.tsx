import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { TopHeader } from '../../components/dashboard/TopHeader';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { OnboardingDashboard } from '../../components/dashboard/academic/OnboardingDashboard';
import { ActiveDashboard } from '../../components/dashboard/academic/ActiveDashboard';
import { AIGenerateModal } from '../../components/dashboard/AIGenerateModal';
import { CreateExamModal } from '../../components/dashboard/CreateExamModal';
import { ExamWizardPage } from '../../components/wizard/ExamWizardPage';
import { ROUTES } from '../../constants/routes';
import { DashboardNavTab } from '../../types';

// Dev flag to display the demo state switcher in the Dashboard Header
const SHOW_DASHBOARD_DEMO_SWITCHER = true;

interface DashboardPageProps {
  onLogout?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardNavTab>('overview');
  const [dashboardMode, setDashboardMode] = useState<'active' | 'onboarding'>('active');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleTabChange = (tab: DashboardNavTab) => {
    setActiveTab(tab);
    if (tab !== 'overview' && tab !== 'exams') {
      showToast(`Đã chuyển tới phân hệ: ${tab}`);
    }
  };

  const handleOpenCreateExam = () => {
    setActiveTab('exams');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user selected 'exams' tab or clicked Create Exam, render full Exam Wizard Page
  if (activeTab === 'exams') {
    return (
      <ExamWizardPage
        onBackToDashboard={() => setActiveTab('overview')}
        onShowToast={showToast}
      />
    );
  }

  return (
    <div
      className="min-h-screen text-slate-900 flex flex-col lg:flex-row antialiased font-sans"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Left Sidebar (Collapsible: ~235px or ~76px) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onOpenAIGenerator={() => setIsAIModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-200 ${
          isSidebarCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[235px]'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
          onOpenAIGenerator={() => setIsAIModalOpen(true)}
        />

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-6xl w-full mx-auto space-y-4">
          {/* Main Dashboard Header */}
          <DashboardHeader
            title="Tổng quan"
            subtitle="Quản lý hoạt động thi và kết quả gần đây"
            dashboardMode={dashboardMode}
            onModeChange={setDashboardMode}
            showDemoSwitcher={SHOW_DASHBOARD_DEMO_SWITCHER}
          />

          {/* Conditional View: First-Use Onboarding vs Active Operational Dashboard */}
          {dashboardMode === 'onboarding' ? (
            <OnboardingDashboard
              onNavigateTab={handleTabChange}
              onOpenAIGenerator={() => setIsAIModalOpen(true)}
              onCreateExam={handleOpenCreateExam}
              onCreateSession={() => showToast('Mở trình tạo Ca thi mới')}
            />
          ) : (
            <ActiveDashboard
              onNavigateTab={handleTabChange}
              onOpenAIGenerator={() => setIsAIModalOpen(true)}
              onCreateExam={handleOpenCreateExam}
              onCreateSession={() => showToast('Mở trình tạo Ca thi mới')}
              onViewExamDetail={(title) => showToast(`Chi tiết kỳ thi: ${title}`)}
              onViewStudentDetail={(name) => showToast(`Xem bài làm của sinh viên: ${name}`)}
            />
          )}

          {/* Clean Administrative Footer */}
          <footer className="pt-8 pb-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              ExamFlow AI © 2026 — Hệ thống Quản lý Khảo thí & Đánh giá Chuẩn đầu ra.
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <button
                type="button"
                onClick={() => setDashboardMode((m) => (m === 'active' ? 'onboarding' : 'active'))}
                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Chuyển đổi giao diện Active / Onboarding trong môi trường phát triển"
              >
                Chế độ: {dashboardMode === 'active' ? 'Đã có dữ liệu' : 'Người dùng mới'}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => showToast('Hỗ trợ kỹ thuật: support@examflow.edu.vn')}
                className="hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Trợ giúp
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => showToast('Đang ở phiên bản v2.4.0')}
                className="hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Phiên bản v2.4.0
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* AI Generate Modal */}
      <AIGenerateModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccessSave={(count) => {
          showToast(`Đã thêm thành công ${count} câu hỏi do AI sinh vào Ngân hàng câu hỏi!`);
        }}
      />

      {/* Create Exam Modal */}
      <CreateExamModal
        isOpen={isCreateExamModalOpen}
        onClose={() => setIsCreateExamModalOpen(false)}
        onCreated={(title) => {
          showToast(`Đã tạo thành công đề thi: ${title}`);
        }}
      />
    </div>
  );
};
