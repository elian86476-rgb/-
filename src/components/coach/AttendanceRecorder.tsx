import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { DateInput } from '../common/DateInput';
import { AttendanceStatus } from '../../types';
import { ClipboardCheck, Check, X, Clock, Calendar, Save } from 'lucide-react';

export const AttendanceRecorder: React.FC = () => {
  const { currentSession, players, activities, recordAttendance, attendance } = useAcademy();

  const coachActivityId = currentSession.activityId;
  const currentActivity = activities.find((a) => a.id === coachActivityId);

  // Today's Date
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    currentActivity?.groups[0]?.id || ''
  );

  // Students in coach activity
  const myStudents = players.filter(
    (p) => coachActivityId && p.activityIds.includes(coachActivityId)
  );

  // Status state per player for selected date
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >(() => {
    const initialState: Record<string, { status: AttendanceStatus; notes: string }> = {};
    myStudents.forEach((st) => {
      // Check if existing record
      const existing = attendance.find(
        (a) => a.playerId === st.id && a.activityId === coachActivityId && a.date === selectedDate
      );
      initialState[st.id] = {
        status: existing ? existing.status : 'present',
        notes: existing?.notes || '',
      };
    });
    return initialState;
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleStatusChange = (playerId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], status },
    }));
  };

  const handleNotesChange = (playerId: string, notes: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], notes },
    }));
  };

  const handleSaveAll = () => {
    if (!coachActivityId) return;

    myStudents.forEach((st) => {
      const stData = attendanceState[st.id] || { status: 'present', notes: '' };
      recordAttendance({
        playerId: st.id,
        activityId: coachActivityId,
        groupId: selectedGroupId || 'grp-main',
        date: selectedDate,
        timeIn: stData.status === 'absent' ? '00:00' : '16:00',
        timeOut: stData.status === 'absent' ? '00:00' : '17:30',
        status: stData.status,
        recordedByCoachId: currentSession.coachId || 'coach-1',
        recordedByName: currentSession.name,
        notes: stData.notes,
      });
    });

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            شاشة تسجيل الحضور والغياب اليومي الحصص
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            نشاط: {currentActivity?.name || 'نشاطي'} • اختر التاريخ وانقر لتسجيل الحضور بضغطة واحدة
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>حفظ وتثبيت الحضور للحصة</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 text-xs font-bold text-center">
          ✓ تم تسجيل وتحفظ كشوف الحضور بنجاح في النظام!
        </div>
      )}

      {/* Date & Group Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        <div>
          <DateInput
            label="تاريخ الحصة"
            value={selectedDate}
            onChange={(iso) => setSelectedDate(iso)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            المجموعة / الحلقة
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
          >
            {currentActivity?.groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.time})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Attendance List */}
      <div className="space-y-3">
        {myStudents.map((student) => {
          const currentStatus = attendanceState[student.id]?.status || 'present';
          const currentNotes = attendanceState[student.id]?.notes || '';

          return (
            <div
              key={student.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900 dark:text-white">
                    {student.fullName}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600">
                    {student.playerCode}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  المستوى: {student.currentLevels[coachActivityId || ''] || 'عام'}
                </div>
              </div>

              {/* Status Toggle Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'present')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentStatus === 'present'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                  }`}
                >
                  ✓ حاضر
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'late')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentStatus === 'late'
                      ? 'bg-amber-500 text-white border-amber-500 shadow'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                  }`}
                >
                  ⏱ متأخر
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'absent')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentStatus === 'absent'
                      ? 'bg-rose-600 text-white border-rose-600 shadow'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                  }`}
                >
                  ✕ غائب
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'excused')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentStatus === 'excused'
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                  }`}
                >
                  🌴 إجازة
                </button>
              </div>

              {/* Note input */}
              <input
                type="text"
                placeholder="ملاحظة خاصة بالحضور..."
                value={currentNotes}
                onChange={(e) => handleNotesChange(student.id, e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs w-full md:w-48 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
