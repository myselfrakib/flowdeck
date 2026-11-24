import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Printer, 
  Share2, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Camera, 
  Users, 
  Sun,
  ShieldAlert
} from 'lucide-react';

export const CallSheetModal: React.FC = () => {
  const { 
    activeCallSheetShootId, 
    setActiveCallSheetShootId, 
    shootEvents, 
    projects, 
    users, 
    addToast 
  } = useApp();

  if (!activeCallSheetShootId) return null;

  const shoot = shootEvents.find(s => s.id === activeCallSheetShootId);
  if (!shoot) return null;

  const project = projects.find(p => p.id === shoot.projectId);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('Call Sheet Copied', 'Mobile call sheet link copied to clipboard.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl my-auto overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Top Action Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-blue-600 px-2 py-0.5 rounded">
              OFFICIAL CALL SHEET
            </span>
            <span className="text-xs text-slate-300">{project?.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
              title="Print Sheet"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => setActiveCallSheetShootId(null)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Call Sheet Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          
          {/* Header Block */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {shoot.title}
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  Project: {project?.title} • Client: {project?.clientName}
                </p>
              </div>

              <div className="text-left sm:text-right font-mono">
                <span className="text-xs text-slate-400 uppercase font-semibold">Shoot Date</span>
                <p className="text-lg font-bold text-slate-900">
                  {new Date(shoot.startAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs font-bold text-blue-600">GENERAL CREW CALL: 07:00 AM</p>
              </div>
            </div>
          </div>

          {/* Location & Safety Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <MapPin className="w-4 h-4 text-rose-600" />
                Shooting Location
              </div>
              <p className="text-sm font-bold text-slate-900">{shoot.location}</p>
              <p className="text-xs text-slate-600">{shoot.locationAddress}</p>
              <p className="text-xs text-blue-600 font-medium">Stage C • Freight Elevator Access Available</p>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Emergency & Medical Contacts
              </div>
              <p className="text-xs font-bold text-slate-800">Bellevue Hospital Emergency Center (2.1 mi)</p>
              <p className="text-xs text-slate-600">462 1st Ave, New York, NY 10016 • (212) 562-4141</p>
              <p className="text-xs text-rose-700 font-semibold">On-Set Medic: Sarah Jenkins (+1 555-456-7890)</p>
            </div>
          </div>

          {/* Day Schedule Timeline */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Day Shooting Schedule
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-100 font-medium">
                <span className="block font-mono font-bold text-blue-600">07:00 AM</span>
                <span className="text-[11px] text-slate-600">Crew Call & Load-in</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 font-medium">
                <span className="block font-mono font-bold text-blue-600">07:30 AM</span>
                <span className="text-[11px] text-slate-600">Breakfast & HMU</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 font-bold text-blue-900">
                <span className="block font-mono">08:30 AM</span>
                <span className="text-[11px]">First Shot Up</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 font-medium">
                <span className="block font-mono font-bold text-blue-600">01:00 PM</span>
                <span className="text-[11px] text-slate-600">Catered Lunch</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 font-medium">
                <span className="block font-mono font-bold text-blue-600">05:30 PM</span>
                <span className="text-[11px] text-slate-600">Estimated Wrap</span>
              </div>
            </div>
          </div>

          {/* Cast & Crew Roster */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Cast & Crew Call Times
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 sm:p-3">Name</th>
                    <th className="p-2.5 sm:p-3">Department Role</th>
                    <th className="p-2.5 sm:p-3">Call Time</th>
                    <th className="p-2.5 sm:p-3">Phone</th>
                    <th className="p-2.5 sm:p-3">RSVP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shoot.participants.map((p) => {
                    const u = users.find(user => user.id === p.userId);
                    const displayName = u?.name || (p as any).name || (p.userId.startsWith('client_') ? 'Client Representative' : 'Production Attendee');
                    const displayPhone = u?.phone || (p as any).phone || '+91 98765 43210';
                    return (
                      <tr key={p.userId} className="hover:bg-slate-50">
                        <td className="p-2.5 sm:p-3 font-bold text-slate-800">{displayName}</td>
                        <td className="p-2.5 sm:p-3 text-slate-600">{p.role}</td>
                        <td className="p-2.5 sm:p-3 font-mono font-bold text-blue-600">{p.callTime}</td>
                        <td className="p-2.5 sm:p-3 text-slate-500 font-mono">{displayPhone}</td>
                        <td className="p-2.5 sm:p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.status === 'accepted' ? 'CONFIRMED' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wardrobe & Camera Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold uppercase text-slate-500">Wardrobe Breakdown</span>
              <p className="text-slate-700 leading-relaxed">{shoot.wardrobeNotes}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold uppercase text-slate-500">Camera & Lighting Package</span>
              <ul className="text-slate-700 space-y-1">
                {shoot.propsEquipment.map((eq, i) => (
                  <li key={i}>• {eq}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-3 border-t border-slate-200 text-center text-slate-400 text-[11px]">
            StudioFlow Automated Production Engine • Please notify Line Producer immediately of any delays.
          </div>

        </div>

      </div>
    </div>
  );
};

