import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { PriorityBadge } from '../../../components/shared/PriorityBadge';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  LayoutList, 
  Kanban,
  X,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface Props {
  project: Project;
}

export const ProjectTasksTab: React.FC<Props> = ({ project }) => {
  const { 
    tasks, 
    updateTaskStatus, 
    toggleChecklistItem, 
    createTask, 
    createRoom,
    sendMessage,
    activeBusiness,
    setActiveProjectTab,
    setActiveRoomId,
    users, 
    currentUser 
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [mobileLane, setMobileLane] = useState<string>('all');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState(users[0]?.id || '');
  const [newPriority, setNewPriority] = useState<Task['priority']>('high');
  const [newDueAt, setNewDueAt] = useState('2026-11-28');

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const filteredTasks = projectTasks.filter(
    (t) => filterStatus === 'all' || t.status === filterStatus
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTask({
      projectId: project.id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      assigneeIds: [newAssignee],
      status: 'todo',
      priority: newPriority,
      dueAt: new Date(newDueAt).toISOString(),
      checklists: [
        { id: 'c1', text: 'Deliver work according to brief specifications', completed: false }
      ]
    });

    setNewTitle('');
    setNewDesc('');
    setIsNewTaskOpen(false);
  };

  const columns: { status: TaskStatus; label: string; count: number }[] = [
    { status: 'todo', label: 'To Do', count: projectTasks.filter(t => t.status === 'todo').length },
    { status: 'in_progress', label: 'In Progress', count: projectTasks.filter(t => t.status === 'in_progress').length },
    { status: 'blocked', label: 'Blocked', count: projectTasks.filter(t => t.status === 'blocked').length },
    { status: 'in_review', label: 'Review', count: projectTasks.filter(t => t.status === 'in_review').length },
    { status: 'completed', label: 'Completed', count: projectTasks.filter(t => t.status === 'completed').length }
  ];

  return (
    <div className="space-y-5">
      
      {/* Task Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Task States ({projectTasks.length})</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold ${
                viewMode === 'list' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold ${
                viewMode === 'board' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        </div>

        {currentUser.role !== 'client' && (
          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* New Task Inline Modal */}
      {isNewTaskOpen && (
        <form onSubmit={handleCreateTask} className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">Add New Production Task</h4>
            <button type="button" onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <input
              type="text"
              required
              placeholder="Task title (e.g. Conform color grade LUT on 6K RED clips)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-hidden"
            />
          </div>
          <div>
            <textarea
              rows={2}
              placeholder="Detailed description, deliverable specifications, or frame numbers..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Assignee</label>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200"
              >
                {users.filter(u => u.role !== 'client').map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.designation})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Due Date</label>
              <input
                type="date"
                value={newDueAt}
                onChange={(e) => setNewDueAt(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewTaskOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">No tasks in this workspace</h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
              {projectTasks.length === 0
                ? 'Create production tasks, post-production checklists, and assign crew members.'
                : 'No tasks match the active filter.'}
            </p>
          </div>
          {currentUser.role !== 'client' && (
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Task</span>
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const assignees = users.filter(u => (task.assigneeIds || []).includes(u.id));
            const completedCount = task.checklists.filter(c => c.completed).length;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} size="sm" />
                    {task.sourceMessageId && (
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-mono">
                        Chat Converted
                      </span>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Move to:</span>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1 bg-slate-50 text-slate-700 focus:outline-hidden"
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
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  {task.blockerReason && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Blocker:</strong> {task.blockerReason}</span>
                    </div>
                  )}
                </div>

                {/* Subtasks Checklists */}
                {task.checklists.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>Subtask Verification ({completedCount}/{task.checklists.length})</span>
                    </div>
                    {task.checklists.map((chk) => (
                      <label
                        key={chk.id}
                        className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={chk.completed}
                          onChange={() => toggleChecklistItem(task.id, chk.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className={chk.completed ? 'line-through text-slate-400' : ''}>
                          {chk.text}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Footer Meta: Assignees & Due Date */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {assignees.map((u) => (
                        <img
                          key={u.id}
                          src={u.avatar}
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover border-2 border-white"
                          title={u.name}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-600">
                      {assignees.map(u => u.name.split(' ')[0]).join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const memberIds = Array.from(new Set([currentUser.id, ...(task.assigneeIds || [])]));
                        const created = createRoom({
                          businessId: activeBusiness.id,
                          projectId: project.id,
                          name: `Task: ${task.title.slice(0, 32)}`,
                          description: task.description || `Discussion room for task "${task.title}"`,
                          roomType: 'internal_planning',
                          visibility: 'internal',
                          memberIds,
                          lastMessageText: `Task room opened for "${task.title}"`,
                          lastMessageTime: 'Just now'
                        });
                        sendMessage(created.id, `Created room for task: "${task.title}" (Due ${new Date(task.dueAt).toLocaleDateString()}).`);
                        setActiveRoomId(created.id);
                        setActiveProjectTab('rooms');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Room & Chat</span>
                    </button>
                    <div className="flex items-center gap-1 text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due {new Date(task.dueAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Board Mode View (Kanban) */
        <div className="space-y-3">
          {/* Mobile Lane Selector Tabs */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setMobileLane('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                mobileLane === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
              }`}
            >
              All Lanes ({projectTasks.length})
            </button>
            {columns.map((c) => (
              <button
                key={c.status}
                onClick={() => setMobileLane(c.status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  mobileLane === c.status ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-4">
            {columns.filter(col => mobileLane === 'all' || col.status === mobileLane).map((col) => {
              const colTasks = projectTasks.filter(t => t.status === col.status);
              return (
                <div key={col.status} className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 min-w-[220px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>

                <div className="space-y-2.5">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={t.priority} />
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(t.dueAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 line-clamp-2">
                        {t.title}
                      </h5>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="flex -space-x-1">
                          {users.filter(u => (t.assigneeIds || []).includes(u.id)).map(u => (
                            <img key={u.id} src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover border border-white" />
                          ))}
                        </div>
                        {/* Quick complete / move */}
                        {t.status !== 'completed' ? (
                          <button
                            onClick={() => updateTaskStatus(t.id, 'completed')}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
                          >
                            Done ✓
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold">Done ✓</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};

