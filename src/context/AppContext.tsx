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
  UserRole
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
import { saveFirestoreDoc, COLLECTIONS } from '../services/firebaseDb';

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
  updateUserAvatar: (newAvatarUrl: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [activeBusiness, setActiveBusiness] = useState<Business>(mockBusinesses[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  
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
    return mockUsers[0]; // Marcus Vance (Owner) fallback
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

  // Domain states
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [shootEvents, setShootEvents] = useState<ShootEvent[]>(mockShootEvents);
  const [editVersions, setEditVersions] = useState<EditVersion[]>(mockEditVersions);
  const [assets, setAssets] = useState<ProjectAsset[]>(mockAssets);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [clients, setClients] = useState<ClientProfile[]>(mockClients);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(mockLeaveRecords);

  // Modals & Popups
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [activeCallSheetShootId, setActiveCallSheetShootId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

    // Create standard initial task
    const initialTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      projectId: newId,
      title: 'Review Brief & Finalize Production Crew',
      description: 'Review client requirements, verify deliverables, and assign crew members.',
      assigneeIds: [projectItem.leadId],
      status: 'in_progress',
      priority: 'high',
      dueAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      checklists: [
        { id: 'c1', text: 'Validate aspect ratios and deliverable formats', completed: true },
        { id: 'c2', text: 'Reach out to crew for shoot availability', completed: false }
      ],
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [initialTask, ...prev]);

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
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const progress = status === 'approved' ? 95 : status === 'delivered' ? 100 : p.progressPercent;
          return { ...p, status, progressPercent: progress };
        }
        return p;
      })
    );

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
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
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
          return {
            ...t,
            checklists: t.checklists.map((c) =>
              c.id === itemId ? { ...c, completed: !c.completed } : c
            )
          };
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
      createdAt: 'Just now',
      reactions: []
    };

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg]
    }));

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, lastMessageText: text.trim(), lastMessageTime: 'Just now' }
          : r
      )
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
          return { ...s, participants: updatedParticipants };
        }
        return s;
      })
    );

    addToast('Availability Updated', `Your response (${status}) has been registered for the shoot.`, 'info');
  };

  const confirmShoot = (shootId: string) => {
    setShootEvents((prev) =>
      prev.map((s) => (s.id === shootId ? { ...s, status: 'confirmed' } : s))
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
          return {
            ...v,
            comments: [...v.comments, newComment]
          };
        }
        return v;
      })
    );

    addToast('Feedback Saved', `Timestamped note added at ${formatted}.`, 'info');
  };

  const approveVersionInternally = (versionId: string) => {
    setEditVersions((prev) =>
      prev.map((v) =>
        v.id === versionId
          ? {
              ...v,
              internalApprovedBy: currentUser.id,
              internalApprovedAt: new Date().toISOString(),
              status: 'client_review'
            }
          : v
      )
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
      prev.map((v) =>
        v.id === versionId
          ? {
              ...v,
              status: 'approved',
              clientApprovedBy: signatureName || currentUser.name,
              clientApprovedAt: new Date().toISOString(),
              finalDeliveryUrl: 'https://drive.google.com/drive/folders/aura-final-delivery-prores4444'
            }
          : v
      )
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
      prev.map((v) =>
        v.id === versionId
          ? {
              ...v,
              status: 'revision_requested',
              changeNotes: notes
            }
          : v
      )
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
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const applyForLeave = (leave: Omit<LeaveRecord, 'id' | 'status'>) => {
    const newRecord: LeaveRecord = {
      ...leave,
      id: 'leave_' + Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };
    setLeaveRecords((prev) => [newRecord, ...prev]);
    addToast('Leave Request Submitted', 'HR and management have been notified of your dates.', 'info');
  };

  const rescheduleShoot = (shootId: string, newStartAt: string, newEndAt: string, reason: string) => {
    setShootEvents((prev) =>
      prev.map((s) => {
        if (s.id === shootId) {
          return {
            ...s,
            startAt: newStartAt,
            endAt: newEndAt,
            status: 'proposed'
          };
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

  const updateUserAvatar = (newAvatarUrl: string) => {
    if (!newAvatarUrl.trim()) return;
    const updatedUser = { ...currentUser, avatar: newAvatarUrl.trim() };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => u.id === currentUser.id ? updatedUser : u));
    try {
      const saved = localStorage.getItem('flowdeck_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorage.setItem('flowdeck_session', JSON.stringify({ ...parsed, user: updatedUser }));
      }
    } catch {}
    addToast('Profile Photo Updated', 'Your profile picture has been updated.', 'success');
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
        updateUserAvatar
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { useApp } from './useApp';


