import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  MessageSquare, 
  CalendarDays, 
  MoreHorizontal,
  Users,
  Building,
  BarChart3,
  Settings,
  ShieldAlert,
  ExternalLink,
  X,
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';
import { RoleBadge } from '../shared/RoleBadge';
import { AppView } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    currentUser, 
    rooms, 
    selectedProjectId, 
    projects,
    activeProjectTab,
    setActiveProjectTab,
    logout
  } = useApp();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const unreadCount = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  const isHRAuthorized = currentUser.role === 'owner' || currentUser.role === 'hr_manager';
  const activeProject = projects.find(p => p.id === selectedProjectId);
  const isInsideProject = currentView === 'project_detail' && activeProject;

  const navItems = [
    { id: 'overview' as AppView, label: 'Home', icon: LayoutDashboard },
    { id: 'projects' as AppView, label: 'Projects', icon: FolderKanban },
    { id: 'rooms' as AppView, label: 'Inbox', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'calendar' as AppView, label: 'Calendar', icon: CalendarDays }
  ];

  const moreItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }>; description: string; hidden?: boolean }[] = [
    { id: 'tasks', label: 'All Tasks & Boards', icon: FolderKanban, description: 'Cross-project task list & board' },
    { id: 'team', label: 'Crew & Personnel', icon: Users, description: 'Directory with 1-tap call & SMS', hidden: currentUser.role === 'client' },
    { id: 'clients', label: 'Client Accounts', icon: Building, description: 'Brand portals & client contacts', hidden: currentUser.role === 'client' },
    { id: 'client_portal', label: 'Client Approval View', icon: ExternalLink, description: 'Zero-gossip client review screener', hidden: currentUser.role !== 'client' },
    { id: 'hr', label: 'HR & Availability', icon: ShieldAlert, description: 'Leave & attendance records', hidden: !isHRAuthorized },
    { id: 'reports', label: 'Operations & KPIs', icon: BarChart3, description: 'Delivery metrics & cycle times', hidden: currentUser.role === 'client' },
    { id: 'settings', label: 'Settings & Security', icon: Settings, description: 'RBAC matrix & storage provider', hidden: currentUser.role === 'client' }
  ];

  return (
    <>
      {/* Slide-up "More" Bottom Sheet for Mobile */}
      {isMoreOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div 
            className="bg-white rounded-t-[32px] border-t border-slate-200 shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />

            {/* Current Logged-in User Profile Card */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <RoleBadge role={currentUser.role} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  logout();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Exit</span>
              </button>
            </div>

            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Workspace Navigation</h3>
                <p className="text-[11px] text-slate-400">All agency management destinations</p>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of options with touch-friendly 52px+ height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {moreItems.filter(i => !i.hidden).map((item) => {
                const Icon = item.icon;
                const isSelected = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all min-h-[56px] active:scale-98 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{item.label}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{item.description}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent 5-Item Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        
        {/* Active Project Mobile Context Strip (Blueprint Principle: "The active project context should remain visible when navigating within a project.") */}
        {isInsideProject && (
          <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-mono font-bold bg-blue-600 px-1.5 py-0.2 rounded shrink-0">
                {activeProject.code}
              </span>
              <span className="truncate text-slate-200 text-[11px] font-medium">
                {activeProject.title}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded shrink-0 border border-sky-800">
              {activeProjectTab}
            </span>
          </div>
        )}

        <div className="grid grid-cols-5 items-center justify-items-center h-14 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'projects' && currentView === 'project_detail');

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsMoreOpen(false);
                }}
                className={`relative flex flex-col items-center justify-center w-full h-full min-h-[48px] transition-all select-none active:scale-95 ${
                  isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className="text-[10px] mt-0.5 leading-tight tracking-tight">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute top-1.5 right-3 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* 5th Tab: More */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center w-full h-full min-h-[48px] transition-all select-none active:scale-95 ${
              isMoreOpen ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isMoreOpen ? 'bg-blue-50 text-blue-600' : ''}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
