import React from 'react';
import { ChevronLeft, Banknote, Receipt } from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { defaultUiRegistry } from '../../data/initialData';
import { DynamicIcon } from '../common/DynamicIcon';

interface AdminDashboardProps {
  onNavigate: (tabId: string) => void;
  onOpenCreateAccountModal?: () => void;
  onOpenReceivePaymentModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenReceivePaymentModal,
}) => {
  const { settings } = useAcademy();
  const reg = { ...defaultUiRegistry, ...(settings.uiRegistry || {}) };
  const ui = settings.uiPreferences || { buttonSize: 'md', colorPalette: 'emerald', displayMode: 'detailed' };

  // Helper for color class
  const getColorBgClass = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20';
      case 'teal':
        return 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/20';
      case 'amber':
        return 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20';
      case 'indigo':
        return 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20';
      case 'rose':
        return 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20';
      case 'orange':
        return 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20';
      default:
        return 'bg-slate-700 hover:bg-slate-600 shadow-slate-700/20';
    }
  };

  // Button Size styling
  const sizeClass =
    ui.buttonSize === 'sm'
      ? 'p-4 rounded-xl text-xs sm:text-sm'
      : ui.buttonSize === 'lg'
      ? 'p-8 rounded-3xl text-base sm:text-lg md:text-xl'
      : 'p-6 rounded-2xl text-sm sm:text-base';

  const iconSizeClass =
    ui.buttonSize === 'sm' ? 'w-5 h-5' : ui.buttonSize === 'lg' ? 'w-9 h-9' : 'w-7 h-7';

  // Config items
  const newSubConf = reg.dashboard_newSubscriber;
  const subCollConf = reg.dashboard_subscriptionsCollection;
  const attConf = reg.dashboard_attendance;
  const repConf = reg.dashboard_reports;

  const cards = [
    {
      conf: newSubConf,
      fallbackLabel: 'تسجيل مشترك جديد',
      fallbackIcon: 'UserPlus',
      fallbackColor: 'emerald',
      subtext: 'معالج تسجيل لاعب وولي أمر واشتراك جديد',
      target: 'admin-register-wizard',
    },
    {
      conf: subCollConf,
      fallbackLabel: 'متابعة تحصيل الاشتراكات',
      fallbackIcon: 'CreditCard',
      fallbackColor: 'teal',
      subtext: 'تحصيل الأقساط وتسليم إيصالات الواتساب',
      target: 'admin-subscriptions',
    },
    {
      conf: attConf,
      fallbackLabel: 'تسجيل الحضور والغياب',
      fallbackIcon: 'CalendarCheck',
      fallbackColor: 'amber',
      subtext: 'تحضير الطلاب اليومي وعرض السجلات',
      target: 'admin-attendance',
    },
    {
      conf: repConf,
      fallbackLabel: 'التقارير والإحصائيات',
      fallbackIcon: 'BarChart3',
      fallbackColor: 'blue',
      subtext: 'كشوف الحضور وتقارير الأداء المتقدمة',
      target: 'admin-reports',
    },
  ].filter((item) => item.conf ? item.conf.visible !== false : true);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            الصفحة الرئيسية
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            اختر الإجراء المطلوب للانتقال الفوري
          </p>
        </div>

        {/* Featured Quick Cash Receipt Banner */}
        {onOpenReceivePaymentModal && (
          <div className="w-full p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-emerald-600/20 text-right">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shrink-0">
                <Banknote className="w-8 h-8 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black">إجراء مباشر: استلام نقدية (سند قبض)</h3>
                  <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">سريع</span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  تحصيل الاشتراكات والرسوم المباشرة (زي رياضي، اختار حزام، رسوم إدارية) وتوليد إيصال A5 رسمي
                </p>
              </div>
            </div>
            <button
              onClick={onOpenReceivePaymentModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer shrink-0 w-full sm:w-auto justify-center"
            >
              <Receipt className="w-4 h-4" />
              <span>استلام نقدية وإصدار إيصال</span>
            </button>
          </div>
        )}

        {cards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {cards.map((card, idx) => {
              const label = card.conf?.label || card.fallbackLabel;
              const iconName = card.conf?.icon || card.fallbackIcon;
              const color = card.conf?.color || card.fallbackColor;
              const bgClass = getColorBgClass(color);

              return (
                <button
                  key={idx}
                  onClick={() => onNavigate(card.target)}
                  className={`flex ${
                    ui.displayMode === 'compact'
                      ? 'flex-row items-center justify-between text-right'
                      : 'flex-col items-center justify-center text-center'
                  } ${sizeClass} ${bgClass} text-white font-black shadow-xl hover:scale-[1.02] transition-all cursor-pointer group gap-3.5`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors shrink-0">
                      <DynamicIcon name={iconName} className={iconSizeClass} />
                    </div>
                    <div className="text-right">
                      <div className="font-black">{label}</div>
                      {ui.displayMode === 'detailed' && (
                        <div className="text-[11px] font-normal opacity-90 mt-0.5">
                          {card.subtext}
                        </div>
                      )}
                    </div>
                  </div>
                  {ui.displayMode === 'compact' && <ChevronLeft className="w-5 h-5 opacity-70" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
            جميع بطاقات الشاشة الرئيسية مخفية حالياً. يمكنك إعادة تفعيلها من إعدادات الأكاديمية.
          </div>
        )}
      </div>
    </div>
  );
};

