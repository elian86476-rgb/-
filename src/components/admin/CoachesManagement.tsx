import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Coach } from '../../types';
import { Modal } from '../common/Modal';
import { Award, Plus, Edit2, Trash2, Phone, Mail, Calendar, Swords, Flame, BookOpenCheck } from 'lucide-react';

export const CoachesManagement: React.FC = () => {
  const { coaches, activities, addCoach, updateCoach, deleteCoach } = useAcademy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    specialization: '',
    hireDate: new Date().toISOString().split('T')[0],
    activityIds: [] as string[],
  });

  const handleOpenAddModal = () => {
    setEditingCoach(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      specialization: '',
      hireDate: new Date().toISOString().split('T')[0],
      activityIds: [activities[0]?.id || 'act-karate'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coach: Coach) => {
    setEditingCoach(coach);
    setFormData({
      fullName: coach.fullName,
      phone: coach.phone,
      email: coach.email,
      specialization: coach.specialization,
      hireDate: coach.hireDate,
      activityIds: [...coach.activityIds],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    try {
      if (editingCoach) {
        updateCoach(editingCoach.id, formData);
      } else {
        addCoach(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving coach:', err);
      alert('حدث خطأ أثناء حفظ بيانات المدرب. يرجى إعادة المحاولة.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت تأكد من حذف حساب المدرب (${name})؟`)) {
      deleteCoach(id);
    }
  };

  const toggleActivitySelection = (actId: string) => {
    setFormData((prev) => {
      const exists = prev.activityIds.includes(actId);
      const updated = exists
        ? prev.activityIds.filter((id) => id !== actId)
        : [...prev.activityIds, actId];
      return { ...prev, activityIds: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            شاشة إدارة المدربين والمحفظين
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة حسابات المدربين والمحفظين وتحديد تخصصهم والأنشطة المسندة إليهم
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مدرب / محفظ جديد</span>
        </button>
      </div>

      {/* Grid of Coaches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coaches.map((coach) => {
          const coachActivities = activities.filter((a) => coach.activityIds.includes(a.id));

          return (
            <div
              key={coach.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={coach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={coach.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {coach.fullName}
                    </h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                      {coach.specialization}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{coach.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono dir-ltr">{coach.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>تاريخ الانضمام: {coach.hireDate}</span>
                  </div>
                </div>

                {/* Assigned Activities */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    الأنشطة المسندة للمدرب:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {coachActivities.map((act) => (
                      <span
                        key={act.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                      >
                        {act.code === 'karate' && <Swords className="w-3 h-3 text-rose-500" />}
                        {act.code === 'kungfu' && <Flame className="w-3 h-3 text-amber-500" />}
                        {act.code === 'quran' && <BookOpenCheck className="w-3 h-3 text-emerald-500" />}
                        <span>{act.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(coach)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDelete(coach.id, coach.fullName)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit Coach */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoach ? 'تعديل بيانات المدرب / المحفظ' : 'إضافة مدرب / محفظ جديد'}
        subtitle="أدخل البيانات والأنشطة المتخصص بها"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              الاسم الكامل واللقب *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="مثال: الكابتن / أحمد علي سلامة"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              التخصص والدرجة / الإجازة *
            </label>
            <input
              type="text"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="مثال: حزام أسود 4 دان - أو محفظ مجاز برواية حفص"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                رقم الهاتف *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01012345678"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني / حساب الدخول
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="01012345678 أو coach@gmail.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block text-slate-800 dark:text-slate-200 font-bold">
              الأنشطة التي يُدرب فيها:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activities.map((act) => {
                const isSelected = formData.activityIds.includes(act.id);
                return (
                  <button
                    type="button"
                    key={act.id}
                    onClick={() => toggleActivitySelection(act.id)}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{act.name}</span>
                  </button>
                );
              })}
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
              {editingCoach ? 'حفظ التعديلات' : 'إضافة المدرب'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
