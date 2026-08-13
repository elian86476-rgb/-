import React from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

export const CoachSchedule: React.FC = () => {
  const { currentSession, schedules, activities } = useAcademy();

  const coachActivityId = currentSession.activityId;
  const currentActivity = activities.find((a) => a.id === coachActivityId);

  // Filter schedule items assigned to coach or coach activity
  const mySchedules = schedules.filter((s) => {
    return (
      s.coachId === currentSession.coachId ||
      (coachActivityId && s.activityId === coachActivityId)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          جدول مواعيدي وحصصي الأسبوعية ({currentActivity?.name})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          قائمة أوقات التدريب والحلقات الأسبوعية والقاعات الخاصة بك
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mySchedules.map((item) => (
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

      {mySchedules.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 text-slate-500">
          لا يوجد أي مواعيد مسجلة في جدولك الحالي.
        </div>
      )}
    </div>
  );
};
