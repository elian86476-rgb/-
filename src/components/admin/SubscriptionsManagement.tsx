import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Subscription, SubscriptionStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { CreditCard, Search, Plus, CheckCircle, AlertTriangle, Clock, DollarSign, Wallet, FileDown, Printer, MessageCircle, Banknote, Receipt } from 'lucide-react';
import { downloadPaymentReceiptPDF } from '../../utils/pdfGenerator';
import { buildPaymentReceiptMessage, openWhatsApp } from '../../utils/whatsapp';
import { ReceivePaymentModal } from './ReceivePaymentModal';

interface SubscriptionsManagementProps {
  onOpenReceivePaymentModal?: () => void;
}

export const SubscriptionsManagement: React.FC<SubscriptionsManagementProps> = ({
  onOpenReceivePaymentModal,
}) => {
  const {
    subscriptions,
    players,
    activities,
    recordPayment,
    addSubscription,
    settings,
    currentSession,
  } = useAcademy();

  const [isLocalReceivePaymentOpen, setIsLocalReceivePaymentOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterActivity, setFilterActivity] = useState<string>('all');

  // Record Payment Modal State
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'نقداً' | 'تحويل بنكي' | 'فودافون كاش' | 'شبكة بطاقات'>('نقداً');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Add New Subscription Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubPlayerId, setNewSubPlayerId] = useState(players[0]?.id || '');
  const [newSubActivityId, setNewSubActivityId] = useState(activities[0]?.id || '');
  const [newSubFee, setNewSubFee] = useState(350);

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

  const handleShareWhatsAppReceipt = (sub: Subscription) => {
    const player = players.find((p) => p.id === sub.playerId);
    const act = activities.find((a) => a.id === sub.activityId);

    const msg = buildPaymentReceiptMessage({
      academyName: settings.academyName || 'أكاديمية الفرسان الرياضية',
      playerName: player ? player.fullName : 'طالب',
      playerCode: player ? player.playerCode : 'N/A',
      amount: sub.paidAmount,
      paymentDate: sub.lastPaymentDate || new Date().toISOString().split('T')[0],
      monthYear: sub.nextDueDate ? `تاريخ الاستحقاق ${sub.nextDueDate}` : 'الشهر الحالي',
      activityName: act ? act.name : 'النشاط',
      receiptNumber: `REC-${sub.id.slice(-6)}`,
      paymentMethod: sub.paymentMethod || 'نقداً',
      coachName: sub.collectorName || 'الإدارة',
      remainingAmount: sub.remainingAmount,
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

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const player = players.find((p) => p.id === sub.playerId);
    const act = activities.find((a) => a.id === sub.activityId);

    const matchesSearch =
      (player && player.fullName.includes(searchTerm)) ||
      (player && player.playerCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (player && player.parentPhone.includes(searchTerm));

    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesActivity = filterActivity === 'all' || sub.activityId === filterActivity;

    return matchesSearch && matchesStatus && matchesActivity;
  });

  const handleOpenPaymentModal = (sub: Subscription) => {
    setSelectedSub(sub);
    setPaymentAmount(sub.remainingAmount > 0 ? sub.remainingAmount : sub.monthlyFee);
    setPaymentMethod('نقداً');
    setPaymentNotes('');
  };

  const handleDownloadReceipt = (sub: Subscription) => {
    const player = players.find((p) => p.id === sub.playerId);
    const act = activities.find((a) => a.id === sub.activityId);
    downloadPaymentReceiptPDF(
      {
        receiptNo: `REC-${sub.id.slice(-6)}`,
        playerName: player ? player.fullName : 'طالب غير محدد',
        playerCode: player ? player.playerCode : 'N/A',
        activityName: act ? act.name : 'نشاط الأكاديمية',
        amountPaid: sub.paidAmount,
        totalFee: sub.monthlyFee,
        remainingAmount: sub.remainingAmount,
        paymentMethod: sub.paymentMethod || 'نقداً',
        collectorName: sub.collectorName || 'إدارة الأكاديمية',
        date: sub.lastPaymentDate || new Date().toISOString().split('T')[0],
        notes: sub.notes,
      },
      { settings }
    );
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || paymentAmount <= 0) return;

    recordPayment(
      selectedSub.id,
      paymentAmount,
      currentSession.name,
      'admin',
      paymentMethod,
      paymentNotes
    );

    // Auto download PDF receipt for the newly recorded payment
    const player = players.find((p) => p.id === selectedSub.playerId);
    const act = activities.find((a) => a.id === selectedSub.activityId);
    downloadPaymentReceiptPDF(
      {
        receiptNo: `REC-${Date.now().toString().slice(-6)}`,
        playerName: player ? player.fullName : 'طالب غير محدد',
        playerCode: player ? player.playerCode : 'N/A',
        activityName: act ? act.name : 'نشاط الأكاديمية',
        amountPaid: paymentAmount,
        totalFee: selectedSub.monthlyFee,
        remainingAmount: Math.max(0, selectedSub.remainingAmount - paymentAmount),
        paymentMethod: paymentMethod,
        collectorName: currentSession.name,
        date: new Date().toISOString().split('T')[0],
        notes: paymentNotes,
      },
      { settings }
    );

    setSelectedSub(null);
  };

  const handleCreateNewSub = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dueDate = nextMonth.toISOString().split('T')[0];

    addSubscription({
      playerId: newSubPlayerId,
      activityId: newSubActivityId,
      monthlyFee: newSubFee,
      paidAmount: 0,
      remainingAmount: newSubFee,
      lastPaymentDate: today,
      nextDueDate: dueDate,
      status: 'overdue',
      collectedByRole: 'admin',
      collectorName: currentSession.name,
      paymentMethod: 'نقداً',
      notes: 'اشتراك دوري مضاف من الإدارة',
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            شاشة متابعة الاشتراكات وتحصيل المبالغ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة الحالة المالية لكل طالب، تسجيل المبالغ المحصلة، وإصدار التنبيهات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenReceivePaymentModal || (() => setIsLocalReceivePaymentOpen(true))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Banknote className="w-4 h-4 text-emerald-200" />
            <span>استلام نقدية (إيصال سداد)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة استحقاق جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث بالاسم، كود اللاعب، أو الهاتف..."
            className="w-full pr-10 pl-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="all">جميع حالات الدفع</option>
          <option value="paid">مدفوع بالكامل</option>
          <option value="partial">متبقي مبلغ (جزئي)</option>
          <option value="overdue">متأخر عن الاستحقاق</option>
        </select>

        <select
          value={filterActivity}
          onChange={(e) => setFilterActivity(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="all">جميع الأنشطة</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="py-3.5 px-4">اسم الطالب</th>
                <th className="py-3.5 px-4">كود اللاعب</th>
                <th className="py-3.5 px-4">النشاط</th>
                <th className="py-3.5 px-4">الاشتراك الشهري</th>
                <th className="py-3.5 px-4">المبلغ المحصّل</th>
                <th className="py-3.5 px-4">المبلغ المتبقي</th>
                <th className="py-3.5 px-4">تاريخ الاستحقاق</th>
                <th className="py-3.5 px-4">حالة الدفع</th>
                <th className="py-3.5 px-4">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredSubscriptions.map((sub) => {
                const player = players.find((p) => p.id === sub.playerId);
                const act = activities.find((a) => a.id === sub.activityId);

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {player?.fullName || 'طالب مجهول'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {player?.playerCode}
                    </td>
                    <td className="py-3.5 px-4">{act?.name}</td>
                    <td className="py-3.5 px-4 font-bold">
                      {sub.monthlyFee} {settings.currency}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
                      {sub.paidAmount} {settings.currency}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      {sub.remainingAmount} {settings.currency}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dir-ltr text-right">
                      {sub.nextDueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          sub.status === 'paid'
                            ? 'success'
                            : sub.status === 'partial'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {sub.status === 'paid'
                          ? 'مدفوع بالكامل'
                          : sub.status === 'partial'
                          ? 'جزئي (متبقي)'
                          : 'متأخر'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPaymentModal(sub)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shrink-0"
                          title="تسجيل مبلغ مدفوع"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>تحصيل</span>
                        </button>

                        <button
                          onClick={() => handleShareWhatsAppReceipt(sub)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                          title="مشاركة إيصال السداد عبر واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </button>

                        <button
                          onClick={() => handleDownloadReceipt(sub)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                          title="تحميل إيصال سداد PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>إيصال PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title="تسجيل إيصال تحصيل جديد"
          subtitle={`تحصيل مبلغ من الطالب: ${
            players.find((p) => p.id === selectedSub.playerId)?.fullName
          }`}
          maxWidth="md"
        >
          <form onSubmit={handleExecutePayment} className="space-y-4 text-xs font-semibold">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span>المبلغ المستحق كلياً:</span>
                <span className="font-bold">{selectedSub.monthlyFee} {settings.currency}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>المبلغ المتبقي حالياً:</span>
                <span className="font-bold">{selectedSub.remainingAmount} {settings.currency}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                المبلغ المدفوع الآن ({settings.currency}) *
              </label>
              <input
                type="number"
                required
                max={selectedSub.remainingAmount || selectedSub.monthlyFee}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                طريقة وسيلة التحصيل
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as 'نقداً' | 'تحويل بنكي' | 'فودافون كاش' | 'شبكة بطاقات')
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="نقداً">نقداً (في الخزينة)</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="فودافون كاش">فودافون كاش / محفظة</option>
                <option value="شبكة بطاقات">شبكة بطاقات (POS)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                ملاحظات الإيصال (اختياري)
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="رقم الإيصال أو اسم المسلّم..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 dark:text-slate-300"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              >
                تأكيد تسجيل التحصيل
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Subscription Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة دورة استحقاق اشتراك جديد"
        subtitle="إنشاء استحقاق شهر جديد للطفل"
        maxWidth="md"
      >
        <form onSubmit={handleCreateNewSub} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              اختر الطالب *
            </label>
            <select
              value={newSubPlayerId}
              onChange={(e) => setNewSubPlayerId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.playerCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              اختر النشاط *
            </label>
            <select
              value={newSubActivityId}
              onChange={(e) => setNewSubActivityId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.monthlyFee} {settings.currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              قيمة الاشتراك المطلوبة ({settings.currency})
            </label>
            <input
              type="number"
              value={newSubFee}
              onChange={(e) => setNewSubFee(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              إضافة الاستحقاق
            </button>
          </div>
        </form>
      </Modal>

      {/* Missing Phone Number Prompt Modal for WhatsApp */}
      {phonePromptData.isOpen && (
        <Modal
          isOpen={phonePromptData.isOpen}
          onClose={() => setPhonePromptData({ ...phonePromptData, isOpen: false })}
          title="رقم الهاتف غير مسجل"
          subtitle={`يرجى إدخال رقم هاتف ولي الأمر للطالب (${phonePromptData.playerName}) لإرسال الإيصال عبر الواتساب`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-semibold">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 font-semibold">
              ⚠️ رقم الهاتف الخاص بهذا اللاعب فارغ. أدخل الرقم أدناه ليتم فتح الواتساب مباشرة مجهزاً بإيصال السداد.
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
                <span>إرسال الإيصال عبر الواتساب</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Local Receive Payment Modal */}
      <ReceivePaymentModal
        isOpen={isLocalReceivePaymentOpen}
        onClose={() => setIsLocalReceivePaymentOpen(false)}
      />
    </div>
  );
};
