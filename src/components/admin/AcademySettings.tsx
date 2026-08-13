import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { defaultUiRegistry, defaultReportSettings } from '../../data/initialData';
import { UniversalUIRegistryEditor } from './UniversalUIRegistryEditor';
import { ReportSettingsEditor } from './ReportSettingsEditor';
import {
  Settings,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ShieldCheck,
  Award,
  Swords,
  BookOpenCheck,
  LayoutGrid,
  UserPlus,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Palette,
  Type,
  Eye,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  Users,
  UserCheck,
  CalendarDays,
} from 'lucide-react';

const defaultCustomLabels = {
  newSubscriber: 'تسجيل مشترك جديد',
  subscriptionsCollection: 'متابعة تحصيل الاشتراكات',
  attendance: 'تسجيل الحضور والغياب',
  reports: 'التقارير والإحصائيات',
  playersManagement: 'إدارة اللاعبين والأبطال',
  coachesManagement: 'المدربين والمحفظين',
  parentsManagement: 'أولياء الأمور وربط الأكواد',
  userAccounts: 'حسابات المستخدمين',
  activitiesManagement: 'الأنشطة والمجموعات',
  scheduleManagement: 'الجدول الأسبوعي',
  settingsManagement: 'إعدادات الأكاديمية',
};

export const AcademySettings: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData } = useAcademy();

  const [formData, setFormData] = useState({
    ...settings,
    dashboardShortcuts: {
      showNewSubscriber: true,
      showSubscriptionCollection: true,
      showAttendance: true,
      showReports: true,
      ...settings.dashboardShortcuts,
    },
    customLabels: {
      ...defaultCustomLabels,
      ...settings.customLabels,
    },
    uiPreferences: {
      buttonSize: ('md' as const),
      colorPalette: ('emerald' as const),
      displayMode: ('detailed' as const),
      ...settings.uiPreferences,
    },
    uiRegistry: {
      ...defaultUiRegistry,
      ...(settings.uiRegistry || {}),
    },
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New item inputs
  const [newKarateBelt, setNewKarateBelt] = useState('');
  const [newKungfuBelt, setNewKungfuBelt] = useState('');
  const [newQuranLevel, setNewQuranLevel] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaultLabels = () => {
    if (window.confirm('هل أنت متأكد من إعادة جميع عناوين القوائم والبطاقات إلى الأسماء الافتراضية؟')) {
      setFormData({
        ...formData,
        customLabels: { ...defaultCustomLabels },
      });
    }
  };

  const handleAddKarateBelt = () => {
    if (!newKarateBelt.trim()) return;
    setFormData({
      ...formData,
      karateBelts: [...formData.karateBelts, newKarateBelt.trim()],
    });
    setNewKarateBelt('');
  };

  const handleRemoveKarateBelt = (index: number) => {
    setFormData({
      ...formData,
      karateBelts: formData.karateBelts.filter((_, i) => i !== index),
    });
  };

  const handleAddKungfuBelt = () => {
    if (!newKungfuBelt.trim()) return;
    setFormData({
      ...formData,
      kungfuBelts: [...formData.kungfuBelts, newKungfuBelt.trim()],
    });
    setNewKungfuBelt('');
  };

  const handleRemoveKungfuBelt = (index: number) => {
    setFormData({
      ...formData,
      kungfuBelts: formData.kungfuBelts.filter((_, i) => i !== index),
    });
  };

  const handleAddQuranLevel = () => {
    if (!newQuranLevel.trim()) return;
    setFormData({
      ...formData,
      quranLevels: [...formData.quranLevels, newQuranLevel.trim()],
    });
    setNewQuranLevel('');
  };

  const handleRemoveQuranLevel = (index: number) => {
    setFormData({
      ...formData,
      quranLevels: formData.quranLevels.filter((_, i) => i !== index),
    });
  };

  const colorPaletteOptions = [
    { id: 'emerald', name: 'الزمردي (الأصلي)', colorClass: 'bg-emerald-600' },
    { id: 'indigo', name: 'النيلي الملوكي', colorClass: 'bg-indigo-600' },
    { id: 'blue', name: 'الأزرق البحري', colorClass: 'bg-blue-600' },
    { id: 'purple', name: 'البنفسجي الفاخر', colorClass: 'bg-purple-600' },
    { id: 'amber', name: 'الذهبي الدافئ', colorClass: 'bg-amber-600' },
    { id: 'rose', name: 'الوردي الياقوتي', colorClass: 'bg-rose-600' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            إعدادات النظام والأكاديمية العامة
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            التعديل المباشر على بيانات الأكاديمية وتخصيص عناوين القوائم وأشكال الأيقونات والألوان
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ الإعدادات والتطبيقات</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 text-xs font-bold text-center animate-fade-in">
          ✓ تم حفظ كافة التخصيصات والإعدادات وتطبيقها حياً في التطبيق!
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs font-semibold">
        {/* Academy Info */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-black text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            بيانات الأكاديمية الأساسية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                اسم الأكاديمية
              </label>
              <input
                type="text"
                value={formData.academyName}
                onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                رقم هاتف التواصل الرسمي
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                رمز العملة المالي
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                العنوان
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Admin Universal UI Registry Editor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <UniversalUIRegistryEditor
            registry={formData.uiRegistry || defaultUiRegistry}
            onChange={(updated) => setFormData({ ...formData, uiRegistry: updated })}
            onResetAll={() => setFormData({ ...formData, uiRegistry: defaultUiRegistry })}
          />
        </div>

        {/* Report & Print Layout Customizer */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <ReportSettingsEditor
            reportSettings={formData.reportSettings}
            onChange={(updated) => setFormData({ ...formData, reportSettings: updated })}
            onReset={() => setFormData({ ...formData, reportSettings: defaultReportSettings })}
          />
        </div>

        {/* Dashboard Shortcut Customization Controls */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-emerald-600" />
                <span>إظهار/إخفاء اختصارات الصفحة الرئيسية (Dashboard Shortcuts Visibility)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                التحكم في إظهار أو إخفاء بطاقات الوصول السريع المعروضة في الشاشة الرئيسية للأدمن
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Toggle: New Subscriber */}
            <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {formData.customLabels.newSubscriber || 'تسجيل مشترك جديد'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    معالج إدخال لاعب جديد واشتراك
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.dashboardShortcuts?.showNewSubscriber ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dashboardShortcuts: {
                      showNewSubscriber: e.target.checked,
                      showSubscriptionCollection: formData.dashboardShortcuts?.showSubscriptionCollection ?? true,
                      showAttendance: formData.dashboardShortcuts?.showAttendance ?? true,
                      showReports: formData.dashboardShortcuts?.showReports ?? true,
                    },
                  })
                }
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer mt-0.5"
              />
            </label>

            {/* Toggle: Subscriptions Collection */}
            <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {formData.customLabels.subscriptionsCollection || 'متابعة تحصيل الاشتراكات'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    شاشة الاشتراكات والتحصيل الفوري
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.dashboardShortcuts?.showSubscriptionCollection ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dashboardShortcuts: {
                      showNewSubscriber: formData.dashboardShortcuts?.showNewSubscriber ?? true,
                      showSubscriptionCollection: e.target.checked,
                      showAttendance: formData.dashboardShortcuts?.showAttendance ?? true,
                      showReports: formData.dashboardShortcuts?.showReports ?? true,
                    },
                  })
                }
                className="w-5 h-5 accent-teal-600 rounded cursor-pointer mt-0.5"
              />
            </label>

            {/* Toggle: Attendance */}
            <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {formData.customLabels.attendance || 'تسجيل الحضور والغياب'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    اختصار التحضير اليومي للتمارين
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.dashboardShortcuts?.showAttendance ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dashboardShortcuts: {
                      showNewSubscriber: formData.dashboardShortcuts?.showNewSubscriber ?? true,
                      showSubscriptionCollection: formData.dashboardShortcuts?.showSubscriptionCollection ?? true,
                      showAttendance: e.target.checked,
                      showReports: formData.dashboardShortcuts?.showReports ?? true,
                    },
                  })
                }
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer mt-0.5"
              />
            </label>

            {/* Toggle: Reports */}
            <label className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {formData.customLabels.reports || 'التقارير والإحصائيات'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    عرض المخططات البيانية والتقارير
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.dashboardShortcuts?.showReports ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dashboardShortcuts: {
                      showNewSubscriber: formData.dashboardShortcuts?.showNewSubscriber ?? true,
                      showSubscriptionCollection: formData.dashboardShortcuts?.showSubscriptionCollection ?? true,
                      showAttendance: formData.dashboardShortcuts?.showAttendance ?? true,
                      showReports: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer mt-0.5"
              />
            </label>
          </div>
        </div>

        {/* Karate Belts Management */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-500" />
              <span>مستويات أحزمة الكاراتيه</span>
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="اسم حزام جديد (مثال: حزام برتقالي)"
              value={newKarateBelt}
              onChange={(e) => setNewKarateBelt(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              onClick={handleAddKarateBelt}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold whitespace-nowrap cursor-pointer text-xs"
            >
              + إضافة
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.karateBelts.map((belt, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <span>{belt}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKarateBelt(idx)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Kungfu Belts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-500" />
              <span>مستويات الكونغ فو والساندا</span>
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="اسم مستوى جديد"
              value={newKungfuBelt}
              onChange={(e) => setNewKungfuBelt(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              onClick={handleAddKungfuBelt}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold whitespace-nowrap cursor-pointer text-xs"
            >
              + إضافة
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.kungfuBelts.map((belt, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <span>{belt}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKungfuBelt(idx)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Quran Levels */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-emerald-500" />
              <span>رتب ومستويات تحفيظ القرآن الكريم</span>
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="مستوى حفظ جديد (مثال: حفظ 10 أجزاء)"
              value={newQuranLevel}
              onChange={(e) => setNewQuranLevel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              onClick={handleAddQuranLevel}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold whitespace-nowrap cursor-pointer text-xs"
            >
              + إضافة
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.quranLevels.map((lvl, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <span>{lvl}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuranLevel(idx)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Reset system data */}
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-rose-900 dark:text-rose-300">
              إعادة ضبط جميع بيانات التطبيق
            </h4>
            <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-0.5">
              يعيد التطبيق إلى بيانات العرض التوضيحية الأوّلية مع جميع الطلاب والأنشطة الافتراضية
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من إعادة ضبط البيانات إلى الحالة الافتراضية؟')) {
                resetToDefaultData();
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة الضبط الشامل</span>
          </button>
        </div>
      </form>
    </div>
  );
};
