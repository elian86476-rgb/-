import React, { useState, useEffect } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { downloadPaymentReceiptPDF } from '../../utils/pdfGenerator';
import { PlayerStatus } from '../../types';
import { DateInput } from '../common/DateInput';
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Camera,
  UserCheck,
  Mail,
  Swords,
  Flame,
  BookOpenCheck,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  QrCode,
  Copy,
  Printer,
  Share2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface NewSubscriberWizardProps {
  onFinish?: (newPlayerCode: string) => void;
  onCancel?: () => void;
}

export const NewSubscriberWizard: React.FC<NewSubscriberWizardProps> = ({
  onFinish,
  onCancel,
}) => {
  const {
    activities,
    coaches,
    parents,
    settings,
    addPlayer,
    addParent,
    linkPlayerToParent,
    addSubscription,
  } = useAcademy();

  // Wizard Step Control (1: Player, 2: Parent, 3: Activity & Subscription, 4: Review, 5: Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- Step 1: Player Personal Data ---
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [playerPhone, setPlayerPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // --- Step 2: Parent Data ---
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [createParentAccount, setCreateParentAccount] = useState(true);
  const [existingParentId, setExistingParentId] = useState<string | null>(null);
  const [existingParentObj, setExistingParentObj] = useState<any | null>(null);

  // --- Step 3: Activity & Subscription ---
  // Selected Activity IDs (default karate)
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>(
    activities.length > 0 ? [activities[0].id] : ['act-karate']
  );
  // Selected group per activity { [activityId]: groupId }
  const [selectedGroups, setSelectedGroups] = useState<Record<string, string>>({});
  // Selected coach per activity { [activityId]: coachId }
  const [selectedCoaches, setSelectedCoaches] = useState<Record<string, string>>({});
  // Selected belt/level per activity { [activityId]: level }
  const [selectedLevels, setSelectedLevels] = useState<Record<string, string>>({});

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<'شهرية' | 'فصلية (3 أشهر)' | 'سنوية'>('شهرية');
  const [customFee, setCustomFee] = useState<number | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'نقداً' | 'تحويل بنكي' | 'فودافون كاش' | 'شبكة بطاقات'>('نقداً');

  // --- Step 5: Saved Result State ---
  const [createdPlayerCode, setCreatedPlayerCode] = useState<string>('');
  const [createdPlayerName, setCreatedPlayerName] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Helper: Calculate age in years and months from birthDate
  const calculateAgeDetails = (dateStr: string) => {
    if (!dateStr) return { years: 0, months: 0, text: 'غير محدد' };
    const birth = new Date(dateStr);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }

    return {
      years,
      months,
      text: `${years} سنة ${months > 0 ? `و ${months} شهر` : ''}`,
    };
  };

  const ageDetails = calculateAgeDetails(birthDate);

  // Auto detect if parent phone matches existing parent record
  useEffect(() => {
    if (parentPhone && parentPhone.trim().length >= 8) {
      const cleanPhone = parentPhone.trim();
      const match = parents.find(
        (p) => p.phone === cleanPhone || p.phone.includes(cleanPhone)
      );
      if (match) {
        setExistingParentId(match.id);
        setExistingParentObj(match);
        if (!parentName) {
          setParentName(match.fullName);
        }
      } else {
        setExistingParentId(null);
        setExistingParentObj(null);
      }
    } else {
      setExistingParentId(null);
      setExistingParentObj(null);
    }
  }, [parentPhone, parents]);

  // Auto sync parentName with player surname if empty
  useEffect(() => {
    if (fullName && !parentName && !existingParentObj) {
      const parts = fullName.trim().split(' ');
      if (parts.length >= 2) {
        setParentName(`أحمد ${parts.slice(1).join(' ')}`);
      }
    }
  }, [fullName]);

  // Auto calculate default fees whenever selected activities change
  const defaultTotalFee = selectedActivityIds.reduce((sum, actId) => {
    const act = activities.find((a) => a.id === actId);
    return sum + (act ? act.monthlyFee : 0);
  }, 0);

  const effectiveTotalFee = customFee !== null ? customFee : defaultTotalFee;
  const remainingAmount = Math.max(0, effectiveTotalFee - paidAmount);

  // Set default groups and coaches when activities change
  useEffect(() => {
    const newGroups: Record<string, string> = { ...selectedGroups };
    const newCoaches: Record<string, string> = { ...selectedCoaches };
    const newLevels: Record<string, string> = { ...selectedLevels };

    selectedActivityIds.forEach((actId) => {
      const act = activities.find((a) => a.id === actId);
      if (act) {
        if (!newGroups[actId] && act.groups.length > 0) {
          newGroups[actId] = act.groups[0].id || act.groups[0].name;
        }
        if (!newCoaches[actId] && act.assignedCoachIds.length > 0) {
          newCoaches[actId] = act.assignedCoachIds[0];
        } else if (!newCoaches[actId] && coaches.length > 0) {
          newCoaches[actId] = coaches[0].id;
        }

        if (!newLevels[actId]) {
          if (act.code === 'karate') newLevels[actId] = settings.karateBelts[0] || 'حزام أبيض';
          else if (act.code === 'kungfu') newLevels[actId] = settings.kungfuBelts[0] || 'المستوى الأول';
          else if (act.code === 'quran') newLevels[actId] = settings.quranLevels[0] || 'جزء عم';
          else newLevels[actId] = 'مبتدئ';
        }
      }
    });

    setSelectedGroups(newGroups);
    setSelectedCoaches(newCoaches);
    setSelectedLevels(newLevels);
  }, [selectedActivityIds, activities, coaches, settings]);

  // Toggle activity selection
  const handleToggleActivity = (actId: string) => {
    setSelectedActivityIds((prev) => {
      if (prev.includes(actId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== actId);
      } else {
        return [...prev, actId];
      }
    });
  };

  // --- Step Navigation & Validation ---
  const handleNextStep = () => {
    setValidationError(null);

    // Validate Step 1
    if (currentStep === 1) {
      if (!fullName.trim()) {
        setValidationError('يرجى إدخال اسم اللاعب الكامل.');
        return;
      }
      if (!parentPhone.trim()) {
        setValidationError('يرجى إدخال رقم هاتف ولي الأمر (إجباري والتواصل للتنبيهات).');
        return;
      }
    }

    // Validate Step 2
    if (currentStep === 2) {
      if (!parentName.trim()) {
        setValidationError('يرجى إدخال اسم ولي الأمر الكامل.');
        return;
      }
    }

    // Validate Step 3
    if (currentStep === 3) {
      if (selectedActivityIds.length === 0) {
        setValidationError('يرجى اختيار نشاط واحد على الأقل للمشترك.');
        return;
      }
      if (paidAmount < 0) {
        setValidationError('المبلغ المدفوع لا يمكن أن يكون بالسالب.');
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // --- Final Save & Submission ---
  const handleFinalSubmit = () => {
    setValidationError(null);

    try {
      // 1. Determine or Create Parent
      let finalParentId = existingParentId;
      if (!finalParentId) {
        const newParent = addParent({
          fullName: parentName,
          phone: parentPhone,
          email: parentEmail || `${parentPhone}@academy.com`,
          linkedPlayerCodes: [],
          status: 'active',
        });
        finalParentId = newParent.id;
      }

      // 2. Create Player
      const primaryCoachId =
        selectedCoaches[selectedActivityIds[0]] || coaches[0]?.id || 'coach-1';

      const newPlayer = addPlayer({
        fullName,
        birthDate,
        age: ageDetails.years,
        gender,
        phone: playerPhone,
        parentPhone,
        parentName,
        address: address || 'القاهرة',
        enrollmentDate: startDate,
        activityIds: selectedActivityIds,
        primaryCoachId,
        status: 'active',
        currentLevels: selectedLevels,
        photoUrl: photoUrl || undefined,
      });

      // 3. Link Player to Parent
      if (finalParentId && newPlayer.playerCode) {
        linkPlayerToParent(finalParentId, newPlayer.playerCode);
      }

      // 4. Create Subscriptions for each selected activity
      selectedActivityIds.forEach((actId) => {
        const act = activities.find((a) => a.id === actId);
        const actFee = act ? act.monthlyFee : 0;
        // Proportionally divide paid amount if multiple activities
        const actPaid = selectedActivityIds.length === 1 ? paidAmount : Math.min(paidAmount, actFee);
        const actRemaining = Math.max(0, actFee - actPaid);

        const nextDueDateObj = new Date(startDate);
        nextDueDateObj.setMonth(nextDueDateObj.getMonth() + 1);
        const nextDueDate = nextDueDateObj.toISOString().split('T')[0];

        addSubscription({
          playerId: newPlayer.id,
          activityId: actId,
          monthlyFee: actFee,
          paidAmount: actPaid,
          remainingAmount: actRemaining,
          lastPaymentDate: startDate,
          nextDueDate: nextDueDate,
          status: actRemaining === 0 ? 'paid' : actPaid > 0 ? 'partial' : 'overdue',
          collectedByRole: 'admin',
          collectorName: 'مدير النظام',
          paymentMethod: paymentMethod,
          notes: `تسجيل جديد عبر معالج الاشتراك (${subscriptionPeriod})`,
        });
      });

      setCreatedPlayerCode(newPlayer.playerCode);
      setCreatedPlayerName(newPlayer.fullName);
      setCurrentStep(5); // Go to Success Step
    } catch (err: any) {
      setValidationError('حدث خطأ أثناء تسجيل البيانات. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdPlayerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `أهلاً بك أ/ ${parentName} في ${settings.academyName}! 🎉%0Aتم تسجيل ابنكم (${createdPlayerName}) بنجاح.%0A🆔 كود اللاعب الخاص به: *${createdPlayerCode}*%0Aيرجى احتفاظ بهذا الكود لاستخدامه في تطبيق ولي الأمر لمتابعة الحضور والاشتراكات.`;
    window.open(`https://wa.me/2${parentPhone}?text=${text}`, '_blank');
  };

  const handlePrintReceipt = async () => {
    try {
      const actNames = selectedActivityIds
        .map((id) => activities.find((a) => a.id === id)?.name)
        .filter(Boolean)
        .join(' • ');

      await downloadPaymentReceiptPDF(
        {
          receiptNo: `REC-${Date.now().toString().slice(-6)}`,
          playerName: createdPlayerName || fullName,
          playerCode: createdPlayerCode,
          activityName: actNames || 'أنشطة الأكاديمية',
          amountPaid: paidAmount || 0,
          totalFee: effectiveTotalFee || 0,
          remainingAmount: remainingAmount || 0,
          paymentMethod: 'نقدي (خزينة)',
          collectorName: 'مسؤول التسجيل',
          date: new Date().toLocaleDateString('ar-EG'),
          notes: 'إيصال اشتراك وتسجيل جديد',
        },
        { settings }
      );
    } catch (e) {
      console.error(e);
    }
    window.print();
  };

  const handleResetForm = () => {
    setFullName('');
    setBirthDate('');
    setGender('ذكر');
    setPlayerPhone('');
    setParentPhone('');
    setAddress('');
    setPhotoUrl('');
    setParentName('');
    setParentEmail('');
    setPaidAmount(0);
    setCustomFee(null);
    setCurrentStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-emerald-100 mb-2">
            <UserPlus className="w-3.5 h-3.5" />
            شاشة الإدارة • تسجيل مشتركون جدد
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            تسجيل مشترك جديد في الأكاديمية
          </h1>
          <p className="text-xs md:text-sm text-emerald-100 mt-1 opacity-90">
            خطوات متتالية ميسرة لتسجيل اللاعب، بيانات ولي الأمر، والاشتراك المالي
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
          >
            إلغاء والعودة
          </button>
        )}
      </div>

      {/* Stepper Progress Indicator */}
      {currentStep <= 4 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            {/* Step 1 */}
            <div
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                currentStep === 1
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : currentStep > 1
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                  currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="hidden sm:inline">بيانات اللاعب</span>
              <span className="sm:hidden">اللاعب</span>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                currentStep === 2
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : currentStep > 2
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                  currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="hidden sm:inline">ولي الأمر</span>
              <span className="sm:hidden">ولي الأمر</span>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                currentStep === 3
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : currentStep > 3
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                  currentStep > 3
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span className="hidden sm:inline">النشاط والاشتراك</span>
              <span className="sm:hidden">الاشتراك</span>
            </div>

            {/* Step 4 */}
            <div
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                currentStep === 4
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                  currentStep === 4
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                4
              </div>
              <span className="hidden sm:inline">مراجعة وتأكيد</span>
              <span className="sm:hidden">المراجعة</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert Message */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* STEP 1: Personal Player Data */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              الخطوة 1: البيانات الشخصية للاعب
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              أدخل اسم الطالب وتاريخ الميلاد ورقم للتواصل الأساسي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                الاسم الكامل للاعب (الطالب) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: يوسف أحمد إبراهيم الشناوي"
                  className="w-full pr-10 pl-4 py-3 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Birthdate */}
            <div>
              <DateInput
                label="تاريخ الميلاد"
                value={birthDate}
                onChange={(iso) => setBirthDate(iso)}
              />
            </div>

            {/* Calculated Age */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                السن المحسوب تلقائياً
              </label>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 font-extrabold text-sm flex items-center justify-between">
                <span>{ageDetails.text}</span>
                <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-lg">
                  تلقائي
                </span>
              </div>
            </div>

            {/* Gender Choice */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                النوع
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('ذكر')}
                  className={`p-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    gender === 'ذكر'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600'
                  }`}
                >
                  <span>👦 ذكر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('أنثى')}
                  className={`p-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    gender === 'أنثى'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600'
                  }`}
                >
                  <span>👧 أنثى</span>
                </button>
              </div>
            </div>

            {/* Parent Phone (Mandatory) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم هاتف ولي الأمر (للتواصل الإجباري) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full pr-10 pl-4 py-3 text-sm font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Player Phone (Optional) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم هاتف اللاعب الخاص (اختياري)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={playerPhone}
                  onChange={(e) => setPlayerPhone(e.target.value)}
                  placeholder="01112345678 (إن وجد)"
                  className="w-full pr-10 pl-4 py-3 text-sm font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                العنوان والمنطقة
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: القاهرة - التجمع الخامس - الحي الأول"
                  className="w-full pr-10 pl-4 py-3 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Profile Photo Option */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                صورة شخصية للاعب (رابط/اختياري)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Camera className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="ضع رابط صورة أو اتركه فارغاً لاستخدام الصورة الافتراضية"
                    className="w-full pr-10 pl-4 py-3 text-xs font-mono rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Parent Data */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              الخطوة 2: بيانات ولي الأمر وحساب المتابعة
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              الربط بحساب سابق أو إنشاء حساب دخول جديد لولي الأمر
            </p>
          </div>

          {/* Existing Parent Detected Banner */}
          {existingParentObj ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-sm">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>وُجد حساب سابق لولي الأمر برقم الهاتف هذا!</span>
              </div>
              <p className="text-xs leading-relaxed">
                اسم ولي الأمر المسجل: <strong className="font-bold">{existingParentObj.fullName}</strong> - لديه ({existingParentObj.linkedPlayerCodes.length}) أبناء مسجلين بالأكاديمية.
              </p>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                سيتم ربط اللاعب الجديد ({fullName}) تلقائياً بنفس حساب ولي الأمر عند الحفظ.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              لم يُعثر على حساب سابق بنفس رقم الهاتف. سيتم إنشاء حساب جديد لولي الأمر عند التسجيل.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parent Full Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم ولي الأمر الكامل <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="أدخل اسم أبا/أم اللاعب"
                  className="w-full pr-10 pl-4 py-3 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم الهاتف الرئيسي
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full pr-10 pl-4 py-3 text-sm font-bold font-mono rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Parent Email */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                البريد الإلكتروني (اختياري للإشعارات)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full pr-10 pl-4 py-3 text-sm font-mono rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Parent Account Creation Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  تفعيل حساب متابعة ولي الأمر في التطبيق
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  يتيح لولي الأمر متابعة الحضور والتقييمات والاشتراكات عبر حسابه
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={createParentAccount}
                  onChange={(e) => setCreateParentAccount(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {createParentAccount && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  سيتولد كود ربط فريد فور حفظ التسجيل لاستخدامه في شاشة "ربط ابن جديد".
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Activity & Subscription */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-emerald-600" />
              الخطوة 3: النشاط والاشتراك والمدفوعات
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              اختر الأنشطة الرياضية/الدينية والمجموعات وتفاصيل الدفع
            </p>
          </div>

          {/* Activity Selection */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-2">
              اختر النشاط الرياضي/الديني (يمكن اختيار أكثر من نشاط):
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activities.map((act) => {
                const isSelected = selectedActivityIds.includes(act.id);
                let icon = <Swords className="w-5 h-5 text-rose-500" />;
                if (act.code === 'kungfu') icon = <Flame className="w-5 h-5 text-amber-500" />;
                if (act.code === 'quran') icon = <BookOpenCheck className="w-5 h-5 text-emerald-500" />;

                return (
                  <button
                    type="button"
                    key={act.id}
                    onClick={() => handleToggleActivity(act.id)}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {act.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300" />
                      )}
                    </div>

                    <div className="text-xs text-slate-500 font-bold">
                      الرسوم الشهرية: {act.monthlyFee} {settings.currency}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group, Level & Coach Selection per Activity */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300">
              تحديد المجموعات والمستويات والمدربين للأنشطة المختارة:
            </h3>

            {selectedActivityIds.map((actId) => {
              const act = activities.find((a) => a.id === actId);
              if (!act) return null;

              const actCoaches = coaches.filter((c) => act.assignedCoachIds.includes(c.id));
              const displayCoaches = actCoaches.length > 0 ? actCoaches : coaches;

              return (
                <div
                  key={actId}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="font-black text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    تفاصيل نشاط: {act.name}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Level / Belt */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        المستوى / الحزام الحالي
                      </label>
                      <select
                        value={
                          selectedLevels[actId] ||
                          (act.code === 'karate'
                            ? settings.karateBelts[0]
                            : act.code === 'kungfu'
                            ? settings.kungfuBelts[0]
                            : settings.quranLevels[0])
                        }
                        onChange={(e) =>
                          setSelectedLevels({ ...selectedLevels, [actId]: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                      >
                        {act.code === 'karate' &&
                          settings.karateBelts.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        {act.code === 'kungfu' &&
                          settings.kungfuBelts.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        {act.code === 'quran' &&
                          settings.quranLevels.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Group Selection */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        المجموعة والتوقيت
                      </label>
                      <select
                        value={
                          typeof selectedGroups[actId] === 'string'
                            ? selectedGroups[actId]
                            : (selectedGroups[actId] as any)?.id || act.groups[0]?.id || ''
                        }
                        onChange={(e) =>
                          setSelectedGroups({ ...selectedGroups, [actId]: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                      >
                        {act.groups.map((grp) => (
                          <option key={grp.id || grp.name} value={grp.id || grp.name}>
                            {grp.name} ({grp.days ? grp.days.join(' - ') : ''}: {grp.time})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Coach Selection */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        المدرب / المحفظ المسؤول
                      </label>
                      <select
                        value={selectedCoaches[actId] || displayCoaches[0]?.id}
                        onChange={(e) =>
                          setSelectedCoaches({ ...selectedCoaches, [actId]: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                      >
                        {displayCoaches.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financials & Payment Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              تفاصيل الدفع والاشتراك المالي:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Start Date */}
              <div>
                <DateInput
                  label="تاريخ بداية الاشتراك"
                  value={startDate}
                  onChange={(iso) => setStartDate(iso)}
                />
              </div>

              {/* Period Type */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الاشتراك
                </label>
                <select
                  value={subscriptionPeriod}
                  onChange={(e) => setSubscriptionPeriod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs"
                >
                  <option value="شهرية">شهري (1 شهر)</option>
                  <option value="فصلية (3 أشهر)">فصلي (3 أشهر)</option>
                  <option value="سنوية">سنوي (12 شهر)</option>
                </select>
              </div>

              {/* Total Fee (Customizable) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  قيمة الاشتراك الإجمالية ({settings.currency})
                </label>
                <input
                  type="number"
                  value={effectiveTotalFee}
                  onChange={(e) => setCustomFee(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs"
                />
              </div>

              {/* Paid Amount Now */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ المدفوع الآن ({settings.currency})
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  placeholder="أدخل المبلغ المقبوض"
                  className="w-full p-2.5 rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-extrabold text-sm"
                />
              </div>

              {/* Remaining Balance (Calculated) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ المتبقي
                </label>
                <div
                  className={`p-2.5 rounded-xl border text-sm font-extrabold flex items-center justify-between ${
                    remainingAmount === 0
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-rose-50 border-rose-300 text-rose-700'
                  }`}
                >
                  <span>{remainingAmount} {settings.currency}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/60">
                    {remainingAmount === 0 ? 'مكتمل' : 'متبقي'}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  طريقة الدفع
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs"
                >
                  <option value="نقداً">نقداً (Cash)</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="فودافون كاش">محفظة إلكترونية (فودافون كاش)</option>
                  <option value="شبكة بطاقات">بطاقة ائتمان / شبكة</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Confirmation */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              الخطوة 4: مراجعة البيانات والتأكيد النهائي
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              تأكد من صحة كافة البيانات المدخلة قبل الحفظ وإصدار كود المشترك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Player Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                بيانات اللاعب
              </h3>
              <div className="space-y-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">الاسم الكامل:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">السن والنوع:</span>
                  <span>{ageDetails.text} ({gender})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">هاتف ولي الأمر:</span>
                  <span className="font-mono">{parentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">العنوان:</span>
                  <span>{address || 'غير محدد'}</span>
                </div>
              </div>
            </div>

            {/* Parent Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 border-b pb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                بيانات ولي الأمر
              </h3>
              <div className="space-y-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">اسم ولي الأمر:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">حالة الحساب:</span>
                  <span>
                    {existingParentObj ? 'حساب سابق موجود (سيتم الربط)' : 'حساب جديد سيتم إنشاؤه'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">إنشاء حساب تطبيق:</span>
                  <span>{createParentAccount ? 'مفعل (نعم)' : 'غير مفعل'}</span>
                </div>
              </div>
            </div>

            {/* Activities & Coaches Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 md:col-span-2">
              <h3 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 border-b pb-2 flex items-center gap-2">
                <Swords className="w-4 h-4" />
                الأنشطة والمجموعات المختارة
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {selectedActivityIds.map((actId) => {
                  const act = activities.find((a) => a.id === actId);
                  const coach = coaches.find((c) => c.id === selectedCoaches[actId]);

                  return (
                    <div
                      key={actId}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1"
                    >
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {act?.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        المستوى: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedLevels[actId]}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        المجموعة: <span className="font-bold text-slate-700 dark:text-slate-300">
                          {(() => {
                            const val = selectedGroups[actId];
                            if (!val) return 'المجموعة الأولى';
                            if (typeof val === 'object') return (val as any).name || 'المجموعة الأولى';
                            const found = act?.groups.find((g) => g.id === val || g.name === val);
                            return found ? `${found.name} (${found.time})` : val;
                          })()}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold">
                        المدرب: {coach?.fullName || 'غير محدد'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Breakdown Summary */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2 md:col-span-2">
              <h3 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800 pb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                ملخص المدفوعات والاشتراك
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1 font-bold">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-slate-400">إجمالي قيمة الاشتراك</div>
                  <div className="text-sm text-slate-900 dark:text-white mt-1">
                    {effectiveTotalFee} {settings.currency}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-slate-400">المبلغ المقبوض الآن</div>
                  <div className="text-sm text-emerald-600 font-black mt-1">
                    {paidAmount} {settings.currency}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-slate-400">المبلغ المتبقي</div>
                  <div className={`text-sm mt-1 ${remainingAmount > 0 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}`}>
                    {remainingAmount} {settings.currency}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-slate-400">طريقة الدفع</div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 mt-1">
                    {paymentMethod}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Success Confirmation Screen */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-emerald-200 dark:border-emerald-800/80 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-4xl shadow-inner animate-bounce">
            🎉
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              تم الحفظ والتسجيل بنجاح!
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2">
              تم تسجيل اللاعب ({createdPlayerName}) بنجاح!
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              تم إنشاء سجل اللاعب، وربطه بنشاط الرياضة والمجموعة المحددة، وإنشاء السجل المالي لولي الأمر.
            </p>
          </div>

          {/* Unique Player Code Display Box */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 text-white shadow-lg space-y-3">
            <div className="text-xs text-emerald-200 font-extrabold flex items-center justify-center gap-1">
              <QrCode className="w-4 h-4" />
              كود اللاعب الفريد (Player ID Code)
            </div>

            <div className="text-3xl md:text-4xl font-black font-mono tracking-widest bg-white/10 py-3 px-6 rounded-xl border border-white/20">
              {createdPlayerCode}
            </div>

            <p className="text-[11px] text-emerald-100 leading-relaxed">
              يُستخدم هذا الكود لربط حساب ولي الأمر في تطبيق متابعة الأبناء، أو للتحضير السريع بالحضور.
            </p>

            <button
              onClick={handleCopyCode}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-900 font-extrabold text-xs hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedCode ? 'تم نسخ الكود!' : 'نسخ كود اللاعب للحافظة'}</span>
            </button>
          </div>

          {/* Share & Print Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>إرسال كود اللاعب لولي الأمر عبر واتساب</span>
            </button>

            <button
              onClick={handlePrintReceipt}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة إيصال التسجيل</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-colors"
            >
              + تسجيل لاعب جديد آخر
            </button>

            {onFinish && (
              <button
                onClick={() => onFinish(createdPlayerCode)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-sm hover:bg-slate-300 transition-colors"
              >
                الذهاب إلى قائمة اللاعبين
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer Wizard Action Buttons */}
      {currentStep <= 4 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>حفظ وتسجيل المشترك</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
