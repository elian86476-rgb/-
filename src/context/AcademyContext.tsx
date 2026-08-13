import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Activity,
  AttendanceRecord,
  Coach,
  Parent,
  PerformanceNote,
  Player,
  ScheduleItem,
  SettingsConfig,
  Subscription,
  UserRole,
  UserSession,
  UserAccount,
} from '../types';
import {
  demoSessions,
  initialActivities,
  initialAttendance,
  initialCoaches,
  initialNotes,
  initialParents,
  initialPlayers,
  initialSchedules,
  initialSettings,
  initialSubscriptions,
  initialUserAccounts,
} from '../data/initialData';

interface AcademyContextType {
  // Authentication State
  isAuthenticated: boolean;
  currentSession: UserSession;
  currentAccount: UserAccount | null;
  userAccounts: UserAccount[];
  mustChangePassword: boolean;
  setCurrentSession: (session: UserSession) => void;
  activeRole: UserRole;

  // Auth Methods
  login: (identifier: string, password: string) => { success: boolean; message: string; session?: UserSession; mustChangePassword?: boolean };
  logout: () => void;
  registerUser: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    childCode?: string;
  }) => { success: boolean; message: string; session?: UserSession };
  changePassword: (userId: string, newPassword: string) => { success: boolean; message: string };
  resetUserPassword: (userId: string) => { success: boolean; message: string; newPassword: string };
  createUserAccount: (data: Omit<UserAccount, 'id' | 'isFirstLogin'>) => UserAccount;
  updateUserAccount: (id: string, updatedData: Partial<UserAccount>) => { success: boolean; message: string };
  deleteUserAccount: (id: string) => { success: boolean; message: string };
  resetAllUserAccounts: () => { success: boolean; message: string };
  
  // Data entities
  settings: SettingsConfig;
  activities: Activity[];
  coaches: Coach[];
  parents: Parent[];
  players: Player[];
  subscriptions: Subscription[];
  attendance: AttendanceRecord[];
  notes: PerformanceNote[];
  schedules: ScheduleItem[];

  // Selected child for Parent view
  selectedPlayerCode: string | null;
  setSelectedPlayerCode: (code: string | null) => void;

  // Actions for Players
  addPlayer: (playerData: Omit<Player, 'id' | 'playerCode'>) => Player;
  updatePlayer: (id: string, playerData: Partial<Player>) => void;
  deletePlayer: (id: string) => void;

  // Actions for Parents & Code Link
  addParent: (parentData: Omit<Parent, 'id'>) => Parent;
  updateParent: (id: string, parentData: Partial<Parent>) => void;
  deleteParent: (id: string) => void;
  linkPlayerToParent: (parentId: string, playerCode: string) => { success: boolean; message: string };
  unlinkPlayerFromParent: (parentId: string, playerCode: string) => void;

  // Actions for Coaches
  addCoach: (coachData: Omit<Coach, 'id' | 'userAccountId'>) => Coach;
  updateCoach: (id: string, coachData: Partial<Coach>) => void;
  deleteCoach: (id: string) => void;

  // Actions for Activities & Settings
  addActivity: (activityData: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, activityData: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  updateSettings: (newSettings: Partial<SettingsConfig>) => void;

  // Actions for Subscriptions & Payments
  addSubscription: (subData: Omit<Subscription, 'id'>) => void;
  recordPayment: (
    subscriptionId: string,
    paidAmountDelta: number,
    collectorName: string,
    collectorRole: 'admin' | 'coach',
    paymentMethod: 'نقداً' | 'تحويل بنكي' | 'فودافون كاش' | 'شبكة بطاقات',
    notes?: string
  ) => void;

  // Actions for Attendance
  recordAttendance: (
    record: Omit<AttendanceRecord, 'id'>
  ) => void;
  bulkRecordAttendance: (
    records: Omit<AttendanceRecord, 'id'>[]
  ) => void;

  // Actions for Performance Notes
  addPerformanceNote: (noteData: Omit<PerformanceNote, 'id'>) => void;
  deletePerformanceNote: (noteId: string) => void;

  // Actions for Schedule
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  deleteScheduleItem: (id: string) => void;

  // System Utility
  resetToDefaultData: () => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'academy_settings_v2',
  ACTIVITIES: 'academy_activities_v2',
  COACHES: 'academy_coaches_v2',
  PARENTS: 'academy_parents_v2',
  PLAYERS: 'academy_players_v2',
  SUBSCRIPTIONS: 'academy_subscriptions_v2',
  ATTENDANCE: 'academy_attendance_v2',
  NOTES: 'academy_notes_v2',
  SCHEDULES: 'academy_schedules_v2',
  SESSION: 'academy_session_v2',
  USER_ACCOUNTS: 'academy_user_accounts_v2',
  AUTH_STATUS: 'academy_auth_status_v2',
};

// Key helper to identify Root / Master Admin Account and enforce Admin Role
const isMasterAdminAccount = (acc?: { id?: string; email?: string; phone?: string; role?: string } | null): boolean => {
  if (!acc) return false;
  const idMatch = acc.id === 'acc-root-admin' || acc.id === 'usr-admin' || acc.id === 'admin';
  const emailMatch = (acc.email || '').trim().toLowerCase() === 'admin@academy.com';
  const phoneMatch = (acc.phone || '').trim().replace(/[\s\-\(\)\+]/g, '') === '01000000000';
  return idMatch || emailMatch || phoneMatch;
};

export const AcademyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth & User Accounts State
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    let list: UserAccount[] = [];
    const saved = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNTS);
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    if (!Array.isArray(list) || list.length === 0) {
      list = [...initialUserAccounts];
    }
    // Enforce Root Admin presence & strict role 'admin'
    let hasMaster = false;
    list = list.map((a) => {
      if (isMasterAdminAccount(a)) {
        hasMaster = true;
        return { ...a, role: 'admin' as UserRole };
      }
      return a;
    });
    if (!hasMaster) {
      list.unshift(initialUserAccounts[0]);
    }
    return list;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_STATUS);
    return saved === 'true';
  });

  // Session State
  const [currentSession, setCurrentSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (saved) {
      try {
        const sess: UserSession = JSON.parse(saved);
        if (isMasterAdminAccount(sess)) {
          sess.role = 'admin';
        }
        return sess;
      } catch (e) { console.error(e); }
    }
    return demoSessions[0]; // Default Admin
  });

  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    const savedAccounts = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNTS);
    let accountsList: UserAccount[] = savedAccounts ? JSON.parse(savedAccounts) : initialUserAccounts;
    if (!Array.isArray(accountsList) || accountsList.length === 0) {
      accountsList = [...initialUserAccounts];
    }
    accountsList = accountsList.map(a => isMasterAdminAccount(a) ? { ...a, role: 'admin' as UserRole } : a);

    if (savedSession) {
      try {
        const sess: UserSession = JSON.parse(savedSession);
        const match = accountsList.find(a => a.email === sess.email || a.id === sess.id || (isMasterAdminAccount(a) && isMasterAdminAccount(sess)));
        if (match) {
          if (isMasterAdminAccount(match)) {
            match.role = 'admin';
          }
          return match;
        }
      } catch (e) { console.error(e); }
    }
    const rootAcc = accountsList.find(a => isMasterAdminAccount(a)) || initialUserAccounts[0];
    return rootAcc;
  });

  const [mustChangePassword, setMustChangePassword] = useState<boolean>(() => {
    return currentAccount ? (currentAccount.isFirstLogin || currentAccount.password === '123456') : false;
  });

  // Entities State
  const [settings, setSettings] = useState<SettingsConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.academyName && parsed.academyName.includes('الأبطال')) {
          parsed.academyName = 'أكاديمية الفرسان';
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialSettings;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [coaches, setCoaches] = useState<Coach[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COACHES);
    return saved ? JSON.parse(saved) : initialCoaches;
  });

  const [parents, setParents] = useState<Parent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARENTS);
    return saved ? JSON.parse(saved) : initialParents;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return saved ? JSON.parse(saved) : initialPlayers;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : initialSubscriptions;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [notes, setNotes] = useState<PerformanceNote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
    return saved ? JSON.parse(saved) : initialNotes;
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return saved ? JSON.parse(saved) : initialSchedules;
  });

  // Selected Player Code for Parents
  const [selectedPlayerCode, setSelectedPlayerCode] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(currentSession));
  }, [currentSession]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COACHES, JSON.stringify(coaches));
  }, [coaches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARENTS, JSON.stringify(parents));
  }, [parents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  }, [schedules]);

  // Set default selected player for parent session
  useEffect(() => {
    if (currentSession.role === 'parent' && currentSession.parentId) {
      const parentObj = parents.find((p) => p.id === currentSession.parentId);
      if (parentObj && parentObj.linkedPlayerCodes.length > 0) {
        if (!selectedPlayerCode || !parentObj.linkedPlayerCodes.includes(selectedPlayerCode)) {
          setSelectedPlayerCode(parentObj.linkedPlayerCodes[0]);
        }
      } else {
        setSelectedPlayerCode(null);
      }
    }
  }, [currentSession, parents, selectedPlayerCode]);

  // Helper to generate next unique Player Code
  const generateNextPlayerCode = (): string => {
    const existingCodes = players.map((p) => p.playerCode);
    let nextNum = 1001;
    while (existingCodes.includes(`PLY-${nextNum}`)) {
      nextNum++;
    }
    return `PLY-${nextNum}`;
  };

  // Actions implementation
  const addPlayer = (playerData: Omit<Player, 'id' | 'playerCode'>): Player => {
    const newCode = generateNextPlayerCode();
    const newId = `ply-${Date.now()}`;
    const newPlayer: Player = {
      ...playerData,
      id: newId,
      playerCode: newCode,
    };
    setPlayers((prev) => [newPlayer, ...prev]);

    // Also auto-create subscriptions for enrolled activities
    playerData.activityIds.forEach((actId) => {
      const act = activities.find((a) => a.id === actId);
      if (act) {
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const dueDate = nextMonth.toISOString().split('T')[0];

        const newSub: Subscription = {
          id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          playerId: newId,
          activityId: actId,
          monthlyFee: act.monthlyFee,
          paidAmount: 0,
          remainingAmount: act.monthlyFee,
          lastPaymentDate: today,
          nextDueDate: dueDate,
          status: 'overdue',
          collectedByRole: 'admin',
          collectorName: 'النظام الآلي',
          paymentMethod: 'نقداً',
          notes: 'اشتراك جديد مضاف عند التسجيل',
        };
        setSubscriptions((prevSubs) => [newSub, ...prevSubs]);
      }
    });

    return newPlayer;
  };

  const updatePlayer = (id: string, playerData: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...playerData } : p))
    );
  };

  const deletePlayer = (id: string) => {
    const playerToDelete = players.find((p) => p.id === id);
    if (!playerToDelete) return;

    // Remove player
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    // Remove player subscriptions
    setSubscriptions((prev) => prev.filter((s) => s.playerId !== id));
    // Remove attendance
    setAttendance((prev) => prev.filter((a) => a.playerId !== id));
    // Unlink from parents
    setParents((prev) =>
      prev.map((par) => ({
        ...par,
        linkedPlayerCodes: par.linkedPlayerCodes.filter((c) => c !== playerToDelete.playerCode),
      }))
    );
  };

  // Auth Methods Implementation
  const createUserAccount = (data: Omit<UserAccount, 'id' | 'isFirstLogin'>): UserAccount => {
    const newAccount: UserAccount = {
      ...data,
      id: `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      password: data.password || '123456',
      isFirstLogin: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUserAccounts((prev) => [newAccount, ...prev]);
    return newAccount;
  };

  const registerUser = (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    childCode?: string;
  }) => {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanPhone = (data.phone || '').trim();

    const existing = userAccounts.find(
      (a) =>
        (cleanEmail && a.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && a.phone === cleanPhone)
    );

    if (existing) {
      return {
        success: false,
        message: 'يوجد حساب مسجل بالفعل برقم الهاتف أو البريد الإلكتروني المكتوب.',
      };
    }

    let associatedEntityId: string | undefined = undefined;

    if (data.role === 'parent') {
      const parentId = `par-${Date.now()}`;
      const newParent: Parent = {
        id: parentId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        linkedPlayerCodes: data.childCode?.trim() ? [data.childCode.trim().toUpperCase()] : [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setParents((prev) => [newParent, ...prev]);
      associatedEntityId = parentId;
    }

    const newAccount: UserAccount = {
      id: `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fullName: data.fullName.trim(),
      email: cleanEmail || `${Date.now()}@academy.com`,
      phone: cleanPhone,
      password: data.password.trim(),
      role: data.role,
      associatedEntityId,
      isFirstLogin: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUserAccounts((prev) => [newAccount, ...prev]);

    const session: UserSession = {
      id: newAccount.id,
      name: newAccount.fullName,
      role: newAccount.role,
      email: newAccount.email,
      phone: newAccount.phone,
      parentId: associatedEntityId,
      mustChangePassword: false,
    };

    setCurrentAccount(newAccount);
    setCurrentSession(session);
    setIsAuthenticated(true);
    setMustChangePassword(false);

    return {
      success: true,
      message: `تم إنشاء حسابك بنجاح! مرحباً بك ${newAccount.fullName} في أكاديمية الفرسان.`,
      session,
    };
  };

  // Auto-sanitize Master Admin role on mount if state or localStorage was tampered with
  useEffect(() => {
    if (currentAccount && isMasterAdminAccount(currentAccount) && currentAccount.role !== 'admin') {
      setCurrentAccount((prev) => (prev ? { ...prev, role: 'admin' } : null));
    }
    if (currentSession && isMasterAdminAccount(currentSession) && currentSession.role !== 'admin') {
      setCurrentSession((prev) => ({ ...prev, role: 'admin' }));
    }
  }, [currentAccount, currentSession]);

  const login = (identifier: string, password: string) => {
    const rawId = identifier.trim().toLowerCase();
    const cleanDigits = rawId.replace(/[\s\-\(\)\+]/g, '');
    const cleanPass = password.trim();

    // Master Admin Fallback Override
    const isMasterAttempt =
      rawId === 'admin' ||
      rawId === 'admin@academy.com' ||
      rawId === '01000000000' ||
      cleanDigits === '01000000000';

    if (isMasterAttempt && (cleanPass === 'admin123' || cleanPass === '123456')) {
      const rootAdminAcc = userAccounts.find((a) => isMasterAdminAccount(a)) || initialUserAccounts[0];
      const rootAccSanitized: UserAccount = {
        ...rootAdminAcc,
        role: 'admin',
        password: cleanPass === 'admin123' ? 'admin123' : rootAdminAcc.password,
      };

      const rootSession: UserSession = {
        id: rootAccSanitized.id,
        name: rootAccSanitized.fullName,
        role: 'admin',
        email: rootAccSanitized.email,
        phone: rootAccSanitized.phone,
        mustChangePassword: false,
      };

      setCurrentAccount(rootAccSanitized);
      setCurrentSession(rootSession);
      setIsAuthenticated(true);
      setMustChangePassword(false);

      return {
        success: true,
        message: `مرحباً بك ${rootAccSanitized.fullName}! تم تسجيل الدخول بصلاحيات المدير العام (Root Admin).`,
        session: rootSession,
        mustChangePassword: false,
      };
    }

    let account = userAccounts.find((a) => {
      const accEmail = (a.email || '').trim().toLowerCase();
      const accPhone = (a.phone || '').trim();
      const accPhoneClean = accPhone.replace(/[\s\-\(\)\+]/g, '');

      // Check Email, Phone, or Username "admin" match
      const isUsernameMatch = rawId === 'admin' && (a.role === 'admin' || accEmail.includes('admin') || a.id.includes('admin'));
      const isEmailMatch = accEmail === rawId || (rawId.includes('@') && accEmail === rawId);
      const isPhoneMatch =
        accPhone === rawId ||
        (cleanDigits.length >= 7 && accPhoneClean.length >= 7 && (accPhoneClean.endsWith(cleanDigits) || cleanDigits.endsWith(accPhoneClean)));

      return (isUsernameMatch || isEmailMatch || isPhoneMatch) && a.password === cleanPass;
    });

    if (!account) {
      return {
        success: false,
        message: 'بيانات الدخول غير صحيحة. يرجى التأكد من كتابة رقم الهاتف أو حساب الجيميل/البريد الإلكتروني وكلمة المرور بشكل صحيح.',
      };
    }

    // Force role: 'admin' if master account
    if (isMasterAdminAccount(account)) {
      account = { ...account, role: 'admin' };
    }

    // Determine linked entity if coach or parent
    let coachId = account.associatedEntityId;
    let parentId = account.associatedEntityId;
    let activityId = account.activityId;

    if (account.role === 'coach' && !coachId) {
      const matchedCoach = coaches.find((c) => c.email.toLowerCase() === account.email.toLowerCase() || c.phone === account.phone);
      if (matchedCoach) coachId = matchedCoach.id;
    }

    if (account.role === 'parent' && !parentId) {
      const matchedParent = parents.find((p) => p.email.toLowerCase() === account.email.toLowerCase() || p.phone === account.phone);
      if (matchedParent) parentId = matchedParent.id;
    }

    const session: UserSession = {
      id: account.id,
      name: account.fullName,
      role: isMasterAdminAccount(account) ? 'admin' : account.role,
      email: account.email,
      phone: account.phone,
      coachId: account.role === 'coach' ? coachId : undefined,
      parentId: account.role === 'parent' ? parentId : undefined,
      activityId: account.role === 'coach' ? activityId : undefined,
      mustChangePassword: account.isFirstLogin || account.password === '123456',
    };

    const needsPasswordChange = account.isFirstLogin || account.password === '123456';

    setCurrentAccount(account);
    setCurrentSession(session);
    setIsAuthenticated(true);
    setMustChangePassword(needsPasswordChange);

    return {
      success: true,
      message: `مرحباً بك ${account.fullName}! تم تسجيل الدخول بنجاح.`,
      session,
      mustChangePassword: needsPasswordChange,
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setMustChangePassword(false);
    setCurrentAccount(null);
    localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'false');
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const changePassword = (userId: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'كلمة المرور يجب أن تكون 4 أحرف/أرقام على الأقل' };
    }

    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === userId || (currentAccount && acc.id === currentAccount.id)) {
          return {
            ...acc,
            password: newPassword,
            isFirstLogin: false,
          };
        }
        return acc;
      })
    );

    if (currentAccount && (currentAccount.id === userId || currentAccount.id === currentAccount.id)) {
      setCurrentAccount((prev) => (prev ? { ...prev, password: newPassword, isFirstLogin: false } : null));
    }

    setMustChangePassword(false);
    return { success: true, message: 'تم تغيير كلمة المرور بنجاح وحفظ الحساب' };
  };

  const resetUserPassword = (userId: string) => {
    const tempPass = '123456';
    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === userId) {
          return {
            ...acc,
            password: tempPass,
            isFirstLogin: true,
          };
        }
        return acc;
      })
    );
    return {
      success: true,
      message: 'تم إعادة ضبط كلمة المرور إلى كلمة المرور المبدئية (123456)',
      newPassword: tempPass,
    };
  };

  const updateUserAccount = (id: string, updatedData: Partial<UserAccount>) => {
    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const isMaster = isMasterAdminAccount(acc);
          const enforcedRole = isMaster ? 'admin' : (updatedData.role || acc.role);
          return { ...acc, ...updatedData, role: enforcedRole };
        }
        return acc;
      })
    );

    // If current logged-in account is updated, sync session
    if (currentAccount && currentAccount.id === id) {
      const isMaster = isMasterAdminAccount(currentAccount);
      const enforcedRole = isMaster ? 'admin' : (updatedData.role || currentAccount.role);
      setCurrentAccount((prev) => (prev ? { ...prev, ...updatedData, role: enforcedRole } : null));
      setCurrentSession((prev) => ({
        ...prev,
        name: updatedData.fullName || prev.name,
        role: enforcedRole,
        email: updatedData.email || prev.email,
      }));
    }

    return { success: true, message: 'تم تحديث بيانات الحساب والصلاحيات بنجاح.' };
  };

  const deleteUserAccount = (id: string) => {
    const targetAcc = userAccounts.find(a => a.id === id);
    if (targetAcc && isMasterAdminAccount(targetAcc)) {
      return { success: false, message: 'لا يمكن حذف حساب المدير العام الرئيسي (Root Admin).' };
    }

    if (currentAccount && currentAccount.id === id) {
      return { success: false, message: 'لا يمكنك حذف الحساب الذي تستخدمه حالياً لتسجيل الدخول.' };
    }

    setUserAccounts((prev) => prev.filter((acc) => acc.id !== id));
    return { success: true, message: 'تم حذف حساب المستخدم بنجاح.' };
  };

  const resetAllUserAccounts = () => {
    // Purge saved account and session state from localStorage
    localStorage.removeItem(STORAGE_KEYS.USER_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.AUTH_STATUS);

    // Reset state to fresh single Root Admin account
    setUserAccounts(initialUserAccounts);
    setCurrentAccount(initialUserAccounts[0]);
    setCurrentSession(demoSessions[0]);
    setIsAuthenticated(true);
    setMustChangePassword(false);

    return {
      success: true,
      message: 'تم تصفية وتطوير كافة حسابات المستخدمين وإعادة الحساب الرئيسي الوحيد (Root Admin) بنجاح!',
    };
  };

  const addParent = (parentData: Omit<Parent, 'id'>): Parent => {
    const newId = `par-${Date.now()}`;
    const newParent: Parent = {
      ...parentData,
      id: newId,
    };
    setParents((prev) => [newParent, ...prev]);

    // Automatically create user account credentials for parent
    createUserAccount({
      fullName: parentData.fullName,
      email: parentData.email || `parent.${Date.now()}@gmail.com`,
      phone: parentData.phone || '01000000000',
      password: '123456',
      role: 'parent',
      associatedEntityId: newId,
    });

    return newParent;
  };

  const updateParent = (id: string, parentData: Partial<Parent>) => {
    setParents((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...parentData } : p))
    );
    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.associatedEntityId === id) {
          return {
            ...acc,
            fullName: parentData.fullName !== undefined ? parentData.fullName : acc.fullName,
            phone: parentData.phone !== undefined ? parentData.phone : acc.phone,
            email: parentData.email !== undefined && parentData.email.trim() ? parentData.email : acc.email,
          };
        }
        return acc;
      })
    );
  };

  const deleteParent = (id: string) => {
    setParents((prev) => prev.filter((p) => p.id !== id));
  };

  const linkPlayerToParent = (parentId: string, playerCode: string) => {
    const cleanCode = playerCode.trim().toUpperCase();
    const playerExists = players.find((p) => p.playerCode === cleanCode);
    if (!playerExists) {
      return { success: false, message: `لم يتم العثور على لاعب برقم الكود (${cleanCode}). يرجى التأكد من الكود المكتوب.` };
    }

    const parentObj = parents.find((p) => p.id === parentId);
    if (!parentObj) {
      return { success: false, message: 'حساب ولي الأمر غير موجود.' };
    }

    if (parentObj.linkedPlayerCodes.includes(cleanCode)) {
      return { success: false, message: `كود اللاعب (${cleanCode}) مرتبط بالفعل بهذا الحساب.` };
    }

    setParents((prev) =>
      prev.map((p) => {
        if (p.id === parentId) {
          return {
            ...p,
            linkedPlayerCodes: [...p.linkedPlayerCodes, cleanCode],
          };
        }
        return p;
      })
    );

    setSelectedPlayerCode(cleanCode);
    return { success: true, message: `تم ربط الابن (${playerExists.fullName}) بنجاح بالحساب!` };
  };

  const unlinkPlayerFromParent = (parentId: string, playerCode: string) => {
    setParents((prev) =>
      prev.map((p) => {
        if (p.id === parentId) {
          return {
            ...p,
            linkedPlayerCodes: p.linkedPlayerCodes.filter((c) => c !== playerCode),
          };
        }
        return p;
      })
    );
  };

  const addCoach = (coachData: Omit<Coach, 'id' | 'userAccountId'>): Coach => {
    const newId = `coach-${Date.now()}`;
    const userAccId = `usr-coach-${Date.now()}`;
    const newCoach: Coach = {
      ...coachData,
      id: newId,
      userAccountId: userAccId,
    };
    setCoaches((prev) => [newCoach, ...prev]);

    // Automatically create user account credentials for coach
    createUserAccount({
      fullName: coachData.fullName,
      email: coachData.email || `coach.${Date.now()}@academy.com`,
      phone: coachData.phone || '01000000000',
      password: '123456',
      role: 'coach',
      associatedEntityId: newId,
      activityId: coachData.activityIds[0],
    });

    return newCoach;
  };

  const updateCoach = (id: string, coachData: Partial<Coach>) => {
    setCoaches((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...coachData } : c))
    );
    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.associatedEntityId === id) {
          return {
            ...acc,
            fullName: coachData.fullName !== undefined ? coachData.fullName : acc.fullName,
            phone: coachData.phone !== undefined ? coachData.phone : acc.phone,
            email: coachData.email !== undefined && coachData.email.trim() ? coachData.email : acc.email,
          };
        }
        return acc;
      })
    );
  };

  const deleteCoach = (id: string) => {
    setCoaches((prev) => prev.filter((c) => c.id !== id));
  };

  const addActivity = (activityData: Omit<Activity, 'id'>) => {
    const newId = `act-${Date.now()}`;
    setActivities((prev) => [...prev, { ...activityData, id: newId }]);
  };

  const updateActivity = (id: string, activityData: Partial<Activity>) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...activityData } : a))
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const updateSettings = (newSettings: Partial<SettingsConfig>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addSubscription = (subData: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...subData,
      id: `sub-${Date.now()}`,
    };
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  const recordPayment = (
    subscriptionId: string,
    paidAmountDelta: number,
    collectorName: string,
    collectorRole: 'admin' | 'coach',
    paymentMethod: 'نقداً' | 'تحويل بنكي' | 'فودافون كاش' | 'شبكة بطاقات',
    notes?: string
  ) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subscriptionId) {
          const newPaid = sub.paidAmount + paidAmountDelta;
          const newRemaining = Math.max(0, sub.monthlyFee - newPaid);
          const newStatus =
            newRemaining === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'overdue';
          const today = new Date().toISOString().split('T')[0];

          return {
            ...sub,
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            status: newStatus,
            lastPaymentDate: today,
            collectedByRole: collectorRole,
            collectorName,
            paymentMethod,
            notes: notes ? `${sub.notes ? sub.notes + ' | ' : ''}${notes}` : sub.notes,
          };
        }
        return sub;
      })
    );
  };

  const recordAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setAttendance((prev) => {
      // Check if record exists for same player, activity & date
      const existingIdx = prev.findIndex(
        (a) =>
          a.playerId === record.playerId &&
          a.activityId === record.activityId &&
          a.date === record.date
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...record, id: copy[existingIdx].id };
        return copy;
      } else {
        return [{ ...record, id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}` }, ...prev];
      }
    });
  };

  const bulkRecordAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    records.forEach((rec) => recordAttendance(rec));
  };

  const addPerformanceNote = (noteData: Omit<PerformanceNote, 'id'>) => {
    const newNote: PerformanceNote = {
      ...noteData,
      id: `nt-${Date.now()}`,
    };
    setNotes((prev) => [newNote, ...prev]);

    // increment player note count
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === noteData.playerId ? { ...p, notesCount: (p.notesCount || 0) + 1 } : p
      )
    );
  };

  const deletePerformanceNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newItem]);
  };

  const deleteScheduleItem = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const resetToDefaultData = () => {
    setUserAccounts(initialUserAccounts);
    setIsAuthenticated(false);
    setCurrentAccount(null);
    setMustChangePassword(false);
    setSettings(initialSettings);
    setActivities(initialActivities);
    setCoaches(initialCoaches);
    setParents(initialParents);
    setPlayers(initialPlayers);
    setSubscriptions(initialSubscriptions);
    setAttendance(initialAttendance);
    setNotes(initialNotes);
    setSchedules(initialSchedules);
    setCurrentSession(demoSessions[0]);
    localStorage.clear();
  };

  return (
    <AcademyContext.Provider
      value={{
        isAuthenticated,
        currentSession,
        currentAccount,
        userAccounts,
        mustChangePassword,
        setCurrentSession,
        activeRole: currentSession.role,
        login,
        logout,
        registerUser,
        changePassword,
        resetUserPassword,
        createUserAccount,
        updateUserAccount,
        deleteUserAccount,
        resetAllUserAccounts,
        settings,
        activities,
        coaches,
        parents,
        players,
        subscriptions,
        attendance,
        notes,
        schedules,
        selectedPlayerCode,
        setSelectedPlayerCode,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addParent,
        updateParent,
        deleteParent,
        linkPlayerToParent,
        unlinkPlayerFromParent,
        addCoach,
        updateCoach,
        deleteCoach,
        addActivity,
        updateActivity,
        deleteActivity,
        updateSettings,
        addSubscription,
        recordPayment,
        recordAttendance,
        bulkRecordAttendance,
        addPerformanceNote,
        deletePerformanceNote,
        addScheduleItem,
        deleteScheduleItem,
        resetToDefaultData,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};
