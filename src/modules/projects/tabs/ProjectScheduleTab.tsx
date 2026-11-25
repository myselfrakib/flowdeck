import React, { useState } from 'react';
import { Project, ShootEvent } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  Users, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  Shirt,
  Sparkles,
  Plus,
  X,
  Check,
  Play
} from 'lucide-react';

interface Props {
  project: Project;
}

export const ProjectScheduleTab: React.FC<Props> = ({ project }) => {
  const { 
    shootEvents, 
    respondToShoot, 
    confirmShoot, 
    createShootEvent,
    setActiveCallSheetShootId, 
    setActiveProjectTab,
    users, 
    currentUser 
  } = useApp();

  const [isAddShootOpen, setIsAddShootOpen] = useState(false);
  const [shootTitle, setShootTitle] = useState('');
  const [shootDate, setShootDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [shootLocation, setShootLocation] = useState('');
  const [wardrobeNotes, setWardrobeNotes] = useState('Standard production attire / brand palette.');
  const [equipmentNotes, setEquipmentNotes] = useState('Cinema Camera A, Prime Lens Kit, Wireless Lavs');
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([currentUser.id]);

  const projectShoots = shootEvents.filter(s => s.projectId === project.id);

  const handleCreateShoot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shootTitle.trim()) return;
    const startAt = new Date(`${shootDate}T${startTime}:00`).toISOString();
    const endAt = new Date(`${shootDate}T${endTime}:00`).toISOString();
    const crewIds = Array.from(new Set([currentUser.id, ...selectedCrewIds]));
    const participants = crewIds.map((uid) => {
      const u = users.find((usr) => usr.id === uid);
      return {
        userId: uid,
        role: u?.designation || 'Crew Member',
        callTime: startTime,
        status: uid === currentUser.id ? ('accepted' as const) : ('invited' as const)
      };
    });

    createShootEvent({
      projectId: project.id,
      title: shootTitle.trim(),
      startAt,
      endAt,
      location: shootLocation.trim() || 'Studio Location TBD',
      mapUrl: 'https://maps.google.com',
      wardrobeNotes: wardrobeNotes.trim() || 'Standard production attire.',
      propsEquipment: equipmentNotes.split(',').map((s) => s.trim()).filter(Boolean),
      status: 'proposed',
      participants
    });

    setShootTitle('');
    setShootLocation('');
    setSelectedCrewIds([currentUser.id]);
    setIsAddShootOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Schedule Shoot + Next Stage */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Shoots & Call Sheets ({projectShoots.length})</h3>
          <p className="text-[11px] text-slate-500">Assign crew, lock call times, and generate production call sheets</p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.role !== 'client' && (
            <button
              onClick={() => setIsAddShootOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Shoot & Call Sheet</span>
            </button>
          )}
          <button
            onClick={() => setActiveProjectTab('approvals')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Review & Approvals →</span>
          </button>
        </div>
      </div>
      
      {/* Shoot Events List */}
      {projectShoots.map((shoot) => {
        const myParticipantRecord = shoot.participants.find(p => p.userId === currentUser.id);

        return (
          <div
            key={shoot.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5"
          >
            {/* Header: Title, Status, Call Sheet Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    Shoot Production
                  </span>
                  <StatusBadge status={shoot.status} size="sm" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {shoot.title}
                </h3>
              </div>

              {/* Action Buttons: Call Sheet & Confirm */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCallSheetShootId(shoot.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Open Call Sheet</span>
                </button>

                {shoot.status === 'proposed' && currentUser.role !== 'client' && (
                  <button
                    onClick={() => confirmShoot(shoot.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Shoot</span>
                  </button>
                )}
              </div>
            </div>

            {/* Conflict Warning if any */}
            {shoot.conflictWarning && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Crew Availability Conflict Detected</h5>
                  <p className="mt-0.5">{shoot.conflictWarning}</p>
                </div>
              </div>
            )}

            {/* Date, Location, Call Times Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  Date & Time
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(shoot.startAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(shoot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shoot.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  Shoot Location
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {shoot.location}
                </p>
                <a
                  href={shoot.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Open Directions Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Crew Call Times
                </div>
                <p className="text-sm font-bold text-slate-900">
                  First Call: 07:00 AM
                </p>
                <p className="text-xs text-slate-500">
                  Wardrobe & Hair/Makeup at 07:30 AM
                </p>
              </div>
            </div>

            {/* Production Notes & Wardrobe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-purple-600" />
                  Wardrobe, Styling & Props Notes
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {shoot.wardrobeNotes}
                </p>
              </div>

              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  Key Equipment & Grip Package
                </h5>
                <ul className="text-xs text-slate-700 space-y-1">
                  {shoot.propsEquipment.map((eq, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{eq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Crew Availability & RSVP Tracker */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Crew Call Time & RSVP Status ({shoot.participants.length} Assigned)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {shoot.participants.map((p) => {
                  const user = users.find(u => u.id === p.userId);
                  const isAccepted = p.status === 'accepted';
                  const isAlt = p.status === 'suggested_alternative';

                  return (
                    <div
                      key={p.userId}
                      className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{p.role}</p>
                          <p className="text-[10px] font-mono text-blue-600">Call: {p.callTime}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isAccepted
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isAlt
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isAccepted ? 'Confirmed' : isAlt ? 'Alt Date' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Personal RSVP action for current user */}
              {myParticipantRecord && shoot.status === 'proposed' && (
                <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs text-blue-900">
                    <span className="font-bold">Your Attendance:</span> You are called for {myParticipantRecord.callTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => respondToShoot(shoot.id, 'accepted')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Accept Call
                    </button>
                    <button
                      onClick={() => respondToShoot(shoot.id, 'suggested_alternative', '2026-11-27T08:00:00Z')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                    >
                      Propose Alternate Date
                    </button>
                    <button
                      onClick={() => respondToShoot(shoot.id, 'declined')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        );
      })}

      {projectShoots.length === 0 && (
        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No Shoots Scheduled</h4>
          <p className="text-xs text-slate-500 mt-1">This project does not have live shoot dates locked yet.</p>
          {currentUser.role !== 'client' && (
            <button
              onClick={() => setIsAddShootOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule First Shoot & Call Sheet</span>
            </button>
          )}
        </div>
      )}

      {/* Schedule Shoot & Call Sheet Modal */}
      {isAddShootOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Schedule Shoot & Call Sheet ({project.code})</h4>
              <button onClick={() => setIsAddShootOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateShoot} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Shoot Title *</label>
                <input
                  type="text"
                  required
                  value={shootTitle}
                  onChange={(e) => setShootTitle(e.target.value)}
                  placeholder="e.g. Day 1 — Studio Hero Shoot"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date</label>
                  <input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} className="w-full text-xs p-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Call Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full text-xs p-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Wrap Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full text-xs p-2 rounded-xl border border-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Location / Studio</label>
                <input
                  type="text"
                  value={shootLocation}
                  onChange={(e) => setShootLocation(e.target.value)}
                  placeholder="e.g. Pier 59 Studios, Stage B"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Equipment & Grip (comma separated)</label>
                <input
                  type="text"
                  value={equipmentNotes}
                  onChange={(e) => setEquipmentNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Wardrobe & Styling Notes</label>
                <input
                  type="text"
                  value={wardrobeNotes}
                  onChange={(e) => setWardrobeNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Add Crew to Shoot & Call Sheet</span>
                  <span className="text-blue-600 font-semibold">{selectedCrewIds.length} crew selected</span>
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50/70">
                  {users.filter(u => u.role !== 'client' && u.membershipStatus !== 'pending').length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">No other active crew members yet.</p>
                  ) : (
                    users.filter(u => u.role !== 'client' && u.membershipStatus !== 'pending').map((u) => {
                      const isSel = selectedCrewIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            if (isSel) setSelectedCrewIds(selectedCrewIds.filter(id => id !== u.id));
                            else setSelectedCrewIds([...selectedCrewIds, u.id]);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                            isSel ? 'bg-blue-600 text-white font-semibold' : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                            <span className="truncate">{u.name}</span>
                            <span className={`text-[10px] truncate ${isSel ? 'text-blue-100' : 'text-slate-400'}`}>({u.designation})</span>
                          </div>
                          {isSel && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddShootOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs">Create Shoot & Call Sheet</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

