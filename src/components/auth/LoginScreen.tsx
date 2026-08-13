import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import alForsanLogo from '../../assets/images/al_forsan_logo_1785855624462.jpg';
import {
  Lock,
  Eye,
  EyeOff,
  LogIn,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  Info,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface LoginScreenProps {
  onBackToLanding?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBackToLanding }) => {
  const { login, settings } = useAcademy();

  // Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف أو عنوان الجيميل (Gmail)');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(identifier, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden dir-rtl">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Back to Landing Page Header Link */}
        {onBackToLanding && (
          <div className="mb-4 text-right">
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <span>العودة للواجهة الرئيسية للأكاديمية</span>
            </button>
          </div>
        )}

        {/* Academy Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative group mb-4">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 blur-md opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-slate-900 flex items-center justify-center">
              <img
                src={alForsanLogo}
                alt="أكاديمية الفرسان"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>{settings.academyName || 'أكاديمية الفرسان'}</span>
          </h1>

          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
            <span>قوة</span>
            <span className="text-amber-500">•</span>
            <span>أخلاق</span>
            <span className="text-amber-500">•</span>
            <span>انضباط</span>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <div className="mb-5 pb-3 border-b border-slate-700/60 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                تسجيل الدخول للنظام
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                أدخل بيانات حسابك المعتمدة للدخول للنظام
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Phone or Gmail Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رقم الهاتف أو عنوان الجيميل (Gmail) / البريد
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="مثال: 01012345678 أو user@gmail.com"
                  dir="ltr"
                  className="block w-full pr-10 pl-3.5 py-3 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-right"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                يمكنك كتابة رقم هاتفك المسجل لدى الأكاديمية أو البريد الإلكتروني (Gmail)
              </p>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="block w-full pr-10 pl-10 py-3 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول للنظام</span>
                </>
              )}
            </button>
          </form>

          {/* System Notice */}
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/40">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              حسابات المدربين وأولياء الأمور يتم إنشاؤها وتأمينها حصرية بواسطة إدارة الأكاديمية.
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Information Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="استعادة كلمة المرور"
      >
        <div className="space-y-4 text-right">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm mb-1">تعليمات إعادة ضبط كلمة المرور</div>
              <p>
                حفاظاً على أمان بيانات اللاعبين والأنشطة، تُدار كافة حسابات الأكاديمية مركزيًا عبر إدارة الأكاديمية.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>خطوات الاستعادة للمدربين وأولياء الأمور:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 pr-2">
              <li>تواصل مع مسؤول إدارة الأكاديمية مباشرة.</li>
              <li>سيقوم المسؤول بطلب بريدك/هاتفك وإعادة ضبط كلمة المرور إلى كلمة مرور مبدئية.</li>
              <li>عند تسجيل الدخول بكلمة المرور المبدئية، سيطلب منك النظام تغييرها مباشرة.</li>
            </ol>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
