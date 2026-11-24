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
  LeaveRecord
} from '../types';

export const mockBusinesses: Business[] = [];

export const mockUsers: User[] = [];

export const mockClients: ClientProfile[] = [];

export const mockProjects: Project[] = [];

export const mockTasks: Task[] = [];

export const mockRooms: Room[] = [];

export const mockMessages: Record<string, Message[]> = {};

export const mockShootEvents: ShootEvent[] = [];

export const mockEditVersions: EditVersion[] = [];

export const mockAssets: ProjectAsset[] = [];

export const mockActivityLogs: ActivityLog[] = [];

export const mockNotifications: NotificationItem[] = [];

export const mockLeaveRecords: LeaveRecord[] = [];

export const mockRolePermissions = {
  createBusiness: { owner: true, manager: false, editor: false, model: false, client: false },
  inviteMembers: { owner: true, manager: true, editor: false, model: false, client: false },
  createProject: { owner: true, manager: true, editor: true, model: false, client: 'request_only' },
  editAssignedTask: { owner: true, manager: true, editor: 'assigned_only', model: 'shoot_only', client: false },
  viewInternalRoom: { owner: true, manager: 'if_member', editor: 'if_member', model: 'if_member', client: false },
  viewClientRoom: { owner: true, manager: 'if_member', editor: 'if_member', model: 'if_member', client: 'if_member' },
  approveFinal: { owner: true, manager: true, editor: false, model: false, client: 'if_requested' },
  accessHR: { owner: true, manager: false, editor: false, model: false, client: false }
};

