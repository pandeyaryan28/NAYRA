import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import type { DailyCalorieHistoryItem, MealEntry, NutritionSummaryResponse } from '../../types/index.js';
import { 
  Flame, 
  Trash2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  Droplets,
  Plus
} from 'lucide-react';
import { api } from '../../services/api.js';

export const CalorieTracker: React.FC = () => {
  const { refreshAll, showToast } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dayData, setDayData] = useState<NutritionSummaryResponse | null>(null);
  const [history, setHistory] = useState<DailyCalorieHistoryItem[]>([]);
  const [mealText, setMealText] = useState('');
  const [mealType, setMealType] = useState<string>('breakfast');
  const [isEstimating, setIsEstimating] = useState(false);
  const [isLoadingDay, setIsLoadingDay] = useState(false);

  // Load summary for the selected date
  const loadDateData = async (date: string) => {
    setIsLoadingDay(true);
    try {
      const data = await api.getNutritionSummary(date);
      setDayData(data);
    } catch (e) {
      console.error('Error loading nutrition for date:', e);
    } finally {
      setIsLoadingDay(false);
    }
  };

  // Load 7-day history
  const loadHistory = async () => {
    try {
      const res = await api.getNutritionHistory(7);
      if (res?.history) {
        setHistory(res.history);
      }
    } catch (e) {
      console.error('Error loading calorie history:', e);
    }
  };

  useEffect(() => {
    loadDateData(selectedDate);
    loadHistory();
  }, [selectedDate]);

  const summary = dayData?.summary || {
    targetCalories: 2200,
    consumedCalories: 0,
    remainingCalories: 2200,
    targetProtein: 140,
    consumedProtein: 0,
    targetCarbs: 220,
    consumedCarbs: 0,
    targetFat: 65,
    consumedFat: 0,
    waterIntakeMl: 0,
    mealBreakdown: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
  };

  const meals = dayData?.meals || [];
  const caloriePercent = Math.min(100, Math.round((summary.consumedCalories / summary.targetCalories) * 100));

  const isToday = selectedDate === todayStr;
  const isYesterday = selectedDate === yesterdayStr;

  const getDayDisplayLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleStepDay = (delta: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleIngestMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText.trim()) return;

    setIsEstimating(true);
    try {
      const res = await api.addMealFromText(mealText, mealType, selectedDate);
      showToast(res.message, 'success');
      setMealText('');
      await loadDateData(selectedDate);
      await loadHistory();
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to estimate calories', 'error');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await api.deleteMeal(id);
      showToast('Meal log deleted', 'info');
      await loadDateData(selectedDate);
      await loadHistory();
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleAddWater = async (amountMl: number = 250) => {
    try {
      const res = await api.logWater(amountMl);
      showToast(`+${amountMl}ml logged (${res.waterIntakeMl}ml total)`, 'info');
      await loadDateData(selectedDate);
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-150">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Nutrition & Calories</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Track daily calorie intake, macronutrients, and view your historical progress
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Date Buttons */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isYesterday
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isToday
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Today
            </button>
          </div>

          {/* Stepper + Date Picker */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-lg px-2 py-1 shadow-2xs">
            <button
              onClick={() => handleStepDay(-1)}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs bg-transparent font-mono text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            />
            <button
              onClick={() => handleStepDay(1)}
              disabled={isToday}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Calorie History Strip */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-mono">
              Calorie History (Last 7 Days)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Click any day to view details
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {history.map(item => {
            const isSelected = item.date === selectedDate;
            const pct = Math.min(100, Math.round((item.totalCalories / (item.targetCalories || 2200)) * 100));
            const hasMeals = item.totalCalories > 0;

            return (
              <button
                key={item.date}
                type="button"
                onClick={() => setSelectedDate(item.date)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-slate-900 dark:border-zinc-100 bg-slate-900/5 dark:bg-zinc-800/60 ring-1 ring-slate-900 dark:ring-zinc-100'
                    : 'border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {item.dayLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                    {item.date.slice(5)}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">
                    {item.totalCalories} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    {item.mealCount} {item.mealCount === 1 ? 'meal' : 'meals'}
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      hasMeals ? (pct > 105 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-transparent'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice Banner when viewing past day */}
      {!isToday && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Viewing {getDayDisplayLabel(selectedDate)}'s Nutrition Log ({selectedDate})</span>
          </div>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 cursor-pointer"
          >
            <span>Jump to Today</span>
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Energy & Macros Cards for Selected Day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>{getDayDisplayLabel(selectedDate)}'s Calories</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono">
            {summary.consumedCalories} <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">/ {summary.targetCalories} kcal</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-slate-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${caloriePercent}%` }}></div>
          </div>
          <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
            {summary.remainingCalories} kcal remaining
          </div>
        </div>

        {/* Protein */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>Protein</span>
            <span className="font-mono text-slate-400 dark:text-zinc-500 text-[11px]">{Math.round((summary.consumedProtein / (summary.targetProtein || 140)) * 100)}%</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono">
            {summary.consumedProtein}g <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">/ {summary.targetProtein}g</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-slate-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (summary.consumedProtein / (summary.targetProtein || 140)) * 100)}%` }}></div>
          </div>
        </div>

        {/* Carbs */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>Carbohydrates</span>
            <span className="font-mono text-slate-400 dark:text-zinc-500 text-[11px]">{Math.round((summary.consumedCarbs / (summary.targetCarbs || 220)) * 100)}%</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono">
            {summary.consumedCarbs}g <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">/ {summary.targetCarbs}g</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-slate-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (summary.consumedCarbs / (summary.targetCarbs || 220)) * 100)}%` }}></div>
          </div>
        </div>

        {/* Fats */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>Fats</span>
            <span className="font-mono text-slate-400 dark:text-zinc-500 text-[11px]">{Math.round((summary.consumedFat / (summary.targetFat || 65)) * 100)}%</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono">
            {summary.consumedFat}g <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">/ {summary.targetFat}g</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-slate-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (summary.consumedFat / (summary.targetFat || 65)) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Log Meal Form for Selected Date */}
      <form onSubmit={handleIngestMeal} className="p-4 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
          Log meal for <span className="font-semibold text-slate-900 dark:text-zinc-100">{getDayDisplayLabel(selectedDate)}</span>:
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={mealType}
            onChange={e => setMealType(e.target.value)}
            className="w-full sm:w-32 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none capitalize cursor-pointer"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>

          <input
            type="text"
            required
            placeholder="e.g. 2 boiled eggs, whole wheat toast with butter, and black coffee"
            value={mealText}
            onChange={e => setMealText(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isEstimating || !mealText.trim()}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0 shadow-2xs"
          >
            {isEstimating ? 'Calculating...' : 'Log Meal'}
          </button>
        </div>
      </form>

      {/* Main 2-Col: Meal History for Selected Date & Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meals on Selected Date */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Meals on {getDayDisplayLabel(selectedDate)}
            </h3>
            <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">{meals.length} logged</span>
          </div>

          <div className="space-y-3">
            {meals.map(meal => (
              <div
                key={meal.id}
                className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase font-mono text-slate-900 dark:text-zinc-100">
                      {meal.mealType}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-zinc-100">
                      {meal.totalCalories} kcal
                    </span>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete meal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-zinc-400">
                  {meal.items?.map((item, i) => (
                    <span key={i} className="inline-block mr-3">
                      {item.name} ({item.calories} kcal)
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 dark:text-zinc-500 pt-1 border-t border-slate-200/60 dark:border-zinc-800/60">
                  <span>P: {meal.totalProtein}g</span>
                  <span>C: {meal.totalCarbs}g</span>
                  <span>F: {meal.totalFat}g</span>
                </div>
              </div>
            ))}

            {meals.length === 0 && (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-zinc-500 space-y-1">
                <p className="font-medium text-slate-600 dark:text-zinc-400">No meals logged for this date</p>
                <p className="text-[11px]">Use the prompt above to calculate and log what you ate.</p>
              </div>
            )}
          </div>
        </div>

        {/* Hydration */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Water Intake</h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-900 dark:text-zinc-100">{summary.waterIntakeMl || 0} ml</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, ((summary.waterIntakeMl || 0) / 3000) * 100)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAddWater(250)}
              className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>250ml Glass</span>
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>500ml Bottle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
