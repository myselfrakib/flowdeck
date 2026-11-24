export type UserRole = 
  | 'owner' 
  | 'head_manager' 
  | 'hr_manager' 
  | 'social_media_manager' 
  | 'photographer' 
  | 'videographer' 
  | 'video_editor' 
  | 'graphic_designer' 
  | 'model' 
  | 'client';

export type AccountType = 'business_owner' | 'employee' | 'freelancer' | 'client';

export type MembershipStatus = 'invited' | 'pending' | 'active' | 'suspended' | 'removed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio?: string;
  role: UserRole;
  accountType: AccountType;
  department?: string;
  designation: string;
  availability: 'available' | 'on_shoot' | 'busy' | 'on_leave';
  isExternalClient?: boolean;
}

export interface Business {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  category: string;
  ownerId: string;
  timezone: string;
  workingDays: string[];
  storageProvider: 'google_drive' | 'dropbox' | 's3_object_storage' | 'firebase';
  createdAt: string;
}

export type ProjectStatus = 'draft' | 'planning' | 'in_production' | 'in_review' | 'revisions' | 'approved' | 'delivered';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DeliverableType = 'brand_video' | 'social_reel' | 'commercial' | 'photoshoot' | 'motion_graphics';

export interface Project {
  id: string;
  businessId: string;
  code: string;
  title: string;
  clientName: string;
  clientId: string;
  leadId: string;
  type: DeliverableType;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string;
  aspectRatio: string; // '16:9' | '9:16' | '1:1' | '4:5'
  duration: string; // e.g. "60s"
  targetPlatforms: string[]; // ['Instagram Reels', 'YouTube', 'TikTok']
  briefSummary: string;
  objectives: string[];
  referenceLinks: string[];
  teamIds: string[];
  progressPercent: number;
  blockerReason?: string;
  blockerOwnerId?: string;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'completed';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeIds: string[];
  status: TaskStatus;
  priority: ProjectPriority;
  dueAt: string;
  checklists: ChecklistItem[];
  sourceMessageId?: string;
  blockerReason?: string;
  blockerOwnerId?: string;
  createdAt: string;
}

export type RoomType = 'client_discussion' | 'internal_planning' | 'production_shoot' | 'editing_room';

export interface Room {
  id: string;
  businessId: string;
  projectId: string;
  name: string;
  description: string;
  roomType: RoomType;
  visibility: 'internal' | 'client_visible';
  memberIds: string[];
  unreadCount?: number;
  lastMessageText?: string;
  lastMessageTime?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user ids
}

export interface MessageAttachment {
  name: string;
  size: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isPinned?: boolean;
  isEdited?: boolean;
  replyToId?: string;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
}

export type ShootStatus = 'proposed' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ShootParticipant {
  userId: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'suggested_alternative';
  callTime: string;
  suggestedAlternativeTime?: string;
}

export interface ShootEvent {
  id: string;
  projectId: string;
  title: string;
  location: string;
  locationAddress: string;
  mapUrl: string;
  startAt: string;
  endAt: string;
  status: ShootStatus;
  participants: ShootParticipant[];
  wardrobeNotes: string;
  propsEquipment: string[];
  directorNotes: string;
  weatherNotes?: string;
  conflictWarning?: string;
  createdAt: string;
}

export type VersionStatus = 
  | 'queued' 
  | 'footage_pending' 
  | 'ready_to_edit' 
  | 'editing' 
  | 'internal_review' 
  | 'client_review' 
  | 'revision_requested' 
  | 'approved' 
  | 'delivered';

export interface TimestampComment {
  id: string;
  userId: string;
  timestampSeconds: number; // e.g. 14 for 00:14
  timestampFormatted: string; // e.g. "00:14"
  text: string;
  createdAt: string;
  resolved?: boolean;
}

export interface EditVersion {
  id: string;
  projectId: string;
  versionNumber: number; // 1, 2, 3
  versionTag: string; // "v1.0 - Rough Cut", "v2.0 - Color Graded"
  submittedBy: string;
  submittedAt: string;
  videoUrl: string; // Simulated preview video URL
  thumbnailUrl: string;
  durationSeconds: number;
  status: VersionStatus;
  reviewUrl: string;
  driveLink: string;
  changeNotes: string;
  comments: TimestampComment[];
  internalApprovedBy?: string;
  internalApprovedAt?: string;
  clientApprovedBy?: string;
  clientApprovedAt?: string;
  finalDeliveryUrl?: string;
}

export type AssetCategory = 
  | 'brief' 
  | 'inspiration' 
  | 'shoot_planning' 
  | 'raw_footage' 
  | 'photos' 
  | 'editing' 
  | 'review' 
  | 'final_delivery';

export interface ProjectAsset {
  id: string;
  projectId: string;
  name: string;
  category: AssetCategory;
  folder: string;
  storageProvider: 'google_drive' | 'dropbox' | 'firebase' | 'external_url';
  sizeFormatted: string;
  url: string;
  visibility: 'internal' | 'client_visible';
  uploadedBy: string;
  createdAt: string;
  mimeType: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  actorId: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'project' | 'task' | 'room' | 'shoot' | 'version' | 'approval';
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'mention' | 'shoot_proposal' | 'draft_submitted' | 'revision_requested' | 'approved' | 'blocker';
  projectId?: string;
  read: boolean;
  createdAt: string;
}

export interface ClientProfile {
  id: string;
  businessId: string;
  companyName: string;
  brandName: string;
  contactPerson: string;
  email: string;
  phone: string;
  avatar: string;
  logoUrl?: string;
  status: 'active' | 'prospect' | 'on_hold';
  totalProjects: number;
  portalToken: string;
}

export interface LeaveRecord {
  id: string;
  userId: string;
  type: 'annual' | 'sick' | 'shoot_compensation' | 'unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

