import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { PriorityBadge } from '../../components/shared/PriorityBadge';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Clock, 
  FileText, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ExternalLink,
  Edit3,
  X,
  Sparkles,
  Camera,
  CheckSquare,
  Coffee,
  RotateCcw,
  Video,
  UserPlus,
  Trash2,
  Phone,
  Briefcase
} from 'lucide-react';
import { ShootEvent, Task, LeaveRecord } from '../../types';

export const CalendarView: React.FC = () => {
  const { 
    shootEvents, 
    tasks, 
    leaveRecords, 
    projects, 
    users, 
    currentUser, 
    clients,
    setActiveCallSheetShootId, 
    openProject, 
    createShootEvent,
    createTask,
    rescheduleShoot,
    updateTaskStatus
  } = useApp();

  // Calendar navigation state (defaults to November 2026 to match blueprint mock data)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 23)); // Nov 23, 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 10, 25)); // Nov 25, 2026 by default (Pier 59 shoot date)
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'agenda'>('month');

  // Modals state
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [reschedulingShoot, setReschedulingShoot] = useState<ShootEvent | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-11-27');
  const [rescheduleReason, setRescheduleReason] = useState('Talent conflict at original time slot');

  // Add Event Form State
  const [eventType, setEventType] = useState<'shoot' | 'meeting' | 'task'>('shoot');
  const [eventTitle, setEventTitle] = useState('');
  const [eventProject, setEventProject] = useState(projects[0]?.id || '');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('Chelsea Industrial Stage A, NYC');

  // People Involved state
  const [selectedParticipants, setSelectedParticipants] = useState<Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
    phone?: string;
    isCustom?: boolean;
  }>>([
    {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.designation,
      avatar: currentUser.avatar,
      phone: currentUser.phone
    }
  ]);

  const [peopleTab, setPeopleTab] = useState<'team' | 'clients' | 'custom'>('team');
  const [customPersonName, setCustomPersonName] = useState('');
  const [customPersonRole, setCustomPersonRole] = useState('');
  const [customPersonPhone, setCustomPersonPhone] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const today = new Date(2026, 10, 23);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to normalize Date string to YYYY-MM-DD
  const toDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const selectedDateStr = toDateString(selectedDate);

  // Compute calendar days for current month grid (including leading & trailing days)
  const calendarGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false, dateStr: toDateString(d) });
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, dateStr: toDateString(d) });
    }

    // Trailing days from next month to fill grid of 35 or 42
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, dateStr: toDateString(d) });
    }

    return days;
  }, [year, month]);

  // Aggregate works (shoots, tasks, leaves) indexed by date string YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map: Record<string, { shoots: ShootEvent[]; tasks: Task[]; leaves: LeaveRecord[] }> = {};

    const ensure = (key: string) => {
      if (!map[key]) map[key] = { shoots: [], tasks: [], leaves: [] };
      return map[key];
    };

    // Shoots
    shootEvents.forEach((s) => {
      const k = s.startAt.slice(0, 10);
      ensure(k).shoots.push(s);
    });

    // Tasks with due dates
    tasks.forEach((t) => {
      if (t.dueAt) {
        const k = t.dueAt.slice(0, 10);
        ensure(k).tasks.push(t);
      }
    });

    // Leaves
    leaveRecords.forEach((l) => {
      if (l.startDate) {
        ensure(l.startDate).leaves.push(l);
      }
    });

    return map;
  }, [shootEvents, tasks, leaveRecords]);

  // Items for the currently selected date
  const selectedDayItems = eventsByDate[selectedDateStr] || { shoots: [], tasks: [], leaves: [] };
  const totalItemsSelected = selectedDayItems.shoots.length + selectedDayItems.tasks.length + selectedDayItems.leaves.length;

  // Handle Add Event Submit
  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const projectId = eventProject || (projects[0]?.id ?? 'proj_main');

    if (eventType === 'shoot' || eventType === 'meeting') {
      const startAt = `${selectedDateStr}T${startTime}:00Z`;
      const endAt = `${selectedDateStr}T${endTime}:00Z`;
      const isMeeting = eventType === 'meeting';
      const formattedTitle = isMeeting
        ? (eventTitle.trim().startsWith('[Meeting]') ? eventTitle.trim() : `[Meeting] ${eventTitle.trim()}`)
        : eventTitle.trim();

      createShootEvent({
        projectId,
        title: formattedTitle,
        location: location.trim() || (isMeeting ? 'Virtual Conference Room / Google Meet' : 'Production Studio'),
        locationAddress: `${location.trim() || (isMeeting ? 'Remote Sync' : 'Production Studio')}, New York, NY`,
        mapUrl: `https://maps.google.com/?q=${encodeURIComponent(location || 'Studio')}`,
        startAt,
        endAt,
        status: 'proposed',
        participants: selectedParticipants.map((p) => ({
          userId: p.id,
          role: p.role,
          status: p.id === currentUser.id ? 'accepted' : 'pending',
          callTime: startTime
        })),
        wardrobeNotes: isMeeting ? 'Professional video appearance.' : 'Production casual / wardrobe options according to client brief.',
        propsEquipment: isMeeting ? ['Meeting Agenda', 'Presentation Deck', 'Microphone'] : ['Sony FX6 / FX3 Cinema Rig', 'Aputure LED Light Kit', 'Wireless Lavalier Audio'],
        directorNotes: isMeeting ? 'Client & team creative coordination meeting.' : 'Planned commercial production shoot day.'
      });
    } else {
      createTask({
        projectId,
        title: eventTitle.trim(),
        description: `Scheduled deadline task for ${selectedDateStr}. Involves: ${selectedParticipants.map(p => `${p.name} (${p.role})`).join(', ') || 'Lead Assignee'}`,
        assigneeIds: selectedParticipants.map(p => p.id),
        status: 'todo',
        priority: 'high',
        dueAt: `${selectedDateStr}T18:00:00Z`,
        checklists: [
          { id: 'c1', text: 'Deliver required project asset', completed: false }
        ]
      });
    }

    setIsAddEventOpen(false);
    setEventTitle('');
    setSelectedParticipants([
      {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.designation,
        avatar: currentUser.avatar,
        phone: currentUser.phone
      }
    ]);
  };

  // Handle Reschedule Submit
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingShoot) return;

    const originalTime = reschedulingShoot.startAt.slice(11, 16);
    const originalEndTime = reschedulingShoot.endAt.slice(11, 16);
    const newStartAt = `${rescheduleDate}T${originalTime}:00Z`;
    const newEndAt = `${rescheduleDate}T${originalEndTime}:00Z`;

    rescheduleShoot(reschedulingShoot.id, newStartAt, newEndAt, rescheduleReason.trim());
    setSelectedDate(new Date(rescheduleDate));
    setReschedulingShoot(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Month & Year, Nav Buttons, Google Calendar View Switcher */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Navigation and Month display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {monthNames[month]} {year}
          </h2>

          <button
            onClick={goToday}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            Today
          </button>
        </div>

        {/* Right: View mode and Quick Add button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calendarView === 'month' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setCalendarView('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calendarView === 'agenda' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={() => setIsAddEventOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

      </div>

      {/* Main Two-Column Calendar Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Month Calendar Grid OR Agenda List */}
        {calendarView === 'month' ? (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {daysOfWeek.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {calendarGridDays.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDateStr;
                const isToday = cell.dateStr === '2026-11-23';
                const dayData = eventsByDate[cell.dateStr];
                const shootCount = dayData?.shoots.length || 0;
                const taskCount = dayData?.tasks.length || 0;
                const leaveCount = dayData?.leaves.length || 0;
                const hasEvents = shootCount > 0 || taskCount > 0 || leaveCount > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`min-h-[85px] sm:min-h-[115px] p-1 sm:p-2 cursor-pointer transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-blue-50/70 ring-2 ring-blue-500 ring-inset z-10'
                        : cell.isCurrentMonth
                        ? 'hover:bg-slate-50/80 bg-white'
                        : 'bg-slate-50/40 text-slate-300'
                    }`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                          isToday
                            ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                            : isSelected
                            ? 'bg-blue-200 text-blue-900 font-extrabold'
                            : cell.isCurrentMonth
                            ? 'text-slate-800 group-hover:text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      {hasEvents && (
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    {/* Event Badges inside the date box */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {/* Shoots & Meetings */}
                      {dayData?.shoots.map((s) => {
                        const isMeeting = s.title.startsWith('[Meeting]');
                        return (
                          <div
                            key={s.id}
                            className={`truncate text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md border shadow-2xs flex items-center gap-1 ${
                              isMeeting
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                                : 'bg-blue-100 text-blue-900 border-blue-200'
                            }`}
                            title={s.title}
                          >
                            {isMeeting ? (
                              <Video className="w-2.5 h-2.5 shrink-0 text-indigo-600 hidden sm:inline" />
                            ) : (
                              <Camera className="w-2.5 h-2.5 shrink-0 text-blue-600 hidden sm:inline" />
                            )}
                            <span className="truncate">{s.title.replace(/^\[Meeting\]\s*/, '').split('—')[0]}</span>
                          </div>
                        );
                      })}

                      {/* Tasks */}
                      {dayData?.tasks.map((t) => (
                        <div
                          key={t.id}
                          className="truncate text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 hidden sm:flex items-center gap-1"
                          title={t.title}
                        >
                          <CheckSquare className="w-2.5 h-2.5 shrink-0 text-purple-600" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}

                      {/* Leave */}
                      {dayData?.leaves.map((l) => (
                        <div
                          key={l.id}
                          className="truncate text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 hidden sm:flex items-center gap-1"
                        >
                          <Coffee className="w-2.5 h-2.5 shrink-0 text-slate-500" />
                          <span className="truncate">Leave</span>
                        </div>
                      ))}
                    </div>

                    {/* Mobile count indicator */}
                    {hasEvents && (
                      <div className="sm:hidden text-[9px] font-bold text-blue-600 mt-0.5">
                        {shootCount + taskCount + leaveCount} w
                      </div>
                    )}

                    <div />
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300" />
                  <span className="font-semibold text-slate-700">Commercial Shoots</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-100 border border-indigo-300" />
                  <span className="font-semibold text-slate-700">Meetings & Syncs</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-300" />
                  <span className="font-semibold text-slate-700">Deadlines & Tasks</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300" />
                  <span className="font-semibold text-slate-700">Leave / Off-Set</span>
                </span>
              </div>

              <span className="text-[11px] text-slate-400">
                Click any date to inspect, reschedule, or add production works
              </span>
            </div>

          </div>
        ) : (
          /* Mobile-First Agenda / Date Selector View */
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Date (Quick Date Strip)
                </span>
                <span className="text-xs font-bold text-blue-600">{monthNames[month]} {year}</span>
              </div>

              {/* Scrollable 14-day date strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {calendarGridDays.filter(d => d.isCurrentMonth).map((d) => {
                  const isSel = d.dateStr === selectedDateStr;
                  const isTod = d.dateStr === '2026-11-23';
                  const dData = eventsByDate[d.dateStr];
                  const hasWorks = (dData?.shoots.length || 0) + (dData?.tasks.length || 0) + (dData?.leaves.length || 0) > 0;

                  return (
                    <button
                      key={d.dateStr}
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl min-w-[58px] transition-all shrink-0 border active:scale-95 ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : isTod
                          ? 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-80">
                        {daysOfWeek[d.date.getDay()]}
                      </span>
                      <span className="text-base font-black mt-0.5">{d.date.getDate()}</span>
                      {hasWorks && (
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSel ? 'bg-white' : 'bg-blue-600'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Agenda Stream */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                All Scheduled Productions ({shootEvents.length})
              </h4>
              {shootEvents.map((shoot) => {
                const project = projects.find(p => p.id === shoot.projectId);
                return (
                  <div
                    key={shoot.id}
                    onClick={() => setSelectedDate(new Date(shoot.startAt))}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-600">{project?.code}</span>
                          <span className="text-xs font-bold text-slate-900 truncate">{shoot.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {new Date(shoot.startAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • {shoot.location}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={shoot.status} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Column: Date Inspector ("Google Calendar Day Panel" - 4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-5 flex flex-col justify-between">
          <div>
            
            {/* Selected Date Header */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  Selected Date Works
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {selectedDate.toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {totalItemsSelected} Scheduled
              </span>
            </div>

            {/* List of Works on this date */}
            <div className="space-y-3.5 mt-4 max-h-[500px] overflow-y-auto">
              
              {/* Shoots */}
              {selectedDayItems.shoots.map((shoot) => {
                const project = projects.find(p => p.id === shoot.projectId);

                return (
                  <div
                    key={shoot.id}
                    className="p-4 rounded-2xl border-2 border-blue-100 bg-blue-50/30 space-y-3 transition-all hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            {project?.code}
                          </span>
                          <StatusBadge status={shoot.status} size="sm" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {shoot.title}
                        </h4>
                      </div>
                    </div>

                    {/* Time & Location */}
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold text-slate-800">
                          {new Date(shoot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shoot.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {shoot.title.startsWith('[Meeting]') ? (
                          <Video className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        <span className="truncate">{shoot.location}</span>
                      </div>
                    </div>

                    {/* People Involved in Shoot / Meeting */}
                    {shoot.participants && shoot.participants.length > 0 && (
                      <div className="pt-2 border-t border-blue-100/60">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-500" />
                          <span>People Involved ({shoot.participants.length})</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {shoot.participants.map((p) => {
                            const u = users.find(user => user.id === p.userId);
                            const c = clients.find(cl => `client_${cl.id}` === p.userId);
                            const name = u?.name || c?.contactPerson || (p as any).name || (p.userId.startsWith('client_') ? 'Client' : 'Crew Member');
                            const avatar = u?.avatar || c?.logoUrl;
                            return (
                              <div
                                key={p.userId}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs"
                              >
                                {avatar ? (
                                  <img src={avatar} alt={name} className="w-3.5 h-3.5 rounded-full object-cover" />
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-700 text-[9px] flex items-center justify-center font-bold">
                                    {name.charAt(0)}
                                  </span>
                                )}
                                <span className="truncate max-w-[95px]">{name}</span>
                                <span className="text-[9px] text-slate-400 font-normal truncate max-w-[70px]">
                                  ({p.role.split(' ')[0]})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions: View Call Sheet & Reschedule Request */}
                    <div className="flex items-center gap-2 pt-2 border-t border-blue-100">
                      <button
                        onClick={() => setActiveCallSheetShootId(shoot.id)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3 text-sky-400" />
                        <span>Call Sheet</span>
                      </button>

                      <button
                        onClick={() => {
                          setReschedulingShoot(shoot);
                          setRescheduleDate(shoot.startAt.slice(0, 10));
                        }}
                        className="py-1.5 px-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                        title="Request Edit / Reschedule Shoot"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-600" />
                        <span>Reschedule</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Tasks */}
              {selectedDayItems.tasks.map((task) => {
                const project = projects.find(p => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                        {project?.code} • Task
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">{task.title}</h5>

                    {/* Task Involved Assignees */}
                    {task.assigneeIds && task.assigneeIds.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
                        <Users className="w-3 h-3 text-purple-500 shrink-0" />
                        <span className="font-semibold text-slate-600">Involved:</span>
                        {task.assigneeIds.map((uid) => {
                          const u = users.find(user => user.id === uid);
                          const c = clients.find(cl => `client_${cl.id}` === uid);
                          const name = u?.name || c?.contactPerson || (uid.startsWith('client_') ? 'Client' : 'Assignee');
                          return (
                            <span key={uid} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <StatusBadge status={task.status} size="sm" />
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800"
                        >
                          Mark Done ✓
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Leaves */}
              {selectedDayItems.leaves.map((leave) => {
                const u = users.find(user => user.id === leave.userId);
                return (
                  <div key={leave.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Scheduled Absence</span>
                    <p className="font-bold text-slate-800">{u?.name} ({leave.type.replace('_', ' ')})</p>
                    <p className="text-slate-500">"{leave.reason}"</p>
                  </div>
                );
              })}

              {/* Empty state for date */}
              {totalItemsSelected === 0 && (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarIcon className="w-10 h-10 mx-auto opacity-30 text-blue-500" />
                  <p className="text-sm font-bold text-slate-700">No Works on this Date</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    No camera shoots or deadline deliveries are currently scheduled for {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Quick Add Button on Date */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Work for {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Google Calendar Style Quick Add Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Add Work to {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
              </div>
              <button onClick={() => setIsAddEventOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-3.5">
              
              {/* Type Switcher: Shoot, Meeting, Task */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEventType('shoot')}
                  className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    eventType === 'shoot' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Shoot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEventType('meeting')}
                  className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    eventType === 'meeting' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Meeting</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEventType('task')}
                  className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    eventType === 'task' ? 'bg-white shadow-xs text-purple-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Task</span>
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  {eventType === 'shoot' ? 'Shoot Production Title *' : eventType === 'meeting' ? 'Meeting Agenda / Title *' : 'Task / Milestone Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    eventType === 'shoot' 
                      ? 'e.g. Golden Hour Rooftop B-Roll Unit' 
                      : eventType === 'meeting'
                      ? 'e.g. Concept Review & Pre-Pro Alignment'
                      : 'e.g. Rough Cut Assembly Review'
                  }
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Project select */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Project Workspace</label>
                <select
                  value={eventProject}
                  onChange={(e) => setEventProject(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} — {p.title}</option>
                  ))}
                </select>
              </div>

              {/* Time inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    {eventType === 'task' ? 'Due / Start Time' : 'Start / Call Time'}
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    {eventType === 'task' ? 'Completion Time' : 'End / Wrap Time'}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Location or Meeting Link */}
              {eventType !== 'task' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    {eventType === 'shoot' ? 'Shoot Location Address' : 'Meeting Location or Virtual Room Link'}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={eventType === 'shoot' ? 'e.g. Stage C, Chelsea Piers, NY' : 'e.g. Google Meet / Studio Boardroom 1'}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              {/* People Involved (Crew, Clients, Guests) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    People Involved ({selectedParticipants.length})
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    Involved crew, clients, or guests
                  </span>
                </div>

                {/* Selected People Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px] items-center">
                  {selectedParticipants.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No people added yet. Select or add below.</span>
                  ) : (
                    selectedParticipants.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                      >
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold shrink-0">
                            {p.name.charAt(0)}
                          </span>
                        )}
                        <span className="truncate max-w-[110px]">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({p.role.split(' ')[0]})</span>
                        <button
                          type="button"
                          onClick={() => setSelectedParticipants(prev => prev.filter(x => x.id !== p.id))}
                          className="text-slate-400 hover:text-rose-500 ml-0.5"
                          title="Remove from event"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* People Tab Selector */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPeopleTab('team')}
                    className={`flex-1 py-1 px-2 rounded-lg text-center transition-all ${
                      peopleTab === 'team' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Agency Team ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeopleTab('clients')}
                    className={`flex-1 py-1 px-2 rounded-lg text-center transition-all ${
                      peopleTab === 'clients' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Clients ({clients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeopleTab('custom')}
                    className={`flex-1 py-1 px-2 rounded-lg text-center transition-all ${
                      peopleTab === 'custom' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    + Add Guest / Person
                  </button>
                </div>

                {/* Tab: Team Members */}
                {peopleTab === 'team' && (
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-1.5 space-y-1">
                    {users.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2 text-center">No other team members found.</p>
                    ) : (
                      users.map((u) => {
                        const isSelected = selectedParticipants.some(p => p.id === u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedParticipants(prev => prev.filter(p => p.id !== u.id));
                              } else {
                                setSelectedParticipants(prev => [
                                  ...prev,
                                  { id: u.id, name: u.name, role: u.designation, avatar: u.avatar, phone: u.phone }
                                ]);
                              }
                            }}
                            className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                              <span className="truncate">{u.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal truncate">({u.designation})</span>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab: Clients */}
                {peopleTab === 'clients' && (
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-1.5 space-y-1">
                    {clients.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2 text-center">No clients registered yet. Add in Clients tab.</p>
                    ) : (
                      clients.map((c) => {
                        const cid = `client_${c.id}`;
                        const isSelected = selectedParticipants.some(p => p.id === cid);
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedParticipants(prev => prev.filter(p => p.id !== cid));
                              } else {
                                setSelectedParticipants(prev => [
                                  ...prev,
                                  {
                                    id: cid,
                                    name: c.contactPerson || c.brandName,
                                    role: `Client (${c.brandName})`,
                                    avatar: c.logoUrl,
                                    phone: c.phone
                                  }
                                ]);
                              }
                            }}
                            className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs shrink-0">
                                {c.avatar || '🏢'}
                              </span>
                              <span className="truncate">{c.contactPerson || c.brandName}</span>
                              <span className="text-[10px] text-slate-400 font-normal truncate">({c.companyName})</span>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab: Custom External Person */}
                {peopleTab === 'custom' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Person Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={customPersonName}
                          onChange={(e) => setCustomPersonName(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Role / Designation *</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Talent / Model, Sound Tech"
                          value={customPersonRole}
                          onChange={(e) => setCustomPersonRole(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Phone Number</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-slate-400 text-xs font-mono font-bold">+91</span>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={customPersonPhone.startsWith('+91') ? customPersonPhone.replace(/^\+91\s*/, '') : customPersonPhone}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomPersonPhone(val ? `+91 ${val}` : '');
                          }}
                          className="w-full text-xs pl-10 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!customPersonName.trim()}
                      onClick={() => {
                        if (!customPersonName.trim()) return;
                        const newId = `custom_${Date.now()}`;
                        setSelectedParticipants(prev => [
                          ...prev,
                          {
                            id: newId,
                            name: customPersonName.trim(),
                            role: customPersonRole.trim() || 'Production Collaborator',
                            phone: customPersonPhone.trim() || '+91 98765 43210',
                            isCustom: true
                          }
                        ]);
                        setCustomPersonName('');
                        setCustomPersonRole('');
                        setCustomPersonPhone('');
                      }}
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Person to Event</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Schedule Event
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Reschedule / Edit Request Modal (Blueprint Workflow E) */}
      {reschedulingShoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-md w-full max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Request Shoot Reschedule
                </h4>
              </div>
              <button onClick={() => setReschedulingShoot(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Current Scheduled Date:</span>
              <p>{new Date(reschedulingShoot.startAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-[11px] text-amber-800">
                Rescheduling will notify all assigned crew and request renewed availability confirmations.
              </p>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Proposed New Shoot Date
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Reason for Rescheduling *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="State reason: Weather, talent availability, equipment shipment delay..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReschedulingShoot(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
