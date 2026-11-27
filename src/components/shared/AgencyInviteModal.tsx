import React from 'react';
import { useApp } from '../../context/AppContext';
import { AgencyLogo } from './AgencyLogo';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Briefcase, 
  Sparkles, 
  X, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const AgencyInviteModal: React.FC = () => {
  const { 
    pendingInvite, 
    isInviteModalOpen, 
    setIsInviteModalOpen, 
    acceptAgencyInvite, 
    rejectAgencyInvite,
    currentUser 
  } = useApp();

  if (!isInviteModalOpen || !pendingInvite) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200/90 max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-200 relative">
        
        {/* Dismiss / Close (allows reviewing dashboard without deciding yet) */}
        <button
          onClick={() => setIsInviteModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Decide later"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Agency Icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 overflow-hidden">
            <AgencyLogo
              logo={pendingInvite.agencyLogo}
              name={pendingInvite.agencyName}
              className="w-full h-full object-contain bg-white p-1.5"
              emojiClassName="text-2xl leading-none"
            />
          </div>
          <div className="min-w-0 pr-6">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800 mb-1">
              <Sparkles className="w-3 h-3" />
              Agency Team Invitation
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Join <span className="text-blue-600">"{pendingInvite.agencyName}"</span>
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
              Profession: <span className="text-slate-900 font-bold">{pendingInvite.role}</span>
            </p>
          </div>
        </div>

        {/* Invitation Context Note */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
          You have been officially invited to join the production team at{' '}
          <strong className="text-slate-900">{pendingInvite.agencyName}</strong> as a{' '}
          <strong className="text-blue-600">{pendingInvite.role}</strong>. Confirming will connect your account to this agency workspace, assigning you to commercial projects, call sheets, editing pipelines, and team rooms.
        </p>

        {/* Account Identity Confirmation */}
        <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-white shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Joining As
            </span>
            <span className="text-xs font-extrabold text-blue-700">
              {pendingInvite.role}
            </span>
          </div>
        </div>

        {/* Action Buttons: Confirm or Reject */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={() => rejectAgencyInvite(pendingInvite)}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
          >
            <XCircle className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
            <span>Reject Invitation</span>
          </button>

          <button
            type="button"
            onClick={() => acceptAgencyInvite(pendingInvite)}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Confirm & Join Agency</span>
          </button>
        </div>

      </div>
    </div>
  );
};

