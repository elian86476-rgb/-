import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { SettingsConfig, ReportSettingsConfig } from '../types';

export { jsPDF, autoTable };

/**
 * Helper to convert any oklch() color occurrences in CSS strings to valid rgb/rgba/hex
 * using an offscreen Canvas 2D context.
 */
function parseAndConvertOklch(str: string): string {
  if (!str || typeof str !== 'string' || !str.includes('oklch')) {
    return str;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');

    return str.replace(/oklch\([^)]+\)/gi, (match) => {
      if (ctx) {
        try {
          ctx.fillStyle = '#000000';
          ctx.fillStyle = match;
          let resolved = ctx.fillStyle;
          if (resolved === '#000000' && !match.includes(' 0 ') && !match.includes(' 0%')) {
            ctx.fillStyle = '#ffffff';
            ctx.fillStyle = match;
            resolved = ctx.fillStyle;
          }
          if (resolved) return resolved;
        } catch {
          // fallback
        }
      }
      return 'rgb(30, 41, 59)';
    });
  } catch {
    return str.replace(/oklch\([^)]+\)/gi, 'rgb(30, 41, 59)');
  }
}

/**
 * Capture an existing HTML element or temp rendered element and export as PDF
 */
export const exportElementToPDF = async (
  element: HTMLElement,
  filename: string = 'report.pdf',
  paperSizeFormat: 'a4' | 'a5' = 'a4'
) => {
  try {
    // Small delay to ensure styles, fonts, and images in DOM are fully computed
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // 1. Proxy getComputedStyle in cloned iframe window
        if (clonedDoc.defaultView) {
          const win = clonedDoc.defaultView;
          const origGetComputedStyle = win.getComputedStyle;
          win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
            const style = origGetComputedStyle.call(this, elt, pseudoElt);
            return new Proxy(style, {
              get(target, prop, receiver) {
                if (prop === 'getPropertyValue') {
                  return (propertyName: string) => {
                    const val = target.getPropertyValue(propertyName);
                    if (typeof val === 'string' && val.includes('oklch')) {
                      return parseAndConvertOklch(val);
                    }
                    return val;
                  };
                }
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === 'string' && value.includes('oklch')) {
                  return parseAndConvertOklch(value);
                }
                return value;
              },
            });
          };
        }

        // 2. Replace <style> elements containing oklch with sanitized versions
        const styles = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
        styles.forEach((s) => {
          if (s.textContent && s.textContent.includes('oklch')) {
            const sanitized = parseAndConvertOklch(s.textContent);
            const newStyle = clonedDoc.createElement('style');
            newStyle.textContent = sanitized;
            s.parentNode?.replaceChild(newStyle, s);
          }
        });

        // 3. Clean up cssRules in clonedDoc.styleSheets
        try {
          const sheets = Array.from(clonedDoc.styleSheets);
          sheets.forEach((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              for (let i = rules.length - 1; i >= 0; i--) {
                const r = rules[i];
                if (r.cssText && r.cssText.includes('oklch')) {
                  try {
                    sheet.deleteRule(i);
                  } catch {
                    // ignore rule deletion error
                  }
                }
              }
            } catch {
              if (sheet.ownerNode && sheet.ownerNode.parentNode) {
                sheet.ownerNode.parentNode.removeChild(sheet.ownerNode);
              }
            }
          });
        } catch {
          // ignore
        }

        // 4. Sanitize inline style attributes on elements
        const allEls = clonedDoc.querySelectorAll('*');
        allEls.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const styleAttr = htmlEl.getAttribute('style');
          if (styleAttr && styleAttr.includes('oklch')) {
            htmlEl.setAttribute('style', parseAndConvertOklch(styleAttr));
          }
        });
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: paperSizeFormat,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // Multi-page handling if content exceeds single page
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanName);
    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return false;
  }
};

interface ReportPdfOptions {
  settings?: SettingsConfig;
  paperSize?: 'A4' | 'A5';
}

/**
 * Generate PDF for Attendance Reports
 */
export const downloadAttendanceReportPDF = async (
  records: Array<{
    date: string;
    playerName: string;
    playerCode: string;
    activityName: string;
    status: string;
    notes?: string;
  }>,
  title: string = 'تقرير سجلات الحضور والغياب - أكاديمية الفرسان',
  options?: ReportPdfOptions
) => {
  const rSettings: ReportSettingsConfig = options?.settings?.reportSettings || {};
  const paperSize = options?.paperSize || rSettings.paperSize || 'A4';
  const headerColor = rSettings.headerColor || '#0f172a';
  const fontSize = rSettings.fontSize === 'small' ? '11px' : rSettings.fontSize === 'large' ? '14px' : '12px';
  const headerText = rSettings.headerText || 'أكاديمية الفرسان للألعاب الرياضية وتحفيظ القرآن - قوة • أخلاق • انضباط';
  const footerText = rSettings.footerText || 'تم التصدير آلياً بواسطة نظام أكاديمية الفرسان الرقمي • معتمد من الإدارة';
  const showLogo = rSettings.showLogo ?? true;
  const showFooter = rSettings.showFooter ?? true;
  const customLogoUrl = rSettings.customLogoUrl || '';

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = paperSize === 'A5' ? '595px' : '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'Cairo, system-ui, sans-serif';
  container.style.direction = 'rtl';
  container.style.padding = '24px';
  container.style.boxSizing = 'border-box';

  const dateStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const presentCount = records.filter((r) => r.status === 'present' || r.status === 'حاضر').length;
  const lateCount = records.filter((r) => r.status === 'late' || r.status === 'متأخر').length;
  const absentCount = records.filter((r) => r.status === 'absent' || r.status === 'غائب').length;

  container.innerHTML = `
    <div style="border: 2px solid ${headerColor}; border-radius: 16px; padding: 20px; background: #ffffff; box-sizing: border-box;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px; background: ${headerColor}; color: #ffffff; padding: 14px 18px; border-radius: 12px; page-break-inside: avoid;">
        <div style="flex: 1; padding-left: 12px;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 900; line-height: 1.3; color: #ffffff;">${options?.settings?.academyName || 'أكاديمية الفرسان'}</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; font-weight: 700; line-height: 1.4;">${headerText}</p>
        </div>
        ${
          showLogo
            ? `<div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #ffffff; shrink: 0; overflow: hidden;">
                ${customLogoUrl ? `<img src="${customLogoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : 'FK'}
              </div>`
            : ''
        }
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; page-break-inside: avoid;">
        <h2 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.4;">${title}</h2>
        <div style="font-size: 11px; color: #64748b; font-weight: 700;">التاريخ: ${dateStr}</div>
      </div>

      <!-- Metrics -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; page-break-inside: avoid;">
        <div style="background: #f1f5f9; padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 10px; color: #64748b; font-weight: 700;">إجمالي السجلات</div>
          <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 2px;">${records.length}</div>
        </div>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 10px; color: #047857; font-weight: 700;">حضور منتظم</div>
          <div style="font-size: 18px; font-weight: 900; color: #047857; margin-top: 2px;">${presentCount}</div>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 10px; color: #b45309; font-weight: 700;">متأخر</div>
          <div style="font-size: 18px; font-weight: 900; color: #b45309; margin-top: 2px;">${lateCount}</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 10px; color: #b91c1c; font-weight: 700;">غياب</div>
          <div style="font-size: 18px; font-weight: 900; color: #b91c1c; margin-top: 2px;">${absentCount}</div>
        </div>
      </div>

      <!-- Table with word wrapping and line heights -->
      <table style="width: 100%; border-collapse: collapse; font-size: ${fontSize}; text-align: right; table-layout: fixed;">
        <thead>
          <tr style="background: ${headerColor}; color: #ffffff;">
            <th style="padding: 8px 10px; width: 15%; word-wrap: break-word;">التاريخ</th>
            <th style="padding: 8px 10px; width: 15%; word-wrap: break-word;">الكود</th>
            <th style="padding: 8px 10px; width: 25%; word-wrap: break-word;">اسم الطالب</th>
            <th style="padding: 8px 10px; width: 20%; word-wrap: break-word;">النشاط</th>
            <th style="padding: 8px 10px; width: 12%; word-wrap: break-word;">الحالة</th>
            <th style="padding: 8px 10px; width: 13%; word-wrap: break-word;">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          ${records
            .slice(0, 100)
            .map(
              (r, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
              <td style="padding: 8px 10px; font-family: monospace; font-weight: bold; word-break: break-all;">${r.date}</td>
              <td style="padding: 8px 10px; font-weight: 700; color: #0284c7; word-break: break-all;">${r.playerCode}</td>
              <td style="padding: 8px 10px; font-weight: 800; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word;">${r.playerName}</td>
              <td style="padding: 8px 10px; line-height: 1.4; word-wrap: break-word;">${r.activityName}</td>
              <td style="padding: 8px 10px;">
                <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; ${
                  r.status === 'present' || r.status === 'حاضر'
                    ? 'background: #d1fae5; color: #065f46;'
                    : r.status === 'late' || r.status === 'متأخر'
                    ? 'background: #fef3c7; color: #92400e;'
                    : 'background: #fee2e2; color: #991b1b;'
                }">
                  ${r.status === 'present' ? 'حاضر' : r.status === 'late' ? 'متأخر' : r.status === 'absent' ? 'غائب' : r.status}
                </span>
              </td>
              <td style="padding: 8px 10px; color: #64748b; line-height: 1.3; word-wrap: break-word;">${r.notes || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- Footer -->
      ${
        showFooter
          ? `<div style="margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; page-break-inside: avoid;">
              <div>${footerText}</div>
              <div>اعتماد الإدارة ____________</div>
            </div>`
          : ''
      }
    </div>
  `;

  document.body.appendChild(container);
  const success = await exportElementToPDF(container, `تقرير_حضور_الفرسان_${Date.now()}.pdf`, paperSize.toLowerCase() as 'a4' | 'a5');
  document.body.removeChild(container);
  return success;
};

/**
 * Generate PDF Payment Receipt for Subscriptions
 */
export const downloadPaymentReceiptPDF = async (
  data: {
    receiptNo: string;
    playerName: string;
    playerCode: string;
    activityName: string;
    amountPaid: number;
    totalFee: number;
    remainingAmount: number;
    paymentMethod: string;
    collectorName: string;
    date: string;
    paymentCategory?: string;
    notes?: string;
  },
  options?: ReportPdfOptions
) => {
  const rSettings: ReportSettingsConfig = options?.settings?.reportSettings || {};
  const paperSize = options?.paperSize || rSettings.paperSize || 'A5';
  const headerColor = rSettings.headerColor || '#0f172a';
  const fontSize = rSettings.fontSize === 'small' ? '12px' : rSettings.fontSize === 'large' ? '15px' : '13px';
  const footerText = rSettings.footerText || 'شغف • انضباط • تميز - أكاديمية الفرسان';
  const showLogo = rSettings.showLogo ?? true;
  const customLogoUrl = rSettings.customLogoUrl || '';

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = paperSize === 'A5' ? '595px' : '720px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'Cairo, system-ui, sans-serif';
  container.style.direction = 'rtl';
  container.style.padding = '20px';
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <div style="border: 2px solid ${headerColor}; border-radius: 16px; padding: 20px; background: #ffffff; box-sizing: border-box; page-break-inside: avoid;">
      <!-- Header -->
      <div style="background: ${headerColor}; color: #ffffff; padding: 14px 18px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 900; line-height: 1.3; color: #ffffff;">${options?.settings?.academyName || 'أكاديمية الفرسان'}</h1>
          <div style="font-size: 11px; font-weight: 800; color: #fde68a; margin-top: 2px;">إيصال تحصيل اشتراكات ورسوم رسمية</div>
        </div>
        <div style="text-align: left; font-size: 10px; opacity: 0.9;">
          <div>رقم الإيصال: <strong>${data.receiptNo}</strong></div>
          <div>التاريخ: <strong>${data.date}</strong></div>
        </div>
        ${
          showLogo
            ? `<div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; color: #ffffff; shrink: 0; overflow: hidden;">
                ${customLogoUrl ? `<img src="${customLogoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : 'FK'}
              </div>`
            : ''
        }
      </div>

      <!-- Receipt Body Table -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
        <table style="width: 100%; font-size: ${fontSize}; border-collapse: separate; border-spacing: 0 8px; line-height: 1.5;">
          <tr>
            <td style="font-weight: 700; color: #475569; width: 32%;">اسم الطالب والرمز:</td>
            <td style="font-weight: 900; color: #0f172a; word-wrap: break-word;">${data.playerName} <span style="color: #0284c7; font-family: monospace;">(${data.playerCode})</span></td>
          </tr>
          ${
            data.paymentCategory
              ? `<tr>
            <td style="font-weight: 700; color: #475569;">فئة / غرض السداد:</td>
            <td style="font-weight: 800; color: #4f46e5;">${data.paymentCategory}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="font-weight: 700; color: #475569;">النشاط / البرنامج:</td>
            <td style="font-weight: 800; color: #d97706; word-wrap: break-word;">${data.activityName}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">المبلغ المدفوع:</td>
            <td style="font-weight: 900; font-size: 16px; color: #059669;">${data.amountPaid.toLocaleString()} ${options?.settings?.currency || 'ج.م'}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">إجمالي قسط الاشتراك:</td>
            <td style="font-weight: 700; color: #334155;">${data.totalFee.toLocaleString()} ${options?.settings?.currency || 'ج.م'}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">المبلغ المتبقي:</td>
            <td style="font-weight: 800; color: ${data.remainingAmount > 0 ? '#dc2626' : '#059669'};">
              ${data.remainingAmount > 0 ? `${data.remainingAmount.toLocaleString()} ${options?.settings?.currency || 'ج.م'}` : 'خالص الاشتراك (0)'}
            </td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">طريقة وسيلة الدفع:</td>
            <td style="font-weight: 700; color: #0284c7;">${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">مسؤول التحصيل:</td>
            <td style="font-weight: 700; color: #334155;">${data.collectorName}</td>
          </tr>
          ${
            data.notes
              ? `<tr>
            <td style="font-weight: 700; color: #475569;">ملاحظات الإيصال:</td>
            <td style="color: #64748b; word-wrap: break-word;">${data.notes}</td>
          </tr>`
              : ''
          }
        </table>
      </div>

      <!-- Signatures -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #475569; page-break-inside: avoid;">
        <div style="text-align: center;">
          <div>توقيع ولي الأمر / الاستلام</div>
          <div style="height: 25px;"></div>
          <div>____________________</div>
        </div>
        <div style="text-align: center;">
          <div style="font-weight: 800; color: #d97706;">خاتم الاعتماد الرسمية</div>
          <div style="width: 50px; height: 50px; margin: 4px auto; border: 2px solid ${headerColor}; border-radius: 50%; padding: 2px; font-size: 7px; color: ${headerColor}; display: flex; align-items: center; justify-content: center; text-align: center;">
            ${options?.settings?.academyName || 'أكاديمية الفرسان'}
          </div>
        </div>
        <div style="text-align: center;">
          <div>توقيع مسؤول الخزينة</div>
          <div style="height: 25px;"></div>
          <div>____________________</div>
        </div>
      </div>

      <div style="margin-top: 10px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 6px;">
        ${footerText}
      </div>
    </div>
  `;

  document.body.appendChild(container);
  const success = await exportElementToPDF(container, `إيصال_سداد_${data.playerCode}_${Date.now()}.pdf`, paperSize.toLowerCase() as 'a4' | 'a5');
  document.body.removeChild(container);
  return success;
};

/**
 * Download Comprehensive Student Profile PDF
 */
export const downloadStudentSummaryPDF = async (
  data: {
    fullName: string;
    playerCode: string;
    birthDate?: string;
    age?: number;
    activities?: string[];
    beltRank?: string;
    quranPart?: string;
    parentName?: string;
    parentPhone?: string;
    phone?: string;
    address?: string;
    enrollmentDate?: string;
    status?: string;
    coachName?: string;
    levels?: Record<string, string>;
    attendanceCount?: number;
    totalSessions?: number;
    attendanceRate?: number;
  },
  options?: ReportPdfOptions
) => {
  const rSettings: ReportSettingsConfig = options?.settings?.reportSettings || {};
  const paperSize = options?.paperSize || rSettings.paperSize || 'A4';
  const headerColor = rSettings.headerColor || '#0284c7';
  const attendanceCount = data.attendanceCount ?? 0;
  const totalSessions = data.totalSessions ?? 0;
  const attendanceRate = data.attendanceRate ?? 100;
  const showLogo = rSettings.showLogo ?? true;
  const customLogoUrl = rSettings.customLogoUrl || '';

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = paperSize === 'A5' ? '595px' : '750px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'Cairo, system-ui, sans-serif';
  container.style.direction = 'rtl';
  container.style.padding = '24px';
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <div style="border: 2px solid ${headerColor}; border-radius: 16px; padding: 20px; background: #ffffff; box-sizing: border-box; page-break-inside: avoid;">
      <!-- Header -->
      <div style="background: ${headerColor}; color: #ffffff; padding: 14px 18px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 900; line-height: 1.3; color: #ffffff;">بطاقة متابعة طالب - ${options?.settings?.academyName || 'أكاديمية الفرسان'}</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; font-weight: 700;">تقرير تفصيلي شامل للأداء والانضباط</p>
        </div>
        <div style="text-align: left; background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 8px;">
          <div style="font-size: 9px; text-transform: uppercase;">كود الطالب</div>
          <div style="font-size: 16px; font-weight: 900; color: #ffffff; font-family: monospace;">${data.playerCode}</div>
        </div>
      </div>

      <!-- Student Main Specs Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 16px;">
        <div style="background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">البيانات الشخصية والرياضية</h3>
          <div style="font-size: 12px; line-height: 1.8;">
            <div><strong>اسم الطالب:</strong> ${data.fullName}</div>
            <div><strong>تاريخ الميلاد:</strong> ${data.birthDate || 'غير مدخل'}</div>
            <div><strong>البرامج المسجل بها:</strong> ${(data.activities || []).join(' • ') || 'كاراتيه'}</div>
            ${data.beltRank ? `<div><strong>مستوى الحزام:</strong> ${data.beltRank}</div>` : ''}
            ${data.quranPart ? `<div><strong>مستوى تحفيظ القرآن:</strong> ${data.quranPart}</div>` : ''}
            <div><strong>اسم ولي الأمر:</strong> ${data.parentName || 'غير مسجل'}</div>
            <div><strong>رقم التواصل:</strong> ${data.phone || 'غير مسجل'}</div>
          </div>
        </div>

        <div style="background: #ecfdf5; padding: 14px; border-radius: 12px; border: 1px solid #a7f3d0; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="font-size: 11px; font-weight: 800; color: #047857;">نسبة الحضور والالتزام</div>
          <div style="font-size: 28px; font-weight: 900; color: #059669; margin: 6px 0;">${attendanceRate}%</div>
          <div style="font-size: 10px; color: #065f46; line-height: 1.4;">حضر ${attendanceCount} من إجمالي ${totalSessions} حصة تدريبية</div>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #64748b;">
        ${options?.settings?.academyName || 'أكاديمية الفرسان الرياضية'} • تقرير متابعة أداء الطالب الرسمي
      </div>
    </div>
  `;

  document.body.appendChild(container);
  const success = await exportElementToPDF(container, `تقرير_طالب_${data.playerCode}_${Date.now()}.pdf`, paperSize.toLowerCase() as 'a4' | 'a5');
  document.body.removeChild(container);
  return success;
};
