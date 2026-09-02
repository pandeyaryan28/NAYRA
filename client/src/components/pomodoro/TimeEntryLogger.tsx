import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { Clock } from 'lucide-react';
import { api } from '../../services/api.js';

export const TimeEntryLogger: React.FC = () => {
  const { tasks, refreshAll, showToast } = useApp();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalMinutes = (Number(hours) * 60) + Number(minutes);
    if (totalMinutes <= 0) {
      showToast('Duration must be greater than 0', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTask = tasks.find(t => t.id === selectedTaskId);
      await api.logTime({
        taskId: selectedTaskId || undefined,
        taskTitle: selectedTask?.title || 'Manual Focus Log',
        durationMinutes: totalMinutes,
        sessionType: 'manual',
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString()
      });

      showToast(`Logged ${totalMinutes}m of focus`, 'success');
      setNotes('');
      setHours(0);
      setMinutes(30);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to log time', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Manual Time Log</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Task</label>
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="">General Focus / Untracked</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Hours</label>
            <input
              type="number"
              min="0"
              max="24"
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              step="5"
              value={minutes}
              onChange={e => setMinutes(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Notes</label>
          <input
            type="text"
            placeholder="What did you accomplish?"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
        >
          {isSubmitting ? 'Logging...' : 'Log Time'}
        </button>
      </form>
    </div>
  );
};
