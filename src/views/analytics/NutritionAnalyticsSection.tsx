import React from 'react';
import { UtensilsCrossed, TrendingUp, PieChart, Activity } from 'lucide-react';
import { CalorieEntry, UserSettings } from '@/types';
import { TimeHorizon } from '@/views/AnalyticsView';

interface NutritionAnalyticsSectionProps {
  calorieEntries: CalorieEntry[];
  settings: UserSettings;
  timeHorizon: TimeHorizon;
  todayStr: string;
}

export const NutritionAnalyticsSection: React.FC<NutritionAnalyticsSectionProps> = ({
  calorieEntries,
  settings,
  todayStr,
}) => {
  const uniqueDays = Array.from(new Set(calorieEntries.map((c) => c.date)));
  const totalLoggedCalories = calorieEntries.reduce((sum, c) => sum + c.calories, 0);
  const totalProtein = calorieEntries.reduce((sum, c) => sum + c.proteinGrams, 0);
  const totalCarbs = calorieEntries.reduce((sum, c) => sum + c.carbsGrams, 0);
  const totalFat = calorieEntries.reduce((sum, c) => sum + c.fatGrams, 0);

  const daysCount = Math.max(1, uniqueDays.length);
  const avgCaloriesPerDay = Math.round(totalLoggedCalories / daysCount);
  const avgProteinPerDay = Math.round(totalProtein / daysCount);
  const avgCarbsPerDay = Math.round(totalCarbs / daysCount);
  const avgFatPerDay = Math.round(totalFat / daysCount);

  // Macro calorie energy contribution (4 kcal per g protein & carb, 9 kcal per g fat)
  const proteinKcal = totalProtein * 4;
  const carbsKcal = totalCarbs * 4;
  const fatKcal = totalFat * 9;
  const totalMacroKcal = Math.max(1, proteinKcal + carbsKcal + fatKcal);

  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  // Meal types count
  const mealCounts = {
    breakfast: calorieEntries.filter((c) => c.mealType === 'breakfast').length,
    lunch: calorieEntries.filter((c) => c.mealType === 'lunch').length,
    dinner: calorieEntries.filter((c) => c.mealType === 'dinner').length,
    snack: calorieEntries.filter((c) => c.mealType === 'snack').length,
  };

  return (
    <div className="space-y-6 card-enter">
      {/* Top Nutrition Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Average Daily Intake
          </span>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
            {avgCaloriesPerDay} kcal
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Target: {settings.dailyCalorieTarget} kcal
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Avg Protein / Day
          </span>
          <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 block">
            {avgProteinPerDay}g
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Target: {settings.proteinTargetGrams}g
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Avg Carbs / Day
          </span>
          <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 block">
            {avgCarbsPerDay}g
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Target: {settings.carbsTargetGrams}g
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
            Avg Fat / Day
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
            {avgFatPerDay}g
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Target: {settings.fatTargetGrams}g
          </span>
        </div>
      </div>

      {/* Macro Split & Meal Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macro Nutrient Energy Ratio */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter interactive-card">
          <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sky-500" />
                <span>Macro Energy Proportion</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Caloric energy breakdown across macronutrients.
              </p>
            </div>
          </div>

          {totalLoggedCalories === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              No nutrition entries logged yet.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stacked Bar */}
              <div className="h-4 w-full rounded-md overflow-hidden flex bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${proteinPct}%` }}
                  title={`Protein: ${proteinPct}%`}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${carbsPct}%` }}
                  title={`Carbs: ${carbsPct}%`}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${fatPct}%` }}
                  title={`Fat: ${fatPct}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                  <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 block font-semibold">
                    Protein
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                    {proteinPct}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono block">{totalProtein}g total</span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 block font-semibold">
                    Carbs
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                    {carbsPct}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono block">{totalCarbs}g total</span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 block font-semibold">
                    Fat
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                    {fatPct}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono block">{totalFat}g total</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meal Logging Distribution */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 card-enter interactive-card">
          <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-purple-500" />
                <span>Meal Distribution</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Log count by meal type across the active horizon.
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              {calorieEntries.length} total entries
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Breakfast</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {mealCounts.breakfast} meals
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Lunch</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {mealCounts.lunch} meals
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Dinner</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {mealCounts.dinner} meals
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Snacks</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {mealCounts.snack} snacks
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
