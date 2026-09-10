import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { HabitModal } from './HabitModal.js';
import type { Habit } from '../../types/index.js';
import { 
  Plus, 
  Flame, 
  Trophy, 
  Check, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Droplets, 
  Activity, 
  BookOpen, 
  Target, 
  Heart, 
  Smile, 
  MoreVertical, 
  Trash2, 
  Edit2 
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Habits' },
  { id: 'health', label: 'Health' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'learning', label: 'Learning' },
  { id: 'finance', label: 'Finance' },
];

const getHabitIcon = (iconName?: string) => {
  switch (iconName) {
    case 'flame': return Flame;
    case 'droplets': return Droplets;
    case 'activity': return Activity;
    case 'book-open': return BookOpen;
    case 'target': return Target;
    case 'heart': return Heart;
    case 'smile': return Smile;
    case 'sparkles':
    default:
      return Sparkles;
  }
};

export const HabitsView: React.FC = () => {
  const { habits, toggleHabit, createHabit, updateHabit, deleteHabit } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const isSelectedDateToday = selectedDate === todayStr;

  // Filter habits
  const filteredHabits = habits.filter(h => {
    if (selectedCategory === 'all') return true;
    return h.category === selectedCategory;
  });

  // Calculate metrics for selected date
  const totalHabits = habits.length;
  const completedCount = habits.filter(h => h.completedDates?.includes(selectedDate)).length;
  const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const highestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  // Generate 7-day rolling window: 6 days ago -> today
  const rollingDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      dateObj: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dayNum: format(d, 'd')
    };
  });

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
    setMenuOpenId(null);
  };

  const handleSaveHabit = (habitData: Partial<Habit>) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
    } else {
      createHabit(habitData);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Habits & Disciplines
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Live Tracker
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Maintain daily consistency, compound atomic routines, and track streaks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Daily Progress & Streak Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              {isSelectedDateToday ? "Today's Completion" : `Completion for ${selectedDate}`}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-900 dark:text-zinc-100">
              {completedCount} / {totalHabits} ({completionRate}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          {completionRate === 100 && totalHabits > 0 && (
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <span>🎉</span> All routines complete for this day! Outstanding work, Commander.
            </p>
          )}
        </div>

        {/* Highest Streak Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Top Active Streak
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-500">
                {highestStreak}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                days unbroken
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Active Habits Count */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Active Disciplines
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">
                {totalHabits}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                routines configured
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Rolling 7-Day Week Strip Selector */}
      <div className="p-3 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Select Date to View or Check Off:</span>
          </span>
          {!isSelectedDateToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Jump to Today
            </button>
          )}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {rollingDays.map(day => {
            const isSelected = selectedDate === day.dateStr;
            const isToday = day.dateStr === todayStr;
            const dayHabitsCompleted = habits.filter(h => h.completedDates?.includes(day.dateStr)).length;
            const dayRate = totalHabits > 0 ? dayHabitsCompleted / totalHabits : 0;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-2xs'
                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase ${isToday ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                  {day.dayName}
                </span>
                <span className={`text-xs font-bold font-mono ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                  {day.dayNum}
                </span>
                {/* Micro completion indicator */}
                <div className="flex gap-0.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    dayRate === 1 ? 'bg-emerald-500' : dayRate > 0 ? 'bg-amber-400' : 'bg-slate-200 dark:bg-zinc-800'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xs'
                : 'bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215]">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-slate-400 dark:text-zinc-600 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">No habits in this view</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
            Build your first habit routine to start stacking continuous streaks.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Habit</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map(habit => {
            const IconComponent = getHabitIcon(habit.icon);
            const isCompletedForDate = habit.completedDates?.includes(selectedDate);

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-xl bg-white dark:bg-[#121215] border transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs ${
                  isCompletedForDate
                    ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold transition-colors ${
                        isCompletedForDate ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-800 dark:text-zinc-200'
                      }`}>
                        {habit.title}
                      </h3>
                      <span 
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                      >
                        {habit.category}
                      </span>
                    </div>
                    {habit.description && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {habit.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Center: 7-Day Mini Dots & Streaks */}
                <div className="flex items-center gap-6 self-start md:self-center">
                  {/* Rolling 7-day mini progress */}
                  <div className="flex items-center gap-1.5">
                    {rollingDays.map(d => {
                      const done = habit.completedDates?.includes(d.dateStr);
                      return (
                        <div 
                          key={d.dateStr}
                          title={`${d.dayName}, ${d.dayNum}: ${done ? 'Completed' : 'Missed'}`}
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] transition-all ${
                            done 
                              ? 'bg-emerald-500 text-white font-bold' 
                              : 'bg-slate-100 dark:bg-zinc-800/80 text-transparent'
                          }`}
                        >
                          {done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Streaks Badges */}
                  <div className="flex items-center gap-2 border-l border-slate-200 dark:border-zinc-800 pl-4">
                    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-amber-500" title="Current Streak">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{habit.streak || 0}d</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-400 dark:text-zinc-500" title="Best Streak">
                      <Trophy className="w-3 h-3" />
                      <span>{habit.bestStreak || 0}d</span>
                    </div>
                  </div>
                </div>

                {/* Right: Interactive Check Button & Menu */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => toggleHabit(habit.id, selectedDate)}
                    title={isCompletedForDate ? "Mark as uncompleted" : "Mark as completed"}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isCompletedForDate
                        ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${isCompletedForDate ? 'stroke-[3]' : 'stroke-[2]'}`} />
                    <span>{isCompletedForDate ? 'Done' : 'Check In'}</span>
                  </button>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === habit.id ? null : habit.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpenId === habit.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-20 animate-in fade-in duration-100">
                        <button
                          onClick={() => handleOpenEdit(habit)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteHabit(habit.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />
    </div>
  );
};
