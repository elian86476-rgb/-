import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { UserRole } from '../../types';
import { Modal } from '../common/Modal';
import {
  UserPlus,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  KeyRound,
  Mail,
  Phone,
  User,
  Swords,
  BookOpenCheck,
} from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose }) => {
  const { userAccounts, createUserAccount, addCoach, addParent, activities } = useAcademy();

  // Form states
  const [role, setRole] = useState<UserRole>('coach');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');

  // Role-specific states
  const [selectedActivityId, setSelectedActivityId] = useState<string>(activities[0]?.id || 'act-karate');
  const [specialization, setSpecialization] = useState('');
  const [linkedPlayerCode, setLinkedPlayerCode] = useState('');

  // UI status
  const [errorMsg, setErrorMsg] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    roleLabel: string;
    email: string;
    phone: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setPassword('123456');
    setSpecialization('');
    setLinkedPlayerCode('');
    setErrorMsg('');
    setCreatedCredentials(null);
    setCopied(false);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setErrorMsg('يرجى إدخال الاسم الكامل لمصاحب الحساب.');
      return;
    }
    if (!cleanPhone) {
      setErrorMsg('يرجى إدخال رقم الهاتف.');
      return;
    }
    if (!cleanEmail) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني أو عنوان الجيميل (Gmail).');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg('يرجى تحديد كلمة المرور.');
      return;
    }

    // Check duplicate account
    const existing = userAccounts.find(
      (a) =>
        (a.email && a.email.toLowerCase() === cleanEmail) ||
        (a.phone && a.phone === cleanPhone)
    );

    if (existing) {
      setErrorMsg('يوجد حساب مسجل بنفس رقم الهاتف أو البريد الإلكتروني بالفعل.');
      return;
    }

    let roleLabel = 'مدير عام';

    if (role === 'admin') {
      createUserAccount({
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPassword,
        role: 'admin',
      });
      roleLabel = 'مدير عام النظام';
    } else if (role === 'coach') {
      const selectedAct = activities.find((a) => a.id === selectedActivityId);
      addCoach({
        fullName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        specialization: specialization.trim() || selectedAct?.name || 'مدرب أكاديمية',
        activityIds: [selectedActivityId],
        hireDate: new Date().toISOString().split('T')[0],
      });
      roleLabel = `مدرب (${selectedAct?.name || 'نشاط الأكاديمية'})`;
    } else if (role === 'parent') {
      addParent({
        fullName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        linkedPlayerCodes: linkedPlayerCode.trim() ? [linkedPlayerCode.trim().toUpperCase()] : [],
        createdAt: new Date().toISOString().split('T')[0],
      });
      roleLabel = 'ولي أمر';
    }

    setCreatedCredentials({
      name: cleanName,
      roleLabel,
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPassword,
    });
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `بيانات دخول أكاديمية الفرسان:\nالاسم: ${createdCredentials.name}\nالصلاحية: ${createdCredentials.roleLabel}\nرقم الهاتف / الجيميل: ${createdCredentials.phone}\nكلمة المرور: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="إنشاء حساب جديد في النظام"
    >
      <div className="space-y-5 text-right font-sans dir-rtl">
        {createdCredentials ? (
          /* SUCCESS CREDENTIALS VIEW */
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black">تم إنشاء الحساب بنجاح!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                تم إضافة الحساب الجديد بنجاح ويمكن للمستخدم تسجيل الدخول به فوراً
              </p>
            </div>

            {/* Credential Card Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                <span>الاسم الكامل</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">{createdCredentials.name}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">نوع الصلاحية</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{createdCredentials.roleLabel}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">رقم الهاتف / البريد</span>
                <span className="font-mono text-slate-900 dark:text-white dir-ltr">{createdCredentials.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">كلمة المرور المبدئية</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 dir-ltr">
                  {createdCredentials.password}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow hover:opacity-90 transition-opacity"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم نسخ البيانات!' : 'نسخ بيانات الدخول'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء حساب آخر</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                اختر نوع الحساب وصلاحية المستخدم
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    role === 'admin'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-300 font-black shadow-sm ring-2 ring-rose-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className={`w-5 h-5 ${role === 'admin' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span className="text-xs">مدير عام</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('coach')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    role === 'coach'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300 font-black shadow-sm ring-2 ring-amber-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Award className={`w-5 h-5 ${role === 'coach' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs">مدرب / محفظ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('parent')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    role === 'parent'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Users className={`w-5 h-5 ${role === 'parent' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs">ولي أمر</span>
                </button>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    placeholder="مثال: كابتن أحمد محمود"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    رقم الهاتف (للتسجيل والتواصل)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      placeholder="01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    البريد الإلكتروني / الجيميل (Gmail)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="email"
                      placeholder="user@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  كلمة المرور المبدئية
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  سيُطلب من المستخدم تغيير كلمة المرور المبدئية عند تسجيل الدخول الأول لزيادة الأمان.
                </p>
              </div>

              {/* Role Specific Additional Fields */}
              {role === 'coach' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-3">
                  <div className="font-bold text-amber-900 dark:text-amber-300 text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>بيانات تخصص المدرب</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      النشاط المسند للمدرب
                    </label>
                    <select
                      value={selectedActivityId}
                      onChange={(e) => setSelectedActivityId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    >
                      {activities.map((act) => (
                        <option key={act.id} value={act.id}>
                          {act.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      التخصص / الرتبة (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مدرب كاراتيه دان 4 / محفظ إجازة برواية حفص"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {role === 'parent' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-2">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>ربط كود الابن / اللاعب</span>
                  </div>
                  <input
                    type="text"
                    placeholder="كود اللاعب (مثال: PLY-1001) - اختياري"
                    value={linkedPlayerCode}
                    onChange={(e) => setLinkedPlayerCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase dir-ltr text-right"
                  />
                  <p className="text-[10px] text-slate-500">
                    يمكن لولي الأمر أيضاً ربط كود ابنه لاحقاً من داخل صفحته الشخصية في أي وقت.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>حفظ وإنشاء الحساب</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
