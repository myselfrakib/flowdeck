import React, { useState } from 'react';
import { Project, ActivityLog } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  History, 
  User, 
  CheckCircle2, 
  Film, 
  Calendar, 
  MessageSquare, 
  Sparkles 
} from 'lucide-react';

interface Props {
  project: Project;
}

export const ProjectActivityTab: React.FC<Props> = ({ project }) => {
  const { activityLogs, users } = useApp();
  const [filter, setFilter] = useState<string>('all');

  const projectLogs = activityLogs.filter(a => a.projectId === project.id);
  const filteredLogs = projectLogs.filter(l => filter === 'all' || l.category === filter);

  const getCategoryIcon = (cat: ActivityLog['category']) => {
    switch (cat) {
      case 'approval':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'version':
        return <Film className="w-4 h-4 text-blue-600" />;
      case 'shoot':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'task':
        return <CheckCircle2 className="w-4 h-4 text-amber-600" />;
      case 'room':
        return <MessageSquare className="w-4 h-4 text-pink-600" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
      
      {/* Activity Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            Immutable Audit Trail & Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic-style change log tracking all version submissions, sign-offs, and shoot edits.
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50 text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Event Categories ({projectLogs.length})</option>
          <option value="approval">Approvals & Sign-offs</option>
          <option value="version">Version Cuts & Feedback</option>
          <option value="shoot">Shoots & Calendar</option>
          <option value="task">Tasks & Checklists</option>
        </select>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const actor = users.find(u => u.id === log.actorId);

          return (
            <div
              key={log.id}
              className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                {getCategoryIcon(log.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">{actor?.name || 'System User'}</span>
                  <span className="text-xs text-slate-500">{log.action}</span>
                  <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-xs">
                    {log.target}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {log.timestamp} • Actor ID: {log.actorId}
                </p>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No activity logs match the selected filter.
          </div>
        )}
      </div>

    </div>
  );
};

