import React, { useState } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { Users, Plus, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const LinkChildTab: React.FC = () => {
  const { currentSession, parents, players, linkPlayerToParent } = useAcademy();

  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const currentParent = parents.find((p) => p.id === currentSession.parentId);
  const linkedCodes = currentParent ? currentParent.linkedPlayerCodes : [];
  const linkedChildren = players.filter((p) => linkedCodes.includes(p.playerCode));

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    if (!currentParent) {
      setMessage({ text: 'حساب ولي الأمر غير موجود', type: 'error' });
      return;
    }

    const success = linkPlayerToParent(currentParent.id, inputCode.trim());

    if (success) {
      setMessage({
        text: `✓ تم ربط اللاعب صاحب الكود (${inputCode.toUpperCase()}) بحسابك بنجاح!`,
        type: 'success',
      });
      setInputCode('');
    } else {
      setMessage({
        text: '❌ كود اللاعب غير صحيح أو غير موجود في سجلات الأكاديمية.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          ربط حساب ولي الأمر بكود الابن
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          أدخل "كود اللاعب" الخاص بابنك (المسجل لدى إدارة الأكاديمية) لربطه بحسابك ومتابعة حضوره واشتراكاته مباشرة
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Code Input Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleLink} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              كود اللاعب الخاص بالابن *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="مثال: PLY-1001 أو PLY-1002"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-sm font-black text-emerald-600 uppercase"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
              >
                ربط الابن
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * ملحوظة: يمكنك الحصول على كود اللاعب من إدارة الأكاديمية أو إيصال الاشتراك.
            </p>
          </div>
        </form>
      </div>

      {/* Linked Children List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          الأبناء المربوطين بحسابك حالياً ({linkedChildren.length}):
        </h3>

        <div className="space-y-2">
          {linkedChildren.map((child) => (
            <div
              key={child.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 dark:text-white">{child.fullName}</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                {child.playerCode}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
