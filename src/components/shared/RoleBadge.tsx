import React from 'react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'owner':
        return { label: 'Owner', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'head_manager':
        return { label: 'Head Manager', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'hr_manager':
        return { label: 'HR Manager', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'social_media_manager':
        return { label: 'Social Media', bg: 'bg-pink-100 text-pink-800 border-pink-200' };
      case 'photographer':
        return { label: 'Photographer', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'videographer':
        return { label: 'Videographer', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'video_editor':
        return { label: 'Video Editor', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'graphic_designer':
        return { label: 'Designer', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'model':
        return { label: 'Talent / Model', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'client':
        return { label: 'Client (External)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const { label, bg } = getRoleConfig();
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${bg} ${sizeClasses}`}>
      {label}
    </span>
  );
};

