import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string; // ISO string YYYY-MM-DD or DD/MM/YYYY or empty
  onChange: (value: string) => void; // Returns YYYY-MM-DD format for data parsing compatibility
  label?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label,
  required = false,
  className = '',
  id,
}) => {
  // Convert incoming YYYY-MM-DD to DD/MM/YYYY for display input
  const formatIsoToDisplay = (iso: string) => {
    if (!iso) return '';
    if (iso.includes('/')) return iso; // already DD/MM/YYYY
    const parts = iso.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    return iso;
  };

  // Convert DD/MM/YYYY back to YYYY-MM-DD for backend state
  const formatDisplayToIso = (display: string) => {
    if (!display) return '';
    const parts = display.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year && year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    return display;
  };

  const [displayValue, setDisplayValue] = useState(formatIsoToDisplay(value));
  const [useDropdownMode, setUseDropdownMode] = useState(false);

  useEffect(() => {
    setDisplayValue(formatIsoToDisplay(value));
  }, [value]);

  // Handle typing masked input with automatic slash insertion
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ''); // Keep digits only
    let formatted = '';

    if (raw.length > 0) {
      const day = raw.slice(0, 2);
      formatted += day;
      if (raw.length >= 2) {
        formatted += '/';
        const month = raw.slice(2, 4);
        formatted += month;
        if (raw.length >= 4) {
          formatted += '/';
          const year = raw.slice(4, 8);
          formatted += year;
        }
      }
    }

    setDisplayValue(formatted);

    // If complete date DD/MM/YYYY (8 digits total) or empty, notify parent
    if (formatted.length === 10) {
      const iso = formatDisplayToIso(formatted);
      onChange(iso);
    } else if (formatted === '') {
      onChange('');
    }
  };

  // Dropdown selectors states derived from current value
  const parts = displayValue.split('/');
  const dayVal = parts[0] || '';
  const monthVal = parts[1] || '';
  const yearVal = parts[2] || '';

  const handleDropdownChange = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const formatted = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      setDisplayValue(formatted);
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    } else {
      const formatted = [d, m, y].filter(Boolean).join('/');
      setDisplayValue(formatted);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i); // 2026 down to 1977
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setUseDropdownMode(!useDropdownMode)}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
          >
            {useDropdownMode ? 'إدخال نصي مباشر (DD/MM/YYYY)' : 'اختيار سريع من القوائم'}
          </button>
        </div>
      )}

      {!useDropdownMode ? (
        <div className="relative">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            placeholder="اليوم / الشهر / السنة (مثال: 15/08/2015)"
            value={displayValue}
            onChange={handleTextChange}
            maxLength={10}
            className="w-full p-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-sm tracking-wider focus:ring-2 focus:ring-emerald-500 transition-all dir-ltr text-right"
            dir="ltr"
          />
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 dir-ltr">
          {/* Day */}
          <select
            value={dayVal}
            onChange={(e) => handleDropdownChange(e.target.value, monthVal, yearVal)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
          >
            <option value="">اليوم</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            value={monthVal}
            onChange={(e) => handleDropdownChange(dayVal, e.target.value, yearVal)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
          >
            <option value="">الشهر</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={yearVal}
            onChange={(e) => handleDropdownChange(dayVal, monthVal, e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
          >
            <option value="">السنة</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}
      <p className="text-[10px] text-slate-400">صيغة التاريخ المعتمدة: يوم / شهر / سنة (مثال: 15/08/2015)</p>
    </div>
  );
};
