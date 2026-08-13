import React from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Badge } from '../common/Badge';
import { CreditCard, Wallet, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export const ChildFinancials: React.FC = () => {
  const { currentSession, parents, players, subscriptions, activities, settings, selectedPlayerCode } = useAcademy();

  const activeChild = players.find((p) => p.playerCode === selectedPlayerCode) || players[0];

  if (!activeChild) {
    return <div className="p-8 text-center text-slate-500">يرجى ربط ابن أولاً لمتابعة الحسابات والاشتراكات.</div>;
  }

  const childSubs = subscriptions.filter((s) => s.playerId === activeChild.id);

  const totalPaid = childSubs.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalRemaining = childSubs.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          متابعة الاشتراكات والمدفوعات للابن ({activeChild.fullName})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          عرض الرسوم المتبقية، تواريخ الدفع السابقة، ومواعيد الاستحقاق القادمة
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-200 text-emerald-800 dark:text-emerald-300 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold block">إجمالي المبالغ المسددة</span>
            <span className="text-2xl font-black">{totalPaid} {settings.currency}</span>
          </div>
          <Wallet className="w-8 h-8 text-emerald-600 opacity-80" />
        </div>

        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-200 text-rose-800 dark:text-rose-300 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold block">إجمالي المبالغ المتبقية</span>
            <span className="text-2xl font-black">{totalRemaining} {settings.currency}</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-600 opacity-80" />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
          بيانات اشتراكات الأنشطة
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="py-3.5 px-4">النشاط الرياضي</th>
                <th className="py-3.5 px-4">الاشتراك الشهري</th>
                <th className="py-3.5 px-4">المبلغ المسدد</th>
                <th className="py-3.5 px-4">المبلغ المتبقي</th>
                <th className="py-3.5 px-4">تاريخ الاستحقاق القادم</th>
                <th className="py-3.5 px-4">حالة الاشتراك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {childSubs.map((sub) => {
                const act = activities.find((a) => a.id === sub.activityId);

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {act?.name}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {sub.monthlyFee} {settings.currency}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
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
                          ? 'جزئي'
                          : 'متأخر'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
