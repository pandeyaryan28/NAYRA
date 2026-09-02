import React from 'react';
import { Task, TaskStatus } from '../../types/index.js';
import { 
  CheckCircle2, 
  Clock, 
  Timer, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Check, 
  Tag, 
  Globe,
  Sparkles 
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useApp } from '../../context/AppContext.js';
import confetti from 'canvas-confetti';

interface TaskKanbanProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; border: string }[] = [
  { id: 'todo', label: 'To Do', color: 'text-slate-400', border: 'border-slate-700' },
  { id: 'in_progress', label: 'In Progress', color: 'text-cyan-400', border: 'border-cyan-500/50' },
  { id: 'review', label: 'Review', color: 'text-purple-400', border: 'border-purple-500/50' },
  { id: 'completed', label: 'Completed', color: 'text-emerald-400', border: 'border-emerald-500/50' },
];

export const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks, onEditTask }) => {
  const { refreshAll, showToast, setActiveTab } = useApp();

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      const isNowCompleted = newStatus === 'completed';
      await api.updateTask(task.id, {
        ...task,
        status: newStatus,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined
      });

      if (isNowCompleted) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        showToast(`Task marked completed! 🎉`, 'success');
      } else {
        showToast(`Moved to ${newStatus.replace('_', ' ')}`, 'info');
      }
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete task "${title}"?`)) return;
    try {
      await api.deleteTask(id);
      showToast('Task deleted', 'info');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleStartFocus = (task: Task) => {
    setActiveTab('pomodoro');
    showToast(`Focus session started for: ${task.title}`, 'info');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="flex flex-col rounded-2xl bg-slate-900/50 border border-slate-800 p-4 space-y-3 min-h-[500px]">
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-2 border-b ${col.border}`}>
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-xs tracking-wider uppercase ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  className="rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 p-3.5 space-y-2.5 transition-all glass-panel group"
                >
                  {/* Title and Action Menu */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-xs font-semibold leading-snug ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-cyan-300'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1 text-slate-400 hover:text-cyan-400 rounded"
                        title="Edit task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id, task.title)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {task.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {task.notes}
                    </p>
                  )}

                  {/* Tags & Time */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      task.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>

                    {task.dueDate && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        <Clock className="w-2.5 h-2.5 text-cyan-400" /> {task.dueDate}
                      </span>
                    )}

                    {task.googleTaskId && (
                      <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40" title="Synced with Google Tasks">
                        <Globe className="w-2.5 h-2.5" /> GTasks
                      </span>
                    )}
                  </div>

                  {/* Footer Action Strip */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                    <button
                      onClick={() => handleStartFocus(task)}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-mono text-[10px]"
                      title="Start Pomodoro for this task"
                    >
                      <Timer className="w-3 h-3" />
                      <span>{task.loggedMinutes ? `${task.loggedMinutes}m logged` : 'Start Focus'}</span>
                    </button>

                    {/* Move Column Select */}
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task, e.target.value as TaskStatus)}
                      className="bg-slate-900 text-[10px] text-slate-400 border border-slate-800 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="h-32 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-xs text-slate-600 font-mono">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
