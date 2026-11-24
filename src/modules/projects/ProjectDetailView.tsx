import React, { useState } from 'react';
import { useApp, ProjectTabType } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { PriorityBadge } from '../../components/shared/PriorityBadge';
import { 
  ArrowLeft, 
  FolderKanban, 
  CheckSquare, 
  MessageSquare, 
  CalendarDays, 
  Folder, 
  Play, 
  History, 
  MoreVertical,
  Calendar,
  User,
  Info,
  X,
  Edit3,
  Trash2
} from 'lucide-react';

import { ProjectOverviewTab } from './tabs/ProjectOverviewTab';
import { ProjectTasksTab } from './tabs/ProjectTasksTab';
import { ProjectRoomsTab } from './tabs/ProjectRoomsTab';
import { ProjectScheduleTab } from './tabs/ProjectScheduleTab';
import { ProjectAssetsTab } from './tabs/ProjectAssetsTab';
import { ProjectApprovalsTab } from './tabs/ProjectApprovalsTab';
import { ProjectActivityTab } from './tabs/ProjectActivityTab';

export const ProjectDetailView: React.FC = () => {
  const { 
    selectedProjectId, 
    projects, 
    setCurrentView, 
    activeProjectTab, 
    setActiveProjectTab, 
    users,
    currentUser,
    updateProject,
    deleteProject
  } = useApp();

  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editProgress, setEditProgress] = useState(0);

  const project = projects.find(p => p.id === selectedProjectId) || projects[0];

  if (!project) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Project not found.</p>
        <button
          onClick={() => setCurrentView('projects')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  const lead = users.find(u => u.id === project.leadId);

  const tabs: { id: ProjectTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'rooms', label: 'Rooms & Chat', icon: MessageSquare },
    { id: 'schedule', label: 'Shoot & Call Sheet', icon: CalendarDays },
    { id: 'assets', label: 'Media Vault', icon: Folder },
    { id: 'approvals', label: 'Review & Approvals', icon: Play },
    { id: 'activity', label: 'Audit Log', icon: History }
  ];

  return (
    <div className="space-y-5">
      
      {/* Back Button & Project Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView('projects')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Projects</span>
          </button>

          <div className="flex items-center gap-2">
            {(currentUser.role === 'owner' || currentUser.role === 'head_manager') && (
              <>
                <button
                  onClick={() => {
                    setEditTitle(project.title);
                    setEditClientName(project.clientName);
                    setEditDeadline(project.deadline ? project.deadline.slice(0, 10) : '');
                    setEditProgress(project.progressPercent || 0);
                    setIsEditOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}
            {/* Mobile Sheet Trigger */}
            <button
              onClick={() => setIsMobileDetailsOpen(true)}
              className="sm:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>
        </div>

        {/* Project Meta Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {project.code}
              </span>
              <PriorityBadge priority={project.priority} />
              <StatusBadge status={project.status} size="sm" />
              <span className="text-xs font-semibold text-slate-500">
                Client: <strong className="text-slate-800">{project.clientName}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {project.title}
            </h1>
          </div>

          {/* Desktop Metadata Row */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 border-l border-slate-200 pl-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Producer</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <img src={lead?.avatar} alt={lead?.name} className="w-5 h-5 rounded-full object-cover" />
                <span className="font-bold text-slate-800">{lead?.name.split(' ')[0]}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Deadline</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {new Date(project.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Progress</span>
              <span className="font-bold text-blue-600 mt-0.5 block">{project.progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pt-3 border-t border-slate-100 -mb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeProjectTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveProjectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Mobile Details Bottom Sheet */}
      {isMobileDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl p-5 w-full max-w-lg space-y-4 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Project Specifications</h4>
              <button onClick={() => setIsMobileDetailsOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Code:</strong> {project.code}</p>
              <p><strong>Client:</strong> {project.clientName}</p>
              <p><strong>Lead Producer:</strong> {lead?.name}</p>
              <p><strong>Ratio:</strong> {project.aspectRatio}</p>
              <p><strong>Duration:</strong> {project.duration}</p>
              <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
              <p><strong>Progress:</strong> {project.progressPercent}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Tab Content */}
      <div>
        {activeProjectTab === 'overview' && <ProjectOverviewTab project={project} />}
        {activeProjectTab === 'tasks' && <ProjectTasksTab project={project} />}
        {activeProjectTab === 'rooms' && <ProjectRoomsTab project={project} />}
        {activeProjectTab === 'schedule' && <ProjectScheduleTab project={project} />}
        {activeProjectTab === 'assets' && <ProjectAssetsTab project={project} />}
        {activeProjectTab === 'approvals' && <ProjectApprovalsTab project={project} />}
        {activeProjectTab === 'activity' && <ProjectActivityTab project={project} />}
      </div>

      {/* Edit Project Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Edit Project Details</h4>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editTitle.trim()) return;
                updateProject(project.id, {
                  title: editTitle.trim(),
                  clientName: editClientName.trim() || project.clientName,
                  deadline: editDeadline ? new Date(editDeadline).toISOString() : project.deadline,
                  progressPercent: Math.min(100, Math.max(0, Number(editProgress) || 0))
                });
                setIsEditOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Client Name</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4">
            <h4 className="text-base font-bold text-slate-900">Delete Project Workspace?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong>{project.title}</strong> ({project.code})? All tasks and rooms linked to this project will also be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  deleteProject(project.id);
                  setIsDeleteConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

