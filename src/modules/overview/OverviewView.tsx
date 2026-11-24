import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { PriorityBadge } from '../../components/shared/PriorityBadge';
import { 
  FolderKanban, 
  CalendarDays, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Play, 
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { 
    currentUser, 
    projects, 
    tasks, 
    shootEvents, 
    editVersions, 
    openProject, 
    setCurrentView,
    updateTaskStatus,
    setIsCreateProjectOpen
  } = useApp();

  // Metrics calculation
  const activeProjects = projects.filter(p => p.status !== 'delivered');
  const upcomingShoots = shootEvents.filter(s => s.status !== 'completed' && s.status !== 'cancelled');
  const pendingApprovals = editVersions.filter(v => v.status === 'client_review' || v.status === 'internal_review');
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  
  // Personal assigned tasks
  const myTasks = tasks.filter(t => t.assigneeIds.includes(currentUser.id) && t.status !== 'completed');

  return (
    <div className="space-y-6">
      
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeProjects.length} active projects • {upcomingShoots.length} shoots scheduled • {pendingApprovals.length} cuts in review
          </p>
        </div>

        {currentUser.role !== 'client' && (
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <span>+ New Project</span>
          </button>
        )}
      </div>

      {/* Urgent Blocker Alert if any */}
      {blockedTasks.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Critical Production Blocker
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                  Needs Resolution
                </span>
              </div>
              <p className="text-xs text-rose-900 font-medium mt-1">
                {blockedTasks[0].title}: {blockedTasks[0].blockerReason || 'Production delayed pending approval.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => openProject(blockedTasks[0].projectId, 'tasks')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shrink-0 transition-colors"
          >
            Resolve Blocker
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          subtitle="Across 3 client brands"
          icon={FolderKanban}
          colorScheme="blue"
          onClick={() => setCurrentView('projects')}
        />
        <StatCard
          title="Upcoming Shoots"
          value={upcomingShoots.length}
          subtitle="Next: Pier 59 Studios"
          icon={CalendarDays}
          colorScheme="emerald"
          onClick={() => setCurrentView('calendar')}
        />
        <StatCard
          title="Pending Reviews"
          value={pendingApprovals.length}
          subtitle="Aura Radiance v2.0"
          icon={Clock}
          colorScheme="amber"
          trend="Action Needed"
          trendType="negative"
          onClick={() => openProject('proj_aura_radiance', 'approvals')}
        />
        <StatCard
          title="My Open Tasks"
          value={myTasks.length}
          subtitle="Assigned to your queue"
          icon={CheckCircle2}
          colorScheme="purple"
          onClick={() => setCurrentView('tasks')}
        />
      </div>

      {/* Two Column Layout: Next Actions & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Personal Next Actions & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Next Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Your Next Priority Actions
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('tasks')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View all ({tasks.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myTasks.length > 0 ? (
              <div className="space-y-2.5">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs text-slate-500 font-mono">
                          Due {new Date(task.dueAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={() => openProject(task.projectId, 'tasks')}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
                <p className="text-xs text-slate-400">No urgent personal tasks assigned right now.</p>
              </div>
            )}
          </div>

          {/* Active Campaigns Showcase */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Active Agency Projects
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('projects')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                All Projects <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {projects.slice(0, 4).map((project) => (
                <div
                  key={project.id}
                  onClick={() => openProject(project.id, 'overview')}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-slate-50/40 hover:bg-white group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {project.code}
                    </span>
                    <StatusBadge status={project.status} size="sm" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {project.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Client: <span className="font-medium text-slate-700">{project.clientName}</span>
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Progress</span>
                      <span>{project.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${project.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Upcoming Shoot & Direct Review Shortcut */}
        <div className="space-y-6">

          {/* Next Confirmed Shoot Card */}
          {upcomingShoots.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Next Shoot Call Sheet
                  </h3>
                </div>
                <StatusBadge status={upcomingShoots[0].status} size="sm" />
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  {upcomingShoots[0].title}
                </h4>
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p>📍 <strong>Location:</strong> {upcomingShoots[0].location}</p>
                  <p>⏰ <strong>Call Time:</strong> 07:00 AM (Elena) / 08:00 AM (Crew)</p>
                  <p>👗 <strong>Wardrobe:</strong> Dewy natural silk & linen</p>
                </div>
                <button
                  onClick={() => openProject(upcomingShoots[0].projectId, 'schedule')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Production Call Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Review Shortcut */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-blue-900">
              <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
              <h3 className="text-sm font-bold">
                Review Player v2.0
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Aura Radiance cut v2.0 is awaiting client approval. Click to open the timestamp review player.
            </p>
            <button
              onClick={() => openProject('proj_aura_radiance', 'approvals')}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Launch Review Player</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Start New Campaign */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 text-center bg-white">
            <h4 className="text-xs font-bold text-slate-800">Need to start a new campaign?</h4>
            <p className="text-xs text-slate-500 mt-1 mb-3">Initialize default rooms, milestones, and call sheets.</p>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              + Create Project
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

