import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import alForsanLogo from '../../assets/images/al_forsan_logo_1785855624462.jpg';
import {
  ShieldCheck,
  Award,
  Users,
  Bell,
  Menu,
  LogOut,
  Banknote,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onOpenCreateAccountModal?: () => void;
  onOpenReceivePaymentModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  onOpenCreateAccountModal,
  onOpenReceivePaymentModal,
}) => {
  const { currentSession, subscriptions, settings, logout } = useAcademy();
  const [showNotifications, setShowNotifications] = useState(false);

  // Overdue count
  const overdueCount = subscriptions.filter((s) => s.status === 'overdue').length;

  let roleBadge = {
    bg: 'bg-rose-500/10 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    icon: <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    label: 'الإدارة العامة',
  };

  if (currentSession.role === 'coach') {
    roleBadge = {
      bg: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      icon: <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      label: 'حساب مدرب',
    };
  } else if (currentSession.role === 'parent') {
    roleBadge = {
      bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      icon: <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      label: 'حساب ولي أمر',
    };
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Right Section: Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-md shadow-amber-500/20 bg-slate-900 shrink-0">
                <img
                  src={alForsanLogo}
                  alt="أكاديمية الفرسان"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-black text-slate-900 dark:text-white leading-none">
                  {settings.academyName}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 hidden sm:block">
                  الكاراتيه • الكونغ فو • تحفيظ القرآن الكريم
                </p>
              </div>
            </div>
          </div>

          {/* Left Section: Account & Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Notifications Alert Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="التنبيهات"
              >
                <Bell className="w-5 h-5" />
                {overdueCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {overdueCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:left-0 top-16 sm:top-full mt-2 mx-auto w-full sm:w-[400px] max-w-[400px] max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      تنبيهات النظام
                    </span>
                    <span className="text-xs text-rose-500 font-medium">
                      {overdueCount} اشتراكات متأخرة
                    </span>
                  </div>

                  {overdueCount > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {subscriptions
                        .filter((s) => s.status === 'overdue')
                        .map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs"
                          >
                            <div className="font-semibold text-rose-900 dark:text-rose-300">
                              اشتراك متأخر المستحق
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                              مبلغ {sub.remainingAmount} {settings.currency} - تاريخ الاستحقاق: {sub.nextDueDate}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-500">
                      لا توجد تنبيهات متأخرة حالياً
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Receive Cash Action Button */}
            {currentSession.role !== 'parent' && onOpenReceivePaymentModal && (
              <button
                onClick={onOpenReceivePaymentModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 border border-amber-500 rounded-xl transition-all shadow-sm shadow-amber-400/20 cursor-pointer"
                title="استلام نقدية وإصدار إيصال سداد"
              >
                <Banknote className="w-4 h-4 text-slate-950" />
                <span className="hidden md:inline">استلام نقدية</span>
              </button>
            )}

            {/* Current Active User Profile Display */}
            <div
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shadow-sm"
            >
              <div className="relative">
                <img
                  src={currentSession.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={currentSession.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                  {currentSession.name}
                </div>
                <div className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.2 rounded font-semibold border ${roleBadge.bg}`}>
                  {roleBadge.icon}
                  <span>{roleBadge.label}</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-all shadow-sm cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
