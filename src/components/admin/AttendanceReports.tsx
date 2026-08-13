import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ClipboardCheck, Search, Filter, Calendar, Users, CheckCircle, XCircle, Clock, FileDown, Loader2, MessageCircle, Printer } from 'lucide-react';
import { downloadAttendanceReportPDF } from '../../utils/pdfGenerator';
import { buildStudentReportMessage, openWhatsApp } from '../../utils/whatsapp';

export const AttendanceReports: React.FC = () => {
  const { attendance, players, activities, coaches, settings } = useAcademy();

  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [paperFormat, setPaperFormat] = useState<'A4' | 'A5'>(
    settings?.reportSettings?.paperSize || 'A4'
  );

  // Missing phone prompt modal state
  const [phonePromptData, setPhonePromptData] = useState<{
    isOpen: boolean;
    playerName: string;
    phoneInput: string;
    message: string;
  }>({
    isOpen: false,
    playerName: '',
    phoneInput: '',
    message: '',
  });

  const filteredAttendance = attendance.filter((rec) => {
    const player = players.find((p) => p.id === rec.playerId);
    const matchesSearch =
      !searchTerm ||
      (player && player.fullName.includes(searchTerm)) ||
      (player && player.playerCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesActivity = filterActivity === 'all' || rec.activityId === filterActivity;
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;

    return matchesSearch && matchesActivity && matchesStatus;
  });

  const handleExportPDF = async () => {
    setIsExporting(true);
    const exportData = filteredAttendance.map((rec) => {
      const player = players.find((p) => p.id === rec.playerId);
      const activity = activities.find((a) => a.id === rec.activityId);
      return {
        date: rec.date,
        playerName: player ? player.fullName : 'طالب غير محدد',
        playerCode: player ? player.playerCode : 'N/A',
        activityName: activity ? activity.name : 'غير محدد',
        status: rec.status,
        notes: rec.notes,
      };
    });

    await downloadAttendanceReportPDF(
      exportData,
      'تقرير حضور وغياب طلاب أكاديمية الفرسان',
      { settings, paperSize: paperFormat }
    );
    setIsExporting(false);
  };

  const handleShareWhatsAppAttendanceRec = (rec: typeof attendance[0]) => {
    const player = players.find((p) => p.id === rec.playerId);
    const activity = activities.find((a) => a.id === rec.activityId);

    const statusLabel =
      rec.status === 'present'
        ? 'حاضر ✅'
        : rec.status === 'late'
        ? 'متأخر ⚠️'
        : rec.status === 'absent'
        ? 'غائب ❌'
        : 'إجازة بعذر 🟡';

    const msg = buildStudentReportMessage({
      academyName: settings.academyName || 'أكاديمية الفرسان الرياضية',
      playerName: player ? player.fullName : 'طالب',
      playerCode: player ? player.playerCode : 'N/A',
      parentName: player?.parentName,
      activities: activity ? [activity.name] : [],
      status: player?.status || 'active',
      attendanceSummary: `سجل يوم ${rec.date}: ${statusLabel} (${rec.timeIn !== '00:00' ? `وقت الحضور: ${rec.timeIn}` : 'غير محدد'})`,
      coachName: rec.recordedByName,
      notes: rec.notes,
    });

    const phone = player?.parentPhone || player?.phone || '';

    openWhatsApp(phone, msg, () => {
      setPhonePromptData({
        isOpen: true,
        playerName: player ? player.fullName : 'الطالب',
        phoneInput: '',
        message: msg,
      });
    });
  };

  // Calculate percentages
  const totalCount = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;

  const reportTitleConf = settings.uiRegistry?.report_attendanceTitle;
  const reportTitle = reportTitleConf?.label || 'تقارير وسجلات الحضور والغياب';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {reportTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مراجعة سجلات الحضور اليومية لجميع الأنشطة واللاعبين المسجلة بواسطة المدربين والمحفظين
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Paper Size Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setPaperFormat('A4')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                paperFormat === 'A4'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => setPaperFormat('A5')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                paperFormat === 'A5'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              A5
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
            title="طباعة التقرير مباشرة"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline">طباعة</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting || filteredAttendance.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>تحميل PDF ({paperFormat})</span>
          </button>
        </div>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500">إجمالي السجلات</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">حضور منتظم</span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{presentCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 dark:border-amber-800 shadow-sm">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">حضور متأخر</span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{lateCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-200 dark:border-rose-800 shadow-sm">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400">غياب</span>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{absentCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث بالاسم أو كود الطالب..."
            className="w-full pr-10 pl-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={filterActivity}
          onChange={(e) => setFilterActivity(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="all">جميع الأنشطة والرياضات</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="all">جميع الحالات</option>
          <option value="present">حاضر</option>
          <option value="late">متأخر</option>
          <option value="absent">غائب</option>
          <option value="excused">إجازة بعذر</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">اسم الطالب</th>
                <th className="py-3.5 px-4">كود اللاعب</th>
                <th className="py-3.5 px-4">النشاط</th>
                <th className="py-3.5 px-4">وقت الحضور والانصراف</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4">المدرب المسجّل</th>
                <th className="py-3.5 px-4">ملاحظات الحضور</th>
                <th className="py-3.5 px-4">واتساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredAttendance.map((rec) => {
                const player = players.find((p) => p.id === rec.playerId);
                const act = activities.find((a) => a.id === rec.activityId);

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {rec.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {player?.fullName || 'طالب مجهول'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {player?.playerCode}
                    </td>
                    <td className="py-3.5 px-4">{act?.name}</td>
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
                            : rec.status === 'absent'
                            ? 'danger'
                            : 'info'
                        }
                        size="sm"
                      >
                        {rec.status === 'present'
                          ? 'حاضر'
                          : rec.status === 'late'
                          ? 'متأخر'
                          : rec.status === 'absent'
                          ? 'غائب'
                          : 'إجازة'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                      {rec.recordedByName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {rec.notes || 'لا توجد ملاحظة'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleShareWhatsAppAttendanceRec(rec)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                        title="إرسال إشعار الحضور لولي الأمر عبر واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>إرسال</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Missing Phone Number Prompt Modal for WhatsApp */}
      {phonePromptData.isOpen && (
        <Modal
          isOpen={phonePromptData.isOpen}
          onClose={() => setPhonePromptData({ ...phonePromptData, isOpen: false })}
          title="رقم الهاتف غير مسجل"
          subtitle={`يرجى إدخال رقم هاتف ولي الأمر للطالب (${phonePromptData.playerName}) لإرسال إشعار الحضور عبر الواتساب`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-semibold">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 font-semibold">
              ⚠️ رقم الهاتف الخاص بهذا اللاعب فارغ. أدخل الرقم أدناه ليتم فتح الواتساب مباشرة مجهزاً بإشعار الحضور.
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                رقم الواتساب (مثال: 01012345678 أو 201012345678)
              </label>
              <input
                type="tel"
                value={phonePromptData.phoneInput}
                onChange={(e) =>
                  setPhonePromptData({ ...phonePromptData, phoneInput: e.target.value })
                }
                placeholder="01xxxxxxxxx"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold dir-ltr text-right"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPhonePromptData({ ...phonePromptData, isOpen: false })}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!phonePromptData.phoneInput.trim()) {
                    alert('يرجى إدخال رقم الهاتف!');
                    return;
                  }
                  openWhatsApp(phonePromptData.phoneInput, phonePromptData.message);
                  setPhonePromptData({ ...phonePromptData, isOpen: false });
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال عبر الواتساب</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
