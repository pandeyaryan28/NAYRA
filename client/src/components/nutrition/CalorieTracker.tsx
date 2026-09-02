import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Flame, 
  Sparkles, 
  Droplet, 
  Plus, 
  Trash2, 
  Utensils, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie,
  Bot,
  Zap,
  CheckCircle2
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
      showToast(`+${amountMl}ml logged! Total: ${res.waterIntakeMl}ml`, 'info');
      await refreshAll();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const mealIcons: Record<string, any> = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Nutrition & Calorie Command</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-friction AI calorie tracking powered by Antigravity natural language ingestion.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Antigravity AI Calorie Calculator:</span>
          <span className="text-emerald-400 font-mono font-semibold">Active</span>
        </div>
      </div>

      {/* Antigravity AI Meal Ingestion Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 glass-panel glow-cyan">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Tell Antigravity AI What You Ate</span>
          </div>

          <form onSubmit={handleIngestMeal} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value)}
                className="w-full sm:w-40 px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
              >
                <option value="breakfast">☕ Breakfast</option>
                <option value="lunch">☀️ Lunch</option>
                <option value="dinner">🌙 Dinner</option>
                <option value="snack">🍪 Snack</option>
              </select>

              <input
                type="text"
                required
                placeholder="e.g. 2 boiled eggs, 2 slices whole wheat toast with butter and black coffee"
                value={mealText}
                onChange={e => setMealText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={isEstimating || !mealText.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:opacity-95 disabled:opacity-50 shadow-md glow-cyan shrink-0 transition-all cursor-pointer"
              >
                {isEstimating ? 'Calculating...' : 'Calculate & Enter'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 You can also tell Antigravity directly in the chat or terminal: <span className="text-cyan-300 font-mono">"I had 200g chicken breast and 1 bowl rice for lunch"</span>.
            </p>
          </form>
        </div>
      </div>

      {/* Energy Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 glass-panel space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Energy Consumed</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-white">
              {summary.consumedCalories} <span className="text-xs text-slate-400">/ {summary.targetCalories} kcal</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">{caloriePercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${caloriePercent}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {summary.remainingCalories} kcal remaining
          </div>
        </div>

        {/* Protein Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 glass-panel space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Protein Goal</span>
            <span className="text-cyan-400 font-mono text-xs font-semibold">4 kcal/g</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {summary.consumedProtein}g <span className="text-xs text-slate-400">/ {summary.targetProtein}g</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              {Math.min(100, Math.round((summary.consumedProtein / summary.targetProtein) * 100))}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (summary.consumedProtein / summary.targetProtein) * 100)}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400">
            Muscle repair & satiety
          </div>
        </div>

        {/* Carbs Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 glass-panel space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Carbohydrates</span>
            <span className="text-amber-400 font-mono text-xs font-semibold">4 kcal/g</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-amber-400">
              {summary.consumedCarbs}g <span className="text-xs text-slate-400">/ {summary.targetCarbs}g</span>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold">
              {Math.min(100, Math.round((summary.consumedCarbs / summary.targetCarbs) * 100))}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (summary.consumedCarbs / summary.targetCarbs) * 100)}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400">
            Brain fuel & physical stamina
          </div>
        </div>

        {/* Fats Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 glass-panel space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Healthy Fats</span>
            <span className="text-rose-400 font-mono text-xs font-semibold">9 kcal/g</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-rose-400">
              {summary.consumedFat}g <span className="text-xs text-slate-400">/ {summary.targetFat}g</span>
            </div>
            <span className="text-xs font-mono text-rose-400 font-semibold">
              {Math.min(100, Math.round((summary.consumedFat / summary.targetFat) * 100))}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-rose-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (summary.consumedFat / summary.targetFat) * 100)}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-400">
            Hormonal balance & joint support
          </div>
        </div>
      </div>

      {/* Meals Timeline & Water Intake Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Meal Log Timeline */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white tracking-wide">Today's Meal Timeline</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{meals.length} meals logged</span>
          </div>

          <div className="space-y-3">
            {meals.map(meal => {
              const Icon = mealIcons[meal.mealType] || Cookie;
              return (
                <div
                  key={meal.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-3 glass-panel group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white capitalize flex items-center gap-2">
                          <span>{meal.mealType}</span>
                          <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 flex items-center gap-1">
                            <Bot className="w-2.5 h-2.5" /> Antigravity Logged
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="text-base font-bold text-emerald-400">{meal.totalCalories}</span>
                        <span className="text-[10px] text-slate-400 ml-1">kcal</span>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
                        title="Delete meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Food items breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-900">
                    {meal.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                        <span className="text-slate-300 truncate">{item.name} ({item.quantity})</span>
                        <span className="font-mono text-emerald-400 shrink-0">{item.calories} kcal</span>
                      </div>
                    ))}
                  </div>

                  {/* Macros strip */}
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 pt-1">
                    <span>Protein: <strong className="text-cyan-400">{meal.totalProtein}g</strong></span>
                    <span>Carbs: <strong className="text-amber-400">{meal.totalCarbs}g</strong></span>
                    <span>Fat: <strong className="text-rose-400">{meal.totalFat}g</strong></span>
                  </div>
                </div>
              );
            })}

            {meals.length === 0 && (
              <div className="text-center py-12 text-xs text-slate-500 font-mono">
                No meals logged today yet. Tell Antigravity what you ate!
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Hydration & Target Summary */}
        <div className="space-y-6">
          {/* Water Tracker */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Water Hydration</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {summary.waterIntakeMl} ml
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (summary.waterIntakeMl / 3000) * 100)}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddWater(250)}
                className="py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+250ml Glass</span>
              </button>

              <button
                onClick={() => handleAddWater(500)}
                className="py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+500ml Bottle</span>
              </button>
            </div>
          </div>

          {/* Meals Calorie Distribution */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 glass-panel text-xs">
            <h3 className="text-sm font-semibold text-white tracking-wide">Daily Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Breakfast:</span>
                <span className="font-mono text-slate-200">{summary.mealBreakdown?.breakfast || 0} kcal</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Lunch:</span>
                <span className="font-mono text-slate-200">{summary.mealBreakdown?.lunch || 0} kcal</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dinner:</span>
                <span className="font-mono text-slate-200">{summary.mealBreakdown?.dinner || 0} kcal</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Snacks:</span>
                <span className="font-mono text-slate-200">{summary.mealBreakdown?.snack || 0} kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
