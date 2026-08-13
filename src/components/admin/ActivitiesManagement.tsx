import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Activity, ActivityGroup } from '../../types';
import { Modal } from '../common/Modal';
import { Swords, Flame, BookOpenCheck, Plus, Edit2, Trash2, Clock, MapPin, Users } from 'lucide-react';

export const ActivitiesManagement: React.FC = () => {
  const { activities, coaches, addActivity, updateActivity, deleteActivity, settings } = useAcademy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: 'karate' as 'karate' | 'kungfu' | 'quran',
    description: '',
    monthlyFee: 300,
    assignedCoachIds: [] as string[],
    groups: [] as ActivityGroup[],
  });

  const handleOpenAddModal = () => {
    setEditingActivity(null);
    setFormData({
      name: '',
      code: 'karate',
      description: '',
      monthlyFee: 300,
      assignedCoachIds: [coaches[0]?.id || ''],
      groups: [
        {
          id: `grp-${Date.now()}-1`,
          name: 'المجموعة الأولى (مبتدئين)',
          levelName: 'المستوى الأساسي',
          days: ['الأحد', 'الثلاثاء'],
          time: '04:00 م - 05:30 م',
          hall: 'القاعة الرئيسية',
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      code: activity.code,
      description: activity.description,
      monthlyFee: activity.monthlyFee,
      assignedCoachIds: [...activity.assignedCoachIds],
      groups: activity.groups.map((g) => ({ ...g })),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingActivity) {
      updateActivity(editingActivity.id, formData);
    } else {
      addActivity({
        ...formData,
        iconName: formData.code === 'karate' ? 'Swords' : formData.code === 'kungfu' ? 'Flame' : 'BookOpenCheck',
        badgeColor: 'bg-emerald-500/10 text-emerald-600',
      });
    }
    setIsModalOpen(false);
  };

  const addGroupItem = () => {
    setFormData((prev) => ({
      ...prev,
      groups: [
        ...prev.groups,
        {
          id: `grp-${Date.now()}`,
          name: `مجموعة جديدة (${prev.groups.length + 1})`,
          levelName: 'المستوى العام',
          days: ['الإثنين', 'الأربعاء'],
          time: '05:00 م - 06:30 م',
          hall: 'قاعة الأنشطة',
        },
      ],
    }));
  };

  const removeGroupItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            إدارة الأنشطة الرياضية والمجموعات
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة وتعديل الأنشطة (الكاراتيه، الكونغ فو، القرآن)، المجموعات، المواعيد وقيم الاشتراكات
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة نشاط جديد</span>
        </button>
      </div>

      {/* Activity List Cards */}
      <div className="space-y-6">
        {activities.map((activity) => {
          const assignedCoachesList = coaches.filter((c) => activity.assignedCoachIds.includes(c.id));

          return (
            <div
              key={activity.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              {/* Activity Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    {activity.code === 'karate' && <Swords className="w-6 h-6 text-rose-600" />}
                    {activity.code === 'kungfu' && <Flame className="w-6 h-6 text-amber-600" />}
                    {activity.code === 'quran' && <BookOpenCheck className="w-6 h-6 text-emerald-600" />}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {activity.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">الاشتراك الشهري</span>
                    <span className="text-base font-black text-emerald-600">
                      {activity.monthlyFee} {settings.currency}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEditModal(activity)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white transition-colors"
                      title="تعديل النشاط"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`حذف نشاط (${activity.name})؟`)) {
                          deleteActivity(activity.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                      title="حذف النشاط"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Assigned Coaches */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">المدربين المسؤولين:</span>
                <div className="flex flex-wrap gap-1.5">
                  {assignedCoachesList.map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    >
                      {c.fullName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Groups & Times Sub-section */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-3">
                  المجموعات والأيام والمواعيد الأسبوعية:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activity.groups.map((grp) => (
                    <div
                      key={grp.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{grp.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[11px]">
                          {grp.levelName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>الأيام: {grp.days.join(' • ')}</span>
                        <span>({grp.time})</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>المكان: {grp.hall}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'تعديل بيانات النشاط والمجموعات' : 'إضافة نشاط جديد'}
        subtitle="حدد اسم النشاط، الرسوم، والمدربين والمجموعات"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                اسم النشاط *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: تدريب الكاراتيه"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                نوع النشاط (الترميز)
              </label>
              <select
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value as 'karate' | 'kungfu' | 'quran' })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="karate">كاراتيه</option>
                <option value="kungfu">كونغ فو</option>
                <option value="quran">تحفيظ قرآن كريم</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              الوصف المختصر للنشاط
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف الفوائد وأسلوب التدريب..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                قيمة الاشتراك الشهري ({settings.currency}) *
              </label>
              <input
                type="number"
                required
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                المدربين المسندين
              </label>
              <select
                multiple
                value={formData.assignedCoachIds}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions, (option) => (option as HTMLOptionElement).value);
                  setFormData({ ...formData, assignedCoachIds: opts });
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-20"
              >
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Groups editor */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                المجموعات داخل النشاط:
              </span>
              <button
                type="button"
                onClick={addGroupItem}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                + إضافة مجموعة
              </button>
            </div>

            <div className="space-y-3">
              {formData.groups.map((grp, idx) => (
                <div
                  key={grp.id}
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <input
                    type="text"
                    placeholder="اسم المجموعة (مثال: البراعم)"
                    value={grp.name}
                    onChange={(e) => {
                      const newG = [...formData.groups];
                      newG[idx].name = e.target.value;
                      setFormData({ ...formData, groups: newG });
                    }}
                    className="p-2 border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="المستوى (مثال: حزام أصفر)"
                    value={grp.levelName}
                    onChange={(e) => {
                      const newG = [...formData.groups];
                      newG[idx].levelName = e.target.value;
                      setFormData({ ...formData, groups: newG });
                    }}
                    className="p-2 border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="التوقيت (مثال: 04:00 م - 05:30 م)"
                    value={grp.time}
                    onChange={(e) => {
                      const newG = [...formData.groups];
                      newG[idx].time = e.target.value;
                      setFormData({ ...formData, groups: newG });
                    }}
                    className="p-2 border rounded-lg text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="القاعة / صالة التدريب"
                      value={grp.hall}
                      onChange={(e) => {
                        const newG = [...formData.groups];
                        newG[idx].hall = e.target.value;
                        setFormData({ ...formData, groups: newG });
                      }}
                      className="p-2 border rounded-lg text-xs w-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeGroupItem(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 dark:text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              حفظ النشاط
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
