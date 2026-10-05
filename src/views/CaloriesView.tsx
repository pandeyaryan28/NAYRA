import React, { useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Apple,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { CalorieEntry, MealType } from '@/types';
import { format, subDays, addDays, isToday, parseISO } from 'date-fns';
import { getTodayDateString } from '@/lib/utils';

export const CaloriesView: React.FC = () => {
  const { calorieEntries, addCalorieEntry, updateCalorieEntry, deleteCalorieEntry, settings } = useData();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalorieEntry | null>(null);

  // Form state
  const [formFoodName, setFormFoodName] = useState('');
  const [formMealType, setFormMealType] = useState<MealType>('breakfast');
  const [formCalories, setFormCalories] = useState<number>(350);
  const [formProtein, setFormProtein] = useState<number>(25);
  const [formCarbs, setFormCarbs] = useState<number>(35);
  const [formFat, setFormFat] = useState<number>(10);
  const [formServing, setFormServing] = useState('');

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedToday = isToday(selectedDate);

  const dayEntries = useMemo(() => {
    return calorieEntries.filter((c) => c.date === selectedDateStr);
  }, [calorieEntries, selectedDateStr]);

  const totalCalories = dayEntries.reduce((sum, c) => sum + c.calories, 0);
  const totalProtein = dayEntries.reduce((sum, c) => sum + c.proteinGrams, 0);
  const totalCarbs = dayEntries.reduce((sum, c) => sum + c.carbsGrams, 0);
  const totalFat = dayEntries.reduce((sum, c) => sum + c.fatGrams, 0);

  const remainingCalories = Math.max(0, settings.dailyCalorieTarget - totalCalories);
  const caloriePercent = Math.min(100, Math.round((totalCalories / settings.dailyCalorieTarget) * 100));

  const handlePrevDay = () => setSelectedDate((d) => subDays(d, 1));
  const handleNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const handleToday = () => setSelectedDate(new Date());

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setFormFoodName('');
    setFormMealType('breakfast');
    setFormCalories(350);
    setFormProtein(25);
    setFormCarbs(35);
    setFormFat(10);
    setFormServing('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: CalorieEntry) => {
    setEditingEntry(entry);
    setFormFoodName(entry.foodName);
    setFormMealType(entry.mealType);
    setFormCalories(entry.calories);
    setFormProtein(entry.proteinGrams);
    setFormCarbs(entry.carbsGrams);
    setFormFat(entry.fatGrams);
    setFormServing(entry.servingSize || '');
    setIsModalOpen(true);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFoodName.trim()) return;

    if (editingEntry) {
      updateCalorieEntry(editingEntry.id, {
        mealType: formMealType,
        foodName: formFoodName.trim(),
        calories: formCalories,
        proteinGrams: formProtein,
        carbsGrams: formCarbs,
        fatGrams: formFat,
        servingSize: formServing.trim() || undefined,
      });
      setEditingEntry(null);
    } else {
      addCalorieEntry({
        date: selectedDateStr,
        mealType: formMealType,
        foodName: formFoodName.trim(),
        calories: formCalories,
        proteinGrams: formProtein,
        carbsGrams: formCarbs,
        fatGrams: formFat,
        servingSize: formServing.trim() || undefined,
      });
    }

    setFormFoodName('');
    setFormServing('');
    setIsModalOpen(false);
  };

  const handleQuickAdd = (calories: number) => {
    addCalorieEntry({
      date: selectedDateStr,
      mealType: 'snack',
      foodName: `Quick Log (+${calories} kcal)`,
      calories,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
    });
  };

  // 7-day intake trend
  const past7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dStr = format(d, 'yyyy-MM-dd');
      const cals = calorieEntries
        .filter((c) => c.date === dStr)
        .reduce((sum, c) => sum + c.calories, 0);
      return {
        dateStr: dStr,
        dayName: format(d, 'EEE'),
        calories: cals,
      };
    });
  }, [calorieEntries]);

  const meals: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'Breakfast' },
    { type: 'lunch', label: 'Lunch' },
    { type: 'dinner', label: 'Dinner' },
    { type: 'snack', label: 'Snacks' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8 select-none">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4 card-enter">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-emerald-500" />
            <span>Nutrition & Calorie Tracker</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Macro-level dietary precision, daily target balancing, and weekly intake history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isSelectedToday && (
            <Button variant="outline" size="sm" onClick={handleToday} className="transition-transform active:scale-95">
              Today
            </Button>
          )}
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50 dark:bg-zinc-900 px-2 py-1 gap-2">
            <button onClick={handlePrevDay} className="text-zinc-500 hover:text-zinc-900 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200 min-w-28 text-center">
              {format(selectedDate, 'MMM d, yyyy')}
            </span>
            <button onClick={handleNextDay} className="text-zinc-500 hover:text-zinc-900 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Log Food</span>
          </Button>
        </div>
      </div>

      {/* Progress & Macro Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Calorie Gauge Card */}
        <div className="md:col-span-2 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3 card-enter stagger-1 interactive-card">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
              Total Intake
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {remainingCalories} kcal left
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
              {totalCalories}
            </span>
            <span className="text-sm font-mono text-zinc-400">
              / {settings.dailyCalorieTarget} kcal target
            </span>
          </div>

          <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
            <div
              className={`h-full progress-bar-animated ${
                totalCalories > settings.dailyCalorieTarget ? 'bg-amber-500' : 'bg-zinc-900 dark:bg-zinc-100'
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>

          {/* Quick Add Bar */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[11px] text-zinc-400 font-mono">Quick add:</span>
            {[100, 250, 500].map((c) => (
              <button
                key={c}
                onClick={() => handleQuickAdd(c)}
                className="px-2 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-300 transition-all active:scale-95"
              >
                +{c}
              </button>
            ))}
          </div>
        </div>

        {/* Protein Target */}
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1 card-enter stagger-2 interactive-card">
          <span className="text-[11px] font-mono uppercase text-zinc-400 block">Protein</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {totalProtein}g
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ {settings.proteinTargetGrams}g</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden mt-2">
            <div
              className="h-full bg-blue-500 progress-bar-animated"
              style={{
                width: `${Math.min(100, Math.round((totalProtein / settings.proteinTargetGrams) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Carbs & Fat Targets */}
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 card-enter stagger-3 interactive-card">
          <div>
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 uppercase">
              <span>Carbs</span>
              <span>{totalCarbs} / {settings.carbsTargetGrams}g</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500 progress-bar-animated"
                style={{
                  width: `${Math.min(100, Math.round((totalCarbs / settings.carbsTargetGrams) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 uppercase">
              <span>Fat</span>
              <span>{totalFat} / {settings.fatTargetGrams}g</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden mt-1">
              <div
                className="h-full bg-amber-500 progress-bar-animated"
                style={{
                  width: `${Math.min(100, Math.round((totalFat / settings.fatTargetGrams) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meals Sections */}
      <div className="space-y-4">
        {meals.map((meal) => {
          const mealEntries = dayEntries.filter((c) => c.mealType === meal.type);
          const mealCals = mealEntries.reduce((sum, c) => sum + c.calories, 0);

          return (
            <div
              key={meal.type}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {meal.label}
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">
                    ({mealEntries.length})
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                  {mealCals} kcal
                </span>
              </div>

              {mealEntries.length === 0 ? (
                <div className="py-3 text-center text-xs text-zinc-400">
                  No items logged for {meal.label.toLowerCase()}.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {mealEntries.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 block truncate">
                          {item.foodName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {item.servingSize ? `${item.servingSize} • ` : ''}
                          P: {item.proteinGrams}g | C: {item.carbsGrams}g | F: {item.fatGrams}g
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 mr-1.5">
                          {item.calories} kcal
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                          title="Edit Entry"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCalorieEntry(item.id)}
                          className="h-6 w-6 text-zinc-400 hover:text-rose-500"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 7-Day Intake History SVG Bar Chart */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            7-Day Caloric Intake History
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            Target: {settings.dailyCalorieTarget} kcal
          </span>
        </div>

        <div className="h-40 flex items-end justify-between gap-3 pt-4 px-2">
          {past7Days.map((d) => {
            const heightPercent = Math.min(100, Math.round((d.calories / (settings.dailyCalorieTarget * 1.2)) * 100));
            const isTargetMet = d.calories <= settings.dailyCalorieTarget && d.calories > 0;

            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono text-zinc-400">
                  {d.calories > 0 ? d.calories : ''}
                </span>
                <div className="w-full max-w-[36px] bg-zinc-100 dark:bg-zinc-800 rounded-t-sm flex items-end h-full">
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      d.calories === 0
                        ? 'bg-transparent'
                        : isTargetMet
                        ? 'bg-zinc-900 dark:bg-zinc-100'
                        : 'bg-amber-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-medium text-zinc-500">
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Food Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? 'Edit Food Entry' : 'Log Food Intake'}
        description={
          editingEntry
            ? 'Update calories and nutritional macro breakdown for this entry.'
            : "Add a meal or snack to today's nutrition ledger."
        }
      >
        <form onSubmit={handleSaveFood} className="space-y-4">
          <Input
            label="Food or Meal Name"
            placeholder="e.g., Grilled Chicken Salad with Olive Oil"
            value={formFoodName}
            onChange={(e) => setFormFoodName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Meal Type"
              value={formMealType}
              onChange={(e) => setFormMealType(e.target.value as MealType)}
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'snack', label: 'Snack' },
              ]}
            />
            <Input
              label="Calories (kcal)"
              type="number"
              min={0}
              value={formCalories}
              onChange={(e) => setFormCalories(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Protein (g)"
              type="number"
              min={0}
              value={formProtein}
              onChange={(e) => setFormProtein(parseInt(e.target.value) || 0)}
            />
            <Input
              label="Carbs (g)"
              type="number"
              min={0}
              value={formCarbs}
              onChange={(e) => setFormCarbs(parseInt(e.target.value) || 0)}
            />
            <Input
              label="Fat (g)"
              type="number"
              min={0}
              value={formFat}
              onChange={(e) => setFormFat(parseInt(e.target.value) || 0)}
            />
          </div>

          <Input
            label="Serving Size (optional)"
            placeholder="e.g., 250g or 1 bowl"
            value={formServing}
            onChange={(e) => setFormServing(e.target.value)}
          />

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
              {editingEntry ? 'Update Entry' : 'Log Food'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
