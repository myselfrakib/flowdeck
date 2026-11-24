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
  AgencyInvitation
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
  firebaseSignOut 
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
  | 'settings';

export type ProjectTabType = 'overview' | 'tasks' | 'rooms' | 'schedule' | 'assets' | 'approvals' | 'activity';

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
  sendMessage: (roomId: string, text: string) => void;
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
  id: 'user_owner',
  name: 'Agency Producer',
  email: 'admin@flowdeck.app',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Executive Producer & Studio Operations Lead.',
  role: 'owner',
  accountType: 'business_owner',
  designation: 'Agency Founder & Director',
  department: 'Executive',
  availability: 'available'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_db_businesses');
      return saved ? JSON.parse(saved) : (mockBusinesses.length > 0 ? mockBusinesses : [DEFAULT_BUSINESS]);
    } catch {
      return [DEFAULT_BUSINESS];
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
      return saved ? JSON.parse(saved) : (mockUsers.length > 0 ? mockUsers : [DEFAULT_USER]);
    } catch {
      return [DEFAULT_USER];
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

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem('flowdeck_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user?.role === 'client') return 'client_portal';
      }
    } catch {}
    return 'overview';
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<ProjectTabType>('overview');

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

  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(mockLeaveRecords);

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
        setUsers((prev) => {
          const map = new Map<string, User>();
          prev.forEach((u) => map.set(u.id, u));
          remoteUsers.forEach((u) => map.set(u.id, u));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('flowdeck_db_users', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      } else {
        users.forEach((u) => saveFirestoreDoc(COLLECTIONS.USERS, u));
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
    try {
      await firebaseSignIn(email, pass);
    } catch (fbErr: any) {
      console.warn('Firebase login attempt:', fbErr?.message);
    }

    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const userToLogin: User = matched || {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'owner',
      accountType: 'business_owner',
      designation: 'Agency Owner & Managing Director',
      availability: 'available'
    };

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
      await firebaseSignUp(data.email, data.password, data.name);
    } catch (fbErr: any) {
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
      name: data.name,
      email: data.email,
      phone: '+91 98765 43210',
      avatar: defaultAvatars[data.role] || defaultAvatars.owner,
      role: data.role,
      accountType: data.role === 'owner' ? 'business_owner' : data.role === 'client' ? 'client' : 'employee',
      designation: data.designation,
      department: data.department,
      availability: 'available',
      isExternalClient: data.role === 'client'
    };

    // If Agency Owner, configure custom business
    if (data.role === 'owner' && data.agencyName) {
      const customBiz: Business = {
        ...activeBusiness,
        id: 'biz_' + Math.random().toString(36).substr(2, 7),
        name: data.agencyName,
        tagline: data.agencyTagline || 'Commercial Video & Creative Production',
        ownerId: newUser.id
      };
      setActiveBusiness(customBiz);
      setBusinesses(prev => [customBiz, ...prev.filter(b => b.id !== customBiz.id)]);
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

  const logout = async () => {
    try {
      await firebaseSignOut();
    } catch {}
    localStorage.removeItem('flowdeck_session');
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
      description: 'Review client requirements, verify deliverables, and coordinate assigned team members: ' + (projectItem.teamIds.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ') || 'Lead Assignee'),
      assigneeIds: Array.from(new Set([projectItem.leadId, ...projectItem.teamIds])),
      status: 'in_progress',
      priority: 'high',
      dueAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      checklists: [
        { id: 'c1', text: 'Validate aspect ratios and deliverable formats', completed: true },
        { id: 'c2', text: 'Coordinate with assigned crew to begin production execution', completed: false }
      ],
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [initialTask, ...prev]);
    saveFirestoreDoc(COLLECTIONS.TASKS, initialTask);

    // Activity Log
    setActivityLogs((prev) => [
      {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId: newId,
        actorId: currentUser.id,
        action: 'created new project workspace',
        target: projectItem.title,
        timestamp: 'Just now',
        category: 'project'
      },
      ...prev
    ]);

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
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    saveFirestoreDoc(COLLECTIONS.TASKS, newTask);
    setActivityLogs((prev) => [
      {
        id: 'act_' + Math.random().toString(36).substr(2, 9),
        projectId: task.projectId,
        actorId: currentUser.id,
        action: 'created new task',
        target: task.title,
        timestamp: 'Just now',
        category: 'task'
      },
      ...prev
    ]);
    addToast('Task Created', `Task "${task.title}" added to workload.`, 'success');
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    let updatedTaskObj: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedTaskObj = { ...t, status };
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
      setActivityLogs((prev) => [
        {
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          projectId: task.projectId,
          actorId: currentUser.id,
          action: `marked task ${status.replace('_', ' ')}:`,
          target: task.title,
          timestamp: 'Just now',
          category: 'task'
        },
        ...prev
      ]);
      addToast('Task Updated', `Task moved to ${status.replace('_', ' ')}.`, 'info');
    }
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            checklists: t.checklists.map((c) =>
              c.id === itemId ? { ...c, completed: !c.completed } : c
            )
          };
          saveFirestoreDoc(COLLECTIONS.TASKS, updated);
          return updated;
        }
        return t;
      })
    );
  };

  const sendMessage = (roomId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: currentUser.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      reactions: []
    };

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg]
    }));

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const updated = { ...r, lastMessageText: text.trim(), lastMessageTime: 'Just now' };
          saveFirestoreDoc(COLLECTIONS.ROOMS, updated);
          return updated;
        }
        return r;
      })
    );

    saveFirestoreDoc(COLLECTIONS.MESSAGES, newMsg);
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
    saveFirestoreDoc('flowdeck_leave_records', newRecord);
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
        sendMessage,
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
        removeEmployee
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { useApp } from './useApp';


