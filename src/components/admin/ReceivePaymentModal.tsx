import React, { useState, useEffect } from 'react';
import {
  Banknote,
  CheckCircle2,
  FileDown,
  Loader2,
  MessageCircle,
  Printer,
  Receipt,
  Search,
  User,
  X,
  CreditCard,
  Shirt,
  Award,
  Package,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { downloadPaymentReceiptPDF } from '../../utils/pdfGenerator';
import { buildPaymentReceiptMessage, openWhatsApp } from '../../utils/whatsapp';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlayerId?: string;
}

export type PaymentCategoryType = 'Subscription' | 'Uniform' | 'Test/Exam' | 'Miscellaneous';

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  onClose,
  initialPlayerId,
}) => {
  const {
    players,
    activities,
    subscriptions,
    recordPayment,
    addSubscription,
    currentSession,
    settings,
  } = useAcademy();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategoryType>('Subscription');
  const [activityId, setActivityId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [totalFee, setTotalFee] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'نقداً' | 'فودافون كاش' | 'تحويل بنكي' | 'شبكة بطاقات'>('نقداً');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [collectorName, setCollectorName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paperFormat, setPaperFormat] = useState<'A4' | 'A5'>(
    settings?.reportSettings?.paperSize || 'A5'
  );

  // Success receipt generated state
  const [isReceiptGenerated, setIsReceiptGenerated] = useState<boolean>(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<{
    receiptNo: string;
    playerName: string;
    playerCode: string;
    parentPhone: string;
    activityName: string;
    amountPaid: number;
    totalFee: number;
    remainingAmount: number;
    paymentMethod: string;
    paymentCategory: string;
    categoryLabel: string;
    collectorName: string;
    date: string;
    notes?: string;
  } | null>(null);

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Initialize form when opened or initialPlayerId changes
  useEffect(() => {
    if (isOpen) {
      const pId = initialPlayerId || (players.length > 0 ? players[0].id : '');
      setSelectedPlayerId(pId);
      setCollectorName(currentSession?.name || 'مسؤول الخزينة والإدارة');
      setIsReceiptGenerated(false);
      setGeneratedReceipt(null);
      setNotes('');
      setAmountPaid('');
      setTotalFee('');
    }
  }, [isOpen, initialPlayerId, players, currentSession]);

  // When player or activity or category changes, set sensible defaults
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  useEffect(() => {
    if (!selectedPlayer) return;

    // Set activity
    let actId = activityId;
    if (!actId || !selectedPlayer.activityIds.includes(actId)) {
      actId = selectedPlayer.activityIds[0] || (activities[0]?.id || '');
      setActivityId(actId);
    }

    const matchedAct = activities.find((a) => a.id === actId);

    if (paymentCategory === 'Subscription') {
      const existingSub = subscriptions.find(
        (s) => s.playerId === selectedPlayer.id && s.activityId === actId
      );

      if (existingSub) {
        setTotalFee(existingSub.monthlyFee);
        setAmountPaid(existingSub.remainingAmount > 0 ? existingSub.remainingAmount : existingSub.monthlyFee);
      } else if (matchedAct) {
        setTotalFee(matchedAct.monthlyFee);
        setAmountPaid(matchedAct.monthlyFee);
      }
    } else if (paymentCategory === 'Uniform') {
      setTotalFee(350);
      setAmountPaid(350);
    } else if (paymentCategory === 'Test/Exam') {
      setTotalFee(150);
      setAmountPaid(150);
    } else {
      setTotalFee('');
      setAmountPaid('');
    }
  }, [selectedPlayerId, paymentCategory, activityId]);

  if (!isOpen) return null;

  // Filtered players list for selector search
  const filteredPlayers = players.filter(
    (p) =>
      p.fullName.includes(playerSearchQuery) ||
      p.playerCode.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
      p.parentPhone.includes(playerSearchQuery)
  );

  const getCategoryLabel = (cat: PaymentCategoryType) => {
    switch (cat) {
      case 'Subscription':
        return 'اشتراك شهري';
      case 'Uniform':
        return 'بدلة / زي رياضي';
      case 'Test/Exam':
        return 'اختبار حزام / تقييم';
      case 'Miscellaneous':
        return 'رسوم إدارية / متنوعة';
      default:
        return 'سداد نقدية';
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    const paidNum = typeof amountPaid === 'number' ? amountPaid : parseFloat(amountPaid) || 0;
    const totalNum = typeof totalFee === 'number' ? totalFee : parseFloat(totalFee) || paidNum;
    const remainingNum = Math.max(0, totalNum - paidNum);

    const matchedAct = activities.find((a) => a.id === activityId);
    const actName = matchedAct ? matchedAct.name : 'نشاط الأكاديمية';

    // If subscription category, update or add subscription in AcademyContext
    if (paymentCategory === 'Subscription' && activityId) {
      const existingSub = subscriptions.find(
        (s) => s.playerId === selectedPlayer.id && s.activityId === activityId
      );

      if (existingSub) {
        recordPayment(
          existingSub.id,
          paidNum,
          collectorName,
          currentSession?.role === 'coach' ? 'coach' : 'admin',
          paymentMethod,
          notes ? `استلام نقدية: ${notes}` : 'استلام نقدية مباشر'
        );
      } else {
        addSubscription({
          playerId: selectedPlayer.id,
          activityId: activityId,
          monthlyFee: totalNum,
          paidAmount: paidNum,
          remainingAmount: remainingNum,
          lastPaymentDate: paymentDate,
          nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: remainingNum === 0 ? 'paid' : paidNum > 0 ? 'partial' : 'overdue',
          collectedByRole: currentSession?.role === 'coach' ? 'coach' : 'admin',
          collectorName: collectorName,
          paymentMethod: paymentMethod,
          notes: notes,
        });
      }
    }

    // Build receipt payload
    const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
    const receiptObj = {
      receiptNo,
      playerName: selectedPlayer.fullName,
      playerCode: selectedPlayer.playerCode,
      parentPhone: selectedPlayer.parentPhone,
      activityName: actName,
      amountPaid: paidNum,
      totalFee: totalNum,
      remainingAmount: remainingNum,
      paymentMethod,
      paymentCategory,
      categoryLabel: getCategoryLabel(paymentCategory),
      collectorName: collectorName || currentSession?.name || 'إدارة الأكاديمية',
      date: paymentDate,
      notes,
    };

    setGeneratedReceipt(receiptObj);
    setIsReceiptGenerated(true);
  };

  const handleDownloadReceiptPDF = async () => {
    if (!generatedReceipt) return;
    setIsExportingPDF(true);
    await downloadPaymentReceiptPDF(
      {
        receiptNo: generatedReceipt.receiptNo,
        playerName: generatedReceipt.playerName,
        playerCode: generatedReceipt.playerCode,
        activityName: generatedReceipt.activityName,
        amountPaid: generatedReceipt.amountPaid,
        totalFee: generatedReceipt.totalFee,
        remainingAmount: generatedReceipt.remainingAmount,
        paymentMethod: generatedReceipt.paymentMethod,
        collectorName: generatedReceipt.collectorName,
        date: generatedReceipt.date,
        paymentCategory: generatedReceipt.categoryLabel,
        notes: generatedReceipt.notes,
      },
      { settings, paperSize: paperFormat }
    );
    setIsExportingPDF(false);
  };

  const handleSendWhatsAppReceipt = () => {
    if (!generatedReceipt) return;
    const msg = buildPaymentReceiptMessage({
      academyName: settings.academyName,
      playerName: generatedReceipt.playerName,
      playerCode: generatedReceipt.playerCode,
      amount: generatedReceipt.amountPaid,
      paymentDate: generatedReceipt.date,
      paymentCategory: generatedReceipt.categoryLabel,
      activityName: generatedReceipt.activityName,
      receiptNumber: generatedReceipt.receiptNo,
      paymentMethod: generatedReceipt.paymentMethod,
      collectorName: generatedReceipt.collectorName,
      remainingAmount: generatedReceipt.remainingAmount,
      notes: generatedReceipt.notes,
    });

    openWhatsApp(generatedReceipt.parentPhone, msg);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleResetForm = () => {
    setIsReceiptGenerated(false);
    setGeneratedReceipt(null);
    setNotes('');
    setAmountPaid('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Banknote className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-black leading-tight">استلام نقدية / إصدار إيصال سداد</h3>
              <p className="text-xs text-emerald-100 font-medium">
                تسجيل الدفعات النقدية والرسوم وإصدار الإيصالات الرسمية فورياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-6">

          {!isReceiptGenerated ? (
            /* FORM STEP */
            <form onSubmit={handleProcessPayment} className="space-y-5">
              
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                  فئة / غرض السداد <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentCategory('Subscription')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                      paymentCategory === 'Subscription'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>اشتراك شهري</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentCategory('Uniform')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                      paymentCategory === 'Uniform'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Shirt className="w-4 h-4 shrink-0" />
                    <span>بدلة / زي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentCategory('Test/Exam')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                      paymentCategory === 'Test/Exam'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Award className="w-4 h-4 shrink-0" />
                    <span>اختبار حزام</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentCategory('Miscellaneous')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                      paymentCategory === 'Miscellaneous'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Package className="w-4 h-4 shrink-0" />
                    <span>متنوع / إداري</span>
                  </button>
                </div>
              </div>

              {/* Player Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  اختيار الطالب / المشترك <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ابحث باسم الطالب أو كود اللاعب..."
                    value={playerSearchQuery}
                    onChange={(e) => setPlayerSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  <option value="" disabled>-- اختر الطالب من القائمة --</option>
                  {filteredPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.playerCode}) - هاتف: {p.parentPhone}
                    </option>
                  ))}
                </select>

                {selectedPlayer && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 dark:text-white">{selectedPlayer.fullName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">({selectedPlayer.playerCode})</span>
                    </div>
                    <div className="text-slate-500 font-medium">
                      ولي الأمر: {selectedPlayer.parentName} ({selectedPlayer.parentPhone})
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    النشاط / الرياضة المتعلقة
                  </label>
                  <select
                    value={activityId}
                    onChange={(e) => setActivityId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.monthlyFee} {settings.currency || 'ج.م'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    وسيلة الدفع <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="نقداً">💵 نقداً (خزينة الأكاديمية)</option>
                    <option value="فودافون كاش">📱 فودافون كاش</option>
                    <option value="تحويل بنكي">🏦 تحويل بنكي</option>
                    <option value="شبكة بطاقات">💳 شبكة بطاقات (POS)</option>
                  </select>
                </div>
              </div>

              {/* Amount Paid & Total Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    المبلغ المستلم (المدفوع) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 text-sm font-black focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <span className="absolute left-3 top-3 text-xs font-bold text-emerald-600">
                      {settings.currency || 'ج.م'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    إجمالي القيمة / المستحق
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={totalFee}
                      onChange={(e) => setTotalFee(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">
                      {settings.currency || 'ج.م'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    تاريخ السداد
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Collector & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم مسؤول المستلم / المحصل
                  </label>
                  <input
                    type="text"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    placeholder="اسم الموظف أو الإداري"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    بيان أو ملاحظات الإيصال
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: سداد بدلة كاراتيه مقاس 36 أو قسط شهر أغسطس"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!selectedPlayer || !amountPaid}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>تأكيد واستخراج الإيصال</span>
                </button>
              </div>

            </form>
          ) : (
            /* GENERATED RECEIPT SCREEN */
            generatedReceipt && (
              <div className="space-y-6">

                {/* Printable Receipt Card */}
                <div
                  id="cash-receipt-print-area"
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-md space-y-5 text-slate-900 dark:text-white relative overflow-hidden"
                >
                  {/* Top Watermark Badge */}
                  <div className="absolute top-3 left-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20">
                    إيصال استلام نقدية رسمي
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        {settings?.reportSettings?.customLogoUrl ? (
                          <img
                            src={settings.reportSettings.customLogoUrl}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          'FK'
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">
                          {settings.academyName || 'أكاديمية الفرسان الرياضية'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          سند قبض نقدية وتحصيل رسمي • معتمد من إدارة الأكاديمية
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono text-xs">
                      <div className="text-slate-500">رقم الإيصال</div>
                      <div className="font-black text-emerald-600">{generatedReceipt.receiptNo}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{generatedReceipt.date}</div>
                    </div>
                  </div>

                  {/* Receipt Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-slate-500 font-bold">بيانات طالب الأكاديمية:</div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {generatedReceipt.playerName}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>كود الطالب:</span>
                        <span className="font-mono font-bold text-emerald-600">{generatedReceipt.playerCode}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>هاتف ولي الأمر:</span>
                        <span className="font-mono">{generatedReceipt.parentPhone}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold">تفاصيل الدفعة المالية:</div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">فئة السداد:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{generatedReceipt.categoryLabel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">النشاط / البرنامج:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{generatedReceipt.activityName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">وسيلة الدفع:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{generatedReceipt.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Paid Amount Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">المبلغ المدفوع والمستلم:</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {generatedReceipt.amountPaid.toLocaleString()} {settings.currency || 'ج.م'}
                      </span>
                    </div>

                    {generatedReceipt.remainingAmount > 0 && (
                      <div className="text-left">
                        <span className="text-xs font-bold text-rose-500 block">المبلغ المتبقي:</span>
                        <span className="text-base font-black text-rose-600">
                          {generatedReceipt.remainingAmount.toLocaleString()} {settings.currency || 'ج.م'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes & Collector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <div>
                      <span>المستلم / المحصل: </span>
                      <strong className="text-slate-900 dark:text-white">{generatedReceipt.collectorName}</strong>
                    </div>
                    {generatedReceipt.notes && (
                      <div>
                        <span>ملاحظات: </span>
                        <span className="italic">{generatedReceipt.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Stamp & Signatures */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 text-center text-[11px] text-slate-500">
                    <div>
                      <div>توقيع واستلام ولي الأمر</div>
                      <div className="h-8"></div>
                      <div className="text-slate-300">____________________</div>
                    </div>
                    <div>
                      <div className="font-bold text-amber-600">اعتماد إدارة الأكاديمية</div>
                      <div className="h-8 flex items-center justify-center">
                        <span className="text-[10px] bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded border border-amber-500/20">
                          ختم معتمد 🔒
                        </span>
                      </div>
                      <div className="text-slate-300">____________________</div>
                    </div>
                  </div>

                </div>

                {/* Print Options & Format Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs print:hidden">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <span>حجم ورق الطباعة:</span>
                    <button
                      type="button"
                      onClick={() => setPaperFormat('A5')}
                      className={`px-3 py-1 rounded-xl cursor-pointer transition-all ${
                        paperFormat === 'A5'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      A5 (نصف صفحة)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperFormat('A4')}
                      className={`px-3 py-1 rounded-xl cursor-pointer transition-all ${
                        paperFormat === 'A4'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      A4 (كامل)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-emerald-600 hover:underline font-bold cursor-pointer"
                  >
                    + تسجيل استلام نقدية جديد
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 print:hidden">
                  <button
                    onClick={handlePrintReceipt}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>طباعة الإيصال ({paperFormat})</span>
                  </button>

                  <button
                    onClick={handleDownloadReceiptPDF}
                    disabled={isExportingPDF}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isExportingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    <span>تحميل PDF ({paperFormat})</span>
                  </button>

                  <button
                    onClick={handleSendWhatsAppReceipt}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>إرسال عبر الواتساب</span>
                  </button>
                </div>

              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
};
