import React, { useState } from 'react';
import { UIItemConfig, UIRegistryConfig } from '../../types';
import { defaultUiRegistry } from '../../data/initialData';
import { DynamicIcon, AVAILABLE_ICONS } from '../common/DynamicIcon';
import {
  LayoutDashboard,
  Navigation,
  FileBarChart,
  CalendarCheck,
  RotateCcw,
  Eye,
  EyeOff,
  Palette,
  Check,
} from 'lucide-react';

interface UniversalUIRegistryEditorProps {
  registry: UIRegistryConfig;
  onChange: (updated: UIRegistryConfig) => void;
  onResetAll: () => void;
}

const COLOR_OPTIONS: { id: UIItemConfig['color']; name: string; bgClass: string }[] = [
  { id: 'emerald', name: 'زمردي (Emerald)', bgClass: 'bg-emerald-600' },
  { id: 'teal', name: 'تيل (Teal)', bgClass: 'bg-teal-600' },
  { id: 'amber', name: 'كهرماني (Amber)', bgClass: 'bg-amber-600' },
  { id: 'blue', name: 'أزرق (Blue)', bgClass: 'bg-blue-600' },
  { id: 'indigo', name: 'نيلي (Indigo)', bgClass: 'bg-indigo-600' },
  { id: 'purple', name: 'بنفسجي (Purple)', bgClass: 'bg-purple-600' },
  { id: 'rose', name: 'وردي قاني (Rose)', bgClass: 'bg-rose-600' },
  { id: 'orange', name: 'برتقالي (Orange)', bgClass: 'bg-orange-600' },
  { id: 'slate', name: 'رمادي (Slate)', bgClass: 'bg-slate-700' },
];

export const UniversalUIRegistryEditor: React.FC<UniversalUIRegistryEditorProps> = ({
  registry,
  onChange,
  onResetAll,
}) => {
  const [activeCategory, setActiveCategory] = useState<'dashboard' | 'sidebar' | 'reports' | 'activities'>('dashboard');

  // Merge current registry with defaultUiRegistry in case keys are missing
  const currentRegistry: UIRegistryConfig = {
    ...defaultUiRegistry,
    ...(registry || {}),
  };

  const categories = [
    { id: 'dashboard', label: 'الرئيسية (Dashboard)', icon: LayoutDashboard },
    { id: 'sidebar', label: 'القائمة الجانبية (Sidebar)', icon: Navigation },
    { id: 'reports', label: 'التقارير (Reports)', icon: FileBarChart },
    { id: 'activities', label: 'الأنشطة والجدول (Activities)', icon: CalendarCheck },
  ] as const;

  const handleUpdateItem = (itemId: string, updates: Partial<UIItemConfig>) => {
    const updated = {
      ...currentRegistry,
      [itemId]: {
        ...currentRegistry[itemId],
        ...updates,
      },
    };
    onChange(updated);
  };

  // Filter items by category
  const categoryItems = Object.values(currentRegistry).filter(
    (item) => item.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Header & Reset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600" />
            <span>سجل الواجهة الشامل والمطوّر (Universal Dynamic UI Registry)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            حرية كاملة للأدمن لتغيير مسميات الأزرار، أيقونات Lucide، الألوان الرئيسية وإظهار/إخفاء كل عنصر بالكامل
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                'هل أنت متأكد من إعادة ضبط مصنع الواجهة؟ سيتم استرجاع جميع النصوص والأيقونات والألوان الافتراضية.'
              )
            ) {
              onResetAll();
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة ضبط المصنع للواجهة</span>
        </button>
      </div>

      {/* Categorized Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Items Grid for Active Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryItems.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all space-y-3.5 ${
                item.visible
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/60 opacity-60'
              }`}
            >
              {/* Item Top Bar */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0 ${
                      COLOR_OPTIONS.find((c) => c.id === item.color)?.bgClass || 'bg-slate-700'
                    }`}
                  >
                    <DynamicIcon name={item.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                  </div>
                </div>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleUpdateItem(item.id, { visible: !item.visible })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    item.visible
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {item.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>ظاهر</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>مخفي</span>
                    </>
                  )}
                </button>
              </div>

              {/* Controls */}
              <div className="space-y-3 pt-1">
                {/* 1. Label Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    النص والاسم المعروض (Display Label)
                  </label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-xs"
                    placeholder="أدخل النص المخصص..."
                  />
                </div>

                {/* 2. Icon Picker & Color Picker Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Icon Select */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      الأيقونة المخصصة (Icon)
                    </label>
                    <select
                      value={item.icon}
                      onChange={(e) => handleUpdateItem(item.id, { icon: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-xs cursor-pointer"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic.id} value={ic.id}>
                          {ic.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Accent Color Select */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      اللون الخاطف (Accent Color)
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {COLOR_OPTIONS.map((col) => {
                        const isSelected = item.color === col.id;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            title={col.name}
                            onClick={() => handleUpdateItem(item.id, { color: col.id })}
                            className={`w-6 h-6 rounded-full ${col.bgClass} flex items-center justify-center transition-transform cursor-pointer ${
                              isSelected ? 'scale-125 ring-2 ring-offset-2 ring-emerald-500 shadow-md' : 'hover:scale-110 opacity-80'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
