import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { WelcomeSection } from './WelcomeSection';
import { StatCard } from './StatCard';
import { PerformanceChart } from './PerformanceChart';
import { QuickActions } from './QuickActions';
import { ScoreDistributionChart } from './ScoreDistributionChart';
import { QuestionBankOverview } from './QuestionBankOverview';
import { QuestionQualityWidget } from './QuestionQualityWidget';
import { RecentExamsTable } from './RecentExamsTable';
import { AIGenerateModal } from './AIGenerateModal';
import { CreateExamModal } from './CreateExamModal';
import { DASHBOARD_STATS } from '../../data/mockDashboardData';
import { DashboardNavTab, ExamRecord } from '../../types';

interface LecturerDashboardProps {
  onLogout?: () => void;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardNavTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
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
    if (tab !== 'overview') {
      showToast(`Đã chuyển tới phân hệ: ${tab}`);
    }
  };

  return (
    <div className="min-h-screen app-bg-main app-text-main flex flex-col lg:flex-row antialiased transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onOpenAIGenerator={() => setIsAIModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
          onOpenAIGenerator={() => setIsAIModalOpen(true)}
        />

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {/* Welcome Greeting & Primary Actions */}
          <WelcomeSection
            onCreateExam={() => setIsCreateExamModalOpen(true)}
            onOpenAIGenerator={() => setIsAIModalOpen(true)}
          />

          {/* 4 Summary Statistics Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {DASHBOARD_STATS.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </section>

          {/* Main Analytics Row: 2 Columns (Left: Performance Chart, Right: Quick Actions) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Left 7 cols: Kết quả thi gần đây */}
            <div className="lg:col-span-7 xl:col-span-8">
              <PerformanceChart />
            </div>

            {/* Right 5 cols: Thao tác nhanh */}
            <div className="lg:col-span-5 xl:col-span-4">
              <QuickActions
                onOpenAIGenerator={() => setIsAIModalOpen(true)}
                onCreateExam={() => setIsCreateExamModalOpen(true)}
                onCreateSession={() => showToast('Mở trình lên lịch Ca thi')}
              />
            </div>
          </section>

          {/* Second Analytics Row: Score Distribution & Question Bank Overview + Quality */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Score Distribution (Histogram) */}
            <div className="lg:col-span-5">
              <ScoreDistributionChart />
            </div>

            {/* Question Bank Overview */}
            <div className="lg:col-span-4">
              <QuestionBankOverview
                onOpenQuestionBank={() => handleTabChange('question-bank')}
                onOpenAIGenerator={() => setIsAIModalOpen(true)}
              />
            </div>

            {/* Question Quality Widget */}
            <div className="lg:col-span-3">
              <QuestionQualityWidget />
            </div>
          </section>

          {/* Recent Exams Table */}
          <section className="pt-2">
            <RecentExamsTable
              onViewExamDetail={(exam: ExamRecord) => {
                showToast(`Chi tiết kỳ thi: ${exam.title}`);
              }}
            />
          </section>

          {/* Bottom Footer Note */}
          <footer className="pt-6 pb-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              ExamFlow AI © 2026 — Phân hệ Quản lý & Khảo thí dành cho Giảng viên.
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <button
                onClick={() => showToast('Hỗ trợ kỹ thuật: support@examflow.edu.vn')}
                className="hover:text-indigo-600 transition-colors"
              >
                Trợ giúp
              </button>
              <span>•</span>
              <button
                onClick={() => showToast('Đang ở phiên bản v2.4.0')}
                className="hover:text-indigo-600 transition-colors"
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
