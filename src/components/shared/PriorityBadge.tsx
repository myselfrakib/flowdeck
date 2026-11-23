import React from 'react';
import { ProjectPriority } from '../../types';
import { AlertCircle, ArrowUpRight, Minus, AlertTriangle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ProjectPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'urgent':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-3 h-3 text-red-600" />
          Urgent
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          High
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <ArrowUpRight className="w-3 h-3 text-blue-500" />
          Medium
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          <Minus className="w-3 h-3 text-slate-400" />
          Low
        </span>
      );
  }
};

