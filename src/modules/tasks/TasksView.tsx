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
  AlertTriangle
} from 'lucide-react';
import { TaskStatus } from '../../types';

export const TasksView: React.FC = () => {
  const { tasks, projects, users, updateTaskStatus, openProject, currentUser } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchProject = projectFilter === 'all' || t.projectId === projectFilter;
    return matchStatus && matchProject;
  });

  const columns: { status: TaskStatus; label: string }[] = [
    { status: 'todo', label: 'To Do' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'blocked', label: 'Blocked' },
    { status: 'in_review', label: 'Review' },
    { status: 'completed', label: 'Completed' }
  ];

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
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3 flex-wrap">
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

      {/* List Mode */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            const assignees = users.filter(u => task.assigneeIds.includes(u.id));

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openProject(task.projectId, 'tasks')}
                      className="text-xs font-mono font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1"
                    >
                      <span>{project?.code}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
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
                          <span className="text-[10px] font-mono text-blue-600 font-bold">{project?.code}</span>
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

    </div>
  );
};

