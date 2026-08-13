import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Users, Search, Phone, User, Swords, Flame, BookOpenCheck, ShieldAlert, Award, MessageCircle } from 'lucide-react';
import { buildStudentReportMessage, openWhatsApp } from '../../utils/whatsapp';

export const CoachStudents: React.FC = () => {
  const { currentSession, players, activities, settings, coaches } = useAcademy();

  const [searchTerm, setSearchTerm] = useState('');

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

  // Strict role isolation: filter players ONLY for this coach's assigned activity
  const coachActivityId = currentSession.activityId;
  const currentActivity = activities.find((a) => a.id === coachActivityId);

  const myStudents = players.filter((p) => {
    // Student must be enrolled in coach's activity
    const isEnrolledInCoachActivity = coachActivityId
      ? p.activityIds.includes(coachActivityId)
      : true;

    const matchesSearch =
      p.fullName.includes(searchTerm) ||
      p.playerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parentPhone.includes(searchTerm);

    return isEnrolledInCoachActivity && matchesSearch;
  });

  const handleShareWhatsApp = (student: typeof players[0]) => {
    const coach = coaches.find((c) => c.id === student.primaryCoachId);
    const coachName = coach ? coach.fullName : (currentSession.name || 'الكابتن المسؤول');
    const currentLevel = coachActivityId ? student.currentLevels[coachActivityId] || 'مبتدئ' : 'طالب';
    const assignedActivities = activities
      .filter((a) => student.activityIds.includes(a.id))
      .map((a) => a.name);

    const msg = buildStudentReportMessage({
      academyName: settings.academyName || 'أكاديمية الفرسان الرياضية',
      playerName: student.fullName,
      playerCode: student.playerCode,
      age: student.age,
      parentName: student.parentName,
      activities: assignedActivities,
      level: currentLevel,
      coachName: coachName,
      status: student.status,
      enrollmentDate: student.enrollmentDate,
    });

    const phone = student.parentPhone || student.phone;

    openWhatsApp(phone, msg, () => {
      setPhonePromptData({
        isOpen: true,
        playerName: student.fullName,
        phoneInput: '',
        message: msg,
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold mb-2">
            لوحة المدرب • {currentActivity?.name || 'النشاط الخاص بك'}
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            قائمة طلابي المباشرين ({myStudents.length} طالب)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            عرض وحيازة الطلاب الملحقين بنشاطك فقط مع حظر باقي الأنشطة الأخرى تلقائياً
          </p>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>مسموح فقط برؤية وتقييم أداء طلابك بالنشاط.</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="البحث بين طلابك بالاسم أو كود اللاعب..."
          className="w-full pr-10 pl-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>

      {/* Grid of Students */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myStudents.map((student) => {
          const currentLevel = coachActivityId ? student.currentLevels[coachActivityId] || 'مبتدئ' : 'طالب';
          const coach = coaches.find((c) => c.id === student.primaryCoachId);
          const coachDisplayName = coach ? coach.fullName : (currentSession.name || 'الكابتن المسؤول');

          return (
            <div
              key={student.id}
              className="p-5 rounded-2xl bg-[#fffaf5] dark:bg-slate-900/95 border border-orange-200/70 dark:border-orange-950/60 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-orange-100 dark:border-slate-800">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-800 dark:text-orange-400 border border-orange-200/70 dark:border-orange-900/50">
                  {student.playerCode}
                </span>

                <Badge variant={student.status === 'active' ? 'success' : 'warning'} size="sm">
                  {student.status === 'active' ? 'نشط بالنشاط' : 'غير نشط'}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {student.fullName}
                </h3>
                <div className="text-xs text-orange-700 dark:text-orange-400 font-bold mt-1">
                  المستوى الحالي: {currentLevel}
                </div>
              </div>

              {/* Parent & Contact Details */}
              <div className="pt-3 border-t border-orange-200/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>ولي الأمر: {student.parentName}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-500 dir-ltr">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.parentPhone}</span>
                  </span>
                </div>

                {/* Instructor / Coach Dedicated Row Aligned Right */}
                <div className="flex items-center gap-1.5 text-right font-semibold pt-1.5 border-t border-orange-100 dark:border-slate-800/80">
                  <Award className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">المدرب / المحفظ:</span>
                  <span className="text-orange-700 dark:text-orange-400 font-bold">
                    {coachDisplayName}
                  </span>
                </div>

                {/* WhatsApp Action Button */}
                <div className="pt-2 border-t border-orange-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleShareWhatsApp(student)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>إرسال تقرير الطالب عبر الواتساب</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {myStudents.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 text-slate-500">
          لا يوجد طلاب مسجلين مطبق عليهم هذا الفلتر بالنشاط الحالي.
        </div>
      )}

      {/* Missing Phone Number Prompt Modal for WhatsApp */}
      {phonePromptData.isOpen && (
        <Modal
          isOpen={phonePromptData.isOpen}
          onClose={() => setPhonePromptData({ ...phonePromptData, isOpen: false })}
          title="رقم الهاتف غير مسجل"
          subtitle={`يرجى إدخال رقم هاتف ولي الأمر للطالب (${phonePromptData.playerName}) للمتابعة عبر الواتساب`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-semibold">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 font-semibold">
              ⚠️ رقم الهاتف الخاص بهذا اللاعب فارغ. أدخل الرقم أدناه ليتم فتح الواتساب مباشرة مجهزاً بتقرير الطالب.
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
