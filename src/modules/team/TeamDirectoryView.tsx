import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Plus, 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck,
  X
} from 'lucide-react';
import { UserRole } from '../../types';

export const TeamDirectoryView: React.FC = () => {
  const { users, currentUser, addToast, createTeamMember } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('videographer');

  const filteredUsers = users.filter((u) => {
    if (u.role === 'client') return false; // clients are in Client Directory
    const matchSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.designation.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const cleanPhone = invitePhone.trim()
      ? (invitePhone.startsWith('+91') ? invitePhone.trim() : `+91 ${invitePhone.trim()}`)
      : '+91 98765 43210';

    const roleDesignations: Record<string, string> = {
      videographer: 'Lead Videographer / DP',
      photographer: 'Production Photographer',
      video_editor: 'Video Editor & Colorist',
      graphic_designer: 'Visual & Motion Designer',
      model: 'On-Camera Talent / Model',
      social_media_manager: 'Social Content Manager',
      head_manager: 'Production Supervisor'
    };

    const sysRole: UserRole = 
      inviteRole === 'head_manager' ? 'head_manager' :
      inviteRole === 'model' ? 'model' :
      inviteRole === 'photographer' ? 'photographer' :
      inviteRole === 'video_editor' ? 'video_editor' :
      inviteRole === 'graphic_designer' ? 'graphic_designer' :
      inviteRole === 'social_media_manager' ? 'social_media_manager' : 'videographer';

    const computedName = inviteName.trim() || inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    createTeamMember({
      name: computedName,
      email: inviteEmail.trim(),
      phone: cleanPhone,
      role: sysRole,
      accountType: 'employee',
      designation: roleDesignations[inviteRole] || 'Creative Personnel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      availability: 'available',
      bio: `${roleDesignations[inviteRole] || 'Specialist'} at agency.`
    });

    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Agency Team & Production Crew
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {filteredUsers.length} Active Personnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Internal creators, full-time staff, and authorized freelance contractors
          </p>
        </div>

        {currentUser.role !== 'client' && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Filter and Phone Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone number, or title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50/50 text-slate-700 focus:outline-hidden w-full sm:w-auto"
        >
          <option value="all">All Roles</option>
          <option value="head_manager">Management</option>
          <option value="videographer">Videographers</option>
          <option value="photographer">Photographers</option>
          <option value="video_editor">Video Editors</option>
          <option value="graphic_designer">Graphic Designers</option>
          <option value="model">Talent / Models</option>
        </select>
      </div>

      {/* Team Cards Grid / Empty State */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No team members yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start building your creative production crew by inviting videographers, photographers, editors, and managers.
            </p>
          </div>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite First Creator</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const availabilityStyles = {
            available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            on_shoot: 'bg-blue-50 text-blue-700 border-blue-200',
            busy: 'bg-amber-50 text-amber-700 border-amber-200',
            on_leave: 'bg-slate-100 text-slate-500 border-slate-200'
          }[user.availability];

          return (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {user.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{user.designation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <RoleBadge role={user.role} size="sm" />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${availabilityStyles}`}>
                    {user.availability.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {user.bio && (
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-700">{user.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Invite Creator or Employee
              </h4>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Liam O'Connor"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@agency.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Phone (Optional for SMS call sheets)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-semibold text-slate-500 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={invitePhone.startsWith('+91') ? invitePhone.replace(/^\+91\s*/, '') : invitePhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInvitePhone(val ? `+91 ${val}` : '');
                    }}
                    className="w-full text-xs sm:text-sm pl-11 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Assigned Agency Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="videographer">Videographer</option>
                  <option value="photographer">Photographer</option>
                  <option value="video_editor">Video Editor</option>
                  <option value="graphic_designer">Graphic Designer</option>
                  <option value="model">Model / On-Screen Talent</option>
                  <option value="social_media_manager">Social Media Manager</option>
                  <option value="head_manager">Head Manager</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

