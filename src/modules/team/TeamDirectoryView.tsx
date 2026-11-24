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
  Sparkles,
  MessageSquare,
  Smartphone,
  UserCheck,
  Trash2,
  Clock,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { User, UserRole, AgencyInvitation } from '../../types';

export const TeamDirectoryView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    activeBusiness, 
    addToast, 
    sendAgencyInviteNotification,
    invitations,
    createAgencyInvitation,
    revokeAgencyInvitation,
    removeEmployee
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Deletion and revocation confirmation modals
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = useState<AgencyInvitation | null>(null);

  // Invite form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('videographer');

  // Success Invite & Download Modal State
  const [inviteSuccessModal, setInviteSuccessModal] = useState<{
    name: string;
    email: string;
    phone: string;
    role: string;
    downloadUrl: string;
    joinUrl: string;
    mailtoUrl: string;
    whatsappUrl: string;
    smsUrl: string;
    emailSubject: string;
    emailBody: string;
    messageText: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (u.role === 'client') return false; // clients are in Client Directory
    if (u.membershipStatus === 'pending') return false; // pending members are in Pending tab
    const matchSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.designation.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const pendingInvites = (invitations || []).filter((inv) => {
    const isBiz = inv.bizId === activeBusiness.id;
    const isPending = inv.status === 'pending';
    const matchSearch = 
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.phone.includes(search) ||
      inv.email.toLowerCase().includes(search.toLowerCase()) ||
      inv.role.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || inv.sysRole === roleFilter;
    return isBiz && isPending && matchSearch && matchRole;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const normalizedEmail = inviteEmail.trim().toLowerCase();
    const existingEmployee = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);

    const cleanPhone = invitePhone.trim()
      ? (invitePhone.startsWith('+91') ? invitePhone.trim() : `+91 ${invitePhone.trim()}`)
      : (existingEmployee?.phone || '+91 98765 43210');

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

    const computedName = inviteName.trim() || (existingEmployee ? existingEmployee.name : inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    const assignedRole = roleDesignations[inviteRole] || 'Creative Specialist';
    const inviteToken = 'inv_' + Math.random().toString(36).substr(2, 9);

    // Create pending agency invitation in Firestore & local state.
    // Notice: Do NOT immediately add to active users roster!
    // The employee will only be added to active users once they confirm & accept.
    createAgencyInvitation({
      bizId: activeBusiness.id,
      agencyName: activeBusiness.name,
      agencyLogo: activeBusiness.logo || '🎬',
      name: computedName,
      email: normalizedEmail,
      phone: cleanPhone,
      role: assignedRole,
      sysRole: sysRole,
      token: inviteToken,
      invitedBy: currentUser.id
    });

    if (existingEmployee) {
      // Send confirm join agency notification directly to the employee's notification inbox
      sendAgencyInviteNotification(existingEmployee, assignedRole, activeBusiness, inviteToken);
      addToast(
        'Invitation Sent to Employee',
        `An in-app confirmation notification to join ${activeBusiness.name} as ${assignedRole} was sent to ${existingEmployee.name} (${existingEmployee.email}).`,
        'success'
      );
    }

    // Prepare App Download & Workspace Join Email and Phone Messages
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    const downloadUrl = 'https://flowdeck.app/download';
    const origin = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://flowdeck.app';
    const joinUrl = `${origin}?join_biz=${encodeURIComponent(activeBusiness.id)}&agency_name=${encodeURIComponent(activeBusiness.name)}&agency_logo=${encodeURIComponent(activeBusiness.logo || '🎬')}&role=${encodeURIComponent(assignedRole)}&token=${inviteToken}&email=${encodeURIComponent(normalizedEmail)}`;
    const emailSubject = `Invitation to join ${activeBusiness.name} on FlowDeck`;
    const emailBody = `Hi ${computedName},\n\nYou have been invited to join ${activeBusiness.name} on FlowDeck as ${assignedRole}.\n\n1. Accept your invitation and enter the agency workspace:\n${joinUrl}\n\n2. Download the FlowDeck App (iOS, Android, or Desktop):\n${downloadUrl}\n\nInvited by: ${currentUser.name} (${activeBusiness.name})`;
    const mailtoUrl = `mailto:${encodeURIComponent(normalizedEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const messageText = `Hi ${computedName}, you've been invited by ${activeBusiness.name} to join our studio operations workspace on FlowDeck as ${assignedRole}.\n\n1. Join Workspace: ${joinUrl}\n2. Download App: ${downloadUrl}`;
    const whatsappUrl = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(messageText)}` : '';
    const smsUrl = phoneDigits ? `sms:${phoneDigits}?body=${encodeURIComponent(messageText)}` : '';

    // Set success modal state
    setInviteSuccessModal({
      name: computedName,
      email: normalizedEmail,
      phone: cleanPhone,
      role: assignedRole,
      downloadUrl,
      joinUrl,
      mailtoUrl,
      whatsappUrl,
      smsUrl,
      emailSubject,
      emailBody,
      messageText
    });

    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
  };

  const handleCopyInviteLink = () => {
    if (!inviteSuccessModal) return;
    const textToCopy = `Hi ${inviteSuccessModal.name},\n\nYou're invited to join ${activeBusiness.name} on FlowDeck as ${inviteSuccessModal.role}!\nDirect Join Link: ${inviteSuccessModal.joinUrl}\nDownload FlowDeck App: ${inviteSuccessModal.downloadUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    addToast('Invite Link Copied', `Direct join link copied for ${inviteSuccessModal.name}.`, 'success');
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

      {/* Tab Switcher: Active Personnel vs Pending Confirmations */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Personnel</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              activeTab === 'active' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {filteredUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Confirmations</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white'
                : pendingInvites.length > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {pendingInvites.length}
          </span>
        </button>
      </div>

      {/* Filter and Phone Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone number, or title..."
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

      {/* Quick Add By Email Search Banner */}
      {search.trim().length >= 2 && users.find(u => u.email.toLowerCase().includes(search.toLowerCase().trim())) && (
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-slate-800">
              Found FlowDeck employee account: <strong className="text-blue-700">{users.find(u => u.email.toLowerCase().includes(search.toLowerCase().trim()))?.name}</strong> ({users.find(u => u.email.toLowerCase().includes(search.toLowerCase().trim()))?.email})
            </p>
          </div>
          <button
            onClick={() => {
              const u = users.find(user => user.email.toLowerCase().includes(search.toLowerCase().trim()));
              if (u) {
                setInviteEmail(u.email);
                setInviteName(u.name);
                setInvitePhone(u.phone);
                setIsInviteOpen(true);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            Invite to {activeBusiness.name}
          </button>
        </div>
      )}

      {/* TAB 1: ACTIVE PERSONNEL */}
      {activeTab === 'active' && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No active team members found</h3>
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

                const isOwner = currentUser.role === 'owner';
                const canRemove = isOwner && user.id !== currentUser.id && user.role !== 'owner';

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

                        {canRemove && (
                          <button
                            onClick={() => setEmployeeToDelete(user)}
                            title={`Remove ${user.name} from agency`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
        </>
      )}

      {/* TAB 2: PENDING CONFIRMATIONS */}
      {activeTab === 'pending' && (
        <>
          {pendingInvites.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No pending join confirmations</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Invitations awaiting confirmation by invited creators or employees will appear here until they confirm and join the agency.
                </p>
              </div>
              <button
                onClick={() => setIsInviteOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite New Creator or Employee</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingInvites.map((invite) => {
                const origin = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://flowdeck.app';
                const joinUrl = `${origin}?join_biz=${encodeURIComponent(invite.bizId)}&agency_name=${encodeURIComponent(invite.agencyName)}&agency_logo=${encodeURIComponent(invite.agencyLogo || '🎬')}&role=${encodeURIComponent(invite.role)}&token=${invite.token}&email=${encodeURIComponent(invite.email)}`;
                const downloadUrl = 'https://flowdeck.app/download';
                const emailSubject = `Invitation to join ${invite.agencyName} on FlowDeck`;
                const emailBody = `Hi ${invite.name},\n\nYou have been invited to join ${invite.agencyName} on FlowDeck as ${invite.role}.\n\n1. Accept your invitation and enter the agency workspace:\n${joinUrl}\n\n2. Download the FlowDeck App:\n${downloadUrl}\n\nInvited by: ${currentUser.name} (${activeBusiness.name})`;
                const mailtoUrl = `mailto:${encodeURIComponent(invite.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                const phoneDigits = invite.phone.replace(/\D/g, '');
                const messageText = `Hi ${invite.name}, you've been invited by ${activeBusiness.name} to join our studio operations workspace on FlowDeck as ${invite.role}.\n\n1. Join Workspace: ${joinUrl}\n2. Download App: ${downloadUrl}`;
                const whatsappUrl = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(messageText)}` : '';
                const smsUrl = phoneDigits ? `sms:${phoneDigits}?body=${encodeURIComponent(messageText)}` : '';

                return (
                  <div
                    key={invite.id}
                    className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-base shadow-2xs">
                            {invite.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">
                              {invite.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">{invite.role}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setInviteToRevoke(invite)}
                          title="Cancel & revoke invitation"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Awaiting Confirmation
                        </span>
                        <RoleBadge role={invite.sysRole} size="sm" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-700">{invite.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{invite.email}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`Hi ${invite.name},\n\nYou're invited to join ${activeBusiness.name} on FlowDeck as ${invite.role}!\nJoin Link: ${joinUrl}\nDownload App: ${downloadUrl}`);
                          addToast('Join Link Copied', `Direct invitation link copied for ${invite.name}.`, 'success');
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </button>
                      <button
                        onClick={() => {
                          setInviteSuccessModal({
                            name: invite.name,
                            email: invite.email,
                            phone: invite.phone,
                            role: invite.role,
                            downloadUrl,
                            joinUrl,
                            mailtoUrl,
                            whatsappUrl,
                            smsUrl,
                            emailSubject,
                            emailBody,
                            messageText
                          });
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Resend</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Remove Employee Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Remove Employee from Agency?</h4>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{employeeToDelete.name}</strong> ({employeeToDelete.designation}) from <strong>{activeBusiness.name}</strong>? They will immediately lose access to this agency workspace, tasks, and shoots.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeEmployee(employeeToDelete.id);
                  setEmployeeToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Remove Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Invitation Confirmation Modal */}
      {inviteToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 bg-amber-50 rounded-xl">
                <UserX className="w-6 h-6 text-rose-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Cancel & Revoke Invitation?</h4>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cancel invitation for <strong className="text-slate-900">{inviteToRevoke.name}</strong> ({inviteToRevoke.email})? Their join link will be invalidated.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setInviteToRevoke(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Keep Invitation
              </button>
              <button
                onClick={() => {
                  revokeAgencyInvitation(inviteToRevoke.id);
                  setInviteToRevoke(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Revoke Invitation
              </button>
            </div>
          </div>
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setInviteEmail(val);
                    const match = users.find(u => u.email.trim().toLowerCase() === val.trim().toLowerCase());
                    if (match) {
                      if (!inviteName) setInviteName(match.name);
                      if (!invitePhone && match.phone) setInvitePhone(match.phone);
                    }
                  }}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Phone (Auto-prefixed with +91)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Assigned Agency Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 bg-white"
                >
                  <option value="videographer">Videographer / DP</option>
                  <option value="photographer">Photographer</option>
                  <option value="video_editor">Video Editor</option>
                  <option value="graphic_designer">Graphic Designer</option>
                  <option value="head_manager">Head Manager / Supervisor</option>
                  <option value="model">On-Camera Talent / Model</option>
                  <option value="social_media_manager">Social Media Manager</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending Confirmation Workflow</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Submitting will create an invitation with links to join {activeBusiness.name} and download the FlowDeck app. The creator will only be added to your active personnel roster once they confirm and accept.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Invitation & Download Delivery Modal */}
      {inviteSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Invitation Created — Awaiting Confirmation
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Official invitation generated for {activeBusiness.name}
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
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                  {inviteSuccessModal.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{inviteSuccessModal.name}</p>
                  <p className="text-[11px] text-slate-500">{inviteSuccessModal.role}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                    <span className="text-blue-600">{inviteSuccessModal.email}</span>
                    <span>•</span>
                    <span>{inviteSuccessModal.phone}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                PENDING CONFIRMATION
              </span>
            </div>

            {/* Quick Email & Message Delivery Actions */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Deliver Download & Invite to Personnel:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={inviteSuccessModal.mailtoUrl}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>Send Email</span>
                </a>

                {inviteSuccessModal.whatsappUrl ? (
                  <a
                    href={inviteSuccessModal.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Download Link Card */}
            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">FlowDeck App Download</p>
                  <p className="text-[10px] text-blue-600 font-mono">https://flowdeck.app/download</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">iOS • Android • Web</span>
            </div>

            {/* Email Body Preview */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email / Message Preview:
              </span>
              <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
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
