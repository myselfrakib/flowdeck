import React from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  MessageSquare, 
  CalendarDays, 
  Users, 
  Building, 
  ShieldAlert, 
  BarChart3, 
  Settings, 
  ExternalLink,
  Lock,
  Layers,
  LogOut
} from 'lucide-react';
import { RoleBadge } from '../shared/RoleBadge';

export const DesktopSidebar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, tasks, rooms, logout } = useApp();

  const isClient = currentUser.role === 'client';
  const isHRAuthorized = currentUser.role === 'owner' || currentUser.role === 'hr_manager';

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const unreadRoomsCount = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  interface NavItem {
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    disabled?: boolean;
    hidden?: boolean;
  }

  const primaryNav: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks & Boards', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'rooms', label: 'Messages & Rooms', icon: MessageSquare, badge: unreadRoomsCount > 0 ? unreadRoomsCount : undefined },
    { id: 'calendar', label: 'Shoot Calendar', icon: CalendarDays },
    { id: 'team', label: 'Team & Crew', icon: Users, hidden: isClient },
    { id: 'clients', label: 'Client Accounts', icon: Building, hidden: isClient },
    { id: 'client_portal', label: 'Client Approval View', icon: ExternalLink, hidden: !isClient },
    { id: 'hr', label: 'HR & Availability', icon: ShieldAlert, hidden: !isHRAuthorized },
    { id: 'reports', label: 'Operations & KPIs', icon: BarChart3, hidden: isClient },
    { id: 'settings', label: 'Settings & Security', icon: Settings, hidden: isClient }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 h-screen sticky top-0 shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#102A43] tracking-tight leading-none">
              FLOWDECK
            </h1>
            <p className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider mt-0.5">
              Agency Operating System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Workspace Navigation
        </p>

        {primaryNav.filter(item => !item.hidden).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'projects' && currentView === 'project_detail');

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors group ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Account & Sign Out */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-blue-600 font-medium truncate capitalize">
                {currentUser.role === 'owner' ? 'Agency Owner' : currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out of FlowDeck"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
};

