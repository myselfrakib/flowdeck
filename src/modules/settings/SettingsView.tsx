import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  ShieldCheck, 
  Lock, 
  HardDrive, 
  Bell, 
  Save, 
  Check, 
  Globe, 
  KeyRound,
  FileCode,
  Flame,
  Database,
  ExternalLink,
  Camera,
  Phone,
  User as UserIcon
} from 'lucide-react';
import { ProfilePhotoModal } from '../../components/shared/ProfilePhotoModal';

export const SettingsView: React.FC = () => {
  const { 
    activeBusiness, 
    updateBusiness, 
    addToast, 
    setIsAuthModalOpen, 
    firebaseUser,
    currentUser,
    updateUserAvatar,
    updateUserProfile,
    setIsPhoneModalOpen
  } = useApp();

  const [bizName, setBizName] = useState(activeBusiness.name);
  const [tagline, setTagline] = useState(activeBusiness.tagline);
  const [timezone, setTimezone] = useState(activeBusiness.timezone);
  const [storageProvider, setStorageProvider] = useState(activeBusiness.storageProvider);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileDesignation, setProfileDesignation] = useState(currentUser.designation);
  const [profileDepartment, setProfileDepartment] = useState(currentUser.department || 'Operations');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setBizName(activeBusiness.name);
    setTagline(activeBusiness.tagline);
    setTimezone(activeBusiness.timezone);
    setStorageProvider(activeBusiness.storageProvider);
  }, [activeBusiness]);

  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileDesignation(currentUser.designation);
    setProfileDepartment(currentUser.department || 'Operations');
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim()) {
      addToast('Validation Error', 'Agency name cannot be empty.', 'warning');
      return;
    }
    updateBusiness({
      name: bizName.trim(),
      tagline: tagline.trim(),
      timezone,
      storageProvider: storageProvider as any
    });
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    updateUserProfile({
      name: profileName.trim(),
      designation: profileDesignation.trim() || currentUser.designation,
      department: profileDepartment.trim() || 'Operations'
    });
    setIsEditingProfile(false);
  };

  // Permission table from Blueprint Page 20
  const permissionsMatrix = [
    { action: 'Create business workspace', owner: 'Yes', manager: 'No', editor: 'No', model: 'No', client: 'No' },
    { action: 'Invite new agency members', owner: 'Yes', manager: 'If granted', editor: 'No', model: 'No', client: 'No' },
    { action: 'Create project workspace', owner: 'Yes', manager: 'Yes', editor: 'If granted', model: 'No', client: 'Request only' },
    { action: 'Edit assigned task status', owner: 'Yes', manager: 'Yes', editor: 'Assigned', model: 'Shoot only', client: 'No' },
    { action: 'View internal planning rooms', owner: 'Yes', manager: 'If member', editor: 'If member', model: 'If member', client: 'No' },
    { action: 'View client discussion rooms', owner: 'Yes', manager: 'If member', editor: 'If member', model: 'If member', client: 'If member' },
    { action: 'Approve final project delivery', owner: 'Yes', manager: 'If granted', editor: 'No', model: 'No', client: 'If requested' },
    { action: 'Access HR & attendance payroll', owner: 'Yes', manager: 'HR only', editor: 'No', model: 'No', client: 'No' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Agency Settings & Security Model
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Tenant Configuration
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Workspace profile, storage integration abstraction, and server-side RBAC policy
        </p>
      </div>

      {/* User Account Profile & Avatar Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <span>Your User Profile & Photo</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
              />
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{currentUser.name}</h4>
              <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {currentUser.designation}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentUser.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            >
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Name / Role'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPhoneModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Change Phone Number</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-2xs"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Change Profile Photo</span>
            </button>
          </div>
        </div>

        {isEditingProfile && (
          <form onSubmit={handleProfileSave} className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Designation</label>
              <input
                type="text"
                value={profileDesignation}
                onChange={(e) => setProfileDesignation(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                <input
                  type="text"
                  value={profileDepartment}
                  onChange={(e) => setProfileDepartment(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Profile & Storage Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Workspace Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Agency Name
              </label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Tagline / Specialty
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Business Timezone (Canonical)
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Preferred Large Media Storage Provider
              </label>
              <select
                value={storageProvider}
                onChange={(e) => setStorageProvider(e.target.value as any)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200"
              >
                <option value="google_drive">Google Drive Enterprise (Recommended for Rushes)</option>
                <option value="dropbox">Dropbox Replay / Business</option>
                <option value="s3_object_storage">AWS S3 / Wasabi Direct Bucket</option>
                <option value="firebase">Firebase Native Cloud Storage (Proxies & Previews)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Official RBAC Matrix from Blueprint Page 20 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              StudioFlow Security & Access Matrix (Blueprint §13)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict multi-tenant security verified at the Firestore and Storage rules layer.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            Page 20 Reference
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="p-3">Action / Resource</th>
                <th className="p-3 text-center">Owner</th>
                <th className="p-3 text-center">Manager</th>
                <th className="p-3 text-center">Editor</th>
                <th className="p-3 text-center">Model</th>
                <th className="p-3 text-center">Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="p-3 font-semibold text-slate-800">{row.action}</td>
                  <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">{row.owner}</td>
                  <td className="p-3 text-center font-medium text-slate-700">{row.manager}</td>
                  <td className="p-3 text-center font-medium text-slate-700">{row.editor}</td>
                  <td className="p-3 text-center font-medium text-slate-700">{row.model}</td>
                  <td className="p-3 text-center font-medium text-slate-700 bg-slate-50/50">{row.client}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Note: Route guards provide immediate UI guidance. Backend Cloud Firestore & Storage rules enforce hard isolation against cross-tenant attacks and parameter tampering.
        </p>
      </div>

      {/* Profile Photo Edit & Crop Modal */}
      <ProfilePhotoModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentUser.avatar}
        onSave={(newAvatarUrl) => {
          updateUserAvatar(newAvatarUrl);
        }}
      />

    </div>
  );
};

