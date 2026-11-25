import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Sparkles, 
  FolderKanban, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Users,
  UserPlus,
  Plus,
  Phone,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { DeliverableType, ProjectPriority, UserRole } from '../../types';

export const CreateProjectModal: React.FC = () => {
  const { 
    isCreateProjectOpen, 
    setIsCreateProjectOpen, 
    clients, 
    users, 
    currentUser, 
    createProject,
    createTeamMember
  } = useApp();

  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [customBrandName, setCustomBrandName] = useState('');
  const [type, setType] = useState<DeliverableType>('brand_video');
  const [priority, setPriority] = useState<ProjectPriority>('high');
  const [deadline, setDeadline] = useState('2026-12-15');
  const [aspectRatio, setAspectRatio] = useState('9:16 & 16:9');
  const [duration, setDuration] = useState('60s Hero + 3x 15s Cutdowns');
  const [briefSummary, setBriefSummary] = useState('');
  const [leadId, setLeadId] = useState(users.find(u => u.role === 'head_manager')?.id || currentUser.id);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([currentUser.id]);
  const [refUrl, setRefUrl] = useState('https://drive.google.com/drive/folders/brand-references');

  // Add New Team Member State
  const [peopleTab, setPeopleTab] = useState<'team' | 'clients' | 'new'>('team');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDesignation, setNewMemberDesignation] = useState('Lead Video Editor');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('video_editor');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const quickSpecialtyTags = [
    'Lead Video Editor',
    'Cinematographer / DP',
    'Motion Graphics Designer',
    'Colorist & Conform',
    'Sound Designer',
    'Creative Director',
    'Production Assistant',
    'On-Camera Talent / Model'
  ];

  if (!isCreateProjectOpen) return null;

  const selectedClient = clientId === '__custom__' ? undefined : (clients.find(c => c.id === clientId) || clients[0]);
  const clientDisplayName = selectedClient?.brandName || customBrandName.trim() || 'Internal Production';
  const resolvedClientId = selectedClient?.id || 'client_direct';

  const handleToggleTeam = (id: string) => {
    if (selectedTeamIds.includes(id)) {
      setSelectedTeamIds(selectedTeamIds.filter(i => i !== id));
    } else {
      setSelectedTeamIds([...selectedTeamIds, id]);
    }
  };

  const handleAddNewMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMemberName.trim()) return;

    const cleanPhone = newMemberPhone.trim()
      ? (newMemberPhone.startsWith('+91') ? newMemberPhone.trim() : `+91 ${newMemberPhone.trim()}`)
      : '+91 98765 43210';

    const defaultAvatarByRole: Record<string, string> = {
      video_editor: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      videographer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      photographer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      graphic_designer: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      head_manager: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      model: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      owner: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      client: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      hr_manager: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      social_media_manager: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
    };

    const newMember = createTeamMember({
      name: newMemberName.trim(),
      designation: newMemberDesignation.trim() || 'Production Specialist',
      role: newMemberRole,
      accountType: 'employee',
      email: newMemberEmail.trim() || `${newMemberName.toLowerCase().replace(/\s+/g, '')}@agency.com`,
      phone: cleanPhone,
      avatar: defaultAvatarByRole[newMemberRole] || defaultAvatarByRole.creator,
      availability: 'available',
      bio: `${newMemberDesignation.trim() || 'Production crew'} involved in studio projects.`
    });

    // Auto-select in teamIds
    setSelectedTeamIds(prev => Array.from(new Set([...prev, newMember.id])));

    // Reset inputs
    setNewMemberName('');
    setNewMemberDesignation('Lead Video Editor');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setPeopleTab('team');
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createProject({
      title: title.trim(),
      clientName: clientDisplayName,
      clientId: resolvedClientId,
      leadId,
      type,
      status: 'planning',
      priority,
      deadline: new Date(deadline).toISOString(),
      aspectRatio,
      duration,
      targetPlatforms: ['Instagram Reels', 'TikTok', 'YouTube'],
      briefSummary: briefSummary || 'Commercial production project targeting multi-platform release with high-conversion visual storytelling.',
      objectives: [
        'Complete pre-production and lock shoot location permits',
        'Capture hero footage and product macro b-roll',
        'Secure client approval within 2 revision cycles'
      ],
      referenceLinks: [refUrl],
      teamIds: Array.from(new Set([...selectedTeamIds, leadId]))
    });

    setIsCreateProjectOpen(false);
    setStep(1);
    setTitle('');
    setBriefSummary('');
    setSelectedTeamIds([currentUser.id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Create Production Workspace
              </h3>
              <p className="text-[11px] text-slate-500">
                Step {step} of 3 • {step === 1 ? 'Project Brief' : step === 2 ? 'Deliverable Specs' : 'Crew & Launch'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateProjectOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinish} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Zenith Activewear — Urban Sprint SS26"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    For Which Client *
                  </label>
                  {clients.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={clientId || clients[0]?.id || '__custom__'}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 bg-white"
                      >
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.brandName} ({c.contactPerson})
                          </option>
                        ))}
                        <option value="__custom__">+ Enter Custom / New Client Name</option>
                      </select>
                      {clientId === '__custom__' && (
                        <input
                          type="text"
                          required
                          placeholder="Enter client / brand name..."
                          value={customBrandName}
                          onChange={(e) => setCustomBrandName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-blue-300 focus:outline-hidden focus:border-blue-600"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zenith Activewear (Client Brand)"
                      value={customBrandName}
                      onChange={(e) => setCustomBrandName(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Deliverable Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DeliverableType)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    <option value="brand_video">Brand Video</option>
                    <option value="social_reel">Social Reel Campaign</option>
                    <option value="photoshoot">Editorial Photoshoot</option>
                    <option value="commercial">Broadcast Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Creative Brief & Core Vision
                </label>
                <textarea
                  rows={3}
                  value={briefSummary}
                  onChange={(e) => setBriefSummary(e.target.value)}
                  placeholder="Summarize the creative direction, mood, color palette, and desired target audience emotional response..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="urgent">Urgent (Express Delivery)</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Standard / Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Aspect Ratio(s)
                  </label>
                  <input
                    type="text"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    placeholder="e.g. 9:16 (Vertical) & 16:9 (Horizontal)"
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Expected Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 60s Hero + 3x 15s Cutdowns"
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Cloud Storage / Moodboard Drive Link
                </label>
                <input
                  type="url"
                  value={refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports Google Drive, Dropbox, or Frame.io review links.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Automatic Workflow Provisioning
                </p>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  StudioFlow will automatically configure 8 organized folders (`01_Brief` through `08_Final_Delivery`), default workflow milestones, and separate Client Discussion and Internal Crew rooms.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Production Lead */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assign Production Lead / Producer
                </label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 font-medium"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.designation} {u.id === currentUser.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* People Involved (Who will get the work done) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      People Getting The Work Done ({selectedTeamIds.length})
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Assign crew, editors, camera specialists, or add new collaborators
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {selectedTeamIds.length} Assigned
                  </span>
                </div>

                {/* Selected Personnel Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px] items-center">
                  {selectedTeamIds.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No people assigned yet. Select from team or add below.</span>
                  ) : (
                    selectedTeamIds.map((id) => {
                      const u = users.find(user => user.id === id);
                      const name = u?.name || 'Assigned Crew';
                      const role = u?.designation || 'Specialist';
                      const isLead = id === leadId;

                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          {u?.avatar ? (
                            <img src={u.avatar} alt={name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold shrink-0">
                              {name.charAt(0)}
                            </span>
                          )}
                          <span className="truncate max-w-[110px]">{name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({role.split(' ')[0]})</span>
                          {isLead && (
                            <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1 rounded">LEAD</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleTeam(id)}
                            className="text-slate-400 hover:text-rose-500 ml-0.5"
                            title="Unassign from project"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Selector Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPeopleTab('team')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      peopleTab === 'team' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Agency Personnel ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeopleTab('clients')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      peopleTab === 'clients' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Clients ({clients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeopleTab('new')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
                      peopleTab === 'new' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Collaborator</span>
                  </button>
                </div>

                {/* Tab: Existing Team Roster */}
                {peopleTab === 'team' && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {users.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 text-center">No team members registered yet. Use "+ Add Collaborator" above.</p>
                    ) : (
                      users.map((u) => {
                        const isSelected = selectedTeamIds.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => handleToggleTeam(u.id)}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                              isSelected ? 'bg-blue-50/90 border border-blue-200 shadow-2xs' : 'bg-white hover:bg-slate-100 border border-slate-200/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                                  {u.id === currentUser.id && (
                                    <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1 rounded">You</span>
                                  )}
                                  {u.id === leadId && (
                                    <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1 rounded">LEAD</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{u.designation}</p>
                              </div>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab: Client Contacts */}
                {peopleTab === 'clients' && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {clients.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 text-center">No clients registered yet.</p>
                    ) : (
                      clients.map((c) => {
                        const isSelected = selectedTeamIds.includes(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleToggleTeam(c.id)}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                              isSelected ? 'bg-blue-50/90 border border-blue-200 shadow-2xs' : 'bg-white hover:bg-slate-100 border border-slate-200/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm shrink-0">
                                {c.avatar || '🏢'}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{c.contactPerson || c.brandName}</p>
                                <p className="text-[11px] text-slate-500 truncate">{c.companyName} • Client</p>
                              </div>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab: Add New Collaborator on the fly */}
                {peopleTab === 'new' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        <span>Add New Person to Studio Team</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Instantly assigns to project</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Liam O'Connor"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Role / Designation *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lead Video Editor"
                          value={newMemberDesignation}
                          onChange={(e) => setNewMemberDesignation(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-600"
                        />
                      </div>
                    </div>

                    {/* Quick Specialty Tags */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        Quick Pick Role:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {quickSpecialtyTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setNewMemberDesignation(tag);
                              if (tag.includes('Director') || tag.includes('Lead') || tag.includes('Producer')) {
                                setNewMemberRole('head_manager');
                              } else if (tag.includes('Model') || tag.includes('Talent')) {
                                setNewMemberRole('model');
                              } else if (tag.includes('Cinematographer') || tag.includes('DP') || tag.includes('Camera')) {
                                setNewMemberRole('videographer');
                              } else if (tag.includes('Graphics') || tag.includes('Designer')) {
                                setNewMemberRole('graphic_designer');
                              } else if (tag.includes('Photo')) {
                                setNewMemberRole('photographer');
                              } else {
                                setNewMemberRole('video_editor');
                              }
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                              newMemberDesignation === tag
                                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Phone Number</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-slate-400 text-xs font-mono font-bold">+91</span>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={newMemberPhone.startsWith('+91') ? newMemberPhone.replace(/^\+91\s*/, '') : newMemberPhone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewMemberPhone(val ? `+91 ${val}` : '');
                            }}
                            className="w-full text-xs pl-10 pr-2.5 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">System Account Role</label>
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                          <option value="video_editor">Video Editor / Post-Production</option>
                          <option value="videographer">Videographer / DP</option>
                          <option value="photographer">Photographer</option>
                          <option value="graphic_designer">Graphic & Motion Designer</option>
                          <option value="head_manager">Production Supervisor / Manager</option>
                          <option value="social_media_manager">Social Media Manager</option>
                          <option value="model">Talent / Model</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!newMemberName.trim()}
                      onClick={handleAddNewMember}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Person & Assign to Project</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !title.trim()) return;
                  setStep(step + 1);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize Workspace</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};

