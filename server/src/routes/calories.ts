import { Router } from 'express';
import { firestoreService } from '../services/firestoreService.js';
import { nutritionEstimatorService } from '../services/nutritionEstimatorService.js';
import { MealEntry } from '../types/index.js';

const router = Router();

// GET daily calorie and nutrition summary
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = (date as string) || new Date().toISOString().split('T')[0];
    
    const meals = await firestoreService.getMealEntries(targetDate);
    const target = await firestoreService.getDailyTarget(targetDate);

    const consumedCalories = meals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
    const consumedProtein = Number(meals.reduce((acc, m) => acc + (m.totalProtein || 0), 0).toFixed(1));
    const consumedCarbs = Number(meals.reduce((acc, m) => acc + (m.totalCarbs || 0), 0).toFixed(1));
    const consumedFat = Number(meals.reduce((acc, m) => acc + (m.totalFat || 0), 0).toFixed(1));

    const breakfastCalories = meals.filter(m => m.mealType === 'breakfast').reduce((acc, m) => acc + m.totalCalories, 0);
    const lunchCalories = meals.filter(m => m.mealType === 'lunch').reduce((acc, m) => acc + m.totalCalories, 0);
    const dinnerCalories = meals.filter(m => m.mealType === 'dinner').reduce((acc, m) => acc + m.totalCalories, 0);
    const snackCalories = meals.filter(m => m.mealType === 'snack').reduce((acc, m) => acc + m.totalCalories, 0);

    res.json({
      date: targetDate,
      summary: {
        targetCalories: target.targetCalories,
        consumedCalories,
        remainingCalories: Math.max(0, target.targetCalories - consumedCalories),
        targetProtein: target.targetProtein,
        consumedProtein,
        targetCarbs: target.targetCarbs,
        consumedCarbs,
        targetFat: target.targetFat,
        consumedFat,
        waterIntakeMl: target.waterIntakeMl,
        mealBreakdown: {
          breakfast: breakfastCalories,
          lunch: lunchCalories,
          dinner: dinnerCalories,
          snack: snackCalories
        }
      },
      meals
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADD MEAL / ANTIGRAVITY AI INGESTION ENDPOINT
// Parses food text -> calculates calories & macros -> saves entry
router.post('/add-meal', async (req, res) => {
  try {
    const { text, mealType } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text description of meal is required.' });
    }

    const meal = await nutritionEstimatorService.logMealFromAntigravity(text, mealType);
    res.status(201).json({
      success: true,
      message: `Calculated ${meal.totalCalories} kcal (${meal.totalProtein}g Protein, ${meal.totalCarbs}g Carbs, ${meal.totalFat}g Fat) and recorded to Nayra!`,
      meal
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE meal
router.delete('/meal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await firestoreService.deleteMealEntry(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET / UPDATE target
router.get('/target', async (req, res) => {
  try {
    const { date } = req.query;
    const target = await firestoreService.getDailyTarget(date as string);
    res.json({ target });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/target', async (req, res) => {
  try {
    const target = await firestoreService.updateDailyTarget(req.body);
    res.json({ target });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// LOG water
router.post('/water', async (req, res) => {
  try {
    const { amountMl = 250, date } = req.body;
    const todayStr = date || new Date().toISOString().split('T')[0];
    const target = await firestoreService.getDailyTarget(todayStr);
    target.waterIntakeMl = Math.max(0, (target.waterIntakeMl || 0) + Number(amountMl));
    await firestoreService.updateDailyTarget(target);
    res.json({ success: true, waterIntakeMl: target.waterIntakeMl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
