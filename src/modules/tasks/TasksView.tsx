import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge } from '../../components/shared/PriorityBadge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { 
  CheckSquare, 
  Calendar, 
  LayoutList, 
  Kanban, 
  ExternalLink,
  Plus,
  AlertTriangle,
  X,
  Trash2,
  Search
} from 'lucide-react';
import { TaskStatus, ProjectPriority } from '../../types';

export const TasksView: React.FC = () => {
  const { tasks, projects, users, updateTaskStatus, deleteTask, openProject, createTask, currentUser } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // New Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [dueAt, setDueAt] = useState(new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([currentUser.id]);
  const [blockerReason, setBlockerReason] = useState('');

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchProject = projectFilter === 'all' || t.projectId === projectFilter;
    const matchSearch = !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchProject && matchSearch;
  });

  const columns: { status: TaskStatus; label: string }[] = [
    { status: 'todo', label: 'To Do' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'blocked', label: 'Blocked' },
    { status: 'in_review', label: 'Review' },
    { status: 'completed', label: 'Completed' }
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      projectId: projectId || projects[0]?.id || 'proj_general',
      title: title.trim(),
      description: description.trim(),
      assigneeIds: selectedAssigneeIds.length > 0 ? selectedAssigneeIds : [currentUser.id],
      status: blockerReason.trim() ? 'blocked' : 'todo',
      priority,
      dueAt: new Date(dueAt).toISOString(),
      blockerReason: blockerReason.trim() || undefined,
      checklists: [
        { id: 'c_' + Math.random().toString(36).substr(2, 6), text: 'Initial deliverable checklist', completed: false }
      ]
    });

    setIsNewTaskOpen(false);
    setTitle('');
    setDescription('');
    setBlockerReason('');
  };

  const toggleAssignee = (id: string) => {
    if (selectedAssigneeIds.includes(id)) {
      setSelectedAssigneeIds(selectedAssigneeIds.filter(i => i !== id));
    } else {
      setSelectedAssigneeIds([...selectedAssigneeIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Agency Master Task Queue
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {filteredTasks.length} Tasks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cross-project deliverables, blockers, and post-production checklists
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Task Button */}
          <button
            onClick={() => {
              if (projects.length > 0 && !projectId) {
                setProjectId(projects[0].id);
              }
              setIsNewTaskOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-white shadow-2xs">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-3 rounded-lg text-xs flex items-center gap-1 font-semibold ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 px-3 rounded-lg text-xs flex items-center gap-1 font-semibold ${
                viewMode === 'board' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50 text-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50 text-slate-700"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.code} — {p.title}</option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {tasks.length === 0 
                ? 'Your task queue is clear. Create your first production task to track deliverables.'
                : 'No tasks match the selected filters.'}
            </p>
          </div>
          <button
            onClick={() => {
              if (projects.length > 0 && !projectId) {
                setProjectId(projects[0].id);
              }
              setIsNewTaskOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List Mode */
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            const assignees = users.filter(u => (task.assigneeIds || []).includes(u.id));

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {project ? (
                      <button
                        onClick={() => openProject(task.projectId, 'tasks')}
                        className="text-xs font-mono font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1"
                      >
                        <span>{project.code}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        General
                      </span>
                    )}
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Status:</span>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1 bg-slate-50 text-slate-700"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="in_review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                    {currentUser.role !== 'client' && (
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-slate-600 mt-0.5">{task.description}</p>
                  )}
                  {task.blockerReason && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Blocker:</strong> {task.blockerReason}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {assignees.map(u => (
                        <img key={u.id} src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover border border-white" />
                      ))}
                    </div>
                    <span className="text-slate-600 text-[11px]">{assignees.map(u => u.name.split(' ')[0]).join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-1 font-medium text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due {new Date(task.dueAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Board Mode */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200 min-w-[220px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col.label}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-600">{colTasks.length}</span>
                </div>
                <div className="space-y-2.5">
                  {colTasks.map((t) => {
                    const project = projects.find(p => p.id === t.projectId);
                    return (
                      <div key={t.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-blue-600 font-bold">{project?.code || 'GEN'}</span>
                          <PriorityBadge priority={t.priority} />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 line-clamp-2">{t.title}</h5>
                        <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[10px]">
                          <span className="text-slate-400">{new Date(t.dueAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          <button
                            onClick={() => updateTaskStatus(t.id, 'completed')}
                            className="font-bold text-emerald-600 hover:text-emerald-800"
                          >
                            Done ✓
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Create New Task
                </h4>
              </div>
              <button onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Color grade outdoor b-roll sequences"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Description / Deliverable Specs
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide context, required deliverable parameters, or instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Target Project
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} — {p.title}</option>
                    ))}
                    {projects.length === 0 && (
                      <option value="proj_general">General Production</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Assign Crew Members
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 border border-slate-200 rounded-xl">
                  {users.map((u) => {
                    const isSelected = selectedAssigneeIds.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => toggleAssignee(u.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{u.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Blocker Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Awaiting client raw asset uploads"
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
