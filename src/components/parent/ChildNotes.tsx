import React from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { FileText, Star, Calendar, User } from 'lucide-react';

export const ChildNotes: React.FC = () => {
  const { players, notes, activities, selectedPlayerCode } = useAcademy();

  const activeChild = players.find((p) => p.playerCode === selectedPlayerCode) || players[0];

  if (!activeChild) {
    return <div className="p-8 text-center text-slate-500">يرجى ربط ابن أولاً لمتابعة الملاحظات.</div>;
  }

  const childNotes = notes.filter((n) => n.playerId === activeChild.id);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          ملاحظات وتقييمات المدربين للابن ({activeChild.fullName})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          ملاحظات وتوجيهات الكباتن والمحفظين اليومية لتقييم أداء الابن وتقدمه
        </p>
      </div>

      <div className="space-y-4 max-w-3xl">
        {childNotes.map((note) => {
          const act = activities.find((a) => a.id === note.activityId);

          return (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {act?.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    • بقلم الكابتن: {note.coachName}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: note.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                "{note.text}"
              </p>

              <div className="text-[11px] text-slate-400 font-mono text-left">
                التاريخ: {note.date}
              </div>
            </div>
          );
        })}

        {childNotes.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 text-slate-500">
            لا يوجد ملاحظات مدونة للابن حتى الآن.
          </div>
        )}
      </div>
    </div>
  );
};
