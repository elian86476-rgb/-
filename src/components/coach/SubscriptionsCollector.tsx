import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Subscription } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { CreditCard, Wallet, Search } from 'lucide-react';

export const SubscriptionsCollector: React.FC = () => {
  const {
    currentSession,
    subscriptions,
    players,
    activities,
    recordPayment,
    settings,
  } = useAcademy();

  const coachActivityId = currentSession.activityId;
  const currentActivity = activities.find((a) => a.id === coachActivityId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [amount, setAmount] = useState<number>(0);

  // Subscriptions strictly for coach's activity
  const mySubscriptions = subscriptions.filter((sub) => {
    if (coachActivityId && sub.activityId !== coachActivityId) return false;
    const player = players.find((p) => p.id === sub.playerId);
    return (
      !searchTerm ||
      (player && player.fullName.includes(searchTerm)) ||
      (player && player.playerCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleOpenPaymentModal = (sub: Subscription) => {
    setSelectedSub(sub);
    setAmount(sub.remainingAmount > 0 ? sub.remainingAmount : sub.monthlyFee);
  };

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || amount <= 0) return;

    recordPayment(
      selectedSub.id,
      amount,
      currentSession.name,
      'coach',
      'نقداً',
      'تحصيل مباشر بواسطة مدرب النشاط'
    );

    setSelectedSub(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          اشتراكات وتحصيل مبالغ طلابك ({currentActivity?.name})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          عرض وحالة الاشتراكات وتدوين المبالغ التي يتم تحصيلها منك من طلاب نشاطك مباشرة
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="البحث بالاسم أو كود اللاعب..."
          className="w-full pr-10 pl-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="py-3.5 px-4">اسم الطالب</th>
                <th className="py-3.5 px-4">كود اللاعب</th>
                <th className="py-3.5 px-4">قيمة الاشتراك</th>
                <th className="py-3.5 px-4">المحصّل</th>
                <th className="py-3.5 px-4">المتبقي</th>
                <th className="py-3.5 px-4">تاريخ الاستحقاق</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {mySubscriptions.map((sub) => {
                const player = players.find((p) => p.id === sub.playerId);

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {player?.fullName || 'طالب مجهول'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {player?.playerCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {sub.monthlyFee} {settings.currency}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">
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
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenPaymentModal(sub)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>تسجيل تحصيل</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title="تسجيل تحصيل مبلغ من الطالب"
          subtitle={`المحصل: ${currentSession.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleCollect} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                المبلغ المستلم نقداً ({settings.currency}) *
              </label>
              <input
                type="number"
                required
                max={selectedSub.remainingAmount || selectedSub.monthlyFee}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-lg"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl border border-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              >
                حفظ التحصيل
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
