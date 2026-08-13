import React from 'react';
import { useAcademy } from '../../context/AcademyContext';
import {
  Swords,
  BookOpenCheck,
  Award,
  ShieldCheck,
  Users,
  LogIn,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  Calendar,
  Flame,
  HeartHandshake,
  Smartphone,
  ChevronLeft,
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin }) => {
  const { settings, activities } = useAcademy();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl text-right overflow-x-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-600/25 ring-2 ring-slate-700/60">
              ف
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight block">
                {settings.academyName || 'أكاديمية الفرسان'}
              </span>
              <span className="text-[11px] text-emerald-400 font-bold block -mt-1">
                رياضة • أخلاق • قرآن
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-300">
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-emerald-400 transition-colors"
            >
              عن الأكاديمية
            </button>
            <button
              onClick={() => scrollToSection('activities')}
              className="hover:text-emerald-400 transition-colors"
            >
              الأنشطة والبرامج
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-emerald-400 transition-colors"
            >
              المميزات
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:text-emerald-400 transition-colors"
            >
              تواصل معنا
            </button>
          </nav>

          {/* Login CTA Button */}
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>الصرح الرياضي والتربوي الأبرز للناشئين والشباب</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              أكاديمية <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">الفرسان</span>
              <br />
              لبناء أجيال متوازنة بدنياً وإيمانياً
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
              نجمع بين تدريب الفنون القتالية الراقية (الكاراتيه والكونغ فو) وبين تحفيظ وترتيل القرآن الكريم بأحكام التجويد، مع نظام إلكتروني متكامل لمتابعة أولياء الأمور لحظة بلحظة.
            </p>

            {/* Program Badges */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2">
                <Swords className="w-4 h-4 text-rose-400" />
                <span>الكاراتيه (القتال والكاتا)</span>
              </span>
              <span className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>الكونغ فو والوشو</span>
              </span>
              <span className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-teal-400" />
                <span>تحفيظ القرآن الكريم</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenLogin}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white font-black text-base shadow-xl shadow-emerald-600/30 flex items-center gap-3 transition-all hover:scale-105"
              >
                <LogIn className="w-5 h-5" />
                <span>تسجيل الدخول لبوابة المشتركين</span>
              </button>

              <button
                onClick={() => scrollToSection('activities')}
                className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <span>استكشاف الأنشطة</span>
                <ChevronLeft className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Hero Visual Card / Stats Overview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">مؤشرات النجاح والتميز</div>
                    <div className="text-xs text-slate-400">إحصائيات الأكاديمية الميدانية</div>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  2026
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-right">
                  <div className="text-2xl font-black text-amber-400 mb-1">+500</div>
                  <div className="text-xs font-bold text-slate-300">مشترك وبطل</div>
                  <div className="text-[10px] text-slate-400 mt-1">يتدربون أسبوعياً بالأكاديمية</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-right">
                  <div className="text-2xl font-black text-emerald-400 mb-1">3</div>
                  <div className="text-xs font-bold text-slate-300">أنشطة رئيسية</div>
                  <div className="text-[10px] text-slate-400 mt-1">كاراتيه • كونغ فو • قرآن</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-right">
                  <div className="text-2xl font-black text-teal-400 mb-1">100%</div>
                  <div className="text-xs font-bold text-slate-300">متابعة لأولياء الأمور</div>
                  <div className="text-[10px] text-slate-400 mt-1">تقارير حضور واشتراكات</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-right">
                  <div className="text-2xl font-black text-rose-400 mb-1">كادر معتمد</div>
                  <div className="text-xs font-bold text-slate-300">مدربين ومحفظين</div>
                  <div className="text-[10px] text-slate-400 mt-1">خبرات رياضية وتربوية عالية</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-white block">بوابة إلكترونية مؤمنة</span>
                    لكل طالب وولي أمر ومدرب حساب خاص ومحمي
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities & Programs Section */}
      <section id="activities" className="py-16 sm:py-24 bg-slate-900/60 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              الأنشطة والبرامج المتاحة
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
              أنشطتنا في أكاديمية الفرسان
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              برامج تدريبية متدرجة تناسب جميع الأعمار والمستويات تحت إشراف نخبة من المدربين والمحفظين
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Karate Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Swords className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">رياضة الكاراتيه</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  تدريب متكامل على فنون القتال الياباني (الكاتا والكوميته) مع تعزيز السرعة، المرونة، والانضباط الذاتي.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>اختبارات الأحزمة الدولية والدورية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>مشاركة في البطولات الرسمية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تجهيز بدني وعقلي عالي المستويات</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenLogin}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>دخول المشتركين</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Kung Fu Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/50 transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Flame className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">رياضة الكونغ فو (الوشو)</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  فن القتال الصيني الشامل، يجمع بين القوة القتالية والأساليب الاستعراضية واللياقة البدنية الاستثنائية.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>قتال الساندا والأساليب الوشو</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>تمارين مرونة وتركيز ورشاقة عالية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>تدريب احترافي للبنين والبنات</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenLogin}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>دخول المشتركين</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Quran Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-teal-500/50 transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpenCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">تحفيظ القرآن الكريم</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  حلقات قرآنية تربوية منتظمة تهدف لحفظ كتاب الله مع تعلم أحكام التجويد وغرس القيم الإسلامية.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>متابعة فردية لجدول الحفظ والمراجعة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>تعليم أحكام التجويد والنطق الصحيح</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>سجل أداء وتسميع يصل لولي الأمر</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenLogin}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-teal-600 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>دخول المشتركين</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Al-Forsan Academy? Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            مميزات المنظومة
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
            لماذا تختار أكاديمية الفرسان؟
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            نوفر بيئة متكاملة تجمع بين التدريب الميداني الجاد والربط المباشر مع أولياء الأمور عبر التطبيق
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">تطبيق خاص لولي الأمر</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              متابعة مباشرة لسجل حضور الطالب، مواعيد الحلقات، درجات التسميع، وحالة الاشتراكات الشهرية.
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">مدربين ومحفظين كبار</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              طاقم متألق وحاصل على حزام أسود واعتمادات رسمية، مع محفظين بسند متصل لإتقان قراءة القرآن.
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">تربية وأخلاق حميدة</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              نركز على بناء الشخصية، احترام الكبير، والالتزام بالسلوك الإسلامي القويم داخل وخارج التمرين.
            </p>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">مواعيد وجداول مرنة</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              مجموعات متعددة خلال الأسبوع تراعي أوقات المدرسة والالتزامات الدراسية للأبناء.
            </p>
          </div>
        </div>

        {/* Note about Account Registration */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 text-right flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">كيفية التسجيل والحصول على حساب؟</h4>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                حسابات المشتركين الجدد والمدربين وأولياء الأمور يتم إنشاؤها وتفعيلها حصرياً بواسطة إدارة الأكاديمية بعد إتمام التسجيل بالمقر. للتسجيل أو الاستفسار تفضل بزيارة مقر الأكاديمية أو التواصل معنا.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogin}
            className="shrink-0 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول للنظام</span>
          </button>
        </div>
      </section>

      {/* Footer & Contact Section */}
      <footer id="contact" className="bg-slate-900 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white font-black text-lg">
                ف
              </div>
              <span className="text-lg font-black text-white">
                {settings.academyName || 'أكاديمية الفرسان'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              أكاديمية رياضية وتربوية متخصصة في الكاراتيه، الكونغ فو، وتحفيظ القرآن الكريم.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">العنوان والمقر</h5>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{settings.address || 'القاهرة - التجمع الخامس - الحي الثاني - شارع 15'}</span>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">التواصل المباشر</h5>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span dir="ltr">{settings.phone || '01012345678'}</span>
            </div>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">بوابة النظام</h5>
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول الإدارة والمدربين وأولياء الأمور</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          جميع الحقوق محفوظة © {new Date().getFullYear()} {settings.academyName || 'أكاديمية الفرسان'} • نظام الإدارة الإلكتروني
        </div>
      </footer>
    </div>
  );
};
