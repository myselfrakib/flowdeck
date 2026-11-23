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
  Layers
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, tasks, rooms } = useApp();

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
    { id: 'client_portal', label: 'Client Approval View', icon: ExternalLink },
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Blueprint Callout */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/70">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Core Principle
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-snug">
            "One project. One workspace. One communication history. Complete visibility."
          </p>
        </div>
      </div>

    </aside>
  );
};

