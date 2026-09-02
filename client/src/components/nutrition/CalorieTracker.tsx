import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Flame, 
  Droplet, 
  Plus, 
  Trash2, 
  Send
} from 'lucide-react';
import { api } from '../../services/api.js';

export const CalorieTracker: React.FC = () => {
  const { nutritionData, refreshAll, showToast } = useApp();
  const [mealText, setMealText] = useState('');
  const [mealType, setMealType] = useState<string>('breakfast');
  const [isEstimating, setIsEstimating] = useState(false);

  const summary = nutritionData?.summary || {
    targetCalories: 2200,
    consumedCalories: 0,
    remainingCalories: 2200,
    targetProtein: 140,
    consumedProtein: 0,
    targetCarbs: 220,
    consumedCarbs: 0,
    targetFat: 65,
    consumedFat: 0,
    waterIntakeMl: 2000,
    mealBreakdown: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
  };

  const meals = nutritionData?.meals || [];
  const caloriePercent = Math.min(100, Math.round((summary.consumedCalories / summary.targetCalories) * 100));

  const handleIngestMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText.trim()) return;

    setIsEstimating(true);
    try {
      const res = await api.addMealFromText(mealText, mealType);
      showToast(res.message, 'success');
      setMealText('');
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
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleAddWater = async (amountMl: number = 250) => {
    try {
      const res = await api.logWater(amountMl);
      showToast(`+${amountMl}ml logged (${res.waterIntakeMl}ml total)`, 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Nutrition & Calories</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Zero-friction AI nutrition logging powered by Antigravity.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300">
          <span>Remaining: </span>
          <strong className="text-zinc-900 dark:text-zinc-100">{summary.remainingCalories} kcal</strong>
        </div>
      </div>

      {/* Minimal Meal Prompt Bar */}
      <form onSubmit={handleIngestMeal} className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Tell Antigravity AI what you ate:
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={mealType}
            onChange={e => setMealType(e.target.value)}
            className="w-full sm:w-32 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none capitalize"
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
            className="w-full px-3.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isEstimating || !mealText.trim()}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
          >
            {isEstimating ? 'Calculating...' : 'Log Meal'}
          </button>
        </div>
      </form>

      {/* Energy & Macros Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Calories</span>
            <Flame className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {summary.consumedCalories} <span className="text-xs font-normal text-zinc-400">/ {summary.targetCalories}</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-zinc-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${caloriePercent}%` }}></div>
          </div>
        </div>

        {/* Protein */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Protein</span>
            <span className="font-mono text-zinc-400 text-[11px]">{Math.round((summary.consumedProtein / summary.targetProtein) * 100)}%</span>
          </div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {summary.consumedProtein}g <span className="text-xs font-normal text-zinc-400">/ {summary.targetProtein}g</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-zinc-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (summary.consumedProtein / summary.targetProtein) * 100)}%` }}></div>
          </div>
        </div>

        {/* Carbs */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Carbohydrates</span>
            <span className="font-mono text-zinc-400 text-[11px]">{Math.round((summary.consumedCarbs / summary.targetCarbs) * 100)}%</span>
          </div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {summary.consumedCarbs}g <span className="text-xs font-normal text-zinc-400">/ {summary.targetCarbs}g</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-zinc-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (summary.consumedCarbs / summary.targetCarbs) * 100)}%` }}></div>
          </div>
        </div>

        {/* Fats */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Fats</span>
            <span className="font-mono text-zinc-400 text-[11px]">{Math.round((summary.consumedFat / summary.targetFat) * 100)}%</span>
          </div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {summary.consumedFat}g <span className="text-xs font-normal text-zinc-400">/ {summary.targetFat}g</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-zinc-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (summary.consumedFat / summary.targetFat) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main 2-Col: Meal History & Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meal History */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Meals Today</h3>
            <span className="text-xs font-mono text-zinc-400">{meals.length} logged</span>
          </div>

          <div className="space-y-3">
            {meals.map(meal => (
              <div
                key={meal.id}
                className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase font-mono text-zinc-900 dark:text-zinc-100">
                      {meal.mealType}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {meal.totalCalories} kcal
                    </span>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {meal.items?.map((item, i) => (
                    <span key={i} className="inline-block mr-3">
                      {item.name} ({item.calories} kcal)
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <span>P: {meal.totalProtein}g</span>
                  <span>C: {meal.totalCarbs}g</span>
                  <span>F: {meal.totalFat}g</span>
                </div>
              </div>
            ))}

            {meals.length === 0 && (
              <div className="text-center py-12 text-xs text-zinc-400 dark:text-zinc-500">
                No meals logged today yet.
              </div>
            )}
          </div>
        </div>

        {/* Hydration */}
        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Water Intake</h3>
            <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">{summary.waterIntakeMl} ml</span>
          </div>

          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-zinc-900 dark:bg-zinc-200 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (summary.waterIntakeMl / 3000) * 100)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAddWater(250)}
              className="py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              +250ml Glass
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              +500ml Bottle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
