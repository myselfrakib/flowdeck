import React, { useState, useRef } from 'react';
import { Project, EditVersion, VersionStatus } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  RotateCcw, 
  MessageSquare, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  Film,
  Download,
  AlertCircle
} from 'lucide-react';

interface Props {
  project: Project;
}

export const ProjectApprovalsTab: React.FC<Props> = ({ project }) => {
  const { 
    editVersions, 
    addTimestampComment, 
    approveVersionInternally, 
    approveVersionClient, 
    requestVersionChanges, 
    currentUser, 
    users 
  } = useApp();

  const projectVersions = editVersions.filter(v => v.projectId === project.id);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    projectVersions[projectVersions.length - 1]?.id || ''
  );

  const activeVersion = projectVersions.find(v => v.id === selectedVersionId) || projectVersions[0];

  // Video Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [signerName, setSignerName] = useState(currentUser.name);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeVersion) return;
    addTimestampComment(activeVersion.id, currentTime, commentInput.trim());
    setCommentInput('');
  };

  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim() || !activeVersion) return;
    requestVersionChanges(activeVersion.id, revisionNotes.trim());
    setIsRevisionModalOpen(false);
    setRevisionNotes('');
  };

  if (!activeVersion) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
        <Film className="w-12 h-12 mx-auto text-slate-300 mb-2" />
        <h4 className="text-sm font-bold text-slate-800">No Review Cuts Uploaded</h4>
        <p className="text-xs text-slate-500 mt-1">Video editors will submit version cuts here for review.</p>
      </div>
    );
  }

  const isClient = currentUser.role === 'client';
  const isApproved = activeVersion.status === 'approved';

  return (
    <div className="space-y-6">
      
      {/* Version Selector Tabs */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            Version Timeline:
          </span>
          {projectVersions.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVersionId(v.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                v.id === activeVersion.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{v.versionTag}</span>
              <StatusBadge status={v.status} size="sm" />
            </button>
          ))}
        </div>

        <a
          href={activeVersion.driveLink}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          <span>Raw ProRes Vault</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Review Section: Video Player (Left) & Timestamp Comments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Video Player & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 relative">
            
            {/* Simulated High-Res Video Screen */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeVersion.thumbnailUrl}
                alt="Video Cut Frame"
                className="w-full h-full object-cover opacity-80"
              />

              {/* Watermark Overlay */}
              <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white text-xs font-mono">
                {project.code} • {activeVersion.versionTag}
              </div>

              {/* Center Play Button Overlay */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 backdrop-blur-xs"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>

              {/* Timestamp overlay */}
              <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-white font-mono text-xs">
                {formatSeconds(currentTime)} / {formatSeconds(activeVersion.durationSeconds)}
              </div>
            </div>

            {/* Scrubber & Player Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-blue-400 p-1"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                {/* Timeline Scrubber */}
                <input
                  type="range"
                  min="0"
                  max={activeVersion.durationSeconds}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <span className="font-mono text-xs text-slate-300 shrink-0">
                  {formatSeconds(currentTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Note Input Bar at Current Playhead */}
          <form onSubmit={handleAddComment} className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold shrink-0">
              {formatSeconds(currentTime)}
            </div>
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={`Add feedback at frame ${formatSeconds(currentTime)}...`}
              className="flex-1 min-w-[140px] text-xs sm:text-sm bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Note</span>
            </button>
          </form>

          {/* Version Details & Change Notes */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Release Notes & Revision Summary
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {activeVersion.changeNotes}
            </p>
          </div>
        </div>

        {/* Right Col: Timestamp Comments & Formal Approvals */}
        <div className="space-y-4">
          
          {/* Approval Action Box */}
          <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Approval Gate
              </span>
              <StatusBadge status={activeVersion.status} size="sm" />
            </div>

            {isApproved ? (
              /* Approved State Card */
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  Approved for Final Delivery!
                </h4>
                <p className="text-xs text-emerald-800">
                  Signed by <strong>{activeVersion.clientApprovedBy || 'Client'}</strong> on{' '}
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
                    <span>Download Master ProRes 4444</span>
                  </a>
                )}
              </div>
            ) : (
              /* Pending Decision Controls */
              <div className="space-y-3">
                {/* Internal Manager Review (if not yet approved internally) */}
                {!activeVersion.internalApprovedBy && (
                  <button
                    onClick={() => approveVersionInternally(activeVersion.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>Internal Manager Sign-off</span>
                  </button>
                )}

                {/* Client Final Approval Button */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
                  <span className="text-[11px] font-bold text-blue-900 block">
                    Client Formal Approval (Digital Sign-off)
                  </span>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Signee Full Name"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white"
                  />
                  <button
                    onClick={() => approveVersionClient(activeVersion.id, signerName)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Lock Cut</span>
                  </button>
                </div>

                {/* Request Changes button */}
                <button
                  onClick={() => setIsRevisionModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Request Revisions</span>
                </button>
              </div>
            )}
          </div>

          {/* Timestamp Comments List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Timestamp Feedback ({activeVersion.comments.length})
              </h4>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {activeVersion.comments.map((comm) => {
                const user = users.find(u => u.id === comm.userId);
                return (
                  <div
                    key={comm.id}
                    onClick={() => handleSeek(comm.timestampSeconds)}
                    className="p-3 rounded-2xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {comm.timestampFormatted}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{user?.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{comm.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pl-1">
                      {comm.text}
                    </p>
                  </div>
                );
              })}

              {activeVersion.comments.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No timestamped notes on this cut.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Revision Request Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-slate-900">
              Request Consolidated Revisions
            </h4>
            <p className="text-xs text-slate-500">
              Consolidate feedback into an actionable brief for video editor Zoe Chen.
            </p>
            <form onSubmit={handleRevisionSubmit} className="space-y-3">
              <textarea
                rows={4}
                required
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="List specific changes: pacing, title cards, color grading, audio stems..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  Dispatch Revisions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

