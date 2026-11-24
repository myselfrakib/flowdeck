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
  X,
  Send,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types';

export const TeamDirectoryView: React.FC = () => {
  const { users, currentUser, activeBusiness, addToast, createTeamMember } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('videographer');

  // Success Invite & Download Modal State
  const [inviteSuccessModal, setInviteSuccessModal] = useState<{
    name: string;
    email: string;
    role: string;
    downloadUrl: string;
    joinUrl: string;
    mailtoUrl: string;
    emailSubject: string;
    emailBody: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

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

    const defaultAvatarByRole: Record<string, string> = {
      videographer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      video_editor: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      photographer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      graphic_designer: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      head_manager: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      model: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      social_media_manager: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
    };

    createTeamMember({
      name: computedName,
      email: inviteEmail.trim(),
      phone: cleanPhone,
      role: sysRole,
      accountType: 'employee',
      designation: roleDesignations[inviteRole] || 'Creative Personnel',
      avatar: defaultAvatarByRole[inviteRole] || defaultAvatarByRole.videographer,
      availability: 'available',
      bio: `${roleDesignations[inviteRole] || 'Specialist'} at ${activeBusiness.name}.`
    });

    // Prepare App Download & Workspace Join Email
    const inviteToken = 'inv_' + Math.random().toString(36).substr(2, 9);
    const downloadUrl = 'https://flowdeck.app/download';
    const joinUrl = `https://flowdeck.app/join?biz=${activeBusiness.id}&token=${inviteToken}&email=${encodeURIComponent(inviteEmail.trim())}`;
    const emailSubject = `Invitation to join ${activeBusiness.name} on FlowDeck`;
    const emailBody = `Hi ${computedName},\n\nYou have been invited to join ${activeBusiness.name} on FlowDeck as ${roleDesignations[inviteRole] || 'Creative Specialist'}.\n\n1. Download the FlowDeck App (iOS, Android, or Desktop):\n${downloadUrl}\n\n2. Accept your invite and enter the agency workspace:\n${joinUrl}\n\nInvited by: ${currentUser.name} (${activeBusiness.name})`;
    const mailtoUrl = `mailto:${encodeURIComponent(inviteEmail.trim())}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Set success modal state
    setInviteSuccessModal({
      name: computedName,
      email: inviteEmail.trim(),
      role: roleDesignations[inviteRole] || 'Creative Personnel',
      downloadUrl,
      joinUrl,
      mailtoUrl,
      emailSubject,
      emailBody
    });

    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
  };

  const handleCopyInviteLink = () => {
    if (!inviteSuccessModal) return;
    const textToCopy = `Hi ${inviteSuccessModal.name},\n\nJoin ${activeBusiness.name} on FlowDeck!\nDownload App: ${inviteSuccessModal.downloadUrl}\nDirect Join Link: ${inviteSuccessModal.joinUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    addToast('Invite Link Copied', 'Download link and workspace token copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Invite Creator or Employee
                </h4>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam O'Connor"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@agency.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Phone (Auto-prefixed with +91)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-semibold text-slate-400 select-none font-mono">
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
                    className="w-full text-xs sm:text-sm pl-11 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Assigned Agency Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="videographer">Videographer / DP</option>
                  <option value="video_editor">Video Editor / Post-Production</option>
                  <option value="photographer">Photographer</option>
                  <option value="graphic_designer">Graphic & Motion Designer</option>
                  <option value="model">On-Camera Talent / Model</option>
                  <option value="social_media_manager">Social Media Manager</option>
                  <option value="head_manager">Production Supervisor / Manager</option>
                </select>
              </div>

              {/* Onboarding info callout */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Download className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Automatic Onboarding & App Download</span>
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Submitting generates an official email invitation with agency join credentials and links to download the FlowDeck app.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email & Add to Agency</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Prepared & App Download Modal */}
      {inviteSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Invitation Sent & Added to Agency!
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Personnel profile created for {activeBusiness.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setInviteSuccessModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Added Personnel Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                  {inviteSuccessModal.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{inviteSuccessModal.name}</p>
                  <p className="text-[11px] text-slate-500">{inviteSuccessModal.role}</p>
                  <p className="text-[10px] text-blue-600 font-mono mt-0.5">{inviteSuccessModal.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ACTIVE PERSONNEL
              </span>
            </div>

            {/* Quick Email Actions */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Deliver Download & Invite Email:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={inviteSuccessModal.mailtoUrl}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open in Mail App</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Download & Invite Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Email Body Preview */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email Invitation Preview:
              </span>
              <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                <span className="font-bold text-slate-900 block mb-1">
                  Subject: {inviteSuccessModal.emailSubject}
                </span>
                {inviteSuccessModal.emailBody}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInviteSuccessModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

