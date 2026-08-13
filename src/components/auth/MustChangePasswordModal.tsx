import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Lock, ShieldAlert, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export const MustChangePasswordModal: React.FC = () => {
  const { mustChangePassword, changePassword, currentSession } = useAcademy();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!mustChangePassword) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 5) {
      setErrorMsg('كلمة المرور الجديدة يجب أن تتكون من 5 أحرف أو أرقام على الأقل');
      return;
    }

    if (newPassword === '123456') {
      setErrorMsg('يرجى اختيار كلمة مرور مختلفة عن كلمة المرور المبدئية (123456)');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة الكتابة');
      return;
    }

    const res = changePassword(currentSession.id, newPassword);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md dir-rtl animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Top Decorative bar */}
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500" />

        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              تغيير كلمة المرور المبدئية
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              خطوة أمان إجبارية لحماية حسابك في أسرع وقت
            </p>
          </div>
        </div>

        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
          أهلاً بك <strong>{currentSession?.name}</strong>! نظراً لأنك تسجل الدخول بكلمة المرور المؤقتة المبدئية، يرجى تعيين كلمة مرور جديدة خاصة بك لحماية حسابك ولن تتمكن من تصفح النظام قبل إتمام هذه الخطوة.
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة مرور جديدة قوية"
                dir="ltr"
                className="w-full pr-10 pl-10 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 left-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور الجديدة"
                dir="ltr"
                className="w-full pr-10 pl-3 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>حفظ كلمة المرور والبدء في الاستخدام</span>
          </button>
        </form>
      </div>
    </div>
  );
};
