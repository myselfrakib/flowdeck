import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { uploadChatImage } from '../../utils/uploadChatImage';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  Globe, 
  Pin, 
  CheckSquare, 
  ExternalLink,
  ShieldAlert,
  X,
  ArrowLeft,
  Plus,
  Users,
  CalendarDays,
  Check,
  ImagePlus,
  Loader2,
  Download
} from 'lucide-react';
import { Message, MessageAttachment, Room } from '../../types';

export const GlobalRoomsView: React.FC = () => {
  const { 
    rooms, 
    messages, 
    sendMessage, 
    convertMessageToTask, 
    createRoom,
    activeBusiness,
    projects, 
    users, 
    currentUser, 
    openProject,
    activeRoomId: globalActiveRoomId,
    setActiveRoomId: setGlobalActiveRoomId,
    markRoomRead,
    addToast
  } = useApp();

  const [isNewRoomOpen, setIsNewRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomProjectId, setNewRoomProjectId] = useState(projects[0]?.id || 'proj_general');
  const [newRoomVisibility, setNewRoomVisibility] = useState<'internal' | 'client_visible'>('internal');
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([currentUser.id]);

  const isClient = currentUser.role === 'client';
  const visibleRooms = rooms.filter(r => !isClient || r.visibility === 'client_visible');

  const [localRoomId, setLocalRoomId] = useState<string>(visibleRooms[0]?.id || '');
  const activeRoomId = globalActiveRoomId && visibleRooms.some(r => r.id === globalActiveRoomId)
    ? globalActiveRoomId
    : localRoomId;
  const setActiveRoomId = (id: string) => {
    setLocalRoomId(id);
    setGlobalActiveRoomId(id);
  };
  const [inputText, setInputText] = useState('');
  const [isFullChatOpen, setIsFullChatOpen] = useState<boolean>(!!globalActiveRoomId);
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsFullChatOpen(!!globalActiveRoomId);
  }, [globalActiveRoomId]);

  // Task conversion state
  const [convertingMessage, setConvertingMessage] = useState<Message | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-11-28');

  const currentRoom = visibleRooms.find(r => r.id === activeRoomId) || visibleRooms[0];
  const roomMessages = currentRoom ? (messages[currentRoom.id] || []) : [];
  const currentProject = currentRoom ? projects.find(p => p.id === currentRoom.projectId) : null;

  useEffect(() => {
    if (isFullChatOpen && currentRoom) {
      markRoomRead(currentRoom.id);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  }, [isFullChatOpen, currentRoom?.id, roomMessages.length]);

  const formatMsgTime = (isoOrLabel: string) => {
    if (!isoOrLabel) return 'Just now';
    const d = new Date(isoOrLabel);
    if (!isNaN(d.getTime()) && isoOrLabel.includes('T')) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return isoOrLabel;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadChatImage(f)));
      setPendingAttachments((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      addToast('Image Upload Failed', err?.message || 'Could not process selected image.', 'danger');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && pendingAttachments.length === 0) || !currentRoom) return;
    sendMessage(currentRoom.id, inputText.trim(), pendingAttachments);
    setInputText('');
    setPendingAttachments([]);
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingMessage || !currentRoom) return;
    convertMessageToTask(currentRoom.id, convertingMessage.id, taskTitle, assigneeId, dueDate);
    setConvertingMessage(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Messages & Project Rooms
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {visibleRooms.length} Active Channels
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time coordination with strict client/internal privacy boundary
          </p>
        </div>

        {!isClient && (
          <button
            onClick={() => {
              setNewRoomProjectId(projects[0]?.id || 'proj_general');
              setIsNewRoomOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Room</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[520px]">
        {/* Rooms list */}
        <div className="w-full bg-slate-50/50 flex flex-col flex-1">
          <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Conversations & Inboxes ({visibleRooms.length})
            </span>
            {!isClient && (
              <button
                onClick={() => setIsNewRoomOpen(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 content-start">
            {visibleRooms.map((r, rIdx) => {
              const isSelected = r.id === currentRoom?.id;
              const project = projects.find(p => p.id === r.projectId);
              const isClientVisible = r.visibility === 'client_visible';

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRoomId(r.id);
                    setIsFullChatOpen(true);
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                    isSelected ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-2xs' : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-xs text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        #{rIdx + 1}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                        {project?.code || 'COMM'}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isClientVisible ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isClientVisible ? 'Client' : 'Internal'}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold truncate">{r.name}</h4>
                  <p className="text-[11px] truncate mt-1 text-slate-500">
                    {r.lastMessageText || r.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-Page Chat View when a chat is clicked */}
      {isFullChatOpen && currentRoom && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-150">
          <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => {
                  setIsFullChatOpen(false);
                  setGlobalActiveRoomId(null);
                }}
                className="p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-700 shrink-0 flex items-center gap-1 text-xs font-bold"
                title="Back to Rooms"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{currentRoom.name}</h3>
                  <span className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    currentRoom.visibility === 'client_visible' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {currentRoom.visibility === 'client_visible' ? 'Client' : 'Internal'}
                  </span>
                </div>
                {currentProject && (
                  <div className="flex items-center gap-3 mt-0.5">
                    <button
                      onClick={() => {
                        setIsFullChatOpen(false);
                        openProject(currentProject.id, 'overview');
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>{currentProject.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setIsFullChatOpen(false);
                        openProject(currentProject.id, 'schedule');
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200"
                    >
                      <CalendarDays className="w-3 h-3" />
                      <span>Shoot & Call Sheet →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{(currentRoom.memberIds || []).length} members</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
            {roomMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 opacity-30 text-blue-500" />
                <p className="text-sm font-bold text-slate-700">No messages yet</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Send a message or upload reference images to collaborate with your crew.
                </p>
              </div>
            ) : (
            roomMessages.map((msg, msgIdx) => {
              const sender = users.find(u => u.id === msg.senderId);
              const senderName = sender?.name || msg.senderName || 'Team Member';
              const senderAvatar = sender?.avatar || msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
              const isCurrentUser = msg.senderId === currentUser.id;

              return (
                <div key={msg.id} className={`flex items-start gap-3 group ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  <img src={senderAvatar} alt={senderName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200" />
                  <div className={`max-w-lg space-y-1 ${isCurrentUser ? 'items-end text-right' : ''}`}>
                    <div className={`flex items-center gap-2 text-[11px] text-slate-400 ${isCurrentUser ? 'justify-end' : ''}`}>
                      <span className="font-mono text-[10px] font-bold text-slate-500">#{msgIdx + 1}</span>
                      <span className="font-bold text-slate-700">{senderName}</span>
                      <span>•</span>
                      <span>{formatMsgTime(msg.createdAt)}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                      isCurrentUser ? 'bg-blue-600 text-white rounded-tr-xs' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                    }`}>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`grid gap-2 ${msg.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {msg.attachments.map((att, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => setLightboxImage({ url: att.url, name: att.name })}
                              className="block overflow-hidden rounded-xl border border-black/10 bg-black/5 hover:opacity-95 transition-opacity text-left"
                            >
                              <img
                                src={att.url}
                                alt={att.name}
                                className="max-h-60 w-full object-cover rounded-xl"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                      {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                    </div>
                    {!isClient && msg.text && (
                      <div className={`flex items-center gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                        <button
                          onClick={() => {
                            setConvertingMessage(msg);
                            setTaskTitle(msg.text.slice(0, 50));
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Convert to Task</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0 safe-bottom space-y-2">
            {pendingAttachments.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-5xl mx-auto">
                {pendingAttachments.map((att, idx) => (
                  <div key={idx} className="relative shrink-0 group">
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2 max-w-5xl mx-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                title="Upload images"
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <ImagePlus className="w-4 h-4" />
                )}
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Reply in #${currentRoom.name}...`}
                className="flex-1 text-xs sm:text-sm bg-transparent focus:outline-hidden text-slate-800"
              />
              <button
                type="submit"
                disabled={(!inputText.trim() && pendingAttachments.length === 0) || isUploadingImage}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-4xl flex items-center justify-between text-white mb-3" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs font-semibold truncate">{lightboxImage.name}</span>
            <div className="flex items-center gap-2">
              <a
                href={lightboxImage.url}
                download={lightboxImage.name}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <img
            src={lightboxImage.url}
            alt={lightboxImage.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Convert to Task Modal */}
      {convertingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 max-w-md w-full space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Convert Message to Project Task</h4>
            <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
              "{convertingMessage.text}"
            </div>
            <form onSubmit={handleConvertSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
                className="w-full text-xs p-2 rounded-xl border border-slate-200"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-slate-200"
                >
                  {users.filter(u => u.role !== 'client').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setConvertingMessage(null)} className="text-xs text-slate-600 px-3 py-1.5">Cancel</button>
                <button type="submit" className="text-xs font-bold text-white bg-blue-600 px-4 py-1.5 rounded-lg">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {isNewRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 max-w-md w-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Start New Room / Meeting Channel</h4>
              <button onClick={() => setIsNewRoomOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRoomName.trim()) return;
                const finalMembers = Array.from(new Set([currentUser.id, ...selectedCrewIds]));
                const created = createRoom({
                  businessId: activeBusiness.id,
                  projectId: newRoomProjectId || projects[0]?.id || 'proj_general',
                  name: newRoomName.trim(),
                  description: newRoomDesc.trim() || 'Agency discussion & meeting channel',
                  roomType: newRoomVisibility === 'client_visible' ? 'client_discussion' : 'internal_planning',
                  visibility: newRoomVisibility,
                  memberIds: finalMembers,
                  lastMessageText: `Room started with ${finalMembers.length} crew member(s).`,
                  lastMessageTime: 'Just now'
                });
                sendMessage(created.id, `Room "${created.name}" created. Invited crew can now discuss and coordinate here.`);
                setActiveRoomId(created.id);
                setIsFullChatOpen(true);
                setNewRoomName('');
                setNewRoomDesc('');
                setSelectedCrewIds([currentUser.id]);
                setIsNewRoomOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  For Which Project / Meeting *
                </label>
                <select
                  value={newRoomProjectId}
                  onChange={(e) => setNewRoomProjectId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-600"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.title} ({p.clientName})
                    </option>
                  ))}
                  <option value="proj_general">General / Agency-Wide Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Room or Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Post-Production Sync or Client Kickoff"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Topic / Agenda
                </label>
                <input
                  type="text"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="Purpose or meeting agenda"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Room Privacy Scope
                </label>
                <select
                  value={newRoomVisibility}
                  onChange={(e) => setNewRoomVisibility(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-600"
                >
                  <option value="internal">Internal Crew Only (Private)</option>
                  <option value="client_visible">Client-Visible Room / Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Add Crew to Discuss & Message</span>
                  <span className="text-blue-600 font-semibold">{selectedCrewIds.length} selected</span>
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
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewRoomOpen(false)} className="text-xs text-slate-600 px-3 py-1.5">Cancel</button>
                <button type="submit" className="text-xs font-bold text-white bg-blue-600 px-4 py-1.5 rounded-xl">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

