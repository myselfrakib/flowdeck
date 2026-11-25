import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, FolderKanban, CheckSquare, MessageSquare, Users, Building, X, ArrowRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    projects, 
    tasks, 
    rooms, 
    users, 
    clients,
    openProject,
    setCurrentView,
    setSelectedProjectId
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredProjects = q
    ? projects.filter(p => (p.title || '').toLowerCase().includes(q) || (p.clientName || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q))
    : projects.slice(0, 3);

  const filteredTasks = q
    ? tasks.filter(t => (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
    : tasks.slice(0, 3);

  const filteredRooms = q
    ? rooms.filter(r => (r.name || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q))
    : rooms.slice(0, 3);

  const filteredUsers = q
    ? users.filter(u => (u.name || '').toLowerCase().includes(q) || (u.phone || '').includes(q) || (u.designation || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q))
    : users.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-blue-600 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, team by name/phone, rooms, clients..."
            className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">ESC</kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <FolderKanban className="w-3.5 h-3.5" />
                Projects
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      openProject(p.id, 'overview');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-blue-50/80 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {p.code}
                        </span>
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                          {p.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{p.clientName} • {p.status.replace('_', ' ')}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <CheckSquare className="w-3.5 h-3.5" />
                Tasks
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      openProject(t.projectId, 'tasks');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-800">{t.title}</span>
                      <p className="text-xs text-slate-500 mt-0.5">Status: {t.status} • Priority: {t.priority}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rooms */}
          {filteredRooms.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Discussion Rooms
              </div>
              <div className="space-y-1">
                {filteredRooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      openProject(r.projectId, 'rooms');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{r.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          r.visibility === 'client_visible' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.visibility === 'client_visible' ? 'Client Visible' : 'Internal Only'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team / Users */}
          {filteredUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                Team & Personnel Directory
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setCurrentView('team');
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100"
                  >
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.designation} • {u.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredProjects.length === 0 && filteredTasks.length === 0 && filteredRooms.length === 0 && filteredUsers.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by client name, project code, or role title</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <strong>Tab</strong> or click</span>
          <span>StudioFlow Search Engine</span>
        </div>
      </div>
    </div>
  );
};

