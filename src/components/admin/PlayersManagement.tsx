import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Player, PlayerStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { DateInput } from '../common/DateInput';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  QrCode,
  Check,
  X,
  Swords,
  Flame,
  BookOpenCheck,
  Phone,
  User,
  MapPin,
  Calendar,
  FileDown,
  Award,
  MessageCircle,
} from 'lucide-react';
import { downloadStudentSummaryPDF } from '../../utils/pdfGenerator';
import { buildStudentReportMessage, openWhatsApp } from '../../utils/whatsapp';

interface PlayersManagementProps {
  onNavigateToWizard?: () => void;
}

export const PlayersManagement: React.FC<PlayersManagementProps> = ({ onNavigateToWizard }) => {
  const {
    players,
    activities,
    coaches,
    addPlayer,
    updatePlayer,
    deletePlayer,
    settings,
  } = useAcademy();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewingPlayerCode, setViewingPlayerCode] = useState<Player | null>(null);

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

  const handleShareWhatsApp = (player: Player) => {
    const coach = coaches.find((c) => c.id === player.primaryCoachId);
    const assignedActivities = activities
      .filter((a) => player.activityIds.includes(a.id))
      .map((a) => a.name);

    const levelParts = Object.entries(player.currentLevels || {})
      .map(([actId, lvl]) => {
        const actName = activities.find((a) => a.id === actId)?.name || '';
        return actName ? `${actName}: ${lvl}` : lvl;
      })
      .filter(Boolean);

    const levelStr = levelParts.join(' | ') || 'مبتدئ';

    const msg = buildStudentReportMessage({
      academyName: settings.academyName || 'أكاديمية الفرسان الرياضية',
      playerName: player.fullName,
      playerCode: player.playerCode,
      age: player.age,
      parentName: player.parentName,
      activities: assignedActivities,
      level: levelStr,
      coachName: coach ? coach.fullName : 'غير معين',
      status: player.status,
      enrollmentDate: player.enrollmentDate,
    });

    const phone = player.parentPhone || player.phone;

    openWhatsApp(phone, msg, () => {
      setPhonePromptData({
        isOpen: true,
        playerName: player.fullName,
        phoneInput: '',
        message: msg,
      });
    });
  };

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    age: 0,
    phone: '',
    parentPhone: '',
    parentName: '',
    address: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    activityIds: [] as string[],
    primaryCoachId: coaches[0]?.id || '',
    status: 'active' as PlayerStatus,
    currentLevels: {} as Record<string, string>,
  });

  // Filtered Players
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.fullName.includes(searchTerm) ||
      p.playerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parentPhone.includes(searchTerm) ||
      p.parentName.includes(searchTerm);

    const matchesActivity =
      filterActivity === 'all' || p.activityIds.includes(filterActivity);

    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;

    return matchesSearch && matchesActivity && matchesStatus;
  });

  const handleExportStudentPDF = (player: Player) => {
    const coach = coaches.find((c) => c.id === player.primaryCoachId);
    const assignedActivities = activities
      .filter((a) => player.activityIds.includes(a.id))
      .map((a) => a.name);

    downloadStudentSummaryPDF(
      {
        playerCode: player.playerCode,
        fullName: player.fullName,
        age: player.age,
        birthDate: player.birthDate,
        parentName: player.parentName,
        parentPhone: player.parentPhone,
        address: player.address,
        enrollmentDate: player.enrollmentDate,
        status: player.status,
        activities: assignedActivities,
        coachName: coach ? coach.fullName : 'غير معين',
        levels: player.currentLevels,
      },
      { settings }
    );
  };

  const handleOpenAddModal = () => {
    setEditingPlayer(null);
    setFormData({
      fullName: '',
      birthDate: '',
      age: 0,
      phone: '',
      parentPhone: '',
      parentName: '',
      address: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      activityIds: [activities[0]?.id || 'act-karate'],
      primaryCoachId: coaches[0]?.id || '',
      status: 'active',
      currentLevels: {
        'act-karate': settings.karateBelts[0] || 'حزام أبيض',
        'act-kungfu': settings.kungfuBelts[0] || 'المستوى الأول (أساسي)',
        'act-quran': settings.quranLevels[0] || 'جزء عم',
      },
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      fullName: player.fullName,
      birthDate: player.birthDate,
      age: player.age,
      phone: player.phone,
      parentPhone: player.parentPhone,
      parentName: player.parentName,
      address: player.address,
      enrollmentDate: player.enrollmentDate,
      activityIds: [...player.activityIds],
      primaryCoachId: player.primaryCoachId,
      status: player.status,
      currentLevels: { ...player.currentLevels },
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    try {
      if (editingPlayer) {
        updatePlayer(editingPlayer.id, formData);
      } else {
        addPlayer(formData);
      }
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error submitting member form:', error);
      alert('حدث خطأ أثناء حفظ بيانات المشترك. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت تأكد من حذف اللاعب (${name})؟ سيتم حذف جميع بيانات الحضور والاشتراكات المرتبطة به.`)) {
      deletePlayer(id);
    }
  };

  const toggleActivitySelection = (actId: string) => {
    setFormData((prev) => {
      const exists = prev.activityIds.includes(actId);
      const updated = exists
        ? prev.activityIds.filter((id) => id !== actId)
        : [...prev.activityIds, actId];
      return { ...prev, activityIds: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            شاشة إدارة اللاعبين (الكاراتيه • الكونغ فو • القرآن)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة وتعديل بيانات الطلاب، واستعراض "كود اللاعب" لربط حسابات أولياء الأمور
          </p>
        </div>

        <button
          onClick={() => (onNavigateToWizard ? onNavigateToWizard() : handleOpenAddModal())}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>تسجيل مشترك جديد (معالج)</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث بالاسم، كود اللاعب، أو هاتف ولي الأمر..."
            className="w-full pr-10 pl-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Activity */}
        <select
          value={filterActivity}
          onChange={(e) => setFilterActivity(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="all">جميع الأنشطة والرياضات</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Filter Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="all">جميع الحالات (نشط/موقوف/منسحب)</option>
          <option value="active">نشط (منتظم)</option>
          <option value="suspended">موقوف مؤقتاً</option>
          <option value="withdrawn">منسحب</option>
        </select>
      </div>

      {/* Players Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const coach = coaches.find((c) => c.id === player.primaryCoachId);

          return (
            <div
              key={player.id}
              className="p-5 rounded-2xl bg-[#fffaf5] dark:bg-slate-900/95 border border-orange-200/70 dark:border-orange-950/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-orange-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-800 dark:text-orange-400 border border-orange-200/70 dark:border-orange-900/50">
                      {player.playerCode}
                    </span>
                    <Badge
                      variant={
                        player.status === 'active'
                          ? 'success'
                          : player.status === 'suspended'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {player.status === 'active'
                        ? 'نشط'
                        : player.status === 'suspended'
                        ? 'موقوف'
                        : 'منسحب'}
                    </Badge>
                  </div>

                  <button
                    onClick={() => setViewingPlayerCode(player)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-orange-100/50 dark:hover:bg-slate-800"
                    title="عرض بطاقة كود اللاعب"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>

                {/* Player Main Info */}
                <div className="mt-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {player.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>السن: {player.age} سنة</span>
                    <span>•</span>
                    <span>تاريخ الالتحاق: {player.enrollmentDate}</span>
                  </div>
                </div>

                {/* Enrolled Activities & Current Belts */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400">
                    الأنشطة والمستويات المسجلة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {player.activityIds.map((actId) => {
                      const act = activities.find((a) => a.id === actId);
                      const level = player.currentLevels[actId] || 'مبتدئ';

                      return (
                        <div
                          key={actId}
                          className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-orange-200/50 dark:border-slate-700 shadow-2xs"
                        >
                          {act?.code === 'karate' && <Swords className="w-3.5 h-3.5 text-rose-500" />}
                          {act?.code === 'kungfu' && <Flame className="w-3.5 h-3.5 text-amber-500" />}
                          {act?.code === 'quran' && <BookOpenCheck className="w-3.5 h-3.5 text-emerald-500" />}
                          <span>{act?.name}</span>
                          <span className="text-[10px] opacity-75 font-normal">({level})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Parent & Contact Details */}
                <div className="mt-3 pt-3 border-t border-orange-200/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>ولي الأمر: {player.parentName}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-500 dir-ltr">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{player.parentPhone}</span>
                    </span>
                  </div>

                  {/* Instructor / Coach Dedicated Row Aligned Right */}
                  <div className="flex items-center gap-1.5 text-right font-semibold pt-1.5 border-t border-orange-100 dark:border-slate-800/80">
                    <Award className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">المدرب / المحفظ:</span>
                    <span className="text-orange-700 dark:text-orange-400 font-bold">
                      {coach ? coach.fullName : 'غير محدد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5 flex-wrap">
                <button
                  onClick={() => handleShareWhatsApp(player)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  title="مشاركة تقرير الطالب عبر واتساب"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>واتساب</span>
                </button>

                <button
                  onClick={() => handleExportStudentPDF(player)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  title="تحميل بطاقة الطالب وملخص البيانات PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>تقرير PDF</span>
                </button>
                <button
                  onClick={() => handleOpenEditModal(player)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDelete(player.id, player.fullName)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
          لا توجد نتائج مطابقة لخيارات البحث المحددة.
        </div>
      )}

      {/* Add / Edit Player Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingPlayer ? 'تعديل بيانات اللاعب' : 'إضافة لاعب جديد للأكاديمية'}
        subtitle="أدخل بيانات الطالب والأنشطة والمدرب المسند إليه"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                اسم اللاعب الكامل *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="مثال: عمر أحمد إبراهيم"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                اسم ولي الأمر *
              </label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="مثال: أحمد إبراهيم الشناوي"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <DateInput
                    label="تاريخ الميلاد"
                    value={formData.birthDate}
                    onChange={(iso) => {
                      setFormData((prev) => {
                        let age = prev.age;
                        if (iso) {
                          const year = parseInt(iso.split('-')[0], 10);
                          if (year > 1900) {
                            const calculatedAge = new Date().getFullYear() - year;
                            if (calculatedAge > 0 && calculatedAge < 100) {
                              age = calculatedAge;
                            }
                          }
                        }
                        return { ...prev, birthDate: iso, age };
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    السن
                  </label>
                  <input
                    type="number"
                    placeholder="السن"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-20 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                رقم هاتف ولي الأمر (للتواصل والتنبيهات) *
              </label>
              <input
                type="tel"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="01012345678"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                رقم هاتف الطالب (اختياري)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01112345678"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <DateInput
                label="تاريخ الالتحاق"
                value={formData.enrollmentDate}
                onChange={(iso) => setFormData({ ...formData, enrollmentDate: iso })}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              العنوان التفصيلي
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="مثال: القاهرة - التجمع الخامس - الحي الثاني"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          {/* Activity Choice */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block text-slate-800 dark:text-slate-200 font-bold">
              الأنشطة المسجل بها الطالب (يمكن اختيار أكثر من نشاط):
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activities.map((act) => {
                const isSelected = formData.activityIds.includes(act.id);
                return (
                  <button
                    type="button"
                    key={act.id}
                    onClick={() => toggleActivitySelection(act.id)}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{act.name}</span>
                    {isSelected ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 opacity-20" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coach & Levels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                المدرب / المحفظ المسؤول
              </label>
              <select
                value={formData.primaryCoachId}
                onChange={(e) => setFormData({ ...formData, primaryCoachId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} - ({c.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                حالة اللاعب
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PlayerStatus })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="active">نشط (منتظم)</option>
                <option value="suspended">موقوف مؤقتاً</option>
                <option value="withdrawn">منسحب</option>
              </select>
            </div>
          </div>

          {/* Level Ranks Selection */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
              مستوى الحزام أو حفظ القرآن الحالي لكل نشاط:
            </label>

            {formData.activityIds.includes('act-karate') && (
              <div>
                <span className="text-slate-600 dark:text-slate-400">حزام الكاراتيه:</span>
                <select
                  value={formData.currentLevels['act-karate'] || settings.karateBelts[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentLevels: { ...formData.currentLevels, 'act-karate': e.target.value },
                    })
                  }
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {settings.karateBelts.map((belt) => (
                    <option key={belt} value={belt}>
                      {belt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.activityIds.includes('act-kungfu') && (
              <div>
                <span className="text-slate-600 dark:text-slate-400">مستوى الكونغ فو:</span>
                <select
                  value={formData.currentLevels['act-kungfu'] || settings.kungfuBelts[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentLevels: { ...formData.currentLevels, 'act-kungfu': e.target.value },
                    })
                  }
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {settings.kungfuBelts.map((belt) => (
                    <option key={belt} value={belt}>
                      {belt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.activityIds.includes('act-quran') && (
              <div>
                <span className="text-slate-600 dark:text-slate-400">مستوى حفظ القرآن الكريم:</span>
                <select
                  value={formData.currentLevels['act-quran'] || settings.quranLevels[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentLevels: { ...formData.currentLevels, 'act-quran': e.target.value },
                    })
                  }
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {settings.quranLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 dark:text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              {editingPlayer ? 'حفظ التعديلات' : 'إضافة اللاعب'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Viewing Player Code Modal */}
      {viewingPlayerCode && (
        <Modal
          isOpen={!!viewingPlayerCode}
          onClose={() => setViewingPlayerCode(null)}
          title="بطاقة كود اللاعب الخاصة بولي الأمر"
          subtitle="استخدم هذا الكود لربط حسابه في تطبيق أداء ولي الأمر"
          maxWidth="md"
        >
          <div className="text-center p-6 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl text-white space-y-4 shadow-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner">
              🆔
            </div>

            <div>
              <h3 className="text-xl font-black">{viewingPlayerCode.fullName}</h3>
              <p className="text-xs text-emerald-100 mt-1">
                ولي الأمر: {viewingPlayerCode.parentName}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white text-slate-900 shadow-md inline-block">
              <div className="text-xs text-slate-400 font-bold mb-1">كود الربط الفريد</div>
              <div className="text-2xl font-black font-mono tracking-widest text-emerald-700">
                {viewingPlayerCode.playerCode}
              </div>
            </div>

            <p className="text-xs text-emerald-100 leading-relaxed max-w-xs mx-auto">
              توجيه لولي الأمر: يرجى فتح شاشة "ربط ابن جديد" داخل تطبيق ولي الأمر وإدخال الكود الموضح أعلاه لمتابعة الحضور والاشتراكات.
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(viewingPlayerCode.playerCode);
                alert(`تم نسخ كود اللاعب (${viewingPlayerCode.playerCode}) للحافظة!`);
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors border border-white/30"
            >
              نسخ الكود للحافظة
            </button>
          </div>
        </Modal>
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
          <div className="space-y-4 text-xs">
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
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
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
