import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { PerformanceNote } from '../../types';
import { Modal } from '../common/Modal';
import { FileText, Plus, Star, Trash2, Calendar, User } from 'lucide-react';

export const PerformanceNotes: React.FC = () => {
  const {
    currentSession,
    notes,
    players,
    activities,
    addPerformanceNote,
    deletePerformanceNote,
  } = useAcademy();

  const coachActivityId = currentSession.activityId;
  const currentActivity = activities.find((a) => a.id === coachActivityId);

  // My students
  const myStudents = players.filter(
    (p) => coachActivityId && p.activityIds.includes(coachActivityId)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    playerId: myStudents[0]?.id || '',
    category: 'progress' as 'progress' | 'behavior' | 'memorization' | 'technique' | 'general',
    text: '',
    rating: 5,
  });

  const myNotes = notes.filter((n) => {
    return coachActivityId ? n.activityId === coachActivityId : true;
  });

  const handleOpenModal = () => {
    setFormData({
      playerId: myStudents[0]?.id || '',
      category: coachActivityId === 'act-quran' ? 'memorization' : 'technique',
      text: '',
      rating: 5,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim() || !formData.playerId) return;

    addPerformanceNote({
      playerId: formData.playerId,
      activityId: coachActivityId || 'act-karate',
      coachId: currentSession.coachId || 'coach-1',
      coachName: currentSession.name,
      date: new Date().toISOString().split('T')[0],
      text: formData.text,
      category: formData.category,
      rating: formData.rating,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            شاشة كتابة وتدوين ملاحظات الأداء والتقييم للطلاب
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            الملاحظات المدونة هنا تظهر بشكل فوري لولي الأمر في تطبيق ولي الأمر عند متابعة أداء ابنه
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ملاحظة وتقييم جديد</span>
        </button>
      </div>

      {/* Notes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myNotes.map((note) => {
          const student = players.find((p) => p.id === note.playerId);

          return (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {student?.fullName || 'طالب'}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    ({student?.playerCode})
                  </span>
                </div>

                <button
                  onClick={() => deletePerformanceNote(note.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                "{note.text}"
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {note.date}
                </span>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: note.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="كتابة ملاحظة وتقييم للطالب"
        subtitle="ستظهر الملاحظة فوراً لولي الأمر"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              اختر الطالب *
            </label>
            <select
              value={formData.playerId}
              onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              {myStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.playerCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              تصنيف الملاحظة
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as any })
              }
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <option value="memorization">التقدم في الحفظ والتسميع (قرآن)</option>
              <option value="technique">الأداء المظهري والكاتا/الساندا</option>
              <option value="progress">التقدم السلوكي والانضباط</option>
              <option value="general">توجيه عام لولي الأمر</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              نص الملاحظة *
            </label>
            <textarea
              required
              rows={4}
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="اكتب ملاحظتك التفصيلية عن أداء الطالب وتطوره..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              التقييم (عدد النجوم)
            </label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (ممتاز - 5 نجوم)</option>
              <option value={4}>⭐⭐⭐⭐ (جيد جداً - 4 نجوم)</option>
              <option value={3}>⭐⭐⭐ (جيد - 3 نجوم)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              نشر الملاحظة لولي الأمر
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
