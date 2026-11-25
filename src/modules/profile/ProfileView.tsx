import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { ProfilePhotoModal } from '../../components/shared/ProfilePhotoModal';
import {
  User as UserIcon,
  Camera,
  Phone,
  Mail,
  Briefcase,
  Building2,
  Save,
  LogOut,
  CheckCircle2,
  FolderKanban,
  CheckSquare,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { User } from '../../types';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    activeBusiness,
    projects,
    tasks,
    updateUserProfile,
    updateUserAvatar,
    setIsPhoneModalOpen,
    setCurrentView,
    logout,
    setCurrentUser,
    addToast
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [designation, setDesignation] = useState(currentUser.designation);
  const [department, setDepartment] = useState(currentUser.department || 'Operations');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [availability, setAvailability] = useState<User['availability']>(currentUser.availability);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setDesignation(currentUser.designation);
    setDepartment(currentUser.department || 'Operations');
    setBio(currentUser.bio || '');
    setAvailability(currentUser.availability);
  }, [currentUser]);

  const myProjectsCount = projects.filter(
    (p) => p.leadId === currentUser.id || (p.teamIds || []).includes(currentUser.id)
  ).length;
  const myTasksCount = tasks.filter((t) => (t.assigneeIds || []).includes(currentUser.id)).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Validation Error', 'Full name cannot be empty.', 'warning');
      return;
    }
    updateUserProfile({
      name: name.trim(),
      designation: designation.trim() || currentUser.designation,
      department: department.trim() || 'Operations',
      bio: bio.trim()
    });
  };

  const handleAvailabilityChange = (nextStatus: User['availability']) => {
    setAvailability(nextStatus);
    setCurrentUser({ ...currentUser, availability: nextStatus });
    updateUserProfile({ name: name.trim() || currentUser.name });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('overview')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              title="Change Profile Photo"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{currentUser.name}</h1>
              <RoleBadge role={currentUser.role} size="sm" />
            </div>
            <p className="text-xs font-semibold text-blue-600">{currentUser.designation}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.email}
              </span>
              <span className="inline-flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.phone || '+91 98765 43210'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPhoneModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>Edit Phone</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Agency</span>
            <p className="text-sm font-bold text-slate-900 truncate">{activeBusiness.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">My Projects</span>
            <p className="text-sm font-bold text-slate-900">{myProjectsCount} Involved</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Tasks</span>
            <p className="text-sm font-bold text-slate-900">{myTasksCount} Total</p>
          </div>
        </div>
      </div>

      {/* Editable Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Personal Profile Details</span>
            </h2>
            {currentUser.role !== 'client' && (
              <button
                type="button"
                onClick={() => setCurrentView('settings')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Agency Settings</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Designation / Title</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Availability Status</label>
              <select
                value={availability}
                onChange={(e) => handleAvailabilityChange(e.target.value as User['availability'])}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-600"
              >
                <option value="available">Available</option>
                <option value="on_shoot">On Shoot</option>
                <option value="busy">Busy</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Bio / Specialties</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your creative specialties, gear, or role focus..."
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Photo Modal */}
      <ProfilePhotoModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentUser.avatar}
        onSave={(newUrl) => updateUserAvatar(newUrl)}
      />
    </div>
  );
};
