export type ActivityType = 'karate' | 'kungfu' | 'quran';

export type UserRole = 'admin' | 'coach' | 'parent';

export type PlayerStatus = 'active' | 'suspended' | 'withdrawn';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type SubscriptionStatus = 'paid' | 'partial' | 'overdue';

export interface UserAccount {
  id: string;
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: UserRole;
  associatedEntityId?: string; // coachId or parentId
  activityId?: string; // for coach
  isFirstLogin: boolean;
  createdAt?: string;
}

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatar?: string;
  coachId?: string;
  parentId?: string;
  activityId?: string; // For coaches limited to specific activity
  mustChangePassword?: boolean;
}

export interface ActivityGroup {
  id: string;
  name: string; // e.g., "مجموعة البراعم", "مجموعة الناشئين", "مستوى الحفظ الأسبوعي"
  levelName: string; // e.g., "حزام أبيض", "حزام أصفر", "جزء عم وتبارك"
  days: string[]; // e.g. ["الأحد", "الثلاثاء", "الخميس"]
  time: string; // e.g. "05:00 م - 06:30 م"
  hall: string; // e.g. "قاعة الكاراتيه الرئيسية"
}

export interface Activity {
  id: string;
  code: ActivityType;
  name: string; // e.g. "تدريب الكاراتيه"
  description: string;
  iconName: string;
  badgeColor: string;
  groups: ActivityGroup[];
  assignedCoachIds: string[];
  monthlyFee: number;
}

export interface Player {
  id: string;
  playerCode: string; // e.g. "PLY-1001" (Used by parent to link child)
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  phone: string;
  parentPhone: string;
  parentName: string;
  address: string;
  enrollmentDate: string;
  activityIds: string[]; // Can be enrolled in multiple activities (e.g. Karate + Quran)
  primaryCoachId: string;
  currentLevels: Record<string, string>; // activityId -> level (e.g. { 'act-karate': 'حزام أصفر', 'act-quran': 'حفظ 3 أجزاء' })
  status: PlayerStatus;
  avatar?: string;
  notesCount?: number;
}

export interface Parent {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  linkedPlayerCodes: string[]; // Player codes linked to this parent
  userAccountId?: string;
  createdAt?: string;
}

export interface Coach {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  specialization: string; // e.g. "مدرب كاراتيه دان 4", "محفظ إجازة برواية حفص"
  activityIds: string[]; // Activities this coach teaches
  hireDate: string;
  userAccountId: string;
  avatar?: string;
}

export interface Subscription {
  id: string;
  playerId: string;
  activityId: string;
  monthlyFee: number;
  paidAmount: number;
  remainingAmount: number;
  lastPaymentDate: string;
  nextDueDate: string;
  status: SubscriptionStatus;
  collectedByRole: 'admin' | 'coach';
  collectorName: string;
  paymentMethod: 'نقداً' | 'تحويل بنكي' | 'فودافون كاش' | 'شبكة بطاقات';
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  playerId: string;
  activityId: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  timeIn: string;
  timeOut: string;
  status: AttendanceStatus;
  recordedByCoachId: string;
  recordedByName: string;
  notes?: string;
}

export interface PerformanceNote {
  id: string;
  playerId: string;
  activityId: string;
  coachId: string;
  coachName: string;
  date: string; // YYYY-MM-DD
  text: string;
  category: 'progress' | 'behavior' | 'memorization' | 'technique' | 'general';
  rating?: number; // 1 to 5 stars
}

export interface ScheduleItem {
  id: string;
  activityId: string;
  activityName: string;
  groupId: string;
  groupName: string;
  dayOfWeek: string; // e.g. "الأحد", "الإثنين"
  startTime: string; // e.g. "16:00"
  endTime: string; // e.g. "17:30"
  coachId: string;
  coachName: string;
  location: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'subscription' | 'attendance' | 'note' | 'system';
  targetRole: UserRole | 'all';
  targetUserId?: string;
  isRead: boolean;
}

export interface UIItemConfig {
  id: string;
  label: string;
  icon: string;
  color: 'emerald' | 'teal' | 'amber' | 'blue' | 'indigo' | 'purple' | 'rose' | 'slate' | 'orange';
  visible: boolean;
  category: 'dashboard' | 'sidebar' | 'reports' | 'activities';
}

export type UIRegistryConfig = Record<string, UIItemConfig>;

export interface DashboardShortcutsConfig {
  showNewSubscriber: boolean;
  showSubscriptionCollection: boolean;
  showAttendance: boolean;
  showReports: boolean;
}

export interface CustomLabelsConfig {
  newSubscriber?: string;
  subscriptionsCollection?: string;
  attendance?: string;
  reports?: string;
  playersManagement?: string;
  coachesManagement?: string;
  parentsManagement?: string;
  userAccounts?: string;
  activitiesManagement?: string;
  scheduleManagement?: string;
  settingsManagement?: string;
}

export interface UIPreferencesConfig {
  buttonSize?: 'sm' | 'md' | 'lg';
  colorPalette?: 'emerald' | 'indigo' | 'blue' | 'purple' | 'amber' | 'rose';
  displayMode?: 'compact' | 'detailed';
}

export interface ReportSettingsConfig {
  fontSize?: 'small' | 'medium' | 'large';
  headerColor?: string;
  paperSize?: 'A4' | 'A5';
  customLogoUrl?: string;
  headerText?: string;
  footerText?: string;
  showLogo?: boolean;
  showFooter?: boolean;
}

export interface SettingsConfig {
  academyName: string;
  phone: string;
  address: string;
  currency: string;
  enableOverdueAlerts: boolean;
  overdueGraceDays: number;
  karateBelts: string[];
  kungfuBelts: string[];
  quranLevels: string[];
  dashboardShortcuts?: DashboardShortcutsConfig;
  customLabels?: CustomLabelsConfig;
  uiPreferences?: UIPreferencesConfig;
  uiRegistry?: UIRegistryConfig;
  reportSettings?: ReportSettingsConfig;
}
