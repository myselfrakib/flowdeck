import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Send, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles,
  Download,
  Lock
} from 'lucide-react';

export const ClientPortalView: React.FC = () => {
  const { 
    projects, 
    editVersions, 
    addTimestampComment, 
    approveVersionClient, 
    requestVersionChanges, 
    setCurrentView,
    currentUser 
  } = useApp();

  const project = projects.find(p => p.id === 'proj_aura_radiance') || projects[0];
  const versions = editVersions.filter(v => v.projectId === project.id);
  const activeVersion = versions[versions.length - 1] || versions[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(14);
  const [commentInput, setCommentInput] = useState('');
  const [signerName, setSignerName] = useState('Claire Dupont');
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeVersion) return;
    addTimestampComment(activeVersion.id, currentTime, commentInput.trim());
    setCommentInput('');
  };

  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim() || !activeVersion) return;
    requestVersionChanges(activeVersion.id, revisionNotes.trim());
    setIsRevisionOpen(false);
    setRevisionNotes('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Client Portal Isolated Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Client Approval Portal • Zero-Gossip Zone
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            {project.title}
          </h1>
          <p className="text-xs text-slate-500">
            Aura Botanicals • Reviewed by {signerName}
          </p>
        </div>

        <button
          onClick={() => setCurrentView('overview')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Client Portal</span>
        </button>
      </div>

      {/* Video Screener & Sign-off Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Video Player & Timestamp Scrubbing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeVersion.thumbnailUrl}
                alt="Client Preview Screener"
                className="w-full h-full object-cover opacity-85"
              />

              <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white text-xs font-mono">
                {activeVersion.versionTag}
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 backdrop-blur-xs"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>

              <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-white font-mono text-xs">
                {formatSeconds(currentTime)} / {formatSeconds(activeVersion.durationSeconds)}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
              <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-blue-400 p-1">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max={activeVersion.durationSeconds}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-blue-500"
              />
              <span className="font-mono text-xs text-slate-300 shrink-0">
                {formatSeconds(currentTime)}
              </span>
            </div>
          </div>

          {/* Add Timestamp Note form */}
          <form onSubmit={handlePostComment} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold shrink-0">
              {formatSeconds(currentTime)}
            </div>
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={`Leave client feedback at ${formatSeconds(currentTime)}...`}
              className="flex-1 text-xs sm:text-sm bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Note</span>
            </button>
          </form>

          {/* Client Brief Summary */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Target Deliverable Specs
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Aspect Ratio</span>
                <span className="font-bold text-slate-800">{project.aspectRatio}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Duration</span>
                <span className="font-bold text-slate-800">{project.duration}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Launch Deadline</span>
                <span className="font-bold text-slate-800">{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Sign-off & Comments */}
        <div className="space-y-4">
          
          {/* Sign-off Card */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Official Sign-off
              </span>
              <StatusBadge status={activeVersion.status} size="sm" />
            </div>

            {activeVersion.status === 'approved' ? (
              <div className="p-4 bg-emerald-50 rounded-2xl text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  Version Officially Approved!
                </h4>
                <p className="text-xs text-emerald-800">
                  Locked by {activeVersion.clientApprovedBy} on{' '}
                  {activeVersion.clientApprovedAt ? new Date(activeVersion.clientApprovedAt).toLocaleDateString() : 'Today'}
                </p>
                {activeVersion.finalDeliveryUrl && (
                  <a
                    href={activeVersion.finalDeliveryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Master ProRes File</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  By clicking approve, you grant official client sign-off on {activeVersion.versionTag} for broadcast and ad spend distribution.
                </p>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Digital Signee Name
                  </label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
                  />
                </div>
                <button
                  onClick={() => approveVersionClient(activeVersion.id, signerName)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Sign Off Version</span>
                </button>
                <button
                  onClick={() => setIsRevisionOpen(true)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Request Changes Instead
                </button>
              </div>
            )}
          </div>

          {/* Timestamp Comments */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Your Notes on this Cut ({activeVersion.comments.length})
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {activeVersion.comments.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setCurrentTime(c.timestampSeconds)}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-400 cursor-pointer space-y-1"
                >
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {c.timestampFormatted}
                  </span>
                  <p className="text-xs text-slate-800">{c.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Revision Modal */}
      {isRevisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-slate-900">
              Request Changes on {activeVersion.versionTag}
            </h4>
            <form onSubmit={handleRevisionSubmit} className="space-y-3">
              <textarea
                rows={4}
                required
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Describe desired adjustments for the editing room..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRevisionOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg"
                >
                  Submit Revisions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

