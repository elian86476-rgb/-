import React from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Badge } from '../common/Badge';
import {
  Users,
  Swords,
  Flame,
  BookOpenCheck,
  CalendarCheck,
  CreditCard,
  Award,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface ParentDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const {
    currentSession,
    parents,
    players,
    activities,
    coaches,
    subscriptions,
    attendance,
    notes,
    selectedPlayerCode,
    setSelectedPlayerCode,
  } = useAcademy();

  const currentParent = parents.find((p) => p.id === currentSession.parentId);
  const linkedCodes = currentParent ? currentParent.linkedPlayerCodes : [];

  // Find linked children objects
  const linkedChildren = players.filter((p) => linkedCodes.includes(p.playerCode));

  // Current active child
  const activeChild = players.find((p) => p.playerCode === selectedPlayerCode) || linkedChildren[0];

  // If no child linked yet
  if (!activeChild) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-lg my-12">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          مرحباً بك ({currentSession.name})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          لم يتم ربط أي أبناء بحسابك حتى الآن. يرجى الحصول على "كود اللاعب" الخاص بابنك من إدارة الأكاديمية وربطه بحسابك المباشر.
        </p>

        <button
          onClick={() => onNavigate('parent-link-child')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ربط كود الابن الآن</span>
        </button>
      </div>
    );
  }

  // Active Child Data Aggregation
  const childSubscriptions = subscriptions.filter((s) => s.playerId === activeChild.id);
  const childAttendance = attendance.filter((a) => a.playerId === activeChild.id);
  const childNotes = notes.filter((n) => n.playerId === activeChild.id);

  // Attendance Rate %
  const totalAtt = childAttendance.length;
  const presentAtt = childAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

  // Financial status
  const totalRemaining = childSubscriptions.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Multi-child Selector Pill Header */}
      {linkedChildren.length > 1 && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            التبديل بين الأبناء:
          </span>

          <div className="flex items-center gap-2">
            {linkedChildren.map((child) => {
              const isSelected = child.playerCode === activeChild.playerCode;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedPlayerCode(child.playerCode)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{child.fullName}</span>
                  <span className="font-mono text-[10px] opacity-80">({child.playerCode})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Child Profile Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-2xl text-white shadow-inner">
              {activeChild.fullName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-emerald-100">
                  كود اللاعب: {activeChild.playerCode}
                </span>
                <span className="text-xs text-emerald-200">السن: {activeChild.age} سنة</span>
              </div>

              <h2 className="text-2xl font-black text-white">{activeChild.fullName}</h2>
              <p className="text-xs text-emerald-100/80 mt-1">
                الأنشطة المسجل بها: {activeChild.activityIds.map((id) => activities.find((a) => a.id === id)?.name).join(' • ')}
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 block">نسبة الحضور</span>
              <span className="text-lg font-black text-white">{attRate}%</span>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-emerald-200 block">المبلغ المتبقي</span>
              <span className="text-lg font-black text-amber-300">
                {totalRemaining} ج.م
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Enrolled Activities Cards */}
      <div>
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">
          الأنشطة الملحق بها الابن والمستوى الحالي
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeChild.activityIds.map((actId) => {
            const act = activities.find((a) => a.id === actId);
            const level = activeChild.currentLevels[actId] || 'مبتدئ';
            const coach = coaches.find((c) => c.id === activeChild.primaryCoachId);

            return (
              <div
                key={actId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {act?.code === 'karate' && <Swords className="w-5 h-5 text-rose-500" />}
                    {act?.code === 'kungfu' && <Flame className="w-5 h-5 text-amber-500" />}
                    {act?.code === 'quran' && <BookOpenCheck className="w-5 h-5 text-emerald-500" />}
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {act?.name}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">المستوى / الحزام الحالي:</span>
                    <span className="font-bold text-emerald-600">{level}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">المدرب / المحفظ المسؤول:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {coach ? coach.fullName : 'كابتن النشاط'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Coach Note Preview */}
      {childNotes.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              آخر ملاحظات وتقييم المدرب عن الابن
            </h3>
            <button
              onClick={() => onNavigate('parent-notes')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              عرض جميع الملاحظات
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            "{childNotes[0].text}"
            <div className="mt-2 text-[11px] text-slate-400 font-bold flex items-center justify-between">
              <span>الكاتب: {childNotes[0].coachName}</span>
              <span>التاريخ: {childNotes[0].date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
