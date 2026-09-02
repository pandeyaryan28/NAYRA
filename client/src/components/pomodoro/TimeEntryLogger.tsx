import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { Clock, Plus, Tag, CheckSquare, Sparkles } from 'lucide-react';
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
      showToast('Please enter a duration greater than 0', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTask = tasks.find(t => t.id === selectedTaskId);
      await api.logTime({
        taskId: selectedTaskId || undefined,
        taskTitle: selectedTask?.title || 'Manual Work Entry',
        durationMinutes: totalMinutes,
        sessionType: 'manual',
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString()
      });

      showToast(`Logged ${totalMinutes} minutes of work!`, 'success');
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
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 glass-panel">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white tracking-wide">Manual Work Entry Log</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Associated Task (Optional)</label>
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="">-- General Focus / No specific task --</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Hours</label>
            <input
              type="number"
              min="0"
              max="24"
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              step="5"
              value={minutes}
              onChange={e => setMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Session Summary / Notes</label>
          <input
            type="text"
            placeholder="e.g. Worked on Firebase rules, sync routines, and UI polishing"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium text-xs hover:opacity-95 disabled:opacity-50 shadow-md glow-purple transition-all"
        >
          {isSubmitting ? 'Logging...' : 'Log Time Spent'}
        </button>
      </form>
    </div>
  );
};
