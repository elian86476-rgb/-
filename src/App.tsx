import React, { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { ArrowRight, Home } from 'lucide-react';
import { AcademyProvider, useAcademy } from './context/AcademyContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginScreen } from './components/auth/LoginScreen';
import { MustChangePasswordModal } from './components/auth/MustChangePasswordModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { NewSubscriberWizard } from './components/admin/NewSubscriberWizard';
import { PlayersManagement } from './components/admin/PlayersManagement';
import { CoachesManagement } from './components/admin/CoachesManagement';
import { ParentsManagement } from './components/admin/ParentsManagement';
import { UserAccountsManagement } from './components/admin/UserAccountsManagement';
import { ActivitiesManagement } from './components/admin/ActivitiesManagement';
import { SubscriptionsManagement } from './components/admin/SubscriptionsManagement';
import { AttendanceReports } from './components/admin/AttendanceReports';
import { WeeklySchedule } from './components/admin/WeeklySchedule';
import { AcademySettings } from './components/admin/AcademySettings';
import { CreateAccountModal } from './components/admin/CreateAccountModal';
import { ReceivePaymentModal } from './components/admin/ReceivePaymentModal';

// Coach Components
import { CoachStudents } from './components/coach/CoachStudents';
import { AttendanceRecorder } from './components/coach/AttendanceRecorder';
import { SubscriptionsCollector } from './components/coach/SubscriptionsCollector';
import { PerformanceNotes } from './components/coach/PerformanceNotes';
import { CoachSchedule } from './components/coach/CoachSchedule';

// Parent Components
import { ParentDashboard } from './components/parent/ParentDashboard';
import { ChildAttendanceCalendar } from './components/parent/ChildAttendanceCalendar';
import { ChildFinancials } from './components/parent/ChildFinancials';
import { ChildSchedule } from './components/parent/ChildSchedule';
import { ChildNotes } from './components/parent/ChildNotes';
import { LinkChildTab } from './components/parent/LinkChildTab';

const getRootTabForRole = (role: string): string => {
  if (role === 'admin') return 'admin-dashboard';
  if (role === 'coach') return 'coach-students';
  if (role === 'parent') return 'parent-dashboard';
  return 'admin-dashboard';
};

const getTabTitle = (tab: string): string => {
  const titles: Record<string, string> = {
    'admin-dashboard': 'لوحة التحكم الرئيسية',
    'admin-register-wizard': 'معالج تسجيل مشترك جديد',
    'admin-players': 'إدارة اللاعبين والأبطال',
    'admin-coaches': 'إدارة المدربين والمحفظين',
    'admin-parents': 'أولياء الأمور وربط الأكواد',
    'admin-accounts': 'حسابات المستخدمين والصلاحيات',
    'admin-activities': 'الأنشطة والمجموعات الرياضية',
    'admin-subscriptions': 'الاشتراكات والمدفوعات',
    'admin-attendance': 'تقارير الحضور والغياب',
    'admin-schedule': 'جدول المواعيد الأسبوعي',
    'admin-settings': 'إعدادات الأكاديمية العامة',

    'coach-students': 'قائمة طلابي واللاعبين',
    'coach-attendance': 'تسجيل الحضور والغياب اليومي',
    'coach-subscriptions': 'تحصيل الاشتراكات والرسوم',
    'coach-notes': 'ملاحظات وتطوير الأداء',
    'coach-schedule': 'جدول مواعيد الحصص',

    'parent-dashboard': 'لوحة متابعة الأبناء',
    'parent-attendance': 'سجل حضور وغياب الأبناء',
    'parent-financials': 'الاشتراكات والمدفوعات للأبناء',
    'parent-schedule': 'جدول مواعيد تمارين الأبناء',
    'parent-notes': 'تقارير وملاحظات المدربين',
    'parent-link-child': 'ربط كود ابن جديد',
  };
  return titles[tab] || 'الشاشة الفرعية';
};

const AcademyAppContent: React.FC = () => {
  const { isAuthenticated, currentSession } = useAcademy();
  const activeRole = currentSession?.role || 'admin';
  const rootTab = getRootTabForRole(activeRole);

  const [activeTab, setActiveTabState] = useState<string>(rootTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showExitToast, setShowExitToast] = useState<boolean>(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState<boolean>(false);
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = useState<boolean>(false);

  const historyStackRef = useRef<string[]>([rootTab]);
  const lastBackPressRef = useRef<number>(0);
  const isSidebarOpenRef = useRef<boolean>(isSidebarOpen);
  const activeTabRef = useRef<string>(activeTab);

  // Keep refs updated for event listeners
  useEffect(() => {
    isSidebarOpenRef.current = isSidebarOpen;
  }, [isSidebarOpen]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Unified navigation method
  const navigateTo = useCallback(
    (newTab: string, replace = false) => {
      if (!newTab || newTab === activeTabRef.current) return;

      const stack = historyStackRef.current;
      const currentRoot = getRootTabForRole(activeRole);

      if (newTab === currentRoot) {
        historyStackRef.current = [currentRoot];
      } else if (replace) {
        if (stack.length > 0) {
          stack[stack.length - 1] = newTab;
        } else {
          stack.push(newTab);
        }
      } else {
        if (stack[stack.length - 1] !== newTab) {
          stack.push(newTab);
        }
      }

      window.history.pushState({ tab: newTab }, '', `#${newTab}`);
      setActiveTabState(newTab);
    },
    [activeRole]
  );

  // Handle back navigation logic
  const handleBackNavigation = useCallback(async () => {
    // 1. If mobile sidebar drawer is open, close it first
    if (isSidebarOpenRef.current) {
      setIsSidebarOpen(false);
      return;
    }

    const stack = historyStackRef.current;
    const currentRoot = getRootTabForRole(activeRole);

    // 2. If we have previous tabs in history stack
    if (stack.length > 1) {
      stack.pop(); // Remove current tab
      const previousTab = stack[stack.length - 1] || currentRoot;
      setActiveTabState(previousTab);
      window.history.replaceState({ tab: previousTab }, '', `#${previousTab}`);
      return;
    }

    // 3. If not on root tab, reset to root
    if (activeTabRef.current !== currentRoot) {
      historyStackRef.current = [currentRoot];
      setActiveTabState(currentRoot);
      window.history.replaceState({ tab: currentRoot }, '', `#${currentRoot}`);
      return;
    }

    // 4. We are on the main root screen -> 2-second double back press to exit
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      try {
        await CapacitorApp.exitApp();
      } catch {
        // Fallback for non-Capacitor web environment
      }
    } else {
      lastBackPressRef.current = now;
      setShowExitToast(true);
      setTimeout(() => {
        setShowExitToast(false);
      }, 2000);
    }
  }, [activeRole]);

  // Sync default tab & history on role change or login
  useEffect(() => {
    const defaultRoot = getRootTabForRole(activeRole);
    historyStackRef.current = [defaultRoot];
    setActiveTabState(defaultRoot);
    window.history.replaceState({ tab: defaultRoot }, '', `#${defaultRoot}`);
  }, [activeRole, isAuthenticated]);

  // Set up listeners for Capacitor Hardware Back Button & Browser Popstate (gestures)
  useEffect(() => {
    let capacitorListener: { remove: () => void } | null = null;

    const initCapacitor = async () => {
      try {
        capacitorListener = await CapacitorApp.addListener('backButton', () => {
          handleBackNavigation();
        });
      } catch {
        // Capacitor App plugin not active in standard web browser
      }
    };

    initCapacitor();

    const handlePopState = (event: PopStateEvent) => {
      const stateTab = event.state?.tab;
      const hashTab = window.location.hash.replace('#', '');
      const targetTab = stateTab || hashTab;

      if (targetTab && targetTab !== activeTabRef.current) {
        const stack = historyStackRef.current;
        if (stack.length > 1 && stack[stack.length - 2] === targetTab) {
          stack.pop();
        } else {
          stack.push(targetTab);
        }
        setActiveTabState(targetTab);
      } else {
        handleBackNavigation();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (capacitorListener && typeof capacitorListener.remove === 'function') {
        capacitorListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBackNavigation]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col dir-rtl text-right relative">
      {/* Toast Notification when user hits back button at root screen */}
      {showExitToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-slate-700/90 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md text-xs font-black flex items-center gap-2.5 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span>اضغط مرة أخرى للخروج من التطبيق</span>
        </div>
      )}

      {/* First Time Login Password Change Enforcement */}
      <MustChangePasswordModal />

      {/* Admin Create Account Registration Modal */}
      <CreateAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => setIsCreateAccountModalOpen(false)}
      />

      {/* Receive Payment Modal */}
      <ReceivePaymentModal
        isOpen={isReceivePaymentModalOpen}
        onClose={() => setIsReceivePaymentModalOpen(false)}
      />

      {/* Top Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setIsSidebarOpen(true)}
        onOpenCreateAccountModal={() => setIsCreateAccountModalOpen(true)}
        onOpenReceivePaymentModal={() => setIsReceivePaymentModalOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => navigateTo(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenCreateAccountModal={() => setIsCreateAccountModalOpen(true)}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Secondary Header with Visual Back Navigation Button */}
          {activeTab !== rootTab && (
            <div className="mb-5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 px-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all animate-fade-in">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackNavigation}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="الرجوع إلى الشاشة السابقة"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>الرجوع</span>
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:inline-block">
                  {getTabTitle(activeTab)}
                </span>
              </div>

              <button
                onClick={() => navigateTo(rootTab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="العودة إلى الشاشة الرئيسية"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden md:inline">اللوحة الرئيسية</span>
              </button>
            </div>
          )}

          {/* Admin Views */}
          {activeRole === 'admin' && (
            <>
              {activeTab === 'admin-dashboard' && (
                <AdminDashboard
                  onNavigate={(tab) => navigateTo(tab)}
                  onOpenCreateAccountModal={() => setIsCreateAccountModalOpen(true)}
                  onOpenReceivePaymentModal={() => setIsReceivePaymentModalOpen(true)}
                />
              )}
              {activeTab === 'admin-register-wizard' && (
                <NewSubscriberWizard
                  onFinish={() => navigateTo('admin-players')}
                  onCancel={() => navigateTo('admin-dashboard')}
                />
              )}
              {activeTab === 'admin-players' && (
                <PlayersManagement onNavigateToWizard={() => navigateTo('admin-register-wizard')} />
              )}
              {activeTab === 'admin-coaches' && <CoachesManagement />}
              {activeTab === 'admin-parents' && <ParentsManagement />}
              {activeTab === 'admin-accounts' && (
                <UserAccountsManagement
                  onOpenCreateAccountModal={() => setIsCreateAccountModalOpen(true)}
                />
              )}
              {activeTab === 'admin-activities' && <ActivitiesManagement />}
              {activeTab === 'admin-subscriptions' && (
                <SubscriptionsManagement
                  onOpenReceivePaymentModal={() => setIsReceivePaymentModalOpen(true)}
                />
              )}
              {activeTab === 'admin-attendance' && <AttendanceReports />}
              {activeTab === 'admin-schedule' && <WeeklySchedule />}
              {activeTab === 'admin-settings' && <AcademySettings />}
            </>
          )}

          {/* Coach Views */}
          {activeRole === 'coach' && (
            <>
              {activeTab === 'coach-students' && <CoachStudents />}
              {activeTab === 'coach-attendance' && <AttendanceRecorder />}
              {activeTab === 'coach-subscriptions' && <SubscriptionsCollector />}
              {activeTab === 'coach-notes' && <PerformanceNotes />}
              {activeTab === 'coach-schedule' && <CoachSchedule />}
            </>
          )}

          {/* Parent Views */}
          {activeRole === 'parent' && (
            <>
              {activeTab === 'parent-dashboard' && (
                <ParentDashboard onNavigate={(tab) => navigateTo(tab)} />
              )}
              {activeTab === 'parent-attendance' && <ChildAttendanceCalendar />}
              {activeTab === 'parent-financials' && <ChildFinancials />}
              {activeTab === 'parent-schedule' && <ChildSchedule />}
              {activeTab === 'parent-notes' && <ChildNotes />}
              {activeTab === 'parent-link-child' && <LinkChildTab />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AcademyProvider>
      <AcademyAppContent />
    </AcademyProvider>
  );
}

export default App;
