import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, FolderKanban, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { DeliverableType, ProjectPriority } from '../../types';

export const CreateProjectModal: React.FC = () => {
  const { 
    isCreateProjectOpen, 
    setIsCreateProjectOpen, 
    clients, 
    users, 
    currentUser, 
    createProject 
  } = useApp();

  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || 'client_aura');
  const [type, setType] = useState<DeliverableType>('brand_video');
  const [priority, setPriority] = useState<ProjectPriority>('high');
  const [deadline, setDeadline] = useState('2026-12-15');
  const [aspectRatio, setAspectRatio] = useState('9:16 & 16:9');
  const [duration, setDuration] = useState('60s Hero + 3x 15s Cutdowns');
  const [briefSummary, setBriefSummary] = useState('');
  const [leadId, setLeadId] = useState(users.find(u => u.role === 'head_manager')?.id || currentUser.id);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([currentUser.id]);
  const [refUrl, setRefUrl] = useState('https://drive.google.com/drive/folders/brand-references');

  if (!isCreateProjectOpen) return null;

  const selectedClient = clients.find(c => c.id === clientId) || clients[0];

  const handleToggleTeam = (id: string) => {
    if (selectedTeamIds.includes(id)) {
      setSelectedTeamIds(selectedTeamIds.filter(i => i !== id));
    } else {
      setSelectedTeamIds([...selectedTeamIds, id]);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createProject({
      title: title.trim(),
      clientName: selectedClient.brandName,
      clientId: selectedClient.id,
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Client Brand
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.brandName} ({c.contactPerson})
                      </option>
                    ))}
                  </select>
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
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assign Production Lead
                </label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200"
                >
                  {users.filter(u => u.role !== 'client').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assign Team & Crew Members
                </label>
                <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2">
                  {users.filter(u => u.role !== 'client').map((u) => {
                    const isSelected = selectedTeamIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleToggleTeam(u.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.designation}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
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

