import React, { useState, useMemo } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Pencil,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Habit, HabitFrequency } from '@/types';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  addDays,
  subDays,
} from 'date-fns';
import { getTodayDateString } from '@/lib/utils';

export const HabitsView: React.FC = () => {
  const {
    habits,
    createHabit,
    updateHabit,
    archiveHabit,
    toggleHabitDate,
    deleteHabit,
    settings,
  } = useData();

  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<any>('health');
  const [formFrequency, setFormFrequency] = useState<HabitFrequency>('daily');
  const [formTargetDays, setFormTargetDays] = useState(7);
  const [formColor, setFormColor] = useState('#3b82f6');

  const todayStr = getTodayDateString();

  const visibleHabits = useMemo(() => {
    return habits.filter((h) => (showArchived ? Boolean(h.archived) : !h.archived));
  }, [habits, showArchived]);

  const activeCount = useMemo(() => habits.filter((h) => !h.archived).length, [habits]);
  const archivedCount = useMemo(() => habits.filter((h) => Boolean(h.archived)).length, [habits]);

  const weekDays = useMemo(() => {
    const s = startOfWeek(currentWeekDate, { weekStartsOn: settings.weekStartsOn });
    const e = endOfWeek(currentWeekDate, { weekStartsOn: settings.weekStartsOn });
    return eachDayOfInterval({ start: s, end: e });
  }, [currentWeekDate, settings.weekStartsOn]);

  const handlePrevWeek = () => setCurrentWeekDate((d) => subDays(d, 7));
  const handleNextWeek = () => setCurrentWeekDate((d) => addDays(d, 7));
  const handleTodayWeek = () => setCurrentWeekDate(new Date());

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('health');
    setFormFrequency('daily');
    setFormTargetDays(7);
    setFormColor('#3b82f6');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormTitle(habit.title);
    setFormDescription(habit.description || '');
    setFormCategory(habit.category);
    setFormFrequency(habit.frequency);
    setFormTargetDays(habit.targetDaysPerWeek);
    setFormColor(habit.color);
    setIsModalOpen(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory,
        frequency: formFrequency,
        targetDaysPerWeek: formTargetDays,
        color: formColor,
      });
      setEditingHabit(null);
    } else {
      createHabit({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        category: formCategory,
        frequency: formFrequency,
        targetDaysPerWeek: formTargetDays,
        color: formColor,
        archived: false,
      });
    }

    setFormTitle('');
    setFormDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 select-none">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4 card-enter">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <span>Habit Tracker</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Consistency matrix, streak retention, and progressive adherence monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-md p-0.5 bg-zinc-100/50 dark:bg-zinc-800/50">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all duration-150 ${
                !showArchived
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all duration-150 ${
                showArchived
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Archived ({archivedCount})
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleTodayWeek} className="transition-transform active:scale-95">
            Current Week
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-8 w-8 transition-transform active:scale-90">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-8 w-8 transition-transform active:scale-90">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Habit</span>
          </Button>
        </div>
      </div>

      {/* Habit Matrix Table */}
      <div className="clay-surface rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[minmax(220px,1.5fr)_repeat(7,minmax(48px,1fr))_120px] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <div>Habit & Category</div>
          {weekDays.map((d) => {
            const today = isToday(d);
            return (
              <div key={d.toISOString()} className="text-center">
                <span className="block text-[10px] text-zinc-400">{format(d, 'EEE')}</span>
                <span
                  className={`inline-block font-mono text-xs font-bold ${
                    today ? 'text-zinc-900 dark:text-zinc-100 font-extrabold' : ''
                  }`}
                >
                  {format(d, 'd')}
                </span>
              </div>
            );
          })}
          <div className="text-right">Streak</div>
        </div>

        {/* Habit Rows */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {visibleHabits.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-400">
              {showArchived
                ? 'No archived habits.'
                : 'No active habits recorded yet. Click "New Habit" to start your streak.'}
            </div>
          ) : (
            visibleHabits.map((habit) => {
              // Calculate completions in this active week
              const weekCompletedCount = weekDays.filter((d) => {
                const dateStr = format(d, 'yyyy-MM-dd');
                return Boolean(habit.completions[dateStr]);
              }).length;

              return (
                <div
                  key={habit.id}
                  className={`grid grid-cols-[minmax(220px,1.5fr)_repeat(7,minmax(48px,1fr))_130px] items-center p-3 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30 transition-colors ${
                    habit.archived ? 'opacity-65' : ''
                  }`}
                >
                  {/* Habit Title & Details */}
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-sm shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {habit.title}
                      </span>
                      {habit.archived && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                          Archived
                        </span>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-[11px] text-zinc-400 truncate pl-4">
                        {habit.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pl-4 pt-1">
                      <span className="text-[10px] text-zinc-400 font-mono capitalize">
                        {habit.category} • {weekCompletedCount}/{habit.targetDaysPerWeek} this week
                      </span>
                    </div>
                  </div>

                  {/* 7 Days Toggle Checkboxes */}
                  {weekDays.map((d) => {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const isDone = Boolean(habit.completions[dateStr]);
                    const today = isToday(d);

                    return (
                      <div key={dateStr} className="flex justify-center">
                        <button
                          onClick={() => toggleHabitDate(habit.id, dateStr)}
                          className={`h-7 w-7 rounded-sm flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                              : today
                              ? 'border-2 border-dashed border-zinc-400 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-zinc-200'
                              : 'border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                          }`}
                          aria-label={`Toggle habit on ${dateStr}`}
                        >
                          {isDone && <Check className="h-4 w-4 stroke-[3] task-checkbox-pop" />}
                        </button>
                      </div>
                    );
                  })}

                  {/* Streak, Edit, Archive & Delete */}
                  <div className="flex items-center justify-end gap-1 pr-1">
                    <div className="text-right font-mono mr-1">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                        {habit.currentStreak}d
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        Best: {habit.bestStreak}d
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(habit)}
                      className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      title="Edit habit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => archiveHabit(habit.id, !habit.archived)}
                      className="h-7 w-7 text-zinc-400 hover:text-amber-500"
                      title={habit.archived ? 'Restore habit' : 'Archive habit'}
                    >
                      {habit.archived ? (
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHabit(habit.id)}
                      className="h-7 w-7 text-zinc-400 hover:text-rose-500"
                      title="Delete habit"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New / Edit Habit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
        description={
          editingHabit
            ? 'Modify habit parameters, cadence, or visual theme.'
            : 'Establish a daily or weekly routine to track.'
        }
      >
        <form onSubmit={handleSaveHabit} className="space-y-4">
          <Input
            label="Habit Name"
            placeholder="e.g., Morning Deep Work Block (90 min)"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description / Intent"
            placeholder="e.g., Uninterrupted focus without notifications"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              options={[
                { value: 'work', label: 'Work & Deep Work' },
                { value: 'learning', label: 'Learning & CA Study' },
                { value: 'health', label: 'Health & Hydration' },
                { value: 'fitness', label: 'Fitness & Physical' },
                { value: 'mind', label: 'Mind & Mindfulness' },
                { value: 'general', label: 'General' },
              ]}
            />

            <Select
              label="Frequency"
              value={formFrequency}
              onChange={(e) => setFormFrequency(e.target.value as HabitFrequency)}
              options={[
                { value: 'daily', label: 'Daily (7 days/week)' },
                { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
                { value: 'weekends', label: 'Weekends (Sat-Sun)' },
                { value: 'custom', label: 'Custom Target' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Days per Week"
              type="number"
              min={1}
              max={7}
              value={formTargetDays}
              onChange={(e) => setFormTargetDays(parseInt(e.target.value) || 7)}
            />

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Color Tag
              </label>
              <div className="flex items-center gap-2 pt-1">
                {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setFormColor(col)}
                    className={`h-6 w-6 rounded-sm transition-transform ${
                      formColor === col ? 'scale-110 ring-2 ring-zinc-400' : ''
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
