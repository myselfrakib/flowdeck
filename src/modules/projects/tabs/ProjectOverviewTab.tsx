import React, { useState, useEffect } from 'react';
import { Project, User } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  Target, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Film, 
  Tv, 
  Clock, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Plus,
  X,
  Save
} from 'lucide-react';
import { RoleBadge } from '../../../components/shared/RoleBadge';

interface Props {
  project: Project;
}

export const ProjectOverviewTab: React.FC<Props> = ({ project }) => {
  const { users, currentUser, setActiveProjectTab, updateProjectStatus, updateProject } = useApp();

  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [briefSummary, setBriefSummary] = useState(project.briefSummary || '');
  const [aspectRatio, setAspectRatio] = useState(project.aspectRatio || '');
  const [duration, setDuration] = useState(project.duration || '');
  const [deadline, setDeadline] = useState(project.deadline ? project.deadline.slice(0, 10) : '');
  const [platformsText, setPlatformsText] = useState((project.targetPlatforms || []).join(', '));
  const [objectives, setObjectives] = useState<string[]>(project.objectives || []);
  const [newObjective, setNewObjective] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string[]>(project.referenceLinks || []);
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    setBriefSummary(project.briefSummary || '');
    setAspectRatio(project.aspectRatio || '');
    setDuration(project.duration || '');
    setDeadline(project.deadline ? project.deadline.slice(0, 10) : '');
    setPlatformsText((project.targetPlatforms || []).join(', '));
    setObjectives(project.objectives || []);
    setReferenceLinks(project.referenceLinks || []);
  }, [project]);

  const handleSaveBrief = () => {
    const cleanedObjectives = [
      ...objectives.map((o) => o.trim()).filter(Boolean),
      ...(newObjective.trim() ? [newObjective.trim()] : [])
    ];
    const cleanedLinks = [
      ...referenceLinks.map((l) => l.trim()).filter(Boolean),
      ...(newLink.trim() ? [newLink.trim()] : [])
    ];
    updateProject(project.id, {
      briefSummary: briefSummary.trim(),
      aspectRatio: aspectRatio.trim() || project.aspectRatio,
      duration: duration.trim() || project.duration,
      deadline: deadline ? new Date(deadline).toISOString() : project.deadline,
      targetPlatforms: platformsText.split(',').map((s) => s.trim()).filter(Boolean),
      objectives: cleanedObjectives,
      referenceLinks: cleanedLinks
    });
    setNewObjective('');
    setNewLink('');
    setIsEditingBrief(false);
  };

  const assignedUsers = users.filter(u => (project.teamIds || []).includes(u.id));
  const leadUser = users.find(u => u.id === project.leadId);

  return (
    <div className="space-y-6">
      
      {/* Blocker Banner if exists */}
      {project.blockerReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Active Project Blocker
            </h4>
            <p className="text-xs sm:text-sm text-rose-900 font-medium mt-0.5">
              {project.blockerReason}
            </p>
          </div>
          <button
            onClick={() => setActiveProjectTab('tasks')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors shrink-0"
          >
            Go to Tasks
          </button>
        </div>
      )}

      {/* Brief & Deliverables Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Creative Strategy & Scope
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Brief Summary
            </h3>
            {!isEditingBrief ? (
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                {project.briefSummary}
              </p>
            ) : (
              <textarea
                rows={3}
                value={briefSummary}
                onChange={(e) => setBriefSummary(e.target.value)}
                placeholder="Write creative brief summary..."
                className="w-full mt-2 text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-blue-600"
              />
            )}
          </div>

          {currentUser.role !== 'client' && (
            <div className="flex items-center gap-1.5 shrink-0">
              {!isEditingBrief ? (
                <button
                  type="button"
                  onClick={() => setIsEditingBrief(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingBrief(false)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBrief}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Deliverable Specifications Grid */}
        {!isEditingBrief ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Aspect Ratio</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{project.aspectRatio}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Deliverable Length</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{project.duration}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Final Deadline</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {new Date(project.deadline).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Target Platforms</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">
                {(project.targetPlatforms || []).join(', ') || 'Multi-Platform'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Aspect Ratio</label>
              <input type="text" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Deliverable Length</label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Final Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Platforms</label>
              <input type="text" value={platformsText} onChange={(e) => setPlatformsText(e.target.value)} placeholder="Instagram Reels, YouTube" className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200" />
            </div>
          </div>
        )}

        {/* Key Objectives Checklist */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-600" />
            Project Milestones & KPIs
          </h4>
          {!isEditingBrief ? (
            <div className="space-y-2">
              {(project.objectives || []).map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{obj}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => setObjectives((prev) => prev.map((item, idx) => (idx === i ? e.target.value : item)))}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setObjectives((prev) => prev.filter((_, idx) => idx !== i))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!newObjective.trim()) return;
                      setObjectives((prev) => [...prev, newObjective.trim()]);
                      setNewObjective('');
                    }
                  }}
                  placeholder="+ Add milestone / bullet point..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-dashed border-slate-300 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newObjective.trim()) return;
                    setObjectives((prev) => [...prev, newObjective.trim()]);
                    setNewObjective('');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reference Links */}
        {((project.referenceLinks || []).length > 0 || isEditingBrief) && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Approved Client Reference Vault
            </span>
            {!isEditingBrief ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {(project.referenceLinks || []).map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition-colors border border-blue-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{(link || '').includes('drive.google.com') ? 'Google Drive Media Folder' : 'External Review / Inspo'}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {referenceLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setReferenceLinks((prev) => prev.map((item, idx) => (idx === i ? e.target.value : item)))}
                      placeholder="https://drive.google.com/..."
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setReferenceLinks((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!newLink.trim()) return;
                        setReferenceLinks((prev) => [...prev, newLink.trim()]);
                        setNewLink('');
                      }
                    }}
                    placeholder="+ Add Google Drive folder or Inspo URL..."
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-dashed border-slate-300 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newLink.trim()) return;
                      setReferenceLinks((prev) => [...prev, newLink.trim()]);
                      setNewLink('');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two Column Layout: Team & Quick Stage Transition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Production Team Roster */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">
              Assigned Production Team ({assignedUsers.length})
            </h4>
            <span className="text-xs text-slate-400">Role-scoped</span>
          </div>

          <div className="space-y-2.5">
            {assignedUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-800">{u.name}</p>
                      {u.id === project.leadId && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 rounded">LEAD</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{u.designation}</p>
                  </div>
                </div>
                <RoleBadge role={u.role} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Lifecycle Status Stepper */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Workflow Lifecycle Pipeline
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Advance the project across the studio production stages:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { s: 'planning', label: 'Planning' },
                { s: 'in_production', label: 'In Production' },
                { s: 'in_review', label: 'In Review' },
                { s: 'approved', label: 'Approved' },
                { s: 'delivered', label: 'Delivered' }
              ].map((stage) => {
                const isCurrent = project.status === stage.s;
                return (
                  <button
                    key={stage.s}
                    onClick={() => updateProjectStatus(project.id, stage.s as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{stage.label}</span>
                    {isCurrent && <span className="block text-[10px] opacity-80">Current Stage</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Jump directly:</span>
            <button
              onClick={() => setActiveProjectTab('approvals')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View Review Player</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

