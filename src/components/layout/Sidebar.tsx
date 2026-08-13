import React from 'react';
import { useAcademy } from '../../context/AcademyContext';
import alForsanLogo from '../../assets/images/al_forsan_logo_1785855624462.jpg';
import { defaultUiRegistry } from '../../data/initialData';
import { DynamicIcon } from '../common/DynamicIcon';
import {
  LayoutDashboard,
  Users,
  Award,
  UserCheck,
  Swords,
  CreditCard,
  ClipboardCheck,
  CalendarDays,
  Settings,
  FileText,
  PlusCircle,
  UserPlus,
  X,
  BookOpenCheck,
  Flame,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenCreateAccountModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  isOpen,
  onClose,
  onOpenCreateAccountModal,
}) => {
  const { currentSession, activeRole, activities, settings, logout } = useAcademy();
  const reg = { ...defaultUiRegistry, ...(settings.uiRegistry || {}) };

  const isMobileOpen = isOpenMobile ?? isOpen ?? false;
  const handleCloseMobile = onCloseMobile ?? onClose ?? (() => {});

  // Determine role specific navigation links
  let navItems: { id: string; label: string; icon: React.ReactNode; badge?: string }[] = [];

  if (activeRole === 'admin') {
    const rawAdminItems = [
      { id: 'admin-dashboard', key: 'nav_dashboard', fallbackLabel: 'لوحة التحكم', fallbackIcon: 'LayoutDashboard' },
      { id: 'admin-register-wizard', key: 'nav_registerWizard', fallbackLabel: 'تسجيل مشترك جديد', fallbackIcon: 'UserPlus', badge: 'جديد' },
      { id: 'admin-players', key: 'nav_players', fallbackLabel: 'إدارة اللاعبين والأبطال', fallbackIcon: 'Users' },
      { id: 'admin-coaches', key: 'nav_coaches', fallbackLabel: 'المدربين والمحفظين', fallbackIcon: 'Award' },
      { id: 'admin-parents', key: 'nav_parents', fallbackLabel: 'أولياء الأمور وربط الأكواد', fallbackIcon: 'UserCheck' },
      { id: 'admin-accounts', key: 'nav_accounts', fallbackLabel: 'حسابات المستخدمين', fallbackIcon: 'ShieldCheck' },
      { id: 'admin-activities', key: 'nav_activities', fallbackLabel: 'الأنشطة والمجموعات', fallbackIcon: 'Swords' },
      { id: 'admin-subscriptions', key: 'nav_subscriptions', fallbackLabel: 'الاشتراكات والمدفوعات', fallbackIcon: 'CreditCard' },
      { id: 'admin-attendance', key: 'nav_attendance', fallbackLabel: 'تقارير الحضور والغياب', fallbackIcon: 'ClipboardCheck' },
      { id: 'admin-schedule', key: 'nav_schedule', fallbackLabel: 'الجدول الأسبوعي', fallbackIcon: 'CalendarDays' },
      { id: 'admin-settings', key: 'nav_settings', fallbackLabel: 'إعدادات الأكاديمية', fallbackIcon: 'Settings' },
    ];

    navItems = rawAdminItems
      .filter((item) => {
        const conf = reg[item.key];
        return conf ? conf.visible !== false : true;
      })
      .map((item) => {
        const conf = reg[item.key];
        const label = conf?.label || item.fallbackLabel;
        const iconName = conf?.icon || item.fallbackIcon;

        return {
          id: item.id,
          label,
          icon: <DynamicIcon name={iconName} className="w-5 h-5" />,
          badge: item.badge,
        };
      });
  } else if (activeRole === 'coach') {
    // Find coach assigned activity
    const coachActivity = activities.find((a) => a.id === currentSession.activityId);
    let activityName = coachActivity ? coachActivity.name : 'نشاطي';

    navItems = [
      { id: 'coach-students', label: `طلابي (${activityName})`, icon: <Users className="w-5 h-5" /> },
      { id: 'coach-attendance', label: 'تسجيل الحضور اليومي', icon: <ClipboardCheck className="w-5 h-5" /> },
      { id: 'coach-subscriptions', label: 'اشتراكات وتحصيل طلابي', icon: <CreditCard className="w-5 h-5" /> },
      { id: 'coach-notes', label: 'كتابة ملاحظات الأداء', icon: <FileText className="w-5 h-5" /> },
      { id: 'coach-schedule', label: 'جدول مواعيدي', icon: <CalendarDays className="w-5 h-5" /> },
    ];
  } else if (activeRole === 'parent') {
    navItems = [
      { id: 'parent-dashboard', label: 'بروفايل الابن والنظرة العامة', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'parent-attendance', label: 'متابعة الحضور والتقويم', icon: <ClipboardCheck className="w-5 h-5" /> },
      { id: 'parent-subscriptions', label: 'الاشتراكات والمدفوعات', icon: <CreditCard className="w-5 h-5" /> },
      { id: 'parent-schedule', label: 'الجدول الأسبوعي للابن', icon: <CalendarDays className="w-5 h-5" /> },
      { id: 'parent-notes', label: 'ملاحظات وتوجيهات المدرب', icon: <FileText className="w-5 h-5" /> },
      { id: 'parent-link-child', label: 'ربط ابن جديد (بكود اللاعب)', icon: <PlusCircle className="w-5 h-5" /> },
    ];
  }

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    handleCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={handleCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 right-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="font-bold text-slate-900 dark:text-white text-base">
            القائمة الرئيسية
          </span>
          <button
            onClick={handleCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academy Emblem Branding Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-900 text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400/90 shadow-lg shadow-amber-500/20 bg-slate-950 shrink-0">
            <img
              src={alForsanLogo}
              alt="أكاديمية الفرسان"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-black text-amber-300 truncate">أكاديمية الفرسان</h2>
            <p className="text-[10px] font-semibold text-slate-300 truncate">قوة • أخلاق • انضباط</p>
          </div>
        </div>

        {/* User Role Banner */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-amber-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
            {activeRole === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
            {activeRole === 'coach' && <Award className="w-4 h-4 text-amber-600" />}
            {activeRole === 'parent' && <UserCheck className="w-4 h-4 text-teal-600" />}
            <span>
              {activeRole === 'admin' && 'صلاحية: المدير العام'}
              {activeRole === 'coach' && 'صلاحية: المدرب / المحفظ'}
              {activeRole === 'parent' && 'صلاحية: ولي الأمر'}
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white truncate">
            {currentSession.name}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.icon}
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button in Sidebar */}
        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
              handleCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900/40 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* Activity Quick Stats Footprint */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
            الأنشطة المتاحة بالأكاديمية
          </div>
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
              <span className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" />
                الكاراتيه
              </span>
              <span className="text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded">مفعل</span>
            </div>
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                الكونغ فو
              </span>
              <span className="text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded">مفعل</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <BookOpenCheck className="w-3.5 h-3.5" />
                تحفيظ القرآن
              </span>
              <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">مفعل</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
