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

export const mockBusinesses: Business[] = [
  {
    id: 'biz_apex',
    name: 'Apex Media Studios',
    tagline: 'High-Performance Video & Creative Operations',
    logo: '🎬',
    category: 'Commercial Video & Creative Agency',
    ownerId: 'u_marcus',
    timezone: 'America/New_York (EST)',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    storageProvider: 'google_drive',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'biz_neon',
    name: 'Neon Peak Creative',
    tagline: 'Boutique Social & Fashion Visuals',
    logo: '⚡',
    category: 'Social First & Fashion Production',
    ownerId: 'u_marcus',
    timezone: 'America/Los_Angeles (PST)',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    storageProvider: 'dropbox',
    createdAt: '2025-06-15T09:00:00Z',
  }
];

export const mockUsers: User[] = [
  {
    id: 'u_marcus',
    name: 'Marcus Vance',
    email: 'marcus@apexmedia.io',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder & Executive Producer. 12+ years in commercial production & agency ops.',
    role: 'owner',
    accountType: 'business_owner',
    designation: 'Agency Founder & Director',
    department: 'Executive',
    availability: 'available',
  },
  {
    id: 'u_elena',
    name: 'Elena Rostova',
    email: 'elena@apexmedia.io',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Head of Production & Operations. Keeps all deliverables locked and on schedule.',
    role: 'head_manager',
    accountType: 'employee',
    designation: 'Head of Production',
    department: 'Management',
    availability: 'available',
  },
  {
    id: 'u_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.hr@apexmedia.io',
    phone: '+91 98765 43212',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'People operations, talent contracts, and crew scheduling coordination.',
    role: 'hr_manager',
    accountType: 'employee',
    designation: 'HR & Talent Director',
    department: 'Operations',
    availability: 'available',
  },
  {
    id: 'u_maya',
    name: 'Maya Lin',
    email: 'maya@apexmedia.io',
    phone: '+91 98765 43213',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Social Strategist and Client Communications Manager.',
    role: 'social_media_manager',
    accountType: 'employee',
    designation: 'Social Media & Client Lead',
    department: 'Social / Strategy',
    availability: 'available',
  },
  {
    id: 'u_liam',
    name: "Liam O'Connor",
    email: 'liam.camera@apexmedia.io',
    phone: '+91 98765 43214',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Director of Photography / Lead Videographer. RED V-Raptor & Sony FX6 owner.',
    role: 'videographer',
    accountType: 'employee',
    designation: 'Senior Cinematographer',
    department: 'Production',
    availability: 'on_shoot',
  },
  {
    id: 'u_david',
    name: 'David Park',
    email: 'david.photo@apexmedia.io',
    phone: '+91 98765 43215',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Key Stills & Commercial Photographer. Lighting enthusiast.',
    role: 'photographer',
    accountType: 'freelancer',
    designation: 'Lead Stills Photographer',
    department: 'Production',
    availability: 'available',
  },
  {
    id: 'u_zoe',
    name: 'Zoe Chen',
    email: 'zoe.edit@apexmedia.io',
    phone: '+91 98765 43216',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior Video Editor & Colorist. DaVinci Resolve Studio & Premiere Pro specialist.',
    role: 'video_editor',
    accountType: 'employee',
    designation: 'Lead Video Editor & Colorist',
    department: 'Post-Production',
    availability: 'busy',
  },
  {
    id: 'u_alex',
    name: 'Alex Rivera',
    email: 'alex.design@apexmedia.io',
    phone: '+91 98765 43217',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Graphic Designer & Motion Graphics Artist. 2D/3D kinetic typography.',
    role: 'graphic_designer',
    accountType: 'freelancer',
    designation: 'Motion & Graphic Designer',
    department: 'Creative',
    availability: 'available',
  },
  {
    id: 'u_chloe',
    name: 'Chloe Bennett',
    email: 'chloe.model@gmail.com',
    phone: '+91 98765 43218',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    bio: 'Commercial Talent & Brand Ambassador. Represented in NYC / Miami.',
    role: 'model',
    accountType: 'freelancer',
    designation: 'Featured Talent / Model',
    department: 'Talent',
    availability: 'available',
  },
  {
    id: 'u_client_claire',
    name: 'Claire Dupont',
    email: 'claire@auraskincare.com',
    phone: '+91 98765 43219',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Global Brand VP at Aura Skincare London & New York.',
    role: 'client',
    accountType: 'client',
    designation: 'VP Brand Marketing (Client)',
    department: 'Aura Skincare',
    availability: 'available',
    isExternalClient: true,
  }
];

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

