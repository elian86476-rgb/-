import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { UserAccount, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Award,
  KeyRound,
  Mail,
  Phone,
  Search,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ShieldAlert,
  User,
  Clock,
  Check,
  Copy,
} from 'lucide-react';

interface UserAccountsManagementProps {
  onOpenCreateAccountModal: () => void;
}

export const UserAccountsManagement: React.FC<UserAccountsManagementProps> = ({
  onOpenCreateAccountModal,
}) => {
  const {
    userAccounts,
    currentAccount,
    updateUserAccount,
    deleteUserAccount,
    resetUserPassword,
    resetAllUserAccounts,
    activities,
  } = useAcademy();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('coach');
  const [editError, setEditError] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Password Reset Alert Toast/Modal state
  const [resetNotice, setResetNotice] = useState<{
    userName: string;
    newPass: string;
  } | null>(null);

  // Deletion Confirm state
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Stats
  const totalCount = userAccounts.length;
  const adminCount = userAccounts.filter((u) => u.role === 'admin').length;
  const coachCount = userAccounts.filter((u) => u.role === 'coach').length;
  const parentCount = userAccounts.filter((u) => u.role === 'parent').length;

  // Filtered List
  const filteredAccounts = userAccounts.filter((acc) => {
    const matchesRole =
      selectedRoleFilter === 'all' || acc.role === selectedRoleFilter;
    const matchesSearch =
      acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.phone.includes(searchTerm) ||
      (acc.email && acc.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  // Open Edit Modal
  const handleOpenEdit = (acc: UserAccount) => {
    setEditingUser(acc);
    setEditFullName(acc.fullName);
    setEditPhone(acc.phone || '');
    setEditEmail(acc.email || '');
    setEditPassword(acc.password || '');
    setEditRole(acc.role);
    setEditError('');
    setEditSuccessMsg('');
  };

  // Submit Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccessMsg('');

    if (!editingUser) return;
    if (!editFullName.trim()) {
      setEditError('يرجى إدخال اسم صاحب الحساب.');
      return;
    }
    if (!editPhone.trim()) {
      setEditError('يرجى إدخال رقم الهاتف.');
      return;
    }
    if (!editPassword.trim()) {
      setEditError('يرجى إدخال كلمة المرور.');
      return;
    }

    const result = updateUserAccount(editingUser.id, {
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim().toLowerCase(),
      password: editPassword.trim(),
      role: editRole,
    });

    if (result.success) {
      setEditSuccessMsg('تم حفظ التغييرات وتحديث الصلاحيات بنجاح!');
      setTimeout(() => {
        setEditingUser(null);
      }, 1200);
    } else {
      setEditError(result.message);
    }
  };

  // Quick Password Reset
  const handleResetPassword = (acc: UserAccount) => {
    if (
      window.confirm(
        `هل أنت تأكد من إعادة ضبط كلمة مرور الحساب (${acc.fullName}) إلى كلمة المرور المبدئية (123456)؟`
      )
    ) {
      const res = resetUserPassword(acc.id);
      if (res.success) {
        setResetNotice({
          userName: acc.fullName,
          newPass: res.newPassword,
        });
      }
    }
  };

  // Delete User
  const handleConfirmDelete = () => {
    if (!deletingUserId) return;
    const res = deleteUserAccount(deletingUserId);
    if (!res.success) {
      alert(res.message);
    }
    setDeletingUserId(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'مدير عام',
          color:
            'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />,
        };
      case 'coach':
        return {
          label: 'مدرب / محفظ',
          color:
            'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          icon: <Award className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'parent':
        return {
          label: 'ولي أمر',
          color:
            'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
          icon: <Users className="w-3.5 h-3.5 text-emerald-600" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xl">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <span>إدارة حسابات المستخدمين والنظام</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            عرض وتعديل بيانات وحسابات المدراء، المدربين، وأولياء الأمور وتغيير الصلاحيات وإعادة ضبط كلمات المرور
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              if (
                window.confirm(
                  'هل أنت تأكد من رغبتك في تصفية وتطهير كافة الحسابات المسجلة بالكامل؟\nسيبقى فقط الحساب الرئيسي الأساسي (Root Admin):\n- الهاتف: 01000000000 / البريد: admin@academy.com\n- كلمة المرور: admin123'
                )
              ) {
                const res = resetAllUserAccounts();
                alert(res.message);
              }
            }}
            className="px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="حذف جميع الحسابات والإبقاء على الحساب الرئيسي فقط"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>تصفير وتطهير الحسابات</span>
          </button>

          <button
            onClick={onOpenCreateAccountModal}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب جديد</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">إجمالي الحسابات</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {totalCount}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-950/40 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">المدراء الأكاديميين</div>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400">
              {adminCount}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-950/40 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">المدربين والمحفظين</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">
              {coachCount}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-950/40 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">أولياء الأمور</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {parentCount}
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Success Toast */}
      {resetNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              تم إعادة ضبط كلمة مرور المستخدم ({resetNotice.userName}) بنجاح! كلمة المرور المبدئية هي:{' '}
              <strong className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 text-amber-600 dir-ltr inline-block">
                {resetNotice.newPass}
              </strong>
            </span>
          </div>
          <button
            onClick={() => setResetNotice(null)}
            className="text-xs underline text-amber-700 hover:text-amber-900 font-bold self-end md:self-auto cursor-pointer"
          >
            إغلاق التنبيه
          </button>
        </div>
      )}

      {/* Controls Header: Search & Filter Roles */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="البحث بالاسم، هاتف المستخدم، أو الجيميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRoleFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            الكل ({userAccounts.length})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRoleFilter === 'admin'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            مدراء ({adminCount})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('coach')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRoleFilter === 'coach'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            مدربين ومحفظين ({coachCount})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('parent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRoleFilter === 'parent'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            أولياء أمور ({parentCount})
          </button>
        </div>
      </div>

      {/* Accounts List Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            لا توجد حسابات مستخدمين مطابقة للبحث
          </h3>
          <p className="text-xs text-slate-400">
            جرب تغيير كلمة البحث أو فلتر نوع الصلاحيات المختار
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => {
            const roleBadge = getRoleBadge(acc.role);
            const isSelf = currentAccount?.id === acc.id;

            return (
              <div
                key={acc.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Header: Role Badge & Current User Flag */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadge.color}`}
                    >
                      {roleBadge.icon}
                      <span>{roleBadge.label}</span>
                    </span>

                    {isSelf && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                        حسابك الحالي
                      </span>
                    )}
                  </div>

                  {/* Main Details */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug">
                        {acc.fullName}
                      </h3>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-900 dark:text-white dir-ltr">
                          {acc.phone || 'غير مسجل'}
                        </span>
                      </div>

                      {acc.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700 dark:text-slate-300 truncate dir-ltr">
                            {acc.email}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">كلمة المرور:</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 dir-ltr">
                          {acc.password}
                        </span>
                      </div>

                      {acc.isFirstLogin && (
                        <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>في انتظار تغيير كلمة المرور المبدئية عند أول دخول</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="تعديل بيانات وصلاحية الحساب"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                    <span>تعديل الصلاحية</span>
                  </button>

                  <button
                    onClick={() => handleResetPassword(acc)}
                    className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center transition-colors border border-amber-200/60 dark:border-amber-800/60 cursor-pointer"
                    title="إعادة ضبط كلمة المرور إلى 123456"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {!isSelf && (
                    <button
                      onClick={() => setDeletingUserId(acc.id)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center justify-center transition-colors border border-rose-200/60 dark:border-rose-900/60 cursor-pointer"
                      title="حذف حساب المستخدم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT USER ACCOUNT MODAL */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="تعديل بيانات وصلاحيات الحساب"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-right font-sans dir-rtl">
            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                تعديل الصلاحية والدور في النظام
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditRole('admin')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    editRole === 'admin'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-300 font-black ring-2 ring-rose-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ShieldCheck className={`w-5 h-5 ${editRole === 'admin' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span className="text-xs">مدير عام</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditRole('coach')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    editRole === 'coach'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300 font-black ring-2 ring-amber-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Award className={`w-5 h-5 ${editRole === 'coach' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs">مدرب / محفظ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditRole('parent')}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    editRole === 'parent'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Users className={`w-5 h-5 ${editRole === 'parent' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs">ولي أمر</span>
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    البريد الإلكتروني / الجيميل
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                  />
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUserId && (
        <Modal
          isOpen={!!deletingUserId}
          onClose={() => setDeletingUserId(null)}
          title="تأكيد حذف الحساب"
        >
          <div className="space-y-4 text-right font-sans dir-rtl">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm">هل أنت تأكد من إزالة هذا الحساب نهائياً؟</div>
                <p>
                  سيؤدي إزالة الحساب إلى إلغاء إمكانية تسجيل الدخول بهذا الهاتف/البريد بشكل دائم.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-colors cursor-pointer"
              >
                حذف الحساب نهائياً
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
