import React from 'react';
import type { Task, TaskStatus } from '../../types/index.js';
import { 
  Clock, 
  Trash2, 
  Edit3, 
  Play
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useApp } from '../../context/AppContext.js';

interface TaskKanbanProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'completed', label: 'Done' },
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
      showToast(isNowCompleted ? 'Completed' : `Moved to ${newStatus}`, 'info');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTask(id);
      showToast('Task deleted', 'info');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="flex flex-col rounded-xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 space-y-3 min-h-[450px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <span className="text-xs font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
                {col.label}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                {columnTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 space-y-2 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-medium ${task.status === 'completed' ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded cursor-pointer"
                        title="Edit task"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 rounded cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {task.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-amber-500' :
                        'bg-zinc-300 dark:bg-zinc-700'
                      }`}></span>
                      {task.dueDate && <span>{task.dueDate}</span>}
                    </div>

                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task, e.target.value as TaskStatus)}
                      className="bg-zinc-50 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
