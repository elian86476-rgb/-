import React from 'react';
import {
  UserPlus,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Users,
  Award,
  UserCheck,
  ShieldCheck,
  Swords,
  CalendarDays,
  Settings,
  ClipboardCheck,
  FileText,
  DollarSign,
  Flame,
  Activity,
  Calendar,
  Plus,
  LayoutDashboard,
  User,
  Phone,
  Clock,
  ShieldAlert,
  Zap,
  CheckCircle,
  MessageCircle,
  Layers,
  Bookmark,
  Sparkles,
  Filter,
  SlidersHorizontal,
  Palette,
  HelpCircle,
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { id: 'UserPlus', name: 'إضافة لاعب (UserPlus)', Icon: UserPlus },
  { id: 'CreditCard', name: 'بطاقة ائتمان (CreditCard)', Icon: CreditCard },
  { id: 'CalendarCheck', name: 'تقويم الحضور (CalendarCheck)', Icon: CalendarCheck },
  { id: 'BarChart3', name: 'مخطط بياني (BarChart3)', Icon: BarChart3 },
  { id: 'Users', name: 'مجموعة مستخدمين (Users)', Icon: Users },
  { id: 'Award', name: 'وسام ومدرب (Award)', Icon: Award },
  { id: 'UserCheck', name: 'مستخدم معتمد (UserCheck)', Icon: UserCheck },
  { id: 'ShieldCheck', name: 'حماية وحسابات (ShieldCheck)', Icon: ShieldCheck },
  { id: 'Swords', name: 'رياضة وقتال (Swords)', Icon: Swords },
  { id: 'CalendarDays', name: 'جدول وأيام (CalendarDays)', Icon: CalendarDays },
  { id: 'Settings', name: 'إعدادات (Settings)', Icon: Settings },
  { id: 'ClipboardCheck', name: 'سجل وكشوف (ClipboardCheck)', Icon: ClipboardCheck },
  { id: 'FileText', name: 'ملف وتقارير (FileText)', Icon: FileText },
  { id: 'DollarSign', name: 'مالية ودفع (DollarSign)', Icon: DollarSign },
  { id: 'Flame', name: 'شعلة ونشاط (Flame)', Icon: Flame },
  { id: 'Activity', name: 'نبض ونشاط (Activity)', Icon: Activity },
  { id: 'Calendar', name: 'تقويم (Calendar)', Icon: Calendar },
  { id: 'Plus', name: 'إضافة (+) (Plus)', Icon: Plus },
  { id: 'LayoutDashboard', name: 'لوحة التحكم (LayoutDashboard)', Icon: LayoutDashboard },
  { id: 'User', name: 'مستخدم فردي (User)', Icon: User },
  { id: 'Phone', name: 'هاتف وتواصل (Phone)', Icon: Phone },
  { id: 'Clock', name: 'ساعة ووقت (Clock)', Icon: Clock },
  { id: 'Zap', name: 'طاقة وسرعة (Zap)', Icon: Zap },
  { id: 'MessageCircle', name: 'واتساب وتواصل (MessageCircle)', Icon: MessageCircle },
];

interface DynamicIconProps {
  name?: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const found = AVAILABLE_ICONS.find((i) => i.id === name);
  if (found) {
    const Component = found.Icon;
    return <Component className={className} />;
  }

  // Default fallback
  return <HelpCircle className={className} />;
};
