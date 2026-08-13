import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Modal } from '../common/Modal';
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Swords,
  Flame,
  BookOpenCheck,
  User,
  Filter,
  ListOrdered,
  LayoutGrid,
  Table,
} from 'lucide-react';

export const WeeklySchedule: React.FC = () => {
  const { schedules, activities, coaches, addScheduleItem, deleteScheduleItem } = useAcademy();

  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const timetableDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const hourlySlots = [
    { hour: 14, label: '02:00 م' },
    { hour: 15, label: '03:00 م' },
    { hour: 16, label: '04:00 م' },
    { hour: 17, label: '05:00 م' },
    { hour: 18, label: '06:00 م' },
    { hour: 19, label: '07:00 م' },
    { hour: 20, label: '08:00 م' },
    { hour: 21, label: '09:00 م' },
    { hour: 22, label: '10:00 م' },
    { hour: 23, label: '11:00 م' },
  ];

  const [selectedDay, setSelectedDay] = useState<string>('الأحد');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'timetable'>('timetable');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    activityId: activities[0]?.id || '',
    groupId: activities[0]?.groups[0]?.id || '',
    dayOfWeek: 'الأحد',
    startTime: '16:00',
    endTime: '17:30',
    coachId: coaches[0]?.id || '',
    location: 'قاعة الأنشطة الرئيسية',
  });

  const getActivityIcon = (activityName: string) => {
    if (activityName.includes('كاراتيه')) return <Swords className="w-4 h-4 text-emerald-600" />;
    if (activityName.includes('كونغ فو')) return <Flame className="w-4 h-4 text-teal-600" />;
    if (activityName.includes('قرآن')) return <BookOpenCheck className="w-4 h-4 text-amber-600" />;
    return <CalendarDays className="w-4 h-4 text-blue-600" />;
  };

  const getActivityBadgeColor = (activityName: string) => {
    if (activityName.includes('كاراتيه'))
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (activityName.includes('كونغ فو'))
      return 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    if (activityName.includes('قرآن'))
      return 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const act = activities.find((a) => a.id === formData.activityId);
    const grp = act?.groups.find((g) => g.id === formData.groupId);
    const coach = coaches.find((c) => c.id === formData.coachId);

    addScheduleItem({
      activityId: formData.activityId,
      activityName: act?.name || 'نشاط',
      groupId: formData.groupId,
      groupName: grp?.name || 'المجموعة الأولى',
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      coachId: formData.coachId,
      coachName: coach?.fullName || 'المدرب',
      location: formData.location,
    });

    setIsModalOpen(false);
  };

  // Filter items by day and activity
  const filteredSchedules = schedules
    .filter((s) => {
      const matchDay = selectedDay === 'الجميع' || s.dayOfWeek === selectedDay;
      const matchActivity = selectedActivityId === 'all' || s.activityId === selectedActivityId;
      return matchDay && matchActivity;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Time conversion helper for Timetable grid cell matching
  const timeToDecimal = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) + (m || 0) / 60;
  };

  const getSchedulesForCell = (day: string, hourStart: number) => {
    const hourEnd = hourStart + 1;
    return schedules.filter((s) => {
      if (s.dayOfWeek !== day) return false;
      if (selectedActivityId !== 'all' && s.activityId !== selectedActivityId) return false;
      const start = timeToDecimal(s.startTime);
      const end = timeToDecimal(s.endTime);
      return start < hourEnd && end > hourStart;
    });
  };

  // Selected Activity Info
  const activeActivityObj = activities.find((a) => a.id === formData.activityId);

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-600" />
            <span>جدول الحصص والتمارين الأسبوعية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة وتصفح المواعيد المحددة لكل نشاط (كاراتيه، كونغ فو، قرآن) حسب أيام الأسبوع
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              ...formData,
              dayOfWeek: selectedDay !== 'الجميع' ? selectedDay : 'الأحد',
              activityId: selectedActivityId !== 'all' ? selectedActivityId : activities[0]?.id || '',
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>إضافة موعد نشاط جديد</span>
        </button>
      </div>

      {/* Filters & Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Row 1: Days Selector Buttons */}
        <div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
            <span>تحديد اليوم الأسبوعي (Daily Selector):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <button
              onClick={() => setSelectedDay('الجميع')}
              className={`w-auto min-w-fit shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedDay === 'الجميع'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              جميع أيام الأسبوع
            </button>
            {daysOfWeek.map((day) => {
              const dayCount = schedules.filter((s) => s.dayOfWeek === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-auto min-w-fit shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    selectedDay === day
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{day}</span>
                  {dayCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        selectedDay === day
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {dayCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Separate Activity Filter & View Toggle */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Activity Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <span className="text-xs font-bold text-slate-400 shrink-0 ml-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              النشاط:
            </span>
            <button
              onClick={() => setSelectedActivityId('all')}
              className={`w-auto min-w-fit shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedActivityId === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              جميع الأنشطة
            </button>
            {activities.map((act) => (
              <button
                key={act.id}
                onClick={() => setSelectedActivityId(act.id)}
                className={`w-auto min-w-fit shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedActivityId === act.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {getActivityIcon(act.name)}
                <span className="whitespace-nowrap">{act.name}</span>
              </button>
            ))}
          </div>

          {/* View Toggle (Timetable vs Timeline vs Grid) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode('timetable')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'timetable'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>جدول الساعات الشامل</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>جدول زمني</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected View Rendering */}
      {viewMode === 'timetable' ? (
        /* Full Weekly Timetable Grid View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                جدول الساعات الشامل الأسبوعي (من 02:00 م حتى 11:00 م)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              اضغط على المربع الشاغر (+) لإضافة تمرين مباشرة في التوقيت واليوم المحدد
            </p>
          </div>

          {/* Horizontally scrollable timetable grid */}
          <div className="overflow-x-auto pb-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right min-w-[950px] border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black">
                  <th className="p-3 text-center border-b border-l border-slate-200 dark:border-slate-700 w-28 sticky right-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-xs">
                    الساعة / اليوم
                  </th>
                  {timetableDays.map((day) => (
                    <th
                      key={day}
                      className={`p-3 text-center border-b border-l border-slate-200 dark:border-slate-700 min-w-[140px] ${
                        selectedDay === day
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : ''
                      }`}
                    >
                      <span>{day}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {hourlySlots.map(({ hour, label }) => (
                  <tr key={hour} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Time Sidebar Column (Right Column in RTL) */}
                    <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-800 sticky right-0 z-10 shadow-xs whitespace-nowrap">
                      {label}
                    </td>

                    {/* Day Cells */}
                    {timetableDays.map((day) => {
                      const cellSchedules = getSchedulesForCell(day, hour);

                      return (
                        <td
                          key={day}
                          className={`p-2 border-l border-slate-200 dark:border-slate-800 align-top transition-colors ${
                            selectedDay === day ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                          }`}
                        >
                          {cellSchedules.length > 0 ? (
                            <div className="space-y-2">
                              {cellSchedules.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-2xs space-y-1 relative group hover:border-emerald-500 transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${getActivityBadgeColor(
                                        item.activityName
                                      )}`}
                                    >
                                      {getActivityIcon(item.activityName)}
                                      <span className="truncate max-w-[85px]">{item.activityName}</span>
                                    </span>

                                    <button
                                      onClick={() => deleteScheduleItem(item.id)}
                                      className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                      title="حذف الموعد"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="font-bold text-slate-900 dark:text-white text-[11px] leading-snug">
                                    {item.groupName}
                                  </div>

                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <User className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span className="truncate">{item.coachName}</span>
                                  </div>

                                  <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 dir-ltr flex items-center gap-1 pt-0.5">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    <span>{item.startTime} - {item.endTime}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  dayOfWeek: day,
                                  startTime: `${hour.toString().padStart(2, '0')}:00`,
                                  endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
                                  activityId: selectedActivityId !== 'all' ? selectedActivityId : activities[0]?.id || '',
                                });
                                setIsModalOpen(true);
                              }}
                              className="w-full h-full min-h-[55px] rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-slate-300 dark:text-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center justify-center cursor-pointer group"
                              title={`إضافة موعد يوم ${day} الساعة ${label}`}
                            >
                              <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredSchedules.length > 0 ? (
        viewMode === 'timeline' ? (
          /* Daily Timeline View */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  جدول مواعيد يوم {selectedDay === 'الجميع' ? 'جميع أيام الأسبوع' : selectedDay}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                إجمالي المواعيد: {filteredSchedules.length}
              </span>
            </div>

            <div className="relative border-r-2 border-emerald-500/30 pr-6 space-y-6 mr-3">
              {filteredSchedules.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-600 shadow-sm" />

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Activity Badge */}
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${getActivityBadgeColor(
                            item.activityName
                          )}`}
                        >
                          {getActivityIcon(item.activityName)}
                          <span>{item.activityName}</span>
                        </span>

                        {/* Group Level */}
                        <span className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold">
                          {item.groupName}
                        </span>

                        {selectedDay === 'الجميع' && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                            {item.dayOfWeek}
                          </span>
                        )}
                      </div>

                      {/* Time Badge */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-mono font-bold shadow-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span dir="ltr">{item.startTime} - {item.endTime}</span>
                        </div>

                        <button
                          onClick={() => deleteScheduleItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="حذف هذا الموعد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meta info: Coach and Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          المدرب المسؤول: <strong className="text-slate-900 dark:text-white">{item.coachName}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          المكان: <strong className="text-slate-900 dark:text-white">{item.location}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${getActivityBadgeColor(
                      item.activityName
                    )}`}
                  >
                    {getActivityIcon(item.activityName)}
                    <span>{item.activityName}</span>
                  </span>

                  <button
                    onClick={() => deleteScheduleItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="حذف الموعد"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    اليوم: <span className="text-emerald-600">{item.dayOfWeek}</span>
                  </div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white mt-0.5">
                    {item.groupName}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>المدرب: {item.coachName}</span>
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono dir-ltr font-bold text-slate-800 dark:text-slate-200">
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-3">
          <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="font-bold text-slate-700 dark:text-slate-300">
            لا يوجد مواعيد تدريب مسجلة ليوم ({selectedDay})
          </div>
          <p className="text-xs text-slate-400">
            يمكنك إضافة مواعيد جديدة بالضغط على زر "إضافة موعد نشاط جديد"
          </p>
        </div>
      )}

      {/* Add Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة موعد نشاط وتدريب جديد"
        subtitle="حدد النشاط والمجموعة واليوم والتوقيت والقاعة"
        maxWidth="md"
      >
        <form onSubmit={handleAddSchedule} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                اليوم الأسبوعي *
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                اختر النشاط *
              </label>
              <select
                value={formData.activityId}
                onChange={(e) => {
                  const actId = e.target.value;
                  const act = activities.find((a) => a.id === actId);
                  setFormData({
                    ...formData,
                    activityId: actId,
                    groupId: act?.groups[0]?.id || '',
                  });
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                اختر المجموعة / المستوى *
              </label>
              <select
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
              >
                {activeActivityObj?.groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                )) || <option value="">المجموعة الأولى</option>}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                اختر المدرب *
              </label>
              <select
                value={formData.coachId}
                onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
              >
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                وقت البدء *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                وقت الانتهاء *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              مكان القاعة / الصالة *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="مثال: قاعة الكاراتيه الرئيسية (1)"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              حفظ الموعد
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
