import React, { useState } from 'react';
import type { CalendarEvent } from '../../types/index.js';
import { X } from 'lucide-react';
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
        meetLink: meetLink.trim() || undefined
      };

      if (event?.id) {
        await api.updateCalendarEvent(event.id, payload);
        showToast('Event updated', 'success');
      } else {
        await api.createCalendarEvent(payload);
        showToast('Event scheduled', 'success');
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            {event ? 'Edit Event' : 'Schedule Event'}
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="Event name"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Optional agenda or details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAllDayEvent"
              checked={isAllDay}
              onChange={e => setIsAllDay(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            <label htmlFor="isAllDayEvent" className="text-zinc-600 dark:text-zinc-400 cursor-pointer">All day event</label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start</label>
              <input
                type={isAllDay ? 'date' : 'datetime-local'}
                value={isAllDay ? startTime.split('T')[0] : startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">End</label>
              <input
                type={isAllDay ? 'date' : 'datetime-local'}
                value={isAllDay ? endTime.split('T')[0] : endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">Google Meet / Video Link</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetLink}
              onChange={e => setMeetLink(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : event ? 'Update' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
