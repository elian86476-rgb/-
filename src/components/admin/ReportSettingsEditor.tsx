import React from 'react';
import { ReportSettingsConfig } from '../../types';
import {
  Printer,
  Palette,
  Type,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Check,
  Building2,
  FileSpreadsheet,
  Receipt,
} from 'lucide-react';

interface ReportSettingsEditorProps {
  reportSettings?: ReportSettingsConfig;
  onChange: (updated: ReportSettingsConfig) => void;
  onReset: () => void;
}

const COLOR_PRESETS = [
  { id: '#0f172a', name: 'رمادي كحلي (Slate)', bgClass: 'bg-slate-900' },
  { id: '#059669', name: 'زمردي (Emerald)', bgClass: 'bg-emerald-600' },
  { id: '#0284c7', name: 'أزرق (Blue)', bgClass: 'bg-sky-600' },
  { id: '#4f46e5', name: 'نيلي (Indigo)', bgClass: 'bg-indigo-600' },
  { id: '#d97706', name: 'كهرماني (Amber)', bgClass: 'bg-amber-600' },
  { id: '#e11d48', name: 'وردي (Rose)', bgClass: 'bg-rose-600' },
  { id: '#9333ea', name: 'بنفسجي (Purple)', bgClass: 'bg-purple-600' },
];

export const defaultReportSettings: ReportSettingsConfig = {
  fontSize: 'medium',
  headerColor: '#0f172a',
  paperSize: 'A4',
  customLogoUrl: '',
  headerText: 'أكاديمية الفرسان للألعاب الرياضية وتحفيظ القرآن - قوة • أخلاق • انضباط',
  footerText: 'تم التصدير آلياً بواسطة نظام إدارة أكاديمية الفرسان الرقمي • معتمد من الإدارة',
  showLogo: true,
  showFooter: true,
};

export const ReportSettingsEditor: React.FC<ReportSettingsEditorProps> = ({
  reportSettings,
  onChange,
  onReset,
}) => {
  const settings: ReportSettingsConfig = {
    ...defaultReportSettings,
    ...(reportSettings || {}),
  };

  const handleUpdate = (updates: Partial<ReportSettingsConfig>) => {
    onChange({
      ...settings,
      ...updates,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-600" />
            <span>محرر مظهر الطباعة والتقارير والإيصالات (Report & Print Layout Customizer)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            التحكم الكامل في ألوان ترويسة التقرير، حجم الخطوط، قياس الورق (A4 / A5)، وشعار الأكاديمية والتذييل
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('هل أنت متأكد من إعادة ضبط إعدادات الطباعة للوضع الافتراضي؟')) {
              onReset();
            }
          }}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <span>استرجاع الافتراضي</span>
        </button>
      </div>

      {/* Grid of Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Paper Size Selector */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>مقاس الورق الافتراضي (Paper Size)</span>
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleUpdate({ paperSize: 'A4' })}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.paperSize === 'A4'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>A4 (قياسي)</span>
            </button>

            <button
              type="button"
              onClick={() => handleUpdate({ paperSize: 'A5' })}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                settings.paperSize === 'A5'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>A5 (إيصالات)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            {settings.paperSize === 'A4'
              ? 'مقاس A4 القياسي مثالي للتقارير الطويلة والكشوفات التفصيلية'
              : 'مقاس A5 المصغر مثالي لإيصالات السداد وكروت العضوية السريعة'}
          </p>
        </div>

        {/* 2. Font Size Selector */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-600" />
            <span>حجم خط الجدول والنصوص (Font Size)</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['small', 'medium', 'large'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => handleUpdate({ fontSize: sz })}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  settings.fontSize === sz
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {sz === 'small' ? 'صغير' : sz === 'medium' ? 'متوسط' : 'كبير'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            تحكم في تكبير وتصغير نصوص الجداول لضمان عدم التداخل والتفاف الكلمات بسلاسة
          </p>
        </div>

        {/* 3. Color Palette */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>لون الترويسة والعناوين (Header Color)</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {COLOR_PRESETS.map((col) => {
              const isSelected = settings.headerColor === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  title={col.name}
                  onClick={() => handleUpdate({ headerColor: col.id })}
                  className={`w-7 h-7 rounded-full ${col.bgClass} flex items-center justify-center transition-transform cursor-pointer ${
                    isSelected
                      ? 'scale-125 ring-2 ring-offset-2 ring-emerald-500 shadow-md'
                      : 'hover:scale-110 opacity-80'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logo & Header Text & Footer Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Header Title & Logo Input */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>عنوان الترويسة والشعار (Header Branding)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLogo}
                onChange={(e) => handleUpdate({ showLogo: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>إظهار الشعار</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              رابط شعار الأكاديمية (Logo Image URL)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="url"
                value={settings.customLogoUrl || ''}
                onChange={(e) => handleUpdate({ customLogoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              العنوان الفرعي / الشعارات (Header Subtitle / Slogan)
            </label>
            <input
              type="text"
              value={settings.headerText || ''}
              onChange={(e) => handleUpdate({ headerText: e.target.value })}
              placeholder="أكاديمية الفرسان للألعاب الرياضية - قوة • أخلاق • انضباط"
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>
        </div>

        {/* Footer Notes & Signatures */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>تذييل التقارير والتوقيعات (Footer & Signatures)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showFooter}
                onChange={(e) => handleUpdate({ showFooter: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>إظهار التذييل</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              نص التذييل / بيانات الاتصال والاعتماد
            </label>
            <textarea
              rows={3}
              value={settings.footerText || ''}
              onChange={(e) => handleUpdate({ footerText: e.target.value })}
              placeholder="تم التصدير آلياً بواسطة نظام إدارة الأكاديمية..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="p-5 bg-slate-950 text-white rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>معاينة حية ومباشرة لنموذج الطباعة (Live Print Preview)</span>
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-mono">
            {settings.paperSize} • {settings.fontSize?.toUpperCase()} FONT
          </span>
        </div>

        {/* Live Mock Sheet */}
        <div className="bg-white text-slate-900 p-6 rounded-xl shadow-lg space-y-4 font-sans text-right max-w-2xl mx-auto border border-slate-200">
          {/* Header Preview */}
          <div
            className="p-4 rounded-xl text-white flex justify-between items-center transition-all"
            style={{ backgroundColor: settings.headerColor || '#0f172a' }}
          >
            <div>
              <div className="font-black text-base">أكاديمية الفرسان الرياضية</div>
              <div className="text-[11px] opacity-90 mt-0.5 font-medium">
                {settings.headerText || 'قوة • أخلاق • انضباط'}
              </div>
            </div>
            {settings.showLogo && (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-xs shrink-0">
                {settings.customLogoUrl ? (
                  <img
                    src={settings.customLogoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  'FK'
                )}
              </div>
            )}
          </div>

          {/* Table Preview */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2">كود الطالب</th>
                  <th className="p-2">اسم الطالب</th>
                  <th className="p-2">النشاط</th>
                  <th className="p-2">الحالة</th>
                </tr>
              </thead>
              <tbody
                style={{
                  fontSize:
                    settings.fontSize === 'small'
                      ? '11px'
                      : settings.fontSize === 'large'
                      ? '14px'
                      : '12px',
                }}
              >
                <tr className="border-b border-slate-100">
                  <td className="p-2 font-mono font-bold text-emerald-600">PLY-1001</td>
                  <td className="p-2 font-bold">عمر أحمد علي</td>
                  <td className="p-2">تدريب الكاراتيه</td>
                  <td className="p-2 text-emerald-600 font-bold">حاضر ✅</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono font-bold text-emerald-600">PLY-1002</td>
                  <td className="p-2 font-bold">يوسف محمد حسن</td>
                  <td className="p-2">تحفيظ القرآن الكريم</td>
                  <td className="p-2 text-emerald-600 font-bold">خالص الاشتراك (0 ج.م)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Preview */}
          {settings.showFooter && (
            <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
              <div>{settings.footerText || 'تم التصدير آلياً بواسطة نظام أكاديمية الفرسان'}</div>
              <div>اعتماد الأكاديمية ____________</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
