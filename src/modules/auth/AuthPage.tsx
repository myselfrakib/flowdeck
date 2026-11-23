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
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Building
} from 'lucide-react';

interface RoleOption {
  role: UserRole;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  defaultDesignation: string;
  defaultDepartment: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'owner',
    title: 'Agency Owner / Founder',
    badge: 'Full Command',
    description: 'Full workspace ownership, business settings, client accounts, financial KPIs & projects.',
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    defaultDesignation: 'Agency Founder & Managing Director',
    defaultDepartment: 'Executive'
  },
  {
    role: 'head_manager',
    title: 'Head of Production',
    badge: 'Operations',
    description: 'Direct production pipelines, approve milestone deadlines and coordinate crew.',
    icon: Briefcase,
    color: 'from-blue-600 to-indigo-600',
    defaultDesignation: 'Head of Creative Operations',
    defaultDepartment: 'Management'
  },
  {
    role: 'videographer',
    title: 'Videographer / DP',
    badge: 'Camera Unit',
    description: 'On-set cinematography, call sheet RSVP, gear lists, and raw footage rushes vault.',
    icon: Video,
    color: 'from-purple-600 to-indigo-600',
    defaultDesignation: 'Director of Photography / Senior Videographer',
    defaultDepartment: 'Camera Unit'
  },
  {
    role: 'photographer',
    title: 'Photographer',
    badge: 'Photo Unit',
    description: 'Stills production, lighting setups, tethered shoot albums, and retouching queues.',
    icon: Camera,
    color: 'from-rose-500 to-pink-600',
    defaultDesignation: 'Lead Commercial Photographer',
    defaultDepartment: 'Stills & Photo'
  },
  {
    role: 'video_editor',
    title: 'Video Editor / Colorist',
    badge: 'Post-Production',
    description: 'Timeline assembly, rough/fine cuts, ProRes uploads, and timestamp revision notes.',
    icon: Scissors,
    color: 'from-sky-500 to-blue-600',
    defaultDesignation: 'Senior Video Editor & Colorist',
    defaultDepartment: 'Post-Production'
  },
  {
    role: 'social_media_manager',
    title: 'Social Media Manager',
    badge: 'Distribution',
    description: 'Multi-platform cutdowns (9:16 Reels, TikToks, Shorts), hooks, and scheduling.',
    icon: Share2,
    color: 'from-pink-500 to-rose-600',
    defaultDesignation: 'Social Media Content Director',
    defaultDepartment: 'Marketing'
  },
  {
    role: 'graphic_designer',
    title: 'Graphic Designer',
    badge: 'Art Direction',
    description: 'Brand asset packages, typography, key visual posters, and motion graphic stems.',
    icon: Palette,
    color: 'from-teal-500 to-emerald-600',
    defaultDesignation: 'Lead Graphic & Motion Designer',
    defaultDepartment: 'Creative'
  },
  {
    role: 'model',
    title: 'Model / Commercial Talent',
    badge: 'Cast & Talent',
    description: 'Mobile call sheet access, wardrobe moodboards, call times, and emergency contacts.',
    icon: Sparkles,
    color: 'from-amber-400 to-orange-500',
    defaultDesignation: 'Commercial Talent / Model',
    defaultDepartment: 'Talent'
  },
  {
    role: 'client',
    title: 'Client / Brand Director',
    badge: 'Client Portal',
    description: 'Isolated review screener: review video cuts, leave timestamp feedback & sign off.',
    icon: Building2,
    color: 'from-emerald-500 to-teal-600',
    defaultDesignation: 'Brand Marketing VP / Client Lead',
    defaultDepartment: 'External Client'
  },
  {
    role: 'hr_manager',
    title: 'HR & People Operations',
    badge: 'Confidential HR',
    description: 'Crew availability calendar, leave requests, attendance logs, and roster planning.',
    icon: Users,
    color: 'from-slate-700 to-slate-900',
    defaultDesignation: 'Head of People & Crew Operations',
    defaultDepartment: 'Operations'
  }
];

export const AuthPage: React.FC = () => {
  const { login, signup, loginAsRole, addToast } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [agencyName, setAgencyName] = useState('Apex Media Studios');
  const [agencyTagline, setAgencyTagline] = useState('Commercial Video & Creative Production');

  const selectedRoleMeta = ROLE_OPTIONS.find(r => r.role === selectedRole) || ROLE_OPTIONS[0];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter a valid email.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          designation: selectedRoleMeta.defaultDesignation,
          department: selectedRoleMeta.defaultDepartment,
          agencyName: selectedRole === 'owner' ? (agencyName.trim() || 'My Creative Agency') : undefined,
          agencyTagline: selectedRole === 'owner' ? agencyTagline.trim() : undefined
        });

        addToast('Welcome to FlowDeck', `Logged in as ${name} (${selectedRoleMeta.title})`, 'success');
      } else {
        if (!email.trim() || !password) throw new Error('Please enter your email and password.');
        await login(email.trim(), password);
        addToast('Welcome Back', 'Successfully signed in to FlowDeck.', 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    loginAsRole(role);
    const meta = ROLE_OPTIONS.find(r => r.role === role);
    addToast('Demo Sign-In', `Instant sign-in as ${meta?.title}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#102A43] flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Banner */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#102A43] tracking-tight leading-none">
              FLOWDECK
            </h1>
            <p className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider mt-0.5">
              Creative Agency Operating System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">
            {mode === 'signup' ? 'Already have an agency account?' : "Don't have an account yet?"}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setErrorMsg(null);
            }}
            className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors"
          >
            {mode === 'signup' ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center my-4">
        
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* Header Strip */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 via-sky-50/40 to-slate-50 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                {mode === 'signup' ? 'Create New Account' : 'Welcome Back'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {mode === 'signup' ? 'Choose your role & get started' : 'Sign in to your agency workspace'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                {mode === 'signup' 
                  ? 'Select your position in the agency below. Role-based permissions, tools, and dashboards are tailored to your position.' 
                  : 'Enter your credentials to access your production schedules, video cuts, and communication rooms.'}
              </p>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex bg-slate-100 p-1 rounded-2xl self-center sm:self-auto shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(null); }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  mode === 'signup' ? 'bg-white shadow-xs text-blue-600 font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  mode === 'login' ? 'bg-white shadow-xs text-blue-600 font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleAuthSubmit} className="p-6 sm:p-8 space-y-6">
            
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Authentication Notice</h5>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* SIGNUP STEP: Choose Role */}
            {mode === 'signup' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Step 1: Select Your Agency Role *
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600">
                    {selectedRoleMeta.title}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-slate-50/50">
                  {ROLE_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.role;
                    return (
                      <div
                        key={item.role}
                        onClick={() => setSelectedRole(item.role)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shrink-0 shadow-2xs`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.badge}
                          </span>
                        </div>

                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conditional Agency Creation for Agency Owner */}
            {mode === 'signup' && selectedRole === 'owner' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Agency Owner Setup: Your Studio Workspace
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Agency / Studio Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="e.g. Apex Media Studios"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Specialty / Focus
                    </label>
                    <input
                      type="text"
                      value={agencyTagline}
                      onChange={(e) => setAgencyTagline(e.target.value)}
                      placeholder="e.g. Commercial Video & High-Fashion Stills"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white focus:outline-hidden focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Standard Credentials */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                {mode === 'signup' ? 'Step 2: Account Credentials' : 'Enter Credentials'}
              </label>

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Work Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@agency.com"
                      className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>
                  {loading 
                    ? 'Processing...' 
                    : mode === 'signup' 
                    ? `Create Account & Enter as ${selectedRoleMeta.title}` 
                    : 'Sign In to FlowDeck'}
                </span>
              </button>
            </div>

          </form>

          {/* Quick 1-Tap Demo Logins */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Tap Instant Access for Testing:
              </span>
              <span className="text-[11px] text-slate-500">No typing required</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('owner')}
                className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Agency Owner</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Marcus Vance</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('videographer')}
                className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                  <Video className="w-3.5 h-3.5 text-purple-500" />
                  <span>Videographer</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Liam O'Connor</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('video_editor')}
                className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                  <Scissors className="w-3.5 h-3.5 text-sky-500" />
                  <span>Video Editor</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Zoe Chen</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('client')}
                className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Client Brand</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Claire Dupont</p>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50">
        FlowDeck Creative Agency Operating System • Firebase Project <span className="font-mono text-slate-600">rakib-18024</span>
      </footer>

    </div>
  );
};
