import React from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { RoleBadge } from '../../../components/shared/RoleBadge';

interface Props {
  project: Project;
}

export const ProjectOverviewTab: React.FC<Props> = ({ project }) => {
  const { users, currentUser, setActiveProjectTab, updateProjectStatus } = useApp();

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
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            Creative Strategy & Scope
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            Brief Summary
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            {project.briefSummary}
          </p>
        </div>

        {/* Deliverable Specifications Grid */}
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

        {/* Key Objectives Checklist */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-600" />
            Project Milestones & KPIs
          </h4>
          <div className="space-y-2">
            {(project.objectives || []).map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reference Links */}
        {(project.referenceLinks || []).length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Approved Client Reference Vault
            </span>
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
                  <span>{(link || '').includes('drive.google.com') ? 'Google Drive Media Folder' : 'External Review / Moodboard'}</span>
                </a>
              ))}
            </div>
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

