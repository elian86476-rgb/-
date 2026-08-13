import React from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Badge } from '../common/Badge';
import { CalendarCheck, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const ChildAttendanceCalendar: React.FC = () => {
  const { currentSession, parents, players, attendance, activities, selectedPlayerCode } = useAcademy();

  const currentParent = parents.find((p) => p.id === currentSession.parentId);
  const activeChild = players.find((p) => p.playerCode === selectedPlayerCode) || players[0];

  if (!activeChild) {
    return <div className="p-8 text-center text-slate-500">يرجى ربط ابن أولاً لمتابعة سجل الحضور والغياب.</div>;
  }

  const childAttendance = attendance.filter((a) => a.playerId === activeChild.id);

  // Rate calculations
  const totalCount = childAttendance.length;
  const presentCount = childAttendance.filter((a) => a.status === 'present').length;
  const lateCount = childAttendance.filter((a) => a.status === 'late').length;
  const absentCount = childAttendance.filter((a) => a.status === 'absent').length;

  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            متابعة الحضور والغياب للابن ({activeChild.fullName})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل التفاصيل اليومية للحصص ونسبة الانضباط والحضور الشاملة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">نسبة الحضور الإجمالية:</span>
          <span className="text-xl font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200">
            {attendanceRate}%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500">إجمالي الحصص</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-200 text-emerald-700 dark:text-emerald-400 shadow-sm">
          <span className="text-xs font-bold">حضور منتظم</span>
          <div className="text-2xl font-black mt-1">{presentCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-700 dark:text-amber-400 shadow-sm">
          <span className="text-xs font-bold">حضور متأخر</span>
          <div className="text-2xl font-black mt-1">{lateCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-200 text-rose-700 dark:text-rose-400 shadow-sm">
          <span className="text-xs font-bold">غياب</span>
          <div className="text-2xl font-black mt-1">{absentCount}</div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
          سجل الحصص السابقة بالتفصيل
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">النشاط</th>
                <th className="py-3.5 px-4">توقيت الحصة</th>
                <th className="py-3.5 px-4">حالة الحضور</th>
                <th className="py-3.5 px-4">ملاحظة المدرب بالحصة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {childAttendance.map((rec) => {
                const act = activities.find((a) => a.id === rec.activityId);

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {rec.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{act?.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dir-ltr text-right">
                      {rec.timeIn !== '00:00' ? `${rec.timeIn} - ${rec.timeOut}` : '---'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          rec.status === 'present'
                            ? 'success'
                            : rec.status === 'late'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {rec.status === 'present'
                          ? 'حاضر'
                          : rec.status === 'late'
                          ? 'متأخر'
                          : 'غائب'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic">
                      {rec.notes || 'لا توجد ملاحظات'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
