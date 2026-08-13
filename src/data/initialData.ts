import {
  Activity,
  Coach,
  Parent,
  Player,
  Subscription,
  AttendanceRecord,
  PerformanceNote,
  ScheduleItem,
  SettingsConfig,
  ReportSettingsConfig,
  UserSession,
  UserAccount,
  UIRegistryConfig,
} from '../types';

export const defaultUiRegistry: UIRegistryConfig = {
  // Dashboard
  dashboard_newSubscriber: { id: 'dashboard_newSubscriber', label: 'تسجيل مشترك جديد', icon: 'UserPlus', color: 'emerald', visible: true, category: 'dashboard' },
  dashboard_subscriptionsCollection: { id: 'dashboard_subscriptionsCollection', label: 'متابعة تحصيل الاشتراكات', icon: 'CreditCard', color: 'teal', visible: true, category: 'dashboard' },
  dashboard_attendance: { id: 'dashboard_attendance', label: 'تسجيل الحضور والغياب', icon: 'CalendarCheck', color: 'amber', visible: true, category: 'dashboard' },
  dashboard_reports: { id: 'dashboard_reports', label: 'التقارير والإحصائيات', icon: 'BarChart3', color: 'blue', visible: true, category: 'dashboard' },

  // Sidebar
  nav_dashboard: { id: 'nav_dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard', color: 'emerald', visible: true, category: 'sidebar' },
  nav_registerWizard: { id: 'nav_registerWizard', label: 'تسجيل مشترك جديد', icon: 'UserPlus', color: 'emerald', visible: true, category: 'sidebar' },
  nav_players: { id: 'nav_players', label: 'إدارة اللاعبين والأبطال', icon: 'Users', color: 'indigo', visible: true, category: 'sidebar' },
  nav_coaches: { id: 'nav_coaches', label: 'المدربين والمحفظين', icon: 'Award', color: 'purple', visible: true, category: 'sidebar' },
  nav_parents: { id: 'nav_parents', label: 'أولياء الأمور وربط الأكواد', icon: 'UserCheck', color: 'blue', visible: true, category: 'sidebar' },
  nav_accounts: { id: 'nav_accounts', label: 'حسابات المستخدمين', icon: 'ShieldCheck', color: 'amber', visible: true, category: 'sidebar' },
  nav_activities: { id: 'nav_activities', label: 'الأنشطة والمجموعات', icon: 'Swords', color: 'rose', visible: true, category: 'sidebar' },
  nav_subscriptions: { id: 'nav_subscriptions', label: 'الاشتراكات والمدفوعات', icon: 'CreditCard', color: 'teal', visible: true, category: 'sidebar' },
  nav_attendance: { id: 'nav_attendance', label: 'تقارير الحضور والغياب', icon: 'ClipboardCheck', color: 'amber', visible: true, category: 'sidebar' },
  nav_schedule: { id: 'nav_schedule', label: 'الجدول الأسبوعي', icon: 'CalendarDays', color: 'indigo', visible: true, category: 'sidebar' },
  nav_settings: { id: 'nav_settings', label: 'إعدادات الأكاديمية', icon: 'Settings', color: 'slate', visible: true, category: 'sidebar' },

  // Reports
  report_attendanceTitle: { id: 'report_attendanceTitle', label: 'سجلات الحضور والغياب', icon: 'ClipboardCheck', color: 'amber', visible: true, category: 'reports' },
  report_paymentsTitle: { id: 'report_paymentsTitle', label: 'كشف الحسابات والإيصالات', icon: 'DollarSign', color: 'emerald', visible: true, category: 'reports' },
  report_playersTitle: { id: 'report_playersTitle', label: 'قائمة بطاقات اللاعبين', icon: 'Users', color: 'indigo', visible: true, category: 'reports' },

  // Activities & Schedule
  schedule_dayFilter: { id: 'schedule_dayFilter', label: 'تحديد اليوم الأسبوعي', icon: 'Calendar', color: 'emerald', visible: true, category: 'activities' },
  schedule_activityFilter: { id: 'schedule_activityFilter', label: 'فلتر النشاط الرياضي', icon: 'Activity', color: 'indigo', visible: true, category: 'activities' },
  schedule_addSessionBtn: { id: 'schedule_addSessionBtn', label: 'إضافة موعد حصة جديد', icon: 'Plus', color: 'emerald', visible: true, category: 'activities' },
};

export const defaultReportSettings: ReportSettingsConfig = {
  fontSize: 'medium',
  headerColor: '#0f172a',
  paperSize: 'A4',
  customLogoUrl: '',
  headerText: 'أكاديمية الفرسان للألعاب الرياضية وتحفيظ القرآن - قوة • أخلاق • انضباط',
  footerText: 'تم التصدير آلياً بواسطة نظام إدارة أكاديمية الفرسان الرقمي • معتمد من الإدارة',
  showLogo: true,
  showFooter: true,
};

export const initialSettings: SettingsConfig = {
  academyName: 'أكاديمية الفرسان',
  phone: '01012345678',
  address: 'القاهرة - التجمع الخامس - الحي الثاني - شارع 15',
  currency: 'ج.م',
  enableOverdueAlerts: true,
  overdueGraceDays: 5,
  dashboardShortcuts: {
    showNewSubscriber: true,
    showSubscriptionCollection: true,
    showAttendance: true,
    showReports: true,
  },
  customLabels: {
    newSubscriber: 'تسجيل مشترك جديد',
    subscriptionsCollection: 'متابعة تحصيل الاشتراكات',
    attendance: 'تسجيل الحضور والغياب',
    reports: 'التقارير والإحصائيات',
    playersManagement: 'إدارة اللاعبين والأبطال',
    coachesManagement: 'المدربين والمحفظين',
    parentsManagement: 'أولياء الأمور وربط الأكواد',
    userAccounts: 'حسابات المستخدمين',
    activitiesManagement: 'الأنشطة والمجموعات',
    scheduleManagement: 'الجدول الأسبوعي',
    settingsManagement: 'إعدادات الأكاديمية',
  },
  uiPreferences: {
    buttonSize: 'md',
    colorPalette: 'emerald',
    displayMode: 'detailed',
  },
  uiRegistry: defaultUiRegistry,
  reportSettings: defaultReportSettings,
  karateBelts: [
    'حزام أبيض',
    'حزام أصفر',
    'حزام برتقالي',
    'حزام أخضر',
    'حزام أزرق',
    'حزام بني',
    'حزام أسود (1 دان)',
    'حزام أسود (2 دان)',
  ],
  kungfuBelts: [
    'المستوى الأول (أساسي)',
    'المستوى الثاني (أساليب فل كونتاكت)',
    'المستوى الثالث (ساندا - قتال ملتحم)',
    'المستوى الرابع (سلاح ننشاكو)',
    'المستوى الخامس (المتقدم)',
  ],
  quranLevels: [
    'جزء عم (المستوى الأول)',
    'جزء تبارك (المستوى الثاني)',
    'حفظ 5 أجزاء',
    'حفظ 10 أجزاء',
    'حفظ 15 جزءاً',
    'حفظ 20 جزءاً',
    'حفظ القرآن كاملاً',
  ],
};

export const initialActivities: Activity[] = [
  {
    id: 'act-karate',
    code: 'karate',
    name: 'تدريب الكاراتيه',
    description: 'تدريب فنون الدفاع عن النفس للكاراتيه (كاتا وكميته) وبناء لياقة بدنية وانضباط عالي.',
    iconName: 'Swords',
    badgeColor: 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    monthlyFee: 350,
    assignedCoachIds: [],
    groups: [
      {
        id: 'grp-kar-1',
        name: 'مجموعة البراعم (مبتدئين)',
        levelName: 'حزام أبيض / أصفر',
        days: ['الأحد', 'الثلاثاء'],
        time: '04:00 م - 05:30 م',
        hall: 'قاعة الكاراتيه (1)',
      },
      {
        id: 'grp-kar-2',
        name: 'مجموعة الأبطال (متقدمين)',
        levelName: 'حزام أخضر / أزرق / بني',
        days: ['الأحد', 'الثلاثاء', 'الخميس'],
        time: '05:30 م - 07:00 م',
        hall: 'قاعة الكاراتيه (1)',
      },
    ],
  },
  {
    id: 'act-kungfu',
    code: 'kungfu',
    name: 'تدريب الكونغ فو',
    description: 'فن الكونغ فو والساندا والقتال المتلاحم والسيطرة والحركات والدفاع عن النفس.',
    iconName: 'Flame',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    monthlyFee: 400,
    assignedCoachIds: [],
    groups: [
      {
        id: 'grp-kun-1',
        name: 'مجموعة الأساسيات والساندا',
        levelName: 'المستوى الأول والثاني',
        days: ['الإثنين', 'الأربعاء'],
        time: '05:00 م - 06:30 م',
        hall: 'صالة اللياقة والقتال (2)',
      },
      {
        id: 'grp-kun-2',
        name: 'مجموعة الننشاكو والدفاع الاحترافي',
        levelName: 'المستوى الثالث والرابع',
        days: ['الإثنين', 'الأربعاء', 'الجمعة'],
        time: '06:30 م - 08:00 م',
        hall: 'صالة اللياقة والقتال (2)',
      },
    ],
  },
  {
    id: 'act-quran',
    code: 'quran',
    name: 'تحفيظ القرآن الكريم',
    description: 'حفظ وتلاوة القرآن الكريم بالتجويد والأحكام والمراجعة المستمرة وأخلاق القرآن.',
    iconName: 'BookOpenCheck',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    monthlyFee: 250,
    assignedCoachIds: [],
    groups: [
      {
        id: 'grp-qur-1',
        name: 'حلقة البراعم (جزء عم وتبارك)',
        levelName: 'المستوى الأول',
        days: ['السبت', 'الثلاثاء'],
        time: '03:00 م - 04:30 م',
        hall: 'قاعة تحفيظ القرآن (أ)',
      },
      {
        id: 'grp-qur-2',
        name: 'حلقة المراجعة والحفظ المتقدم (5-15 جزءاً)',
        levelName: 'المستوى الثاني والمتقدم',
        days: ['الأحد', 'الاربعاء'],
        time: '04:00 م - 06:00 م',
        hall: 'قاعة تحفيظ القرآن (ب)',
      },
    ],
  },
];

export const initialCoaches: Coach[] = [];

export const initialPlayers: Player[] = [];

export const initialParents: Parent[] = [];

export const initialSubscriptions: Subscription[] = [];

export const initialAttendance: AttendanceRecord[] = [];

export const initialNotes: PerformanceNote[] = [];

export const initialSchedules: ScheduleItem[] = [
  {
    id: 'sch-1',
    activityId: 'act-karate',
    activityName: 'كاراتيه',
    groupId: 'grp-karate-1',
    groupName: 'المبتدئين (حزام أبيض)',
    dayOfWeek: 'الأحد',
    startTime: '16:00',
    endTime: '17:30',
    coachId: 'coach-1',
    coachName: 'كابتن أحمد علي',
    location: 'قاعة الكاراتيه الرئيسية (1)',
  },
  {
    id: 'sch-2',
    activityId: 'act-kungfu',
    activityName: 'كونغ فو',
    groupId: 'grp-kungfu-1',
    groupName: 'المستوى الأساسي',
    dayOfWeek: 'الأحد',
    startTime: '17:30',
    endTime: '19:00',
    coachId: 'coach-2',
    coachName: 'كابتن محمود حسن',
    location: 'صالة القتال المغطاة (2)',
  },
  {
    id: 'sch-3',
    activityId: 'act-quran',
    activityName: 'تحفيظ القرآن الكريم',
    groupId: 'grp-quran-1',
    groupName: 'حلقة جزء عم',
    dayOfWeek: 'الأحد',
    startTime: '19:00',
    endTime: '20:30',
    coachId: 'coach-3',
    coachName: 'الشيخ محمد سعيد',
    location: 'قاعة التحفيظ والقرآن',
  },
  {
    id: 'sch-4',
    activityId: 'act-karate',
    activityName: 'كاراتيه',
    groupId: 'grp-karate-2',
    groupName: 'المتقدمين (حزام حزام بني وأسود)',
    dayOfWeek: 'الثلاثاء',
    startTime: '16:00',
    endTime: '17:30',
    coachId: 'coach-1',
    coachName: 'كابتن أحمد علي',
    location: 'قاعة الكاراتيه الرئيسية (1)',
  },
  {
    id: 'sch-5',
    activityId: 'act-kungfu',
    activityName: 'كونغ فو',
    groupId: 'grp-kungfu-2',
    groupName: 'المستوى المتوسط',
    dayOfWeek: 'الثلاثاء',
    startTime: '17:30',
    endTime: '19:00',
    coachId: 'coach-2',
    coachName: 'كابتن محمود حسن',
    location: 'صالة القتال المغطاة (2)',
  },
  {
    id: 'sch-6',
    activityId: 'act-quran',
    activityName: 'تحفيظ القرآن الكريم',
    groupId: 'grp-quran-2',
    groupName: 'حلقة أجزاء تبارك وعم',
    dayOfWeek: 'الخميس',
    startTime: '18:00',
    endTime: '19:30',
    coachId: 'coach-3',
    coachName: 'الشيخ محمد سعيد',
    location: 'قاعة التحفيظ والقرآن',
  },
];

export const initialUserAccounts: UserAccount[] = [
  {
    id: 'acc-root-admin',
    email: 'admin@academy.com',
    phone: '01000000000',
    password: 'admin123',
    fullName: 'المدير العام (Root Admin)',
    role: 'admin',
    isFirstLogin: false,
    createdAt: '2026-01-01',
  },
];

export const demoSessions: UserSession[] = [
  {
    id: 'usr-admin',
    name: 'المدير العام (Root Admin)',
    role: 'admin',
    email: 'admin@academy.com',
    phone: '01000000000',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
  },
];
