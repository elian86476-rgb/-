/**
 * WhatsApp Integration Utilities
 * Formats phone numbers (e.g. converting Egyptian local format 011... to 2011...)
 * and builds dynamic Arabic report messages for WhatsApp sharing.
 */

export const formatWhatsAppNumber = (rawPhone: string, defaultCountryCode = '20'): string => {
  if (!rawPhone) return '';

  // Remove all non-digit characters
  let digits = rawPhone.replace(/\D/g, '');

  if (!digits) return '';

  // If phone starts with double zero (e.g. 0020...), strip leading 00
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Handle Egyptian & local numbers starting with 01... (e.g. 010, 011, 012, 015)
  if (digits.startsWith('01') && digits.length === 11) {
    return defaultCountryCode + digits.slice(1);
  }

  // Generic local number starting with 0 (not 00)
  if (digits.startsWith('0')) {
    return defaultCountryCode + digits.slice(1);
  }

  // If number already starts with country code (e.g. 2011...)
  return digits;
};

export interface StudentReportWhatsAppPayload {
  academyName?: string;
  playerName: string;
  playerCode: string;
  age?: number;
  parentName?: string;
  activities?: string[];
  level?: string;
  coachName?: string;
  status?: string;
  paymentStatus?: string;
  attendanceSummary?: string;
  enrollmentDate?: string;
  notes?: string;
}

export interface PaymentReceiptWhatsAppPayload {
  academyName?: string;
  playerName: string;
  playerCode: string;
  amount: number;
  paymentDate: string;
  monthYear?: string;
  paymentCategory?: string;
  activityName: string;
  receiptNumber?: string;
  paymentMethod?: string;
  collectorName?: string;
  coachName?: string;
  remainingAmount?: number;
  notes?: string;
}

/**
 * Builds a friendly, formatted Arabic text report for WhatsApp sharing
 */
export const buildStudentReportMessage = (data: StudentReportWhatsAppPayload): string => {
  const academy = data.academyName || 'أكاديمية الفرسان الرياضية';
  const activitiesStr = data.activities?.length ? data.activities.join(' • ') : 'غير محدد';
  const statusStr = data.status === 'active' ? 'نشط ومستمر ✅' : 'غير نشط ⚠️';

  let msg = `📋 *تقرير طالب - ${academy}*\n`;
  msg += `-----------------------------------\n`;
  msg += `👤 *اسم الطالب:* ${data.playerName}\n`;
  msg += `🆔 *كود اللاعب:* ${data.playerCode}\n`;
  if (data.parentName) msg += `👨‍👩‍👦 *ولي الأمر:* ${data.parentName}\n`;
  if (data.age) msg += `🎂 *العمر:* ${data.age} سنة\n`;
  msg += `🥋 *الرياضة / الأنشطة:* ${activitiesStr}\n`;
  if (data.level) msg += `🏅 *المستوى / الحزام:* ${data.level}\n`;
  if (data.coachName) msg += `👨‍🏫 *المدرب المسؤول:* ${data.coachName}\n`;
  msg += `📌 *حالة الاشتراك:* ${statusStr}\n`;
  if (data.enrollmentDate) msg += `📅 *تاريخ الالتحاق:* ${data.enrollmentDate}\n`;
  if (data.paymentStatus) msg += `💳 *موقف التحصيل:* ${data.paymentStatus}\n`;
  if (data.attendanceSummary) msg += `📊 *ملخص الحضور:* ${data.attendanceSummary}\n`;
  if (data.notes) msg += `📝 *ملاحظات الكابتن:* ${data.notes}\n`;
  msg += `-----------------------------------\n`;
  msg += `نتمنى لبطنا دوام التوفيق والتميز! 🏆✨`;

  return msg;
};

/**
 * Builds a formatted Arabic payment receipt text for WhatsApp
 */
export const buildPaymentReceiptMessage = (data: PaymentReceiptWhatsAppPayload): string => {
  const academy = data.academyName || 'أكاديمية الفرسان الرياضية';
  const receiptNo = data.receiptNumber || `REC-${Date.now().toString().slice(-6)}`;

  let msg = `🧾 *إيصال استلام نقدية - ${academy}*\n`;
  msg += `-----------------------------------\n`;
  msg += `🔖 *رقم الإيصال:* ${receiptNo}\n`;
  msg += `👤 *اسم الطالب:* ${data.playerName} (كود: ${data.playerCode})\n`;
  if (data.paymentCategory) msg += `📌 *فئة السداد:* ${data.paymentCategory}\n`;
  msg += `🥋 *النشاط:* ${data.activityName}\n`;
  if (data.monthYear) msg += `📅 *عن الفترة:* ${data.monthYear}\n`;
  msg += `💵 *المبلغ المدفوع:* ${data.amount} ج.م\n`;
  if (data.remainingAmount !== undefined && data.remainingAmount > 0) {
    msg += `⚠️ *المبلغ المتبقي:* ${data.remainingAmount} ج.م\n`;
  }
  msg += `📆 *تاريخ السداد:* ${data.paymentDate}\n`;
  if (data.paymentMethod) msg += `💳 *طريقة الدفع:* ${data.paymentMethod}\n`;
  if (data.collectorName) msg += `👤 *المستلم:* ${data.collectorName}\n`;
  if (data.notes) msg += `📝 *ملاحظات الإيصال:* ${data.notes}\n`;
  msg += `-----------------------------------\n`;
  msg += `شكراً لثقتكم بنا، تم تسجيل عملية الدفع بنجاح! 🟢`;

  return msg;
};

/**
 * Triggers WhatsApp deep link or fallback prompt
 */
export const openWhatsApp = (
  phone: string,
  message: string,
  onMissingPhone?: () => void
): boolean => {
  const formattedPhone = formatWhatsAppNumber(phone);

  if (!formattedPhone) {
    if (onMissingPhone) {
      onMissingPhone();
    } else {
      alert('⚠️ رقم الهاتف غير مسجل لهذا الطالب/ولي الأمر! يرجى تحديث رقم الهاتف أولاً.');
    }
    return false;
  }

  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  return true;
};
