import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { PriorityBadge } from '../../components/shared/PriorityBadge';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Calendar, 
  Users, 
  ArrowRight,
  Sparkles,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Project, ProjectStatus, DeliverableType } from '../../types';

export const ProjectListView: React.FC = () => {
  const { 
    projects, 
    openProject, 
    deleteProject,
    setIsCreateProjectOpen, 
    currentUser, 
    users,
    unreadProjectIds,
    markProjectSeen
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const filteredProjects = projects.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(q) ||
      (p.clientName || '').toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q);
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter === 'all' || p.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredProjects.length} active campaigns across client accounts
          </p>
        </div>

        {currentUser.role !== 'client' && currentUser.role !== 'model' && (
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter projects, code, or client..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50/50 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="planning">Planning</option>
            <option value="in_production">In Production</option>
            <option value="in_review">In Review</option>
            <option value="revisions">Revisions</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50/50 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Formats</option>
            <option value="brand_video">Brand Video</option>
            <option value="photoshoot">Photoshoot</option>
            <option value="commercial">Commercial</option>
            <option value="social_reel">Social Reel</option>
          </select>

          {/* Grid / Table View Toggle */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Grid Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => {
            const leadUser = users.find(u => u.id === project.leadId);
            const hasUnread = unreadProjectIds.includes(project.id);
            return (
              <div
                key={project.id}
                onClick={() => {
                  markProjectSeen(project.id);
                  openProject(project.id, 'overview');
                }}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0 mt-0.5">
                        #{index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            {project.title}
                          </h3>
                          {hasUnread && (
                            <span
                              title="New task or update added"
                              className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100 shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                          {project.clientName} <span className="text-slate-300 mx-1">•</span> <span className="font-mono text-slate-400">{project.code}</span>
                        </p>
                      </div>
                    </div>
                    {currentUser.role === 'owner' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                        title="Delete project"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                    <PriorityBadge priority={project.priority} />
                    <StatusBadge status={project.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {project.briefSummary}
                  </p>

                  {/* Format Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      Ratio: {project.aspectRatio}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      Duration: {project.duration}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Milestones Completed</span>
                      <span>{project.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${project.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Meta: Lead + Deadline */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      {leadUser && (
                        <img
                          src={leadUser.avatar}
                          alt={leadUser.name}
                          className="w-5 h-5 rounded-full object-cover"
                          title={`Lead: ${leadUser.name}`}
                        />
                      )}
                      <span className="truncate max-w-[100px]">{leadUser?.name.split(' ')[0] || 'Lead'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((p, idx) => {
                  const lead = users.find(u => u.id === p.leadId);
                  const hasUnread = unreadProjectIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        markProjectSeen(p.id);
                        openProject(p.id, 'overview');
                      }}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-500">#{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        <span className="inline-flex items-center gap-1.5">
                          {hasUnread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                          {p.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{p.title}</td>
                      <td className="py-3 px-4 text-slate-600">{p.clientName}</td>
                      <td className="py-3 px-4"><StatusBadge status={p.status} size="sm" /></td>
                      <td className="py-3 px-4 text-slate-600">{lead?.name || 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-1.5" style={{ width: `${p.progressPercent}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold">{p.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{new Date(p.deadline).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {currentUser.role === 'owner' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProjectToDelete(p);
                              }}
                              title="Delete project"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ArrowRight className="w-4 h-4 text-slate-400 inline" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or start a new production project.
          </p>
        </div>
      )}

      {/* Owner Delete Project Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Delete Project Workspace?</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong>{projectToDelete.title}</strong> ({projectToDelete.code})? All tasks and rooms linked to this project will also be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProject(projectToDelete.id);
                  setProjectToDelete(null);
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

