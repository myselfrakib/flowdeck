import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Search, 
  Bell, 
  Plus, 
  ChevronDown, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Flame, 
  LogOut,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { RoleBadge } from '../shared/RoleBadge';
import { ProfilePhotoModal } from '../shared/ProfilePhotoModal';

export const TopBar: React.FC = () => {
  const { 
    activeBusiness, 
    setActiveBusiness, 
    businesses, 
    currentUser, 
    setCurrentUser, 
    users, 
    setIsSearchOpen, 
    setIsCreateProjectOpen,
    notifications,
    markNotificationAsRead,
    currentView,
    setCurrentView,
    setIsAuthModalOpen,
    firebaseUser,
    logout,
    updateUserAvatar,
    pendingInvite,
    setIsInviteModalOpen,
    acceptAgencyInvite,
    rejectAgencyInvite
  } = useApp();

  const [isBizMenuOpen, setIsBizMenuOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2 sm:py-2.5 safe-top">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Business Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsBizMenuOpen(!isBizMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 text-left"
            >
              <span className="text-xl sm:text-2xl">{activeBusiness.logo}</span>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                    {activeBusiness.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium leading-tight">
                  {activeBusiness.category}
                </span>
              </div>
            </button>

            {/* Business Dropdown */}
            {isBizMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Agency Workspace
                  </p>
                </div>
                {businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => {
                      setActiveBusiness(biz);
                      setIsBizMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                      biz.id === activeBusiness.id ? 'bg-blue-50/70' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{biz.logo}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{biz.name}</p>
                        <p className="text-[11px] text-slate-500">{biz.tagline}</p>
                      </div>
                    </div>
                    {biz.id === activeBusiness.id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search Bar Button (Full on desktop, compact on mobile) */}
        <div className="flex-1 max-w-md mx-1 sm:mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200/60 transition-all text-xs sm:text-sm group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
              <span className="truncate hidden sm:inline">Search projects, tasks, crew, rooms...</span>
              <span className="truncate sm:hidden text-slate-400">Search...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* Logged-In User Profile & Account Menu */}
          <div className="relative">
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all active:scale-95"
              title="Your Account & Role Profile"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover border border-white shadow-2xs shrink-0"
                />
                <span className="sm:hidden absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="text-left hidden md:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-[10px] text-blue-600 font-medium truncate block max-w-[120px]">
                  {currentUser.designation.split(' ')[0]} • {currentUser.role === 'owner' ? 'Owner' : currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </button>

            {/* User Account Popover */}
            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                      />
                      <button
                        onClick={() => {
                          setIsPersonaMenuOpen(false);
                          setIsAvatarModalOpen(true);
                        }}
                        className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        title="Change Profile Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {currentUser.name}
                        </p>
                        <RoleBadge role={currentUser.role} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <button
                        onClick={() => {
                          setIsPersonaMenuOpen(false);
                          setIsAvatarModalOpen(true);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold mt-0.5 inline-flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Edit Photo</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 text-xs space-y-2 border-b border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400 font-medium">Designation:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]">{currentUser.designation}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400 font-medium">Department:</span>
                    <span className="font-semibold text-slate-800">{currentUser.department || 'Operations'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400 font-medium">Agency Workspace:</span>
                    <span className="font-semibold text-blue-600">{activeBusiness.name}</span>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsPersonaMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out of FlowDeck</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Notifications ({unreadNotifs.length} new)
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">Clear all</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((notif) => {
                    const isInviteNotif = notif.title.toLowerCase().includes('invitation') && pendingInvite;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (isInviteNotif) {
                            setIsInviteModalOpen(true);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">{notif.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {notif.createdAt && notif.createdAt.includes('T') ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : notif.createdAt || 'Just now'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                        {isInviteNotif && (
                          <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                markNotificationAsRead(notif.id);
                                rejectAgencyInvite(pendingInvite);
                                setIsNotifOpen(false);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                markNotificationAsRead(notif.id);
                                acceptAgencyInvite(pendingInvite);
                                setIsNotifOpen(false);
                              }}
                              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
                            >
                              Confirm
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Project Button (Permission-checked) */}
          {currentUser.role !== 'client' && currentUser.role !== 'model' && (
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          )}

        </div>

      </div>

      {/* Profile Photo Edit & Zoom Crop Viewer Modal */}
      <ProfilePhotoModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentUser.avatar}
        onSave={(newAvatarUrl) => {
          updateUserAvatar(newAvatarUrl);
        }}
      />
    </header>
  );
};

