import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  ArrowLeft
} from 'lucide-react';
import { Message, Room } from '../../types';

export const GlobalRoomsView: React.FC = () => {
  const { 
    rooms, 
    messages, 
    sendMessage, 
    convertMessageToTask, 
    projects, 
    users, 
    currentUser, 
    openProject 
  } = useApp();

  const isClient = currentUser.role === 'client';
  const visibleRooms = rooms.filter(r => !isClient || r.visibility === 'client_visible');

  const [activeRoomId, setActiveRoomId] = useState<string>(visibleRooms[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Task conversion state
  const [convertingMessage, setConvertingMessage] = useState<Message | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-11-28');

  const currentRoom = visibleRooms.find(r => r.id === activeRoomId) || visibleRooms[0];
  const roomMessages = currentRoom ? (messages[currentRoom.id] || []) : [];
  const currentProject = currentRoom ? projects.find(p => p.id === currentRoom.projectId) : null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentRoom) return;
    sendMessage(currentRoom.id, inputText.trim());
    setInputText('');
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingMessage || !currentRoom) return;
    convertMessageToTask(currentRoom.id, convertingMessage.id, taskTitle, assigneeId, dueDate);
    setConvertingMessage(null);
  };

  return (
    <div className="space-y-4">
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

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row h-[620px] sm:h-[720px]">
        {/* Left: Rooms list */}
        <div className={`w-full md:w-80 border-r border-slate-200/80 bg-slate-50/50 flex flex-col shrink-0 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-3.5 border-b border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Conversations & Inboxes
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {visibleRooms.map((r) => {
              const isSelected = r.id === currentRoom?.id;
              const project = projects.find(p => p.id === r.projectId);
              const isClientVisible = r.visibility === 'client_visible';

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRoomId(r.id);
                    setMobileView('chat');
                  }}
                  className={`w-full p-3 rounded-2xl text-left transition-all ${
                    isSelected ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {project?.code || 'COMM'}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-blue-500 text-white' : isClientVisible ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isClientVisible ? 'Client' : 'Internal'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold truncate">{r.name}</h4>
                  <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {r.lastMessageText || r.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Chat Stream */}
        {currentRoom ? (
          <div className={`flex-1 flex flex-col min-w-0 bg-white ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}>
            <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 -ml-1 rounded-xl hover:bg-slate-100 text-slate-600 shrink-0"
                  title="Back to Room List"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{currentRoom.name}</h3>
                    <span className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      currentRoom.visibility === 'client_visible' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {currentRoom.visibility === 'client_visible' ? 'Client' : 'Internal'}
                    </span>
                  </div>
                  {currentProject && (
                    <button
                      onClick={() => openProject(currentProject.id, 'overview')}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-0.5"
                    >
                      <span>{currentProject.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {roomMessages.map((msg) => {
                const sender = users.find(u => u.id === msg.senderId);
                const isCurrentUser = msg.senderId === currentUser.id;

                return (
                  <div key={msg.id} className={`flex items-start gap-3 group ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    <img src={sender?.avatar} alt={sender?.name} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                    <div className={`max-w-md space-y-1 ${isCurrentUser ? 'items-end text-right' : ''}`}>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-bold text-slate-700">{sender?.name}</span>
                        <span>•</span>
                        <span>{msg.createdAt}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isCurrentUser ? 'bg-blue-600 text-white rounded-tr-xs' : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                      }`}>
                        {msg.text}
                      </div>
                      {!isClient && (
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
              })}
            </div>

            <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 px-3 py-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Reply in #${currentRoom.name}...`}
                  className="flex-1 text-xs sm:text-sm bg-transparent focus:outline-hidden text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
            Select a room to begin
          </div>
        )}
      </div>

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
    </div>
  );
};

