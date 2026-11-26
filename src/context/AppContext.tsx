import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Business, 
  Project, 
  Task, 
  Room, 
  Message, 
  ShootEvent, 
  EditVersion, 
  ProjectAsset, 
  ActivityLog, 
  NotificationItem, 
  ClientProfile,
  LeaveRecord,
  TaskStatus,
  ProjectStatus,
  VersionStatus,
  UserRole,
  AgencyInvitation,
  MessageAttachment
} from '../types';
import { 
  mockBusinesses, 
  mockUsers, 
  mockProjects, 
  mockTasks, 
  mockRooms, 
  mockMessages, 
  mockShootEvents, 
  mockEditVersions, 
  mockAssets, 
  mockActivityLogs, 
  mockNotifications, 
  mockClients,
  mockLeaveRecords
} from '../data/mockData';
import confetti from 'canvas-confetti';
import { 
  onFirebaseAuthStateChanged, 
  firebaseSignIn, 
  firebaseSignUp, 
  firebaseSignOut,
  firebaseResetPassword
} from '../services/firebaseAuth';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  saveFirestoreDoc, 
  deleteFirestoreDoc, 
  subscribeFirestoreCollection, 
  COLLECTIONS 
} from '../services/firebaseDb';

export type AppView = 
  | 'overview' 
  | 'projects' 
  | 'project_detail' 
  | 'tasks' 
  | 'rooms' 
  | 'calendar' 
  | 'team' 
  | 'clients' 
  | 'client_portal' 
  | 'hr' 
  | 'reports' 
  | 'settings'
  | 'profile';

export type ProjectTabType = 'overview' | 'tasks' | 'rooms' | 'schedule' | 'assets' | 'approvals' | 'activity';

const VALID_VIEWS: AppView[] = [
  'overview', 'projects', 'project_detail', 'tasks', 'rooms',
  'calendar', 'team', 'clients', 'client_portal', 'hr', 'reports', 'settings', 'profile'
];
const VALID_TABS: ProjectTabType[] = ['overview', 'tasks', 'rooms', 'schedule', 'assets', 'approvals', 'activity'];

const parseAppRoute = (): {
  view?: AppView;
  projectId?: string | null;
  projectTab?: ProjectTabType;
  roomId?: string | null;
} => {
  try {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash && hash.startsWith('#/')) {
      const parts = hash.slice(2).split('/').filter(Boolean).map(decodeURIComponent);
      const [first, second, third, fourth] = parts;
      if (first === 'projects' && second) {
        const tab = VALID_TABS.includes(third as ProjectTabType) ? (third as ProjectTabType) : 'overview';
        const roomId = tab === 'rooms' && fourth ? fourth : null;
        return { view: 'project_detail', projectId: second, projectTab: tab, roomId };
      }
      if (first === 'rooms') {
        return { view: 'rooms', projectId: null, projectTab: 'overview', roomId: second || null };
      }
      if (VALID_VIEWS.includes(first as AppView)) {
        return { view: first as AppView, projectId: null, projectTab: 'overview', roomId: null };
      }
    }
    const saved = localStorage.getItem('flowdeck_last_route');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
};

const buildRouteHash = (
  view: AppView,
  projectId: string | null,
  tab: ProjectTabType,
  roomId: string | null
): string => {
  if (view === 'project_detail' && projectId) {
    if (tab === 'rooms' && roomId) {
      return `#/projects/${encodeURIComponent(projectId)}/rooms/${encodeURIComponent(roomId)}`;
    }
    return `#/projects/${encodeURIComponent(projectId)}/${encodeURIComponent(tab)}`;
  }
  if (view === 'rooms' && roomId) {
    return `#/rooms/${encodeURIComponent(roomId)}`;
  }
  return `#/${view}`;
};

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'danger';
}

export interface PendingAgencyInvite {
  bizId: string;
  agencyName: string;
  agencyLogo?: string;
  role: string;
  token: string;
  email?: string;
}

interface AppContextType {
  // Business & Persona
  activeBusiness: Business;
  setActiveBusiness: (b: Business) => void;
  businesses: Business[];
  currentUser: User;
  setCurrentUser: (u: User) => void;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    designation: string;
    department: string;
    agencyName?: string;
    agencyTagline?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;

  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  activeProjectTab: ProjectTabType;
  setActiveProjectTab: (tab: ProjectTabType) => void;
  openProject: (projectId: string, tab?: ProjectTabType) => void;

  // Domain state
  projects: Project[];
  tasks: Task[];
  rooms: Room[];
  messages: Record<string, Message[]>;
  shootEvents: ShootEvent[];
  editVersions: EditVersion[];
  assets: ProjectAsset[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  clients: ClientProfile[];
  leaveRecords: LeaveRecord[];

  // Modals & UI controls
  isCreateProjectOpen: boolean;
  setIsCreateProjectOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  pendingInvite: PendingAgencyInvite | null;
  setPendingInvite: (invite: PendingAgencyInvite | null) => void;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  isPhoneModalOpen: boolean;
  setIsPhoneModalOpen: (open: boolean) => void;
  acceptAgencyInvite: (invite?: PendingAgencyInvite) => void;
  rejectAgencyInvite: (invite?: PendingAgencyInvite) => void;
  updateUserPhone: (newPhone: string) => void;
  sendAgencyInviteNotification: (recipientUser: User, role: string, agency: Business, token: string) => void;
  firebaseUser: FirebaseUser | null;
  activeCallSheetShootId: string | null;
  setActiveCallSheetShootId: (id: string | null) => void;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'danger') => void;
  removeToast: (id: string) => void;

  // Actions
  createProject: (newProj: Omit<Project, 'id' | 'createdAt' | 'businessId' | 'code' | 'progressPercent'>) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addSubtask: (taskId: string, text: string, imageUrl?: string) => void;
  deleteSubtask: (taskId: string, itemId: string) => void;
  sendMessage: (roomId: string, text: string, attachments?: MessageAttachment[]) => void;
  markRoomRead: (roomId: string) => void;
  convertMessageToTask: (roomId: string, messageId: string, taskTitle: string, assigneeId: string, dueAt: string) => void;
  respondToShoot: (shootId: string, status: 'accepted' | 'declined' | 'suggested_alternative', alternativeTime?: string) => void;
  confirmShoot: (shootId: string) => void;
  addTimestampComment: (versionId: string, timestampSeconds: number, text: string) => void;
  approveVersionInternally: (versionId: string) => void;
  approveVersionClient: (versionId: string, signatureName: string) => void;
  requestVersionChanges: (versionId: string, notes: string) => void;
  registerProjectAsset: (projectId: string, category: ProjectAsset['category'], name: string, url: string, size: string) => void;
  markNotificationAsRead: (id: string) => void;
  applyForLeave: (leave: Omit<LeaveRecord, 'id' | 'status'>) => void;
  rescheduleShoot: (shootId: string, newStartAt: string, newEndAt: string, reason: string) => void;
  createShootEvent: (shoot: Omit<ShootEvent, 'id' | 'createdAt'>) => void;
  createClient: (client: Omit<ClientProfile, 'id' | 'businessId' | 'portalToken' | 'totalProjects'>) => void;
  updateClient: (clientId: string, updates: Partial<ClientProfile>) => void;
  updateUserAvatar: (newAvatarUrl: string) => void;
  createTeamMember: (memberData: Omit<User, 'id'>) => User;
  invitations: AgencyInvitation[];
  createAgencyInvitation: (data: Omit<AgencyInvitation, 'id' | 'createdAt' | 'status'>) => AgencyInvitation;
  revokeAgencyInvitation: (id: string) => void;
  removeEmployee: (userId: string) => void;
  resetPassword: (email: string) => Promise<void>;
  updateBusiness: (updates: Partial<Business>) => void;
  updateUserProfile: (updates: Partial<Pick<User, 'name' | 'designation' | 'department' | 'bio'>>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  deleteClient: (clientId: string) => void;
  updateShootEvent: (shootId: string, updates: Partial<ShootEvent>) => void;
  deleteShootEvent: (shootId: string) => void;
  respondToLeave: (leaveId: string, status: 'approved' | 'rejected') => void;
  markAllNotificationsAsRead: () => void;
  createRoom: (room: Omit<Room, 'id' | 'unreadCount'>) => Room;
  openOrCreateTaskRoom: (task: Task) => Room;
  activeRoomId: string | null;
  setActiveRoomId: (id: string | null) => void;
  unreadProjectIds: string[];
  unreadTaskIds: string[];
  markProjectSeen: (projectId: string) => void;
  markTaskSeen: (taskId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_BUSINESS: Business = {
  id: 'biz_main',
  name: 'My Creative Agency',
  tagline: 'High-Performance Production & Studio Operations',
  logo: '🎬',
  category: 'Creative Production Agency',
  ownerId: 'user_owner',
  timezone: 'Asia/Kolkata (IST)',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  storageProvider: 'firebase',
  createdAt: new Date().toISOString()
};

const DEFAULT_USER: User = {
  id: 'guest',
  name: 'Guest User',
  email: '',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: '',
  role: 'owner',
  accountType: 'business_owner',
  designation: 'Agency Member',
  department: 'Executive',
  availability: 'available'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_businesses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeBusiness, setActiveBusiness] = useState<Business>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_active_biz');
      return saved ? JSON.parse(saved) : (businesses[0] || DEFAULT_BUSINESS);
    } catch {
      return DEFAULT_BUSINESS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_users');
      if (saved) {
        const parsed = JSON.parse(saved) as User[];
        return parsed.filter(u => u.id !== 'user_owner' && u.email !== 'admin@flowdeck.app' && u.id !== 'guest');
      }
      return [];
    } catch {
      return [];
    }
  });
  
  // Real Session & Auth Persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_session');
      return saved ? JSON.parse(saved).isAuthenticated : false;
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) return parsed.user;
      }
    } catch {}
    return users[0] || DEFAULT_USER;
  });

  const initialRoute = parseAppRoute();

  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (initialRoute.view) return initialRoute.view;
    try {
      const saved = localStorage.getItem('flowdeck_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user?.role === 'client') return 'client_portal';
      }
    } catch {}
    return 'overview';
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => initialRoute.projectId ?? null);
  const [activeProjectTab, setActiveProjectTab] = useState<ProjectTabType>(() => initialRoute.projectTab ?? 'overview');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => initialRoute.roomId ?? null);

  // Sync active route to URL hash and localStorage so refresh & links preserve exact state
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem(
        'flowdeck_last_route',
        JSON.stringify({
          view: currentView,
          projectId: selectedProjectId,
          projectTab: activeProjectTab,
          roomId: activeRoomId
        })
      );
      const nextHash = buildRouteHash(currentView, selectedProjectId, activeProjectTab, activeRoomId);
      if (typeof window !== 'undefined' && window.location.hash !== nextHash) {
        window.history.pushState(null, '', nextHash);
      }
    } catch {}
  }, [isAuthenticated, currentView, selectedProjectId, activeProjectTab, activeRoomId]);

  // Clear activeRoomId when navigating outside of rooms
  useEffect(() => {
    if (currentView !== 'rooms' && !(currentView === 'project_detail' && activeProjectTab === 'rooms')) {
      if (activeRoomId !== null) setActiveRoomId(null);
    }
  }, [currentView, activeProjectTab]);

  // Listen to browser Back/Forward hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseAppRoute();
      if (parsed.view) setCurrentView(parsed.view);
      if (parsed.projectId !== undefined) setSelectedProjectId(parsed.projectId);
      if (parsed.projectTab !== undefined) setActiveProjectTab(parsed.projectTab);
      if (parsed.roomId !== undefined) setActiveRoomId(parsed.roomId);
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const [unreadProjectIds, setUnreadProjectIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_unread_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unreadTaskIds, setUnreadTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_unread_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_unread_projects', JSON.stringify(unreadProjectIds));
    } catch {}
  }, [unreadProjectIds]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_unread_tasks', JSON.stringify(unreadTaskIds));
    } catch {}
  }, [unreadTaskIds]);

  const markProjectSeen = (projectId: string) => {
    setUnreadProjectIds((prev) => prev.filter((id) => id !== projectId));
  };

  const markTaskSeen = (taskId: string) => {
    setUnreadTaskIds((prev) => prev.filter((id) => id !== taskId));
  };

  const markChangeUnread = (projectId?: string, taskId?: string) => {
    if (projectId) {
      setUnreadProjectIds((prev) => (prev.includes(projectId) ? prev : [...prev, projectId]));
    }
    if (taskId) {
      setUnreadTaskIds((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
    }
  };

  const pushChangeNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'] = 'mention'
  ) => {
    const newNotif: NotificationItem = {
      id: 'notif_chg_' + Math.random().toString(36).substr(2, 9),
      recipientId: 'all',
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveFirestoreDoc(COLLECTIONS.NOTIFICATIONS, newNotif);
  };

  // Domain states with localStorage persistence fallback
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_projects');
      return saved ? JSON.parse(saved) : mockProjects;
    } catch {
      return mockProjects;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_tasks');
      return saved ? JSON.parse(saved) : mockTasks;
    } catch {
      return mockTasks;
    }
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_rooms');
      return saved ? JSON.parse(saved) : mockRooms;
    } catch {
      return mockRooms;
    }
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_messages');
      return saved ? JSON.parse(saved) : mockMessages;
    } catch {
      return mockMessages;
    }
  });

  const [shootEvents, setShootEvents] = useState<ShootEvent[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_shoots');
      return saved ? JSON.parse(saved) : mockShootEvents;
    } catch {
      return mockShootEvents;
    }
  });

  const [editVersions, setEditVersions] = useState<EditVersion[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_versions');
      return saved ? JSON.parse(saved) : mockEditVersions;
    } catch {
      return mockEditVersions;
    }
  });

  const [assets, setAssets] = useState<ProjectAsset[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_assets');
      return saved ? JSON.parse(saved) : mockAssets;
    } catch {
      return mockAssets;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_logs');
      return saved ? JSON.parse(saved) : mockActivityLogs;
    } catch {
      return mockActivityLogs;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_notifications');
      return saved ? JSON.parse(saved) : mockNotifications;
    } catch {
      return mockNotifications;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const [invitations, setInvitations] = useState<AgencyInvitation[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_invitations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_invitations', JSON.stringify(invitations));
    } catch {}
  }, [invitations]);

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_clients');
      return saved ? JSON.parse(saved) : mockClients;
    } catch {
      return mockClients;
    }
  });

  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_leaves');
      return saved ? JSON.parse(saved) : mockLeaveRecords;
    } catch {
      return mockLeaveRecords;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_leaves', JSON.stringify(leaveRecords));
    } catch {}
  }, [leaveRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_businesses', JSON.stringify(businesses));
    } catch {}
  }, [businesses]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_active_biz', JSON.stringify(activeBusiness));
    } catch {}
  }, [activeBusiness]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_users', JSON.stringify(users));
    } catch {}
  }, [users]);

  // Auto-sync domain states to local cache
  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_projects', JSON.stringify(projects));
    } catch {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_clients', JSON.stringify(clients));
    } catch {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_shoots', JSON.stringify(shootEvents));
    } catch {}
  }, [shootEvents]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_rooms', JSON.stringify(rooms));
    } catch {}
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_versions', JSON.stringify(editVersions));
    } catch {}
  }, [editVersions]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_assets', JSON.stringify(assets));
    } catch {}
  }, [assets]);

  useEffect(() => {
    try {
      localStorage.setItem('flowdeck_db_logs', JSON.stringify(activityLogs));
    } catch {}
  }, [activityLogs]);

  // Real-time Firestore Sync Listeners
  useEffect(() => {
    const unsubUsers = subscribeFirestoreCollection<User>(COLLECTIONS.USERS, (remoteUsers) => {
      if (remoteUsers && remoteUsers.length > 0) {
        // Purge legacy demo crew account if it still exists in Firestore
        const demoAccounts = remoteUsers.filter(u => u.id === 'user_owner' || u.email === 'admin@flowdeck.app');
        demoAccounts.forEach((d) => deleteFirestoreDoc(COLLECTIONS.USERS, d.id));

        const cleanRemote = remoteUsers.filter(u => u.id !== 'user_owner' && u.email !== 'admin@flowdeck.app' && u.id !== 'guest');
        setUsers((prev) => {
          const map = new Map<string, User>();
          prev.filter(u => u.id !== 'user_owner' && u.email !== 'admin@flowdeck.app' && u.id !== 'guest').forEach((u) => map.set(u.id, u));
          cleanRemote.forEach((u) => map.set(u.id, u));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('flowdeck_db_users', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    const unsubBusinesses = subscribeFirestoreCollection<Business>(COLLECTIONS.BUSINESSES, (remoteBizs) => {
      if (remoteBizs && remoteBizs.length > 0) {
        setBusinesses(remoteBizs);
        try {
          localStorage.setItem('flowdeck_db_businesses', JSON.stringify(remoteBizs));
        } catch {}
      } else {
        businesses.forEach((b) => saveFirestoreDoc(COLLECTIONS.BUSINESSES, b));
      }
    });

    const unsubProjects = subscribeFirestoreCollection<Project>(COLLECTIONS.PROJECTS, (remoteProjects) => {
      if (remoteProjects && remoteProjects.length > 0) {
        setProjects(remoteProjects);
        try {
          localStorage.setItem('flowdeck_db_projects', JSON.stringify(remoteProjects));
        } catch {}
      } else {
        projects.forEach((p) => saveFirestoreDoc(COLLECTIONS.PROJECTS, p));
      }
    });

    const unsubClients = subscribeFirestoreCollection<ClientProfile>(COLLECTIONS.CLIENTS, (remoteClients) => {
      if (remoteClients && remoteClients.length > 0) {
        setClients(remoteClients);
        try {
          localStorage.setItem('flowdeck_db_clients', JSON.stringify(remoteClients));
        } catch {}
      } else {
        clients.forEach((c) => saveFirestoreDoc(COLLECTIONS.CLIENTS, c));
      }
    });

    const unsubTasks = subscribeFirestoreCollection<Task>(COLLECTIONS.TASKS, (remoteTasks) => {
      if (remoteTasks && remoteTasks.length > 0) {
        setTasks(remoteTasks);
        try {
          localStorage.setItem('flowdeck_db_tasks', JSON.stringify(remoteTasks));
        } catch {}
      } else {
        tasks.forEach((t) => saveFirestoreDoc(COLLECTIONS.TASKS, t));
      }
    });

    const unsubShoots = subscribeFirestoreCollection<ShootEvent>(COLLECTIONS.SHOOTS, (remoteShoots) => {
      if (remoteShoots && remoteShoots.length > 0) {
        setShootEvents(remoteShoots);
        try {
          localStorage.setItem('flowdeck_db_shoots', JSON.stringify(remoteShoots));
        } catch {}
      } else {
        shootEvents.forEach((s) => saveFirestoreDoc(COLLECTIONS.SHOOTS, s));
      }
    });

    const unsubRooms = subscribeFirestoreCollection<Room>(COLLECTIONS.ROOMS, (remoteRooms) => {
      if (remoteRooms && remoteRooms.length > 0) {
        setRooms(remoteRooms);
        try {
          localStorage.setItem('flowdeck_db_rooms', JSON.stringify(remoteRooms));
        } catch {}
      } else {
        rooms.forEach((r) => saveFirestoreDoc(COLLECTIONS.ROOMS, r));
      }
    });

    const unsubVersions = subscribeFirestoreCollection<EditVersion>(COLLECTIONS.VERSIONS, (remoteVersions) => {
      if (remoteVersions && remoteVersions.length > 0) {
        setEditVersions(remoteVersions);
        try {
          localStorage.setItem('flowdeck_db_versions', JSON.stringify(remoteVersions));
        } catch {}
      } else {
        editVersions.forEach((v) => saveFirestoreDoc(COLLECTIONS.VERSIONS, v));
      }
    });

    const unsubNotifications = subscribeFirestoreCollection<NotificationItem>(COLLECTIONS.NOTIFICATIONS, (remoteNotifs) => {
      if (remoteNotifs && remoteNotifs.length > 0) {
        setNotifications(remoteNotifs);
        try {
          localStorage.setItem('flowdeck_db_notifications', JSON.stringify(remoteNotifs));
        } catch {}
      }
    });

    const unsubInvitations = subscribeFirestoreCollection<AgencyInvitation>(COLLECTIONS.INVITATIONS, (remoteInvites) => {
      if (remoteInvites) {
        setInvitations(remoteInvites);
        try {
          localStorage.setItem('flowdeck_db_invitations', JSON.stringify(remoteInvites));
        } catch {}
      }
    });

    const unsubMessages = subscribeFirestoreCollection<Message>(COLLECTIONS.MESSAGES, (remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setMessages((prev) => {
          const next: Record<string, Message[]> = { ...prev };
          const remoteRoomIds = new Set(remoteMsgs.map((m) => m.roomId));
          remoteRoomIds.forEach((rId) => {
            const existing = prev[rId] || [];
            const incoming = remoteMsgs.filter((m) => m.roomId === rId);
            const map = new Map<string, Message>();
            existing.forEach((m) => map.set(m.id, m));
            incoming.forEach((m) => map.set(m.id, m));
            next[rId] = Array.from(map.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          });
          try {
            localStorage.setItem('flowdeck_db_messages', JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    });

    const unsubAssets = subscribeFirestoreCollection<ProjectAsset>(COLLECTIONS.ASSETS, (remoteAssets) => {
      if (remoteAssets && remoteAssets.length > 0) {
        setAssets(remoteAssets);
        try {
          localStorage.setItem('flowdeck_db_assets', JSON.stringify(remoteAssets));
        } catch {}
      }
    });

    const unsubLogs = subscribeFirestoreCollection<ActivityLog>(COLLECTIONS.LOGS, (remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setActivityLogs(remoteLogs);
        try {
          localStorage.setItem('flowdeck_db_logs', JSON.stringify(remoteLogs));
        } catch {}
      }
    });

    const unsubLeaves = subscribeFirestoreCollection<LeaveRecord>(COLLECTIONS.LEAVES, (remoteLeaves) => {
      if (remoteLeaves && remoteLeaves.length > 0) {
        setLeaveRecords(remoteLeaves);
        try {
          localStorage.setItem('flowdeck_db_leaves', JSON.stringify(remoteLeaves));
        } catch {}
      }
    });

    return () => {
      unsubUsers();
      unsubBusinesses();
      unsubProjects();
      unsubClients();
      unsubTasks();
      unsubShoots();
      unsubRooms();
      unsubVersions();
      unsubNotifications();
      unsubInvitations();
      unsubMessages();
      unsubAssets();
      unsubLogs();
      unsubLeaves();
    };
  }, []);

  // Modals & Popups
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [activeCallSheetShootId, setActiveCallSheetShootId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Pending Agency Invite
  const [pendingInvite, setPendingInvite] = useState<PendingAgencyInvite | null>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_pending_invite');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  // Check URL invitation params & sync with pendingInvite state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const joinBiz = params.get('join_biz') || params.get('biz');
      const agencyName = params.get('agency_name') || params.get('agency');
      const role = params.get('role');
      const token = params.get('token');
      const email = params.get('email');
      const logo = params.get('agency_logo');

      let currentInvite = pendingInvite;

      if (joinBiz && agencyName) {
        currentInvite = {
          bizId: joinBiz,
          agencyName: decodeURIComponent(agencyName),
          agencyLogo: logo ? decodeURIComponent(logo) : '🎬',
          role: role ? decodeURIComponent(role) : 'Creative Specialist',
          token: token || '',
          email: email ? decodeURIComponent(email) : undefined
        };
        localStorage.setItem('flowdeck_pending_invite', JSON.stringify(currentInvite));
        setPendingInvite(currentInvite);
      } else if (!currentInvite) {
        const saved = localStorage.getItem('flowdeck_pending_invite');
        if (saved) {
          currentInvite = JSON.parse(saved);
          setPendingInvite(currentInvite);
        }
      }

      // Check user-targeted pending invite if authenticated
      if (isAuthenticated && currentUser && !currentInvite) {
        const userInviteKey = `flowdeck_user_invite_${currentUser.id}`;
        const emailInviteKey = `flowdeck_user_invite_${currentUser.email.toLowerCase()}`;
        const savedUserInvite = localStorage.getItem(userInviteKey) || localStorage.getItem(emailInviteKey);
        if (savedUserInvite) {
          try {
            currentInvite = JSON.parse(savedUserInvite);
            setPendingInvite(currentInvite);
          } catch {}
        }
      }

      // If user is logged in and there is an invitation pending
      if (currentInvite && isAuthenticated && currentUser) {
        setIsInviteModalOpen(true);

        // Send Toast notification
        addToast(
          'Agency Invitation',
          `Join "${currentInvite.agencyName}" as "${currentInvite.role}"? Confirm or Reject below.`,
          'info'
        );

        // Add to Notifications bell
        const notifId = 'notif_invite_' + (currentInvite.token || currentInvite.bizId);
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notifId)) return prev;
          return [
            {
              id: notifId,
              recipientId: currentUser.id,
              title: `Invitation: ${currentInvite!.agencyName}`,
              message: `Join "${currentInvite!.agencyName}" as "${currentInvite!.role}". Confirm or Reject invitation.`,
              type: 'mention',
              createdAt: new Date().toISOString(),
              read: false
            },
            ...prev
          ];
        });
      }
    } catch (e) {
      console.warn('Error parsing agency invite URL:', e);
    }
  }, [isAuthenticated, currentUser?.id]);

  // Listen to live Firebase Auth state
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Auth Operations
  const login = async (email: string, pass: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    let firebaseAuthenticated = false;
    try {
      await firebaseSignIn(email.trim(), pass);
      firebaseAuthenticated = true;
    } catch (fbErr: any) {
      const code = fbErr?.code || '';
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-email' ||
        code === 'auth/too-many-requests' ||
        code === 'auth/user-disabled'
      ) {
        throw new Error(
          code === 'auth/too-many-requests'
            ? 'Too many failed login attempts. Please wait a few minutes or reset your password.'
            : 'Invalid email or password. Please check your credentials and try again.'
        );
      }
      if (code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please sign up first.');
      }
      console.warn('Firebase login warning:', fbErr?.message);
    }

    const matched = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (!matched && !firebaseAuthenticated) {
      throw new Error('No account found with this email. Please sign up first.');
    }

    const userToLogin: User = matched || {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: normalizedEmail,
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'videographer',
      accountType: 'employee',
      designation: 'Team Member',
      availability: 'available'
    };

    if (!matched) {
      setUsers(prev => [userToLogin, ...prev]);
      saveFirestoreDoc(COLLECTIONS.USERS, userToLogin);
    }

    setCurrentUser(userToLogin);
    setIsAuthenticated(true);
    localStorage.setItem('flowdeck_session', JSON.stringify({ isAuthenticated: true, user: userToLogin }));

    if (userToLogin.role === 'client') {
      setCurrentView('client_portal');
    } else {
      setCurrentView('overview');
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    designation: string;
    department: string;
    agencyName?: string;
    agencyTagline?: string;
  }) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (existingUser) {
      throw new Error(`The email "${data.email}" is already associated with an account (${existingUser.name}). One email can only be associated with one account. Please sign in instead.`);
    }

    try {
      await firebaseSignUp(data.email.trim(), data.password, data.name.trim());
    } catch (fbErr: any) {
      const code = fbErr?.code || '';
      if (code === 'auth/email-already-in-use') {
        throw new Error(`The email "${data.email}" is already registered. Please sign in instead.`);
      }
      if (code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      }
      if (code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      console.warn('Firebase signup attempt:', fbErr?.message);
    }

    const defaultAvatars: Record<UserRole, string> = {
      owner: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      head_manager: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      videographer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      photographer: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      video_editor: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      social_media_manager: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      graphic_designer: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      model: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      client: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      hr_manager: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
    };

    const newUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: data.name.trim(),
      email: normalizedEmail,
      phone: '+91 98765 43210',
      avatar: defaultAvatars[data.role] || defaultAvatars.owner,
      role: data.role,
      accountType: data.role === 'owner' ? 'business_owner' : data.role === 'client' ? 'client' : 'employee',
      designation: data.designation,
      department: data.department,
      availability: 'available',
      isExternalClient: data.role === 'client',
      membershipStatus: 'active'
    };

    // If Agency Owner, configure custom business and persist to Firestore
    if (data.role === 'owner' && data.agencyName) {
      const customBiz: Business = {
        ...activeBusiness,
        id: 'biz_' + Math.random().toString(36).substr(2, 7),
        name: data.agencyName,
        tagline: data.agencyTagline || 'Commercial Video & Creative Production',
        ownerId: newUser.id
      };
      newUser.businessId = customBiz.id;
      setActiveBusiness(customBiz);
      setBusinesses(prev => [customBiz, ...prev.filter(b => b.id !== customBiz.id)]);
      saveFirestoreDoc(COLLECTIONS.BUSINESSES, customBiz);
    }

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('flowdeck_session', JSON.stringify({ isAuthenticated: true, user: newUser }));
    saveFirestoreDoc(COLLECTIONS.USERS, newUser);

    if (data.role === 'client') {
      setCurrentView('client_portal');
    } else {
      setCurrentView('overview');
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail) throw new Error('Please enter your email address first.');
    try {
      await firebaseResetPassword(cleanEmail);
      addToast('Reset Link Sent', `Password reset instructions sent to ${cleanEmail}.`, 'success');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        throw new Error('No Firebase account found for that email address.');
      }
      throw new Error(err?.message || 'Unable to send password reset email.');
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
    } catch {}
    localStorage.removeItem('flowdeck_session');
    localStorage.removeItem('flowdeck_pending_invite');
    setCurrentUser(DEFAULT_USER);
    setPendingInvite(null);
    setIsAuthenticated(false);
  };

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'danger' = 'info') => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openProject = (projectId: string, tab: ProjectTabType = 'overview') => {
    setSelectedProjectId(projectId);
    setActiveProjectTab(tab);
    setCurrentView('project_detail');
  };

  // Create Project
  const createProject = (newProj: Omit<Project, 'id' | 'createdAt' | 'businessId' | 'code' | 'progressPercent'>) => {
    const code = 'SF-' + Math.floor(1000 + Math.random() * 9000);
    const newId = 'proj_' + Math.random().toString(36).substr(2, 9);
    const projectItem: Project = {
      ...newProj,
      id: newId,
      code,
      businessId: activeBusiness.id,
      progressPercent: 5,
      createdAt: new Date().toISOString()
    };

    setProjects((prev) => [projectItem, ...prev]);
    saveFirestoreDoc(COLLECTIONS.PROJECTS, projectItem);

    // Create default rooms for this project (Client room + Internal production room)
    const clientRoom: Room = {
      id: 'room_' + Math.random().toString(36).substr(2, 9),
      businessId: activeBusiness.id,
      projectId: newId,
      name: `Client Discussion — ${projectItem.clientName}`,
      description: 'Client brief clarification, previews, and updates.',
      roomType: 'client_discussion',
      visibility: 'client_visible',
      memberIds: [currentUser.id, projectItem.leadId],
      unreadCount: 0,
      lastMessageText: 'Workspace initialized.',
      lastMessageTime: 'Just now'
    };

    const internalRoom: Room = {
      id: 'room_' + Math.random().toString(36).substr(2, 9),
      businessId: activeBusiness.id,
      projectId: newId,
      name: 'Internal Production & Crew',
      description: 'Private team planning, budget, and shoots.',
      roomType: 'internal_planning',
      visibility: 'internal',
      memberIds: [currentUser.id, projectItem.leadId, ...projectItem.teamIds],
      unreadCount: 0,
      lastMessageText: 'Project created from template.',
      lastMessageTime: 'Just now'
    };

    setRooms((prev) => [...prev, clientRoom, internalRoom]);
    saveFirestoreDoc(COLLECTIONS.ROOMS, clientRoom);
    saveFirestoreDoc(COLLECTIONS.ROOMS, internalRoom);

    // Create standard initial task
    const initialTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      projectId: newId,
      title: 'Review Brief & Finalize Production Crew',
      description: 'Review client requirements, verify deliverables, and coordinate assigned team members: ' + ((projectItem.teamIds || []).map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ') || 'Lead Assignee'),
      assigneeIds: Array.from(new Set([projectItem.leadId, ...(projectItem.teamIds || [])])),
      status: 'in_progress',
      priority: 'high',
      dueAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      checklists: [
        { id: 'c1', text: 'Validate aspect ratios and deliverable formats', completed: true, createdBy: currentUser.id, createdByName: currentUser.name },
        { id: 'c2', text: 'Coordinate with assigned crew to begin production execution', completed: false, createdBy: currentUser.id, createdByName: currentUser.name }
      ],
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [initialTask, ...prev]);
    saveFirestoreDoc(COLLECTIONS.TASKS, initialTask);

    // Activity Log
    const newProjLog: ActivityLog = {
      id: 'act_' + Math.random().toString(36).substr(2, 9),
      projectId: newId,
      actorId: currentUser.id,
      action: 'created new project workspace',
      target: projectItem.title,
      timestamp: 'Just now',
      category: 'project'
    };
    setActivityLogs((prev) => [newProjLog, ...prev]);
    saveFirestoreDoc(COLLECTIONS.LOGS, newProjLog);

    markChangeUnread(newId, initialTask.id);
    pushChangeNotification(
      `New Project (By ${currentUser.name})`,
      `${currentUser.name} created project "${projectItem.title}" for ${projectItem.clientName}.`,
      'mention'
    );

    addToast('Project Created', `"${projectItem.title}" has been set up with default rooms and workflow tasks.`, 'success');
    openProject(newId, 'overview');
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    let updatedProj: Project | null = null;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const progress = status === 'approved' ? 95 : status === 'delivered' ? 100 : p.progressPercent;
          updatedProj = { ...p, status, progressPercent: progress };
          return updatedProj;
        }
        return p;
      })
    );
    if (updatedProj) {
      saveFirestoreDoc(COLLECTIONS.PROJECTS, updatedProj);
    }

    setActivityLogs((prev) => [
      {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId,
        actorId: currentUser.id,
        action: `updated project status to`,
        target: status.toUpperCase().replace('_', ' '),
        timestamp: 'Just now',
        category: 'project'
      },
      ...prev
    ]);

    addToast('Status Updated', `Project status changed to ${status}`, 'info');
  };

  const createTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      createdBy: task.createdBy || currentUser.id,
      createdByName: task.createdByName || currentUser.name,
      checklists: (task.checklists || []).map((c) => ({
        ...c,
        createdBy: c.createdBy || currentUser.id,
        createdByName: c.createdByName || currentUser.name
      })),
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    saveFirestoreDoc(COLLECTIONS.TASKS, newTask);

    const newLog: ActivityLog = {
      id: 'act_' + Math.random().toString(36).substr(2, 9),
      projectId: task.projectId,
      actorId: currentUser.id,
      action: 'created new task',
      target: task.title,
      timestamp: 'Just now',
      category: 'task'
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    saveFirestoreDoc(COLLECTIONS.LOGS, newLog);

    markChangeUnread(task.projectId, newTask.id);
    const proj = projects.find((p) => p.id === task.projectId);
    pushChangeNotification(
      `New Task (By ${currentUser.name})`,
      `${currentUser.name} added task "${task.title}"${proj ? ` in ${proj.title}` : ''}.`,
      'mention'
    );
    addToast('Task Created', `Task "${task.title}" added to workload (By ${currentUser.name}).`, 'success');
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    let updatedTaskObj: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedTaskObj = { ...t, status, updatedByName: currentUser.name };
          return updatedTaskObj;
        }
        return t;
      })
    );
    if (updatedTaskObj) {
      saveFirestoreDoc(COLLECTIONS.TASKS, updatedTaskObj);
    }
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const newLog: ActivityLog = {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId: task.projectId,
        actorId: currentUser.id,
        action: `marked task ${status.replace('_', ' ')}:`,
        target: task.title,
        timestamp: 'Just now',
        category: 'task'
      };
      setActivityLogs((prev) => [newLog, ...prev]);
      saveFirestoreDoc(COLLECTIONS.LOGS, newLog);
      markChangeUnread(task.projectId, task.id);
      pushChangeNotification(
        `Task Updated (By ${currentUser.name})`,
        `${currentUser.name} moved "${task.title}" to ${status.replace('_', ' ').toUpperCase()}.`,
        'mention'
      );
      addToast('Task Updated', `Task moved to ${status.replace('_', ' ')}.`, 'info');
    }
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            updatedByName: currentUser.name,
            checklists: t.checklists.map((c) => {
              if (c.id !== itemId) return c;
              const nextDone = !c.completed;
              if (nextDone) {
                pushChangeNotification(
                  `Subtask Done (By ${currentUser.name})`,
                  `${currentUser.name} marked subtask "${c.text}" done in "${t.title}".`,
                  'approved'
                );
              }
              return {
                ...c,
                completed: nextDone,
                completedBy: nextDone ? currentUser.id : undefined,
                completedByName: nextDone ? currentUser.name : undefined
              };
            })
          };
          saveFirestoreDoc(COLLECTIONS.TASKS, updated);
          markChangeUnread(t.projectId, t.id);
          return updated;
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string, text: string, imageUrl?: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    let targetTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSub = {
            id: 'c_' + Math.random().toString(36).substr(2, 7),
            text: cleanText,
            completed: false,
            createdBy: currentUser.id,
            createdByName: currentUser.name,
            imageUrl: imageUrl || undefined
          };
          const updated = {
            ...t,
            updatedByName: currentUser.name,
            checklists: [...(t.checklists || []), newSub]
          };
          targetTask = updated;
          saveFirestoreDoc(COLLECTIONS.TASKS, updated);
          markChangeUnread(t.projectId, t.id);
          return updated;
        }
        return t;
      })
    );
    if (targetTask) {
      pushChangeNotification(
        `Subtask Added (By ${currentUser.name})`,
        `${currentUser.name} added subtask "${cleanText}" to "${(targetTask as Task).title}".`,
        'mention'
      );
    }
    addToast('Subtask Added', `"${cleanText}" added (By ${currentUser.name}).`, 'success');
  };

  const deleteSubtask = (taskId: string, itemId: string) => {
    if (currentUser.role !== 'owner') {
      addToast('Permission Denied', 'Only the agency owner can delete subtasks.', 'danger');
      return;
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            updatedByName: currentUser.name,
            checklists: (t.checklists || []).filter((c) => c.id !== itemId)
          };
          saveFirestoreDoc(COLLECTIONS.TASKS, updated);
          return updated;
        }
        return t;
      })
    );
    addToast('Subtask Deleted', 'Subtask removed from checklist.', 'info');
  };

  const sendMessage = (roomId: string, text: string, attachments?: MessageAttachment[]) => {
    const cleanText = text.trim();
    const hasAttachments = !!(attachments && attachments.length > 0);
    if (!cleanText && !hasAttachments) return;

    const newMsg: Message = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: cleanText,
      createdAt: new Date().toISOString(),
      reactions: [],
      attachments: hasAttachments ? attachments : undefined
    };

    setMessages((prev) => {
      const next = {
        ...prev,
        [roomId]: [...(prev[roomId] || []), newMsg]
      };
      try {
        localStorage.setItem('flowdeck_db_messages', JSON.stringify(next));
      } catch {}
      return next;
    });

    const previewText = cleanText || (hasAttachments ? `📷 Sent ${attachments!.length} image(s)` : '');
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const updated = {
            ...r,
            lastMessageText: `${currentUser.name.split(' ')[0]}: ${previewText}`,
            lastMessageTime: timeLabel
          };
          saveFirestoreDoc(COLLECTIONS.ROOMS, updated);
          return updated;
        }
        return r;
      })
    );

    saveFirestoreDoc(COLLECTIONS.MESSAGES, newMsg);
  };

  const markRoomRead = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId && (r.unreadCount || 0) > 0) {
          const updated = { ...r, unreadCount: 0 };
          saveFirestoreDoc(COLLECTIONS.ROOMS, updated);
          return updated;
        }
        return r;
      })
    );
  };

  const convertMessageToTask = (
    roomId: string,
    messageId: string,
    taskTitle: string,
    assigneeId: string,
    dueAt: string
  ) => {
    const room = rooms.find((r) => r.id === roomId);
    const projectId = room ? room.projectId : selectedProjectId || (projects[0]?.id || 'proj_general');

    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      projectId,
      title: taskTitle,
      description: `Action item converted directly from message history.`,
      assigneeIds: [assigneeId],
      status: 'todo',
      priority: 'high',
      dueAt: dueAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      sourceMessageId: messageId,
      checklists: [
        { id: 'c1', text: 'Execute note from chat room', completed: false }
      ],
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => [newTask, ...prev]);
    saveFirestoreDoc(COLLECTIONS.TASKS, newTask);

    setActivityLogs((prev) => [
      {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId,
        actorId: currentUser.id,
        action: 'converted discussion message into actionable task:',
        target: taskTitle,
        timestamp: 'Just now',
        category: 'task'
      },
      ...prev
    ]);

    addToast('Converted to Task', `"${taskTitle}" has been added to the project board.`, 'success');
  };

  const respondToShoot = (
    shootId: string,
    status: 'accepted' | 'declined' | 'suggested_alternative',
    alternativeTime?: string
  ) => {
    setShootEvents((prev) =>
      prev.map((s) => {
        if (s.id === shootId) {
          const updatedParticipants = s.participants.map((p) => {
            if (p.userId === currentUser.id) {
              return {
                ...p,
                status,
                suggestedAlternativeTime: alternativeTime || p.suggestedAlternativeTime
              };
            }
            return p;
          });
          const updated = { ...s, participants: updatedParticipants };
          saveFirestoreDoc(COLLECTIONS.SHOOTS, updated);
          return updated;
        }
        return s;
      })
    );

    addToast('Availability Updated', `Your response (${status}) has been registered for the shoot.`, 'info');
  };

  const confirmShoot = (shootId: string) => {
    setShootEvents((prev) =>
      prev.map((s) => {
        if (s.id === shootId) {
          const updated = { ...s, status: 'confirmed' as const };
          saveFirestoreDoc(COLLECTIONS.SHOOTS, updated);
          return updated;
        }
        return s;
      })
    );
    addToast('Shoot Confirmed', 'The shoot has been locked. Mobile call sheets sent to all crew members.', 'success');
  };

  const addTimestampComment = (versionId: string, timestampSeconds: number, text: string) => {
    const mins = Math.floor(timestampSeconds / 60);
    const secs = timestampSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const newComment = {
      id: 'comm_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      timestampSeconds,
      timestampFormatted: formatted,
      text,
      createdAt: 'Just now',
      resolved: false
    };

    setEditVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          const updated = {
            ...v,
            comments: [...v.comments, newComment]
          };
          saveFirestoreDoc(COLLECTIONS.VERSIONS, updated);
          return updated;
        }
        return v;
      })
    );

    addToast('Feedback Saved', `Timestamped note added at ${formatted}.`, 'info');
  };

  const approveVersionInternally = (versionId: string) => {
    setEditVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          const updated = {
            ...v,
            internalApprovedBy: currentUser.id,
            internalApprovedAt: new Date().toISOString(),
            status: 'client_review' as const
          };
          saveFirestoreDoc(COLLECTIONS.VERSIONS, updated);
          return updated;
        }
        return v;
      })
    );

    const version = editVersions.find((v) => v.id === versionId);
    if (version) {
      setActivityLogs((prev) => [
        {
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          projectId: version.projectId,
          actorId: currentUser.id,
          action: 'granted internal manager approval on',
          target: `${version.versionTag} — Now queued for Client Review`,
          timestamp: 'Just now',
          category: 'approval'
        },
        ...prev
      ]);
    }

    addToast('Internal Approval Granted', 'Version forwarded to Client Review Portal.', 'success');
  };

  const approveVersionClient = (versionId: string, signatureName: string) => {
    setEditVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          const updated = {
            ...v,
            status: 'approved' as const,
            clientApprovedBy: signatureName || currentUser.name,
            clientApprovedAt: new Date().toISOString(),
            finalDeliveryUrl: 'https://drive.google.com/drive/folders/aura-final-delivery-prores4444'
          };
          saveFirestoreDoc(COLLECTIONS.VERSIONS, updated);
          return updated;
        }
        return v;
      })
    );

    const version = editVersions.find((v) => v.id === versionId);
    if (version) {
      updateProjectStatus(version.projectId, 'approved');

      // Trigger Confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }

      setActivityLogs((prev) => [
        {
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          projectId: version.projectId,
          actorId: currentUser.id,
          action: 'OFFICIALLY APPROVED & SIGNED',
          target: `${version.versionTag} by ${signatureName || currentUser.name}`,
          timestamp: 'Just now',
          category: 'approval'
        },
        ...prev
      ]);
    }

    addToast('Final Client Sign-off Recorded! 🎉', 'Project is approved for master final delivery.', 'success');
  };

  const requestVersionChanges = (versionId: string, notes: string) => {
    setEditVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          const updated = {
            ...v,
            status: 'revision_requested' as const,
            changeNotes: notes
          };
          saveFirestoreDoc(COLLECTIONS.VERSIONS, updated);
          return updated;
        }
        return v;
      })
    );

    const version = editVersions.find((v) => v.id === versionId);
    if (version) {
      updateProjectStatus(version.projectId, 'revisions');

      setActivityLogs((prev) => [
        {
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          projectId: version.projectId,
          actorId: currentUser.id,
          action: 'requested revisions on',
          target: `${version.versionTag}: "${notes.slice(0, 50)}..."`,
          timestamp: 'Just now',
          category: 'approval'
        },
        ...prev
      ]);
    }

    addToast('Revisions Requested', 'Consolidated feedback dispatched to video editing room.', 'warning');
  };

  const registerProjectAsset = (
    projectId: string,
    category: ProjectAsset['category'],
    name: string,
    url: string,
    size: string
  ) => {
    const newAsset: ProjectAsset = {
      id: 'ast_' + Math.random().toString(36).substr(2, 9),
      projectId,
      name,
      category,
      folder: category === 'raw_footage' ? '04_Raw_Footage' : '07_Review',
      storageProvider: 'google_drive',
      sizeFormatted: size,
      url,
      visibility: 'client_visible',
      uploadedBy: currentUser.id,
      createdAt: new Date().toISOString(),
      mimeType: name.endsWith('.pdf') ? 'application/pdf' : 'video/mp4'
    };

    setAssets((prev) => [newAsset, ...prev]);
    saveFirestoreDoc(COLLECTIONS.ASSETS, newAsset);

    setActivityLogs((prev) => [
      {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId,
        actorId: currentUser.id,
        action: 'uploaded asset',
        target: name,
        timestamp: 'Just now',
        category: 'project'
      },
      ...prev
    ]);

    addToast('Asset Linked', `${name} successfully added to project vault.`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, read: true };
          saveFirestoreDoc(COLLECTIONS.NOTIFICATIONS, updated);
          return updated;
        }
        return n;
      })
    );
  };

  const applyForLeave = (leave: Omit<LeaveRecord, 'id' | 'status'>) => {
    const newRecord: LeaveRecord = {
      ...leave,
      id: 'leave_' + Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };
    setLeaveRecords((prev) => [newRecord, ...prev]);
    saveFirestoreDoc(COLLECTIONS.LEAVES, newRecord);
    addToast('Leave Request Submitted', 'HR and management have been notified of your dates.', 'info');
  };

  const rescheduleShoot = (shootId: string, newStartAt: string, newEndAt: string, reason: string) => {
    setShootEvents((prev) =>
      prev.map((s) => {
        if (s.id === shootId) {
          const updated = {
            ...s,
            startAt: newStartAt,
            endAt: newEndAt,
            status: 'proposed' as const
          };
          saveFirestoreDoc(COLLECTIONS.SHOOTS, updated);
          return updated;
        }
        return s;
      })
    );

    const shoot = shootEvents.find((s) => s.id === shootId);
    if (shoot) {
      setActivityLogs((prev) => [
        {
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          projectId: shoot.projectId,
          actorId: currentUser.id,
          action: 'rescheduled shoot',
          target: `${shoot.title} (Reason: ${reason})`,
          timestamp: 'Just now',
          category: 'shoot'
        },
        ...prev
      ]);
    }

    addToast('Shoot Rescheduled', `Updated to ${new Date(newStartAt).toLocaleDateString()}. Re-confirmations requested from crew.`, 'warning');
  };

  const createShootEvent = (shoot: Omit<ShootEvent, 'id' | 'createdAt'>) => {
    const newShoot: ShootEvent = {
      ...shoot,
      id: 'shoot_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    setShootEvents((prev) => [newShoot, ...prev]);
    saveFirestoreDoc(COLLECTIONS.SHOOTS, newShoot);

    setActivityLogs((prev) => [
      {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId: shoot.projectId,
        actorId: currentUser.id,
        action: 'scheduled new shoot production day',
        target: shoot.title,
        timestamp: 'Just now',
        category: 'shoot'
      },
      ...prev
    ]);

    addToast('Event Scheduled', `"${shoot.title}" has been placed on the master calendar.`, 'success');
  };

  const createClient = (newClient: Omit<ClientProfile, 'id' | 'businessId' | 'portalToken' | 'totalProjects'>) => {
    const clientId = 'client_' + Math.random().toString(36).substr(2, 9);
    const token = 'tok_' + Math.random().toString(36).substr(2, 12);
    const clientItem: ClientProfile = {
      ...newClient,
      id: clientId,
      businessId: activeBusiness.id,
      portalToken: token,
      totalProjects: 0
    };

    setClients((prev) => [clientItem, ...prev]);
    saveFirestoreDoc(COLLECTIONS.CLIENTS, clientItem);

    setActivityLogs((prev) => [
      {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId: 'biz_apex',
        actorId: currentUser.id,
        action: 'onboarded new client account',
        target: `${newClient.brandName} (${newClient.companyName})`,
        timestamp: 'Just now',
        category: 'project'
      },
      ...prev
    ]);

    addToast('Client Onboarded', `"${newClient.brandName}" added to client directory.`, 'success');
  };

  const updateClient = (clientId: string, updates: Partial<ClientProfile>) => {
    let updatedClientObj: ClientProfile | null = null;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          updatedClientObj = { ...c, ...updates };
          return updatedClientObj;
        }
        return c;
      })
    );
    if (updatedClientObj) {
      saveFirestoreDoc(COLLECTIONS.CLIENTS, updatedClientObj);
    }
    addToast('Client Updated', 'Client profile and branding updated successfully.', 'success');
  };

  const updateUserAvatar = (newAvatarUrl: string) => {
    const cleanUrl = newAvatarUrl.trim();
    if (!cleanUrl) return;
    const updatedUser: User = { ...currentUser, avatar: cleanUrl };
    setCurrentUser(updatedUser);
    setUsers((prev) => {
      const nextUsers = prev.some((u) => u.id === currentUser.id)
        ? prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
        : [updatedUser, ...prev];
      try {
        localStorage.setItem('flowdeck_db_users', JSON.stringify(nextUsers));
      } catch {}
      return nextUsers;
    });
    try {
      const saved = localStorage.getItem('flowdeck_session');
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem('flowdeck_session', JSON.stringify({ ...parsed, isAuthenticated: true, user: updatedUser }));
    } catch {}

    saveFirestoreDoc(COLLECTIONS.USERS, updatedUser);

    addToast('Profile Photo Updated', 'Your profile picture has been updated.', 'success');
  };

  const updateUserPhone = (newPhone: string) => {
    let cleanPhone = newPhone.trim();
    if (!cleanPhone) return;
    if (!cleanPhone.startsWith('+91')) {
      const digits = cleanPhone.replace(/\D/g, '');
      cleanPhone = digits ? `+91 ${digits.slice(-10)}` : '+91 98765 43210';
    }
    const updatedUser: User = { ...currentUser, phone: cleanPhone };
    setCurrentUser(updatedUser);
    setUsers((prev) => {
      const nextUsers = prev.some((u) => u.id === currentUser.id)
        ? prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
        : [updatedUser, ...prev];
      try {
        localStorage.setItem('flowdeck_db_users', JSON.stringify(nextUsers));
      } catch {}
      return nextUsers;
    });
    try {
      const session = localStorage.getItem('flowdeck_session');
      const parsed = session ? JSON.parse(session) : {};
      localStorage.setItem('flowdeck_session', JSON.stringify({ ...parsed, isAuthenticated: true, user: updatedUser }));
    } catch {}

    saveFirestoreDoc(COLLECTIONS.USERS, updatedUser);
    addToast('Phone Number Updated', `Contact phone set to ${cleanPhone}.`, 'success');
  };

  const sendAgencyInviteNotification = (recipientUser: User, role: string, agency: Business, token: string) => {
    const notifId = 'notif_invite_' + token;
    const newNotif: NotificationItem = {
      id: notifId,
      recipientId: recipientUser.id,
      title: `Agency Invitation: ${agency.name}`,
      message: `Join "${agency.name}" as "${role}". Confirm or Reject invitation.`,
      type: 'mention',
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== notifId)]);
    saveFirestoreDoc(COLLECTIONS.NOTIFICATIONS, newNotif);

    const inviteData: PendingAgencyInvite = {
      bizId: agency.id,
      agencyName: agency.name,
      agencyLogo: agency.logo || '🎬',
      role,
      token,
      email: recipientUser.email
    };

    try {
      localStorage.setItem(`flowdeck_user_invite_${recipientUser.id}`, JSON.stringify(inviteData));
      localStorage.setItem(`flowdeck_user_invite_${recipientUser.email.toLowerCase()}`, JSON.stringify(inviteData));
      localStorage.setItem('flowdeck_pending_invite', JSON.stringify(inviteData));
    } catch {}

    if (currentUser.id === recipientUser.id || currentUser.email.toLowerCase() === recipientUser.email.toLowerCase()) {
      setPendingInvite(inviteData);
      setIsInviteModalOpen(true);
      addToast(
        'Agency Invitation Received',
        `Join "${agency.name}" as "${role}"? Confirm or Reject below.`,
        'info'
      );
    }
  };

  const createTeamMember = (memberData: Omit<User, 'id'>): User => {
    const normalizedEmail = memberData.email.trim().toLowerCase();
    const existing = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error(`The email "${memberData.email}" is already associated with an account (${existing.name}). One email can only be associated with one account.`);
    }

    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    const newMember: User = {
      ...memberData,
      id: userId
    };
    setUsers((prev) => {
      const nextUsers = [newMember, ...prev.filter(u => u.id !== userId)];
      try {
        localStorage.setItem('flowdeck_db_users', JSON.stringify(nextUsers));
      } catch {}
      return nextUsers;
    });
    saveFirestoreDoc(COLLECTIONS.USERS, newMember);
    addToast('Team Member Added', `${newMember.name} has been added as ${newMember.designation}.`, 'success');
    return newMember;
  };

  const acceptAgencyInvite = (customInvite?: PendingAgencyInvite) => {
    const invite = customInvite || pendingInvite;
    if (!invite) return;

    // 1. Ensure business exists
    const existingBiz = businesses.find(b => b.id === invite.bizId);
    const targetBiz: Business = existingBiz || {
      id: invite.bizId,
      name: invite.agencyName,
      tagline: 'Commercial Video & Creative Production',
      category: 'Commercial Video & Creative Production',
      logo: invite.agencyLogo || '🎬',
      ownerId: 'owner_agency',
      timezone: 'Asia/Kolkata (IST)',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      storageProvider: 'firebase',
      createdAt: new Date().toISOString()
    };

    if (!existingBiz) {
      setBusinesses(prev => [targetBiz, ...prev.filter(b => b.id !== targetBiz.id)]);
    }
    setActiveBusiness(targetBiz);
    saveFirestoreDoc(COLLECTIONS.BUSINESSES, targetBiz);

    // 2. Update currentUser designation & business association
    const updatedUser: User = {
      ...currentUser,
      designation: invite.role,
      department: invite.role.toLowerCase().includes('editor') ? 'Post-Production' :
                  invite.role.toLowerCase().includes('photo') ? 'Photo Unit' :
                  invite.role.toLowerCase().includes('video') ? 'Camera Unit' :
                  invite.role.toLowerCase().includes('design') ? 'Design & Branding' :
                  invite.role.toLowerCase().includes('manager') ? 'Management' : 'Operations',
      accountType: currentUser.role === 'owner' ? 'business_owner' : 'employee'
    };

    setCurrentUser(updatedUser);
    saveFirestoreDoc(COLLECTIONS.USERS, updatedUser);
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === updatedUser.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = updatedUser;
        return copy;
      }
      return [updatedUser, ...prev];
    });

    try {
      const session = localStorage.getItem('flowdeck_session');
      if (session) {
        const parsed = JSON.parse(session);
        parsed.user = updatedUser;
        localStorage.setItem('flowdeck_session', JSON.stringify(parsed));
      }
      localStorage.removeItem('flowdeck_pending_invite');
      if (typeof window !== 'undefined' && window.history && window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}

    // 3. Activity Log
    if (projects.length > 0) {
      setActivityLogs(prev => [
        {
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          projectId: projects[0].id,
          actorId: updatedUser.id,
          action: 'joined agency workspace',
          target: `${invite.agencyName} as ${invite.role}`,
          timestamp: 'Just now',
          category: 'project'
        },
        ...prev
      ]);
    }

    // 4. System Notification
    setNotifications(prev => [
      {
        id: 'notif_joined_' + Math.random().toString(36).substr(2, 9),
        recipientId: updatedUser.id,
        title: `Welcome to ${invite.agencyName}!`,
        message: `You are officially onboarded to ${invite.agencyName} as ${invite.role}.`,
        type: 'approved',
        createdAt: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);

    // 5. Success Toast
    addToast(
      'Joined Agency! 🎉',
      `You have successfully joined ${invite.agencyName} as ${invite.role}.`,
      'success'
    );

    // 6. Update invitation status to accepted
    const matchingInvite = invitations.find(i => 
      (i.token && i.token === invite.token) || 
      (i.bizId === invite.bizId && i.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    if (matchingInvite) {
      const updatedInv: AgencyInvitation = { ...matchingInvite, status: 'accepted' };
      setInvitations(prev => prev.map(inv => inv.id === matchingInvite.id ? updatedInv : inv));
      saveFirestoreDoc(COLLECTIONS.INVITATIONS, updatedInv);
    }

    setPendingInvite(null);
    setIsInviteModalOpen(false);
  };

  const rejectAgencyInvite = (customInvite?: PendingAgencyInvite) => {
    const invite = customInvite || pendingInvite;
    const agencyName = invite?.agencyName || 'Agency';

    addToast(
      'Invitation Declined',
      `You declined the invitation to join ${agencyName}.`,
      'warning'
    );

    // Update invitation status to rejected
    const matchingInvite = invitations.find(i => 
      (i.token && i.token === invite?.token) || 
      (invite && i.bizId === invite.bizId && i.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    if (matchingInvite) {
      const updatedInv: AgencyInvitation = { ...matchingInvite, status: 'rejected' };
      setInvitations(prev => prev.map(inv => inv.id === matchingInvite.id ? updatedInv : inv));
      saveFirestoreDoc(COLLECTIONS.INVITATIONS, updatedInv);
    }

    if (currentUser) {
      const declineNotif: NotificationItem = {
        id: 'notif_declined_' + Math.random().toString(36).substr(2, 9),
        recipientId: currentUser.id,
        title: `Declined: ${agencyName} Invitation`,
        message: `You declined the invitation to join ${agencyName}.`,
        type: 'mention',
        createdAt: new Date().toISOString(),
        read: true
      };
      setNotifications(prev => [declineNotif, ...prev]);
      saveFirestoreDoc(COLLECTIONS.NOTIFICATIONS, declineNotif);
    }

    try {
      localStorage.removeItem('flowdeck_pending_invite');
      if (typeof window !== 'undefined' && window.history && window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}

    setPendingInvite(null);
    setIsInviteModalOpen(false);
  };

  const createAgencyInvitation = (data: Omit<AgencyInvitation, 'id' | 'createdAt' | 'status'>): AgencyInvitation => {
    const inviteId = 'inv_' + Math.random().toString(36).substr(2, 9);
    const newInvite: AgencyInvitation = {
      ...data,
      id: inviteId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setInvitations((prev) => [newInvite, ...prev.filter(i => i.id !== inviteId)]);
    saveFirestoreDoc(COLLECTIONS.INVITATIONS, newInvite);

    // If an existing registered user matches this email, send direct notification
    const matchedUser = users.find(u => u.email.trim().toLowerCase() === newInvite.email.trim().toLowerCase());
    if (matchedUser) {
      sendAgencyInviteNotification(matchedUser, newInvite.role, activeBusiness, newInvite.token);
    }

    addToast('Invitation Created', `Invitation sent to ${newInvite.name} (${newInvite.email}) awaiting confirmation.`, 'info');
    return newInvite;
  };

  const revokeAgencyInvitation = (inviteId: string) => {
    const target = invitations.find(i => i.id === inviteId);
    setInvitations((prev) => prev.filter(i => i.id !== inviteId));
    deleteFirestoreDoc(COLLECTIONS.INVITATIONS, inviteId);
    if (target) {
      addToast('Invitation Revoked', `Invitation for ${target.name} (${target.email}) was cancelled.`, 'info');
    }
  };

  const removeEmployee = (userId: string) => {
    if (currentUser.role !== 'owner') {
      addToast('Permission Denied', 'Only the agency owner can remove employees.', 'danger');
      return;
    }
    if (userId === currentUser.id) {
      addToast('Action Prohibited', 'You cannot remove yourself from your own agency.', 'warning');
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    setUsers((prev) => {
      const nextUsers = prev.filter(u => u.id !== userId);
      try {
        localStorage.setItem('flowdeck_db_users', JSON.stringify(nextUsers));
      } catch {}
      return nextUsers;
    });

    deleteFirestoreDoc(COLLECTIONS.USERS, userId);

    setActivityLogs((prev) => [
      {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId: projects[0]?.id || 'biz_apex',
        actorId: currentUser.id,
        action: 'removed employee from agency',
        target: `${targetUser.name} (${targetUser.designation})`,
        timestamp: 'Just now',
        category: 'project'
      },
      ...prev
    ]);

    addToast('Employee Removed', `${targetUser.name} has been removed from the agency personnel roster.`, 'info');
  };

  const updateBusiness = (updates: Partial<Business>) => {
    const updatedBiz: Business = { ...activeBusiness, ...updates };
    setActiveBusiness(updatedBiz);
    setBusinesses((prev) =>
      prev.some((b) => b.id === updatedBiz.id)
        ? prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b))
        : [updatedBiz, ...prev]
    );
    saveFirestoreDoc(COLLECTIONS.BUSINESSES, updatedBiz);
    addToast('Settings Saved', 'Business configuration updated and synced.', 'success');
  };

  const updateUserProfile = (updates: Partial<Pick<User, 'name' | 'designation' | 'department' | 'bio'>>) => {
    const updatedUser: User = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.some((u) => u.id === updatedUser.id)
        ? prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        : [updatedUser, ...prev]
    );
    try {
      const saved = localStorage.getItem('flowdeck_session');
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem('flowdeck_session', JSON.stringify({ ...parsed, isAuthenticated: true, user: updatedUser }));
    } catch {}
    saveFirestoreDoc(COLLECTIONS.USERS, updatedUser);
    addToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    let updatedProj: Project | null = null;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          updatedProj = { ...p, ...updates };
          return updatedProj;
        }
        return p;
      })
    );
    if (updatedProj) {
      saveFirestoreDoc(COLLECTIONS.PROJECTS, updatedProj);
      addToast('Project Updated', `"${(updatedProj as Project).title}" changes saved.`, 'success');
    }
  };

  const deleteProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => {
      prev.filter((t) => t.projectId === projectId).forEach((t) => deleteFirestoreDoc(COLLECTIONS.TASKS, t.id));
      return prev.filter((t) => t.projectId !== projectId);
    });
    setRooms((prev) => {
      prev.filter((r) => r.projectId === projectId).forEach((r) => deleteFirestoreDoc(COLLECTIONS.ROOMS, r.id));
      return prev.filter((r) => r.projectId !== projectId);
    });
    deleteFirestoreDoc(COLLECTIONS.PROJECTS, projectId);
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setCurrentView('projects');
    }
    if (target) {
      addToast('Project Deleted', `"${target.title}" and its workspace items were removed.`, 'info');
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    let updatedTaskObj: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedTaskObj = { ...t, ...updates };
          return updatedTaskObj;
        }
        return t;
      })
    );
    if (updatedTaskObj) {
      saveFirestoreDoc(COLLECTIONS.TASKS, updatedTaskObj);
      addToast('Task Updated', `"${(updatedTaskObj as Task).title}" saved.`, 'success');
    }
  };

  const deleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteFirestoreDoc(COLLECTIONS.TASKS, taskId);
    if (target) {
      addToast('Task Deleted', `"${target.title}" removed.`, 'info');
    }
  };

  const deleteClient = (clientId: string) => {
    const target = clients.find((c) => c.id === clientId);
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    deleteFirestoreDoc(COLLECTIONS.CLIENTS, clientId);
    if (target) {
      addToast('Client Removed', `"${target.brandName}" removed from client directory.`, 'info');
    }
  };

  const updateShootEvent = (shootId: string, updates: Partial<ShootEvent>) => {
    let updatedShoot: ShootEvent | null = null;
    setShootEvents((prev) =>
      prev.map((s) => {
        if (s.id === shootId) {
          updatedShoot = { ...s, ...updates };
          return updatedShoot;
        }
        return s;
      })
    );
    if (updatedShoot) {
      saveFirestoreDoc(COLLECTIONS.SHOOTS, updatedShoot);
      addToast('Event Updated', `"${(updatedShoot as ShootEvent).title}" updated.`, 'success');
    }
  };

  const deleteShootEvent = (shootId: string) => {
    const target = shootEvents.find((s) => s.id === shootId);
    setShootEvents((prev) => prev.filter((s) => s.id !== shootId));
    deleteFirestoreDoc(COLLECTIONS.SHOOTS, shootId);
    if (target) {
      addToast('Event Cancelled', `"${target.title}" removed from calendar.`, 'info');
    }
  };

  const respondToLeave = (leaveId: string, status: 'approved' | 'rejected') => {
    let updatedLeave: LeaveRecord | null = null;
    setLeaveRecords((prev) =>
      prev.map((l) => {
        if (l.id === leaveId) {
          updatedLeave = { ...l, status };
          return updatedLeave;
        }
        return l;
      })
    );
    if (updatedLeave) {
      saveFirestoreDoc(COLLECTIONS.LEAVES, updatedLeave);
      const targetUser = users.find((u) => u.id === (updatedLeave as LeaveRecord).userId);
      const notif: NotificationItem = {
        id: 'notif_leave_' + Math.random().toString(36).substr(2, 9),
        recipientId: (updatedLeave as LeaveRecord).userId,
        title: `Leave Request ${status === 'approved' ? 'Approved' : 'Declined'}`,
        message: `Your leave from ${(updatedLeave as LeaveRecord).startDate} to ${(updatedLeave as LeaveRecord).endDate} was ${status}.`,
        type: status === 'approved' ? 'approved' : 'mention',
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => [notif, ...prev]);
      saveFirestoreDoc(COLLECTIONS.NOTIFICATIONS, notif);
      addToast(
        `Leave ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        `${targetUser?.name || 'Employee'}'s leave request has been ${status}.`,
        status === 'approved' ? 'success' : 'warning'
      );
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!n.read && (n.recipientId === currentUser.id || !n.recipientId || n.recipientId === 'all')) {
          const updated = { ...n, read: true };
          saveFirestoreDoc(COLLECTIONS.NOTIFICATIONS, updated);
          return updated;
        }
        return n;
      })
    );
  };

  const createRoom = (room: Omit<Room, 'id' | 'unreadCount'>): Room => {
    const newRoom: Room = {
      ...room,
      id: 'room_' + Math.random().toString(36).substr(2, 9),
      unreadCount: 0
    };
    setRooms((prev) => [newRoom, ...prev]);
    saveFirestoreDoc(COLLECTIONS.ROOMS, newRoom);
    setActiveRoomId(newRoom.id);

    const newLog: ActivityLog = {
      id: 'act_' + Math.random().toString(36).substr(2, 9),
      projectId: newRoom.projectId,
      actorId: currentUser.id,
      action: 'started discussion room',
      target: `#${newRoom.name}`,
      timestamp: 'Just now',
      category: 'room'
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    saveFirestoreDoc(COLLECTIONS.LOGS, newLog);

    addToast('Channel Created', `"#${newRoom.name}" room is ready.`, 'success');
    return newRoom;
  };

  const openOrCreateTaskRoom = (task: Task): Room => {
    const expectedName = `Task: ${task.title.slice(0, 32)}`;
    const existingRoom = rooms.find(
      (r) =>
        r.taskId === task.id ||
        (r.projectId === task.projectId && r.name.toLowerCase() === expectedName.toLowerCase())
    );
    if (existingRoom) {
      setActiveRoomId(existingRoom.id);
      return existingRoom;
    }

    const memberIds = Array.from(new Set([currentUser.id, ...(task.assigneeIds || [])]));
    const created = createRoom({
      businessId: activeBusiness.id,
      projectId: task.projectId,
      taskId: task.id,
      name: expectedName,
      description: task.description || `Discussion room for task "${task.title}"`,
      roomType: 'internal_planning',
      visibility: 'internal',
      memberIds,
      lastMessageText: `Task room opened for "${task.title}"`,
      lastMessageTime: 'Just now'
    });
    sendMessage(created.id, `Room opened for task: "${task.title}" (Due ${new Date(task.dueAt).toLocaleDateString()}).`);
    setActiveRoomId(created.id);
    return created;
  };

  return (
    <AppContext.Provider
      value={{
        activeBusiness,
        setActiveBusiness,
        businesses,
        currentUser,
        setCurrentUser,
        users,
        isAuthenticated,
        login,
        signup,
        logout,
        currentView,
        setCurrentView,
        selectedProjectId,
        setSelectedProjectId,
        activeProjectTab,
        setActiveProjectTab,
        openProject,
        projects,
        tasks,
        rooms,
        messages,
        shootEvents,
        editVersions,
        assets,
        activityLogs,
        notifications,
        clients,
        leaveRecords,
        isCreateProjectOpen,
        setIsCreateProjectOpen,
        isSearchOpen,
        setIsSearchOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        pendingInvite,
        setPendingInvite,
        isInviteModalOpen,
        setIsInviteModalOpen,
        isPhoneModalOpen,
        setIsPhoneModalOpen,
        acceptAgencyInvite,
        rejectAgencyInvite,
        updateUserPhone,
        sendAgencyInviteNotification,
        firebaseUser,
        activeCallSheetShootId,
        setActiveCallSheetShootId,
        toasts,
        addToast,
        removeToast,
        createProject,
        updateProjectStatus,
        createTask,
        updateTaskStatus,
        toggleChecklistItem,
        addSubtask,
        deleteSubtask,
        sendMessage,
        markRoomRead,
        convertMessageToTask,
        respondToShoot,
        confirmShoot,
        addTimestampComment,
        approveVersionInternally,
        approveVersionClient,
        requestVersionChanges,
        registerProjectAsset,
        markNotificationAsRead,
        applyForLeave,
        rescheduleShoot,
        createShootEvent,
        createClient,
        updateClient,
        updateUserAvatar,
        createTeamMember,
        invitations,
        createAgencyInvitation,
        revokeAgencyInvitation,
        removeEmployee,
        resetPassword,
        updateBusiness,
        updateUserProfile,
        updateProject,
        deleteProject,
        updateTask,
        deleteTask,
        deleteClient,
        updateShootEvent,
        deleteShootEvent,
        respondToLeave,
        markAllNotificationsAsRead,
        createRoom,
        openOrCreateTaskRoom,
        activeRoomId,
        setActiveRoomId,
        unreadProjectIds,
        unreadTaskIds,
        markProjectSeen,
        markTaskSeen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { useApp } from './useApp';


