import React, { useState } from 'react';
import { CalendarEvent } from '../../types/index.js';
import { X, Calendar as CalendarIcon, Clock, MapPin, Video, Sparkles } from 'lucide-react';
import { api } from '../../services/api.js';
import { useApp } from '../../context/AppContext.js';

interface EventModalProps {
  event?: CalendarEvent | null;
  onClose: () => void;
  onSaved: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose, onSaved }) => {
  const { showToast } = useApp();
  const now = new Date();
  const defaultStartTime = event?.startTime || new Date(now.setMinutes(0, 0, 0)).toISOString().slice(0, 16);
  const defaultEndTime = event?.endTime || new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay || false);
  const [location, setLocation] = useState(event?.location || '');
  const [meetLink, setMeetLink] = useState(event?.meetLink || '');
  const [category, setCategory] = useState<'work' | 'personal' | 'meeting' | 'health' | 'other'>(event?.category || 'meeting');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<CalendarEvent> = {
        title: title.trim(),
        description: description.trim(),
        startTime: isAllDay ? `${startTime.split('T')[0]}T00:00:00Z` : new Date(startTime).toISOString(),
        endTime: isAllDay ? `${endTime.split('T')[0]}T23:59:59Z` : new Date(endTime).toISOString(),
        isAllDay,
        location: location.trim(),
        meetLink: meetLink.trim() || undefined,
        category
      };

      if (event?.id) {
        await api.updateCalendarEvent(event.id, payload);
        showToast('Event updated and synced with Google Calendar', 'success');
      } else {
        await api.createCalendarEvent(payload);
        showToast('Event scheduled and queued for Google Calendar', 'success');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel glow-purple">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white text-base">
              {event ? 'Edit Event' : 'Schedule Event'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Nayra Architecture & Strategy Review"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={2}
              placeholder="Agenda, objectives, or meeting notes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAllDay"
              checked={isAllDay}
              onChange={e => setIsAllDay(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-0"
            />
            <label htmlFor="isAllDay" className="text-xs text-slate-300 cursor-pointer">All-day event</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" /> Start Time
              </label>
              <input
                type={isAllDay ? 'date' : 'datetime-local'}
                value={isAllDay ? startTime.split('T')[0] : startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" /> End Time
              </label>
              <input
                type={isAllDay ? 'date' : 'datetime-local'}
                value={isAllDay ? endTime.split('T')[0] : endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> Location / Room
              </label>
              <input
                type="text"
                placeholder="HQ / Home Office"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Video className="w-3 h-3 text-emerald-400" /> Google Meet / Video Link
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetLink}
                onChange={e => setMeetLink(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:opacity-95 disabled:opacity-50 shadow-md glow-purple"
            >
              {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
