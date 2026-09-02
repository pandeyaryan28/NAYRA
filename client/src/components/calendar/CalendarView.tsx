import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { CalendarEvent } from '../../types/index.js';
import { EventModal } from './EventModal.js';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  RefreshCw, 
  Clock, 
  MapPin, 
  Video, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  Globe
} from 'lucide-react';
import { api } from '../../services/api.js';
import { format, addDays, isSameDay } from 'date-fns';

export const CalendarView: React.FC = () => {
  const { calendarEvents, isSyncing, syncGoogleCalendar, refreshAll, showToast } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayEvents = calendarEvents.filter(e => e.startTime.startsWith(selectedDateStr));

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete calendar event "${title}"?`)) return;
    try {
      await api.deleteCalendarEvent(id);
      showToast('Event removed', 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Generate 7 days strip
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Google Calendar & Schedule</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            2-way synchronized with your Google Calendar events and meetings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncGoogleCalendar}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:border-purple-500/50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : '2-Way Calendar Sync'}</span>
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:opacity-95 shadow-md glow-purple transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {/* Week Day Selector Strip */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {format(selectedDate, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-400 border border-purple-800/40"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedDate(prev => addDays(prev, -1))}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const countForDay = calendarEvents.filter(e => isSameDay(new Date(e.startTime), day)).length;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-purple-900/40 border-purple-500/60 text-white shadow-sm glow-purple'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] uppercase font-mono tracking-wider">{format(day, 'EEE')}</span>
                <span className={`text-base font-bold my-1 ${isToday && !isSelected ? 'text-purple-400 font-mono' : ''}`}>
                  {format(day, 'd')}
                </span>
                {countForDay > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Agenda Schedule List */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 glass-panel">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <span>Agenda for {format(selectedDate, 'EEEE, MMMM do')}</span>
            <span className="text-xs font-mono text-slate-400">({dayEvents.length} events)</span>
          </h3>
        </div>

        <div className="space-y-3">
          {dayEvents.map(event => (
            <div
              key={event.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {event.title}
                  </h4>
                  {event.googleEventId && (
                    <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-800/40" title="Google Calendar Event">
                      <Globe className="w-2.5 h-2.5" /> GCal
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-xs text-slate-400 max-w-xl">{event.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    {event.isAllDay ? 'All Day' : `${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>

                  {event.location && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-cyan-400" /> {event.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions & Meet Link */}
              <div className="flex items-center gap-2 shrink-0">
                {event.meetLink && (
                  <a
                    href={event.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-medium transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Meet</span>
                  </a>
                )}

                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Edit event"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {dayEvents.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-500 font-mono">
              No calendar events scheduled for this day.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <EventModal
          event={editingEvent}
          onClose={() => setIsModalOpen(false)}
          onSaved={refreshAll}
        />
      )}
    </div>
  );
};
