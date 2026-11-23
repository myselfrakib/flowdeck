import React from 'react';
import { ProjectStatus, TaskStatus, VersionStatus, ShootStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus | VersionStatus | ShootStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyleAndLabel = () => {
    switch (status) {
      // Project statuses
      case 'draft':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Draft' };
      case 'planning':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Planning' };
      case 'in_production':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'In Production' };
      case 'in_review':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'In Review' };
      case 'revisions':
        return { bg: 'bg-orange-50 text-orange-800 border-orange-200', label: 'Revisions' };
      case 'approved':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Approved' };
      case 'delivered':
        return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', label: 'Delivered' };

      // Task statuses
      case 'todo':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'To Do' };
      case 'in_progress':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'In Progress' };
      case 'blocked':
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200', label: 'Blocked' };
      case 'completed':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Completed' };

      // Version statuses
      case 'queued':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Queued' };
      case 'footage_pending':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Footage Pending' };
      case 'ready_to_edit':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Ready to Edit' };
      case 'editing':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Editing' };
      case 'internal_review':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Internal Review' };
      case 'client_review':
        return { bg: 'bg-sky-50 text-sky-800 border-sky-300 font-semibold', label: 'Client Review' };
      case 'revision_requested':
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200', label: 'Revision Requested' };

      // Shoot statuses
      case 'proposed':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Proposed' };
      case 'confirmed':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold', label: 'Confirmed' };
      case 'cancelled':
        return { bg: 'bg-slate-100 text-slate-500 border-slate-200 line-through', label: 'Cancelled' };

      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: String(status).replace('_', ' ') };
    }
  };

  const { bg, label } = getStyleAndLabel();
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bg} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
};

