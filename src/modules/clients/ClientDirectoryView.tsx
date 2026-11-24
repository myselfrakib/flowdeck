import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building, 
  ExternalLink, 
  Mail, 
  Phone, 
  FolderKanban, 
  ShieldCheck, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  X, 
  Sparkles, 
  Briefcase, 
  Users, 
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { ClientProfile } from '../../types';

export const ClientDirectoryView: React.FC = () => {
  const { 
    clients, 
    projects, 
    setCurrentView, 
    openProject, 
    createClient, 
    setIsCreateProjectOpen,
    currentUser 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  // New Client Form State
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'prospect' | 'on_hold'>('active');
  const [selectedAvatar, setSelectedAvatar] = useState('💎');

  const avatarOptions = ['🌸', '⚡', '🏎️', '☕', '☀️', '🎧', '💎', '🚀', '🌿', '👗', '🍔', '🎬', '✨', '🪐', '👟'];

  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = clients.filter(c => c.status === 'active').length;
  const prospectCount = clients.filter(c => c.status === 'prospect').length;
  const totalCampaigns = projects.length;

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !companyName.trim()) return;

    const cleanPhone = phone.trim() ? (phone.startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`) : '+91 98765 43210';
    createClient({
      companyName: companyName.trim(),
      brandName: brandName.trim(),
      contactPerson: contactPerson.trim() || 'Brand Director',
      email: email.trim() || `contact@${brandName.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: cleanPhone,
      avatar: selectedAvatar,
      status
    });

    setIsAddClientOpen(false);
    setCompanyName('');
    setBrandName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Clients
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredClients.length} active client accounts & portals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role !== 'client' && (
            <button
              onClick={() => setIsAddClientOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          )}

          <button
            onClick={() => setCurrentView('client_portal')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
            title="Preview isolated Client Approval Portal"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Portal</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Clients</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{clients.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Enterprise & agency brands</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Retainers</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Under active SLA</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Prospect Pipeline</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{prospectCount}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Pitch & proposal stage</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Live Campaigns</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalCampaigns}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Across all clients</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by brand, legal name, contact person, or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50/50 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Client States ({clients.length})</option>
            <option value="active">Active Retainer</option>
            <option value="prospect">Prospect / Pitching</option>
            <option value="on_hold">On Hold</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Card Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No client accounts found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {clients.length === 0
                ? 'Get started by onboarding your first client. Each client receives a dedicated review portal token and campaign workspace.'
                : 'No clients match your filter criteria.'}
            </p>
          </div>
          <button
            onClick={() => setIsAddClientOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard New Client</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const clientProjects = projects.filter(p => p.clientId === client.id);

            const statusConfig = {
              active: { label: 'ACTIVE RETAINER', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              prospect: { label: 'PROSPECT / PITCH', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
              on_hold: { label: 'ON HOLD', bg: 'bg-slate-100 text-slate-600 border-slate-200' }
            }[client.status];

            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform">
                      {client.avatar}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${statusConfig.bg}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">
                    {client.brandName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{client.companyName}</p>

                  {/* Contact Info Box */}
                  <div className="mt-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{client.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Campaigns & Portal Link */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      {clientProjects.length} Active Campaign(s)
                    </span>
                    {clientProjects.length > 0 ? (
                      <button
                        onClick={() => openProject(clientProjects[0].id, 'overview')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsCreateProjectOpen(true)}
                        className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        <span>+ New Brief</span>
                      </button>
                    )}
                  </div>

                  {/* Direct Launch Client Portal button */}
                  <button
                    onClick={() => setCurrentView('client_portal')}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open Client Approval View</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Brand & Legal Entity</th>
                  <th className="py-3 px-4">Primary Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Live Campaigns</th>
                  <th className="py-3 px-4 text-right">Portal Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const clientProjects = projects.filter(p => p.clientId === client.id);

                  return (
                    <tr key={client.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{client.avatar}</span>
                          <div>
                            <p className="font-bold text-slate-900">{client.brandName}</p>
                            <p className="text-[11px] text-slate-500">{client.companyName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <p>{client.contactPerson}</p>
                        <p className="text-[11px] text-slate-400">{client.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          client.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : client.status === 'prospect'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {client.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{client.phone}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-blue-600">{clientProjects.length} Projects</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setCurrentView('client_portal')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 inline-flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Portal</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Client Modal */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Building className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Onboard New Client Account
                </h4>
              </div>
              <button onClick={() => setIsAddClientOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-3.5">
              
              {/* Brand Emoji Picker */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Brand Logo / Identity Emoji
                </label>
                <div className="flex items-center gap-2 flex-wrap p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {avatarOptions.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`text-xl p-1.5 rounded-lg transition-transform ${
                        selectedAvatar === emoji ? 'bg-blue-600 scale-125 shadow-xs' : 'hover:bg-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Brand / Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Veloce Cold Brew"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Legal Corporate Entity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Veloce Beverage LLC"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Primary Contact Lead Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sofia Rossi (VP Marketing)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sofia@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-semibold text-slate-500 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone.startsWith('+91') ? phone.replace(/^\+91\s*/, '') : phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val ? `+91 ${val}` : '');
                      }}
                      className="w-full text-xs sm:text-sm pl-11 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="active">Active Retainer (Full Access)</option>
                  <option value="prospect">Prospect / Pitching</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              {/* Info notice */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Instant Client Portal Token
                </span>
                <p className="text-[11px] text-blue-800 leading-snug">
                  An isolated secure review portal token will be generated automatically for this client so they can review video edits without seeing internal discussions.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Onboard Client
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
