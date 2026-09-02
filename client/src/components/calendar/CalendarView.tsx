import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import type { CalendarEvent } from '../../types/index.js';
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
  ChevronRight
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

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCalendarEvent(id);
      showToast('Event deleted', 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Calendar</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            2-way synced with Google Calendar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={syncGoogleCalendar}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Week Strip */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              {format(selectedDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 cursor-pointer"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedDate(prev => addDays(prev, -1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const hasEvents = calendarEvents.some(e => isSameDay(new Date(e.startTime), day));

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100 font-semibold shadow-2xs'
                    : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="text-[10px] font-mono uppercase">{format(day, 'EEE')}</span>
                <span className={`text-sm my-0.5 font-bold ${isToday && !isSelected ? 'text-slate-900 dark:text-zinc-100' : ''}`}>
                  {format(day, 'd')}
                </span>
                {hasEvents && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white dark:bg-zinc-900' : 'bg-slate-400 dark:bg-zinc-500'}`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Events Agenda */}
      <div className="rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800/60 shadow-2xs overflow-hidden">
        {dayEvents.map(event => (
          <div
            key={event.id}
            className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-4 group"
          >
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-900 dark:text-zinc-100">
                {event.title}
              </div>
              {event.description && (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">{event.description}</p>
              )}
              <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.isAllDay ? 'All Day' : `${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {event.location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {event.meetLink && (
                <a
                  href={event.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                >
                  <Video className="w-3 h-3" />
                  <span>Join</span>
                </a>
              )}
              <button
                onClick={() => handleEdit(event)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {dayEvents.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400 dark:text-zinc-500">
            No events scheduled for {format(selectedDate, 'MMMM d')}.
          </div>
        )}
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
