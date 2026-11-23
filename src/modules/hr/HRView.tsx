import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Calendar, Plus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { LeaveRecord } from '../../types';

export const HRView: React.FC = () => {
  const { currentUser, leaveRecords, applyForLeave, users } = useApp();

  const isAuthorized = currentUser.role === 'owner' || currentUser.role === 'hr_manager';

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveRecord['type']>('annual');
  const [startDate, setStartDate] = useState('2026-12-10');
  const [endDate, setEndDate] = useState('2026-12-14');
  const [reason, setReason] = useState('');

  if (!isAuthorized) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto p-6">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Permission Restricted</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          HR records, compensation notes, and private personnel leave are strictly restricted to Agency Owners and HR Managers as defined in the StudioFlow Security Blueprint.
        </p>
        <p className="text-[11px] text-blue-600 font-semibold mt-3">
          Tip: Switch persona to Marcus Vance (Owner) or Sarah Jenkins (HR Manager) via the top bar to inspect this module.
        </p>
      </div>
    );
  }

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    applyForLeave({
      userId: currentUser.id,
      type: leaveType,
      startDate,
      endDate,
      reason: reason.trim()
    });
    setIsApplyOpen(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              HR, Attendance & Leave Records
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              Confidential Scoped
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Production crew availability blocks, vacation leave, and compensation rest periods
          </p>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Leave Request</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Pending & Approved Leave Schedule ({leaveRecords.length})
        </h3>

        <div className="space-y-3">
          {leaveRecords.map((rec) => {
            const user = users.find(u => u.id === rec.userId);
            return (
              <div
                key={rec.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">{user?.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Type: <strong className="capitalize">{rec.type.replace('_', ' ')}</strong> • {rec.startDate} to {rec.endDate}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">"{rec.reason}"</p>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  rec.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {rec.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Submit Leave Application</h4>
              <button onClick={() => setIsApplyOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="annual">Annual Paid Vacation</option>
                  <option value="shoot_compensation">Post-Shoot Recovery Rest</option>
                  <option value="sick">Medical / Sick Leave</option>
                  <option value="unpaid">Unpaid Personal Time</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reason / Notes</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for absence..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

