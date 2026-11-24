import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Layers, 
  Crown, 
  Video, 
  Camera, 
  Scissors, 
  Share2, 
  Palette, 
  Sparkles, 
  Building2, 
  Briefcase, 
  Users, 
  ArrowRight, 
  AlertCircle,
  RefreshCw,
  Building
} from 'lucide-react';

interface RoleOption {
  role: UserRole;
  title: string;
  category: string;
  defaultDesignation: string;
  defaultDepartment: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'owner',
    title: 'Agency Owner / Founder',
    category: 'Full Command',
    defaultDesignation: 'Agency Founder & Director',
    defaultDepartment: 'Executive'
  },
  {
    role: 'head_manager',
    title: 'Head of Production',
    category: 'Management',
    defaultDesignation: 'Head of Creative Operations',
    defaultDepartment: 'Management'
  },
  {
    role: 'videographer',
    title: 'Videographer / DP',
    category: 'Camera Unit',
    defaultDesignation: 'Director of Photography',
    defaultDepartment: 'Camera Unit'
  },
  {
    role: 'photographer',
    title: 'Lead Photographer',
    category: 'Photo Unit',
    defaultDesignation: 'Lead Commercial Photographer',
    defaultDepartment: 'Stills & Photo'
  },
  {
    role: 'video_editor',
    title: 'Video Editor / Colorist',
    category: 'Post-Production',
    defaultDesignation: 'Senior Video Editor',
    defaultDepartment: 'Post-Production'
  },
  {
    role: 'social_media_manager',
    title: 'Social Media Director',
    category: 'Distribution',
    defaultDesignation: 'Social Content Director',
    defaultDepartment: 'Marketing'
  },
  {
    role: 'graphic_designer',
    title: 'Graphic & Motion Designer',
    category: 'Art Direction',
    defaultDesignation: 'Lead Visual Designer',
    defaultDepartment: 'Creative'
  },
  {
    role: 'model',
    title: 'Commercial Talent / Model',
    category: 'Talent',
    defaultDesignation: 'Commercial Talent',
    defaultDepartment: 'Talent'
  },
  {
    role: 'client',
    title: 'Client / Brand Director',
    category: 'Client Portal',
    defaultDesignation: 'Brand Director',
    defaultDepartment: 'External Client'
  },
  {
    role: 'hr_manager',
    title: 'People & Operations',
    category: 'HR & Roster',
    defaultDesignation: 'HR & People Operations',
    defaultDepartment: 'Operations'
  }
];

export const AuthPage: React.FC = () => {
  const { login, signup, addToast, pendingInvite } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => pendingInvite?.email || '');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [agencyName, setAgencyName] = useState('');

  // If there's an agency invite, default to employee role if possible
  React.useEffect(() => {
    if (pendingInvite?.role) {
      const rLower = pendingInvite.role.toLowerCase();
      if (rLower.includes('video_editor') || rLower.includes('editor')) setSelectedRole('video_editor');
      else if (rLower.includes('photographer') || rLower.includes('photo')) setSelectedRole('photographer');
      else if (rLower.includes('videographer') || rLower.includes('dp')) setSelectedRole('videographer');
      else if (rLower.includes('designer') || rLower.includes('graphic')) setSelectedRole('graphic_designer');
      else if (rLower.includes('manager')) setSelectedRole('head_manager');
      else if (rLower.includes('model') || rLower.includes('talent')) setSelectedRole('model');
      else setSelectedRole('videographer');
    }
  }, [pendingInvite]);

  const selectedRoleMeta = ROLE_OPTIONS.find(r => r.role === selectedRole) || ROLE_OPTIONS[0];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter a valid work email.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          designation: selectedRoleMeta.defaultDesignation,
          department: selectedRoleMeta.defaultDepartment,
          agencyName: selectedRole === 'owner' ? (agencyName.trim() || 'My Creative Agency') : undefined
        });

        addToast('Welcome', `Signed in as ${name}`, 'success');
      } else {
        if (!email.trim() || !password) throw new Error('Please enter your email and password.');
        await login(email.trim(), password);
        addToast('Welcome back', 'Signed in successfully.', 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      
      {/* Centered Auth Card */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Sign in to FlowDeck'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Creative agency operating system
            </p>
          </div>
        </div>

        {/* Pending Agency Invite Banner */}
        {pendingInvite && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-left animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shrink-0 shadow-2xs">
              {pendingInvite.agencyLogo || '🎬'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                Official Agency Invitation
              </span>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Join {pendingInvite.agencyName}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Profession: <strong className="text-blue-700 font-bold">{pendingInvite.role}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign in
          </button>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Work email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              {mode === 'login' && (
                <span className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer">
                  Forgot?
                </span>
              )}
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>

          {/* Role Selector on Signup */}
          {mode === 'signup' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Your agency role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.role} value={opt.role}>
                      {opt.title} ({opt.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* If Agency Owner, studio name input */}
              {selectedRole === 'owner' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Agency / Studio name
                  </label>
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g. Horizon Media Studio"
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                </div>
              )}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <span>{mode === 'signup' ? 'Continue' : 'Sign in'}</span>
            )}
          </button>

        </form>

      </div>

    </div>
  );
};
