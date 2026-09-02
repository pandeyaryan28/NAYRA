import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { Task } from '../../types/index.js';
import { TaskKanban } from './TaskKanban.js';
import { TaskModal } from './TaskModal.js';
import { 
  CheckSquare, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Globe,
  List,
  Columns3,
  Clock,
  CheckCircle2,
  Trash2,
  Edit3
} from 'lucide-react';
import { api } from '../../services/api.js';

export const TaskManager: React.FC = () => {
  const { tasks, isSyncing, syncGoogleTasks, refreshAll, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const isCompleted = task.status === 'completed';
      await api.updateTask(task.id, {
        ...task,
        status: isCompleted ? 'todo' : 'completed',
        completedAt: !isCompleted ? new Date().toISOString() : undefined
      });
      showToast(isCompleted ? 'Task marked active' : 'Task completed!', 'success');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Google Tasks Sync Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Task & Project Command</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your high-priority projects and 2-way synchronize with Google Tasks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={syncGoogleTasks}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : '2-Way Google Sync'}</span>
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-95 shadow-md glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter tasks by name, note, or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-slate-950/80 text-xs text-slate-300 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              viewMode === 'kanban' ? 'bg-slate-800 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              viewMode === 'list' ? 'bg-slate-800 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'kanban' ? (
        <TaskKanban tasks={filteredTasks} onEditTask={handleEdit} />
      ) : (
        /* List View */
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-2 glass-panel">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'border-slate-700 text-transparent hover:border-cyan-400 hover:text-cyan-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <div>
                  <div className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-cyan-300'}`}>
                    {task.title}
                  </div>
                  {task.notes && (
                    <div className="text-[11px] text-slate-400 truncate max-w-xl">{task.notes}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                  task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  task.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {task.priority}
                </span>

                {task.dueDate && (
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {task.dueDate}
                  </span>
                )}

                <button
                  onClick={() => handleEdit(task)}
                  className="p-1 text-slate-400 hover:text-cyan-400"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-500 font-mono">
              No tasks match your filters.
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
          onSaved={refreshAll}
        />
      )}
    </div>
  );
};
