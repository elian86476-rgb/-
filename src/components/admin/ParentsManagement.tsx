import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Parent } from '../../types';
import { Modal } from '../common/Modal';
import { UserCheck, Plus, Link, Unlink, Phone, Mail, User, Search, CheckCircle2 } from 'lucide-react';

export const ParentsManagement: React.FC = () => {
  const { parents, players, addParent, updateParent, deleteParent, linkPlayerToParent, unlinkPlayerFromParent } = useAcademy();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  // Link code modal
  const [linkingParent, setLinkingParent] = useState<Parent | null>(null);
  const [inputPlayerCode, setInputPlayerCode] = useState('');
  const [linkFeedback, setLinkFeedback] = useState<{ success?: boolean; message?: string }>({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });

  const filteredParents = parents.filter((par) => {
    return (
      par.fullName.includes(searchTerm) ||
      par.phone.includes(searchTerm) ||
      par.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      par.linkedPlayerCodes.some((code) => code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleOpenAddModal = () => {
    setEditingParent(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (parent: Parent) => {
    setEditingParent(parent);
    setFormData({
      fullName: parent.fullName,
      phone: parent.phone,
      email: parent.email,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    try {
      if (editingParent) {
        updateParent(editingParent.id, formData);
      } else {
        addParent({
          ...formData,
          linkedPlayerCodes: [],
          userAccountId: `usr-parent-${Date.now()}`,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving parent:', err);
      alert('حدث خطأ أثناء حفظ بيانات ولي الأمر. يرجى إعادة المحاولة.');
    }
  };

  const handleOpenLinkModal = (parent: Parent) => {
    setLinkingParent(parent);
    setInputPlayerCode('');
    setLinkFeedback({});
  };

  const handleExecuteLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingParent || !inputPlayerCode.trim()) return;

    const res = linkPlayerToParent(linkingParent.id, inputPlayerCode);
    setLinkFeedback(res);
    if (res.success) {
      setInputPlayerCode('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            إدارة أولياء الأمور وربط كود اللاعب
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ربط حسابات أولياء الأمور بالأبناء المسجلين عن طريق "كود اللاعب" الفريد
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ولي أمر جديد</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="البحث بالاسم، هاتف ولي الأمر، أو كود الابن..."
          className="w-full pr-10 pl-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Grid of Parents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredParents.map((parent) => {
          // Find linked child objects
          const linkedChildren = players.filter((p) =>
            parent.linkedPlayerCodes.includes(p.playerCode)
          );

          return (
            <div
              key={parent.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {parent.fullName}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">{parent.phone}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenLinkModal(parent)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                    title="ربط كود ابن جديد"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>ربط ابن</span>
                  </button>
                </div>

                {/* Email */}
                <div className="mt-3 text-xs text-slate-500 font-mono dir-ltr text-right">
                  {parent.email}
                </div>

                {/* Linked Children List */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400">
                      الأبناء المرتبطون بولي الأمر ({parent.linkedPlayerCodes.length}):
                    </span>
                  </div>

                  {parent.linkedPlayerCodes.length > 0 ? (
                    <div className="space-y-2">
                      {parent.linkedPlayerCodes.map((code, idx) => {
                        const childObj = linkedChildren.find((c) => c.playerCode === code);

                        return (
                          <div
                            key={`${code}-${idx}`}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {childObj ? childObj.fullName : 'لاعب مسجل'}
                              </div>
                              <div className="font-mono text-[11px] text-emerald-600 font-bold">
                                {code}
                              </div>
                            </div>

                            <button
                              onClick={() => unlinkPlayerFromParent(parent.id, code)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="إلغاء ربط الابن"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 text-center bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 text-xs text-amber-800 dark:text-amber-300">
                      لا يوجد أي أطفال مرتبطين بهذا الحساب حالياً. اضغط "ربط ابن" وأدخل كود اللاعب.
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(parent)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  تعديل البيانات
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`هل أنت تأكد من حذف حساب ولي الأمر (${parent.fullName})؟`)) {
                      deleteParent(parent.id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                >
                  حذف الحساب
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Parent Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParent ? 'تعديل بيانات ولي الأمر' : 'إضافة حساب ولي أمر جديد'}
        subtitle="أدخل بيانات ولي الأمر للربط"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              اسم ولي الأمر الكامل *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="مثال: أحمد إبراهيم الشناوي"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              رقم الهاتف *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01055556666"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              البريد الإلكتروني / حساب الدخول
            </label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="01012345678 أو parent@gmail.com"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 dark:text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              {editingParent ? 'حفظ' : 'إضافة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Link Player Code Modal */}
      {linkingParent && (
        <Modal
          isOpen={!!linkingParent}
          onClose={() => setLinkingParent(null)}
          title={`ربط ابن بولي الأمر (${linkingParent.fullName})`}
          subtitle="أدخل كود اللاعب الفريد الخا ص بالطالب لربطه بحساب ولي الأمر"
          maxWidth="md"
        >
          <form onSubmit={handleExecuteLink} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                أدخل كود اللاعب (مثال: PLY-1001) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={inputPlayerCode}
                  onChange={(e) => setInputPlayerCode(e.target.value.toUpperCase())}
                  placeholder="PLY-1001"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-base font-black tracking-wider text-center"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  ربط الآن
                </button>
              </div>
            </div>

            {linkFeedback.message && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  linkFeedback.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
                }`}
              >
                {linkFeedback.message}
              </div>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                تلميح سريع للاختبار:
              </span>
              <p>أكواد الطلاب المتاحة للتجربة الآن:</p>
              <div className="flex flex-wrap gap-1 mt-1 font-mono text-[11px] font-bold text-emerald-600">
                {players.map((p) => (
                  <span
                    key={p.id}
                    onClick={() => setInputPlayerCode(p.playerCode)}
                    className="cursor-pointer bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-200"
                  >
                    {p.playerCode} ({p.fullName.split(' ')[0]})
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLinkingParent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 dark:text-slate-300"
              >
                إغلاق
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
