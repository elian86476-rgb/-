import React from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Clock, MapPin, CalendarDays } from 'lucide-react';

export const ChildSchedule: React.FC = () => {
  const { currentSession, players, schedules, activities, selectedPlayerCode } = useAcademy();

  const activeChild = players.find((p) => p.playerCode === selectedPlayerCode) || players[0];

  if (!activeChild) {
    return <div className="p-8 text-center text-slate-500">يرجى ربط ابن أولاً لمتابعة جدول مواعيده.</div>;
  }

  // Schedule items for child's activities
  const childSchedules = schedules.filter((s) => activeChild.activityIds.includes(s.activityId));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          جدول المواعيد والحصص للابن ({activeChild.fullName})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          مواعيد التمارين وحلقات التحفيظ والقاعات المحددة أسبوعياً
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {childSchedules.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 inline-block">
              {item.dayOfWeek}
            </span>

            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {item.activityName} - {item.groupName}
              </h3>
              <p className="text-xs text-emerald-600 font-bold mt-1">
                المدرب: {item.coachName}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono dir-ltr">{item.startTime} - {item.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>المكان: {item.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
