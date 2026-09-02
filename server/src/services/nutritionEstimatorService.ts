import { FoodItem, MealEntry } from '../types/index.js';
import { firestoreService } from './firestoreService.js';
import { v4 as uuidv4 } from 'uuid';

interface NutritionRef {
  keywords: string[];
  unitCalories: number;
  unitProtein: number;
  unitCarbs: number;
  unitFat: number;
  defaultUnit: string;
}

// Built-in nutrition database for accurate macro & calorie estimation
const FOOD_DATABASE: NutritionRef[] = [
  { keywords: ['egg', 'eggs', 'boiled egg', 'fried egg'], unitCalories: 78, unitProtein: 6.3, unitCarbs: 0.6, unitFat: 5.3, defaultUnit: 'piece' },
  { keywords: ['egg white', 'egg whites'], unitCalories: 17, unitProtein: 3.6, unitCarbs: 0.2, unitFat: 0.1, defaultUnit: 'piece' },
  { keywords: ['toast', 'bread', 'slice bread', 'wheat bread', 'brown bread', 'white bread'], unitCalories: 80, unitProtein: 3.5, unitCarbs: 14.0, unitFat: 1.0, defaultUnit: 'slice' },
  { keywords: ['roti', 'chapati', 'phulka'], unitCalories: 104, unitProtein: 3.1, unitCarbs: 20.0, unitFat: 1.2, defaultUnit: 'piece' },
  { keywords: ['rice', 'cooked rice', 'white rice', 'brown rice', 'bowl rice'], unitCalories: 130, unitProtein: 2.7, unitCarbs: 28.0, unitFat: 0.3, defaultUnit: '100g / 1 bowl' },
  { keywords: ['dal', 'daal', 'lentil soup', 'yellow dal', 'tadka dal'], unitCalories: 150, unitProtein: 9.0, unitCarbs: 22.0, unitFat: 3.0, defaultUnit: '1 bowl' },
  { keywords: ['chicken breast', 'grilled chicken', 'cooked chicken'], unitCalories: 165, unitProtein: 31.0, unitCarbs: 0.0, unitFat: 3.6, defaultUnit: '100g' },
  { keywords: ['paneer', 'cottage cheese'], unitCalories: 265, unitProtein: 18.0, unitCarbs: 3.5, unitFat: 20.0, defaultUnit: '100g' },
  { keywords: ['tofu'], unitCalories: 76, unitProtein: 8.0, unitCarbs: 1.9, unitFat: 4.8, defaultUnit: '100g' },
  { keywords: ['whey', 'protein shake', 'whey protein', 'scoop whey'], unitCalories: 120, unitProtein: 24.0, unitCarbs: 2.0, unitFat: 1.5, defaultUnit: '1 scoop' },
  { keywords: ['oat', 'oats', 'oatmeal'], unitCalories: 150, unitProtein: 5.0, unitCarbs: 27.0, unitFat: 2.5, defaultUnit: '40g / 1 serving' },
  { keywords: ['milk', 'whole milk', 'cow milk'], unitCalories: 150, unitProtein: 8.0, unitCarbs: 12.0, unitFat: 8.0, defaultUnit: '1 cup / 240ml' },
  { keywords: ['almond milk', 'oat milk'], unitCalories: 45, unitProtein: 1.5, unitCarbs: 2.0, unitFat: 3.0, defaultUnit: '1 cup' },
  { keywords: ['banana'], unitCalories: 105, unitProtein: 1.3, unitCarbs: 27.0, unitFat: 0.3, defaultUnit: '1 medium' },
  { keywords: ['apple'], unitCalories: 95, unitProtein: 0.5, unitCarbs: 25.0, unitFat: 0.3, defaultUnit: '1 medium' },
  { keywords: ['avocado'], unitCalories: 240, unitProtein: 3.0, unitCarbs: 12.0, unitFat: 22.0, defaultUnit: '1 medium' },
  { keywords: ['greek yogurt', 'yogurt', 'curd', 'dahi'], unitCalories: 100, unitProtein: 10.0, unitCarbs: 6.0, unitFat: 4.0, defaultUnit: '100g' },
  { keywords: ['coffee', 'black coffee', 'espresso'], unitCalories: 5, unitProtein: 0.3, unitCarbs: 0.0, unitFat: 0.0, defaultUnit: '1 cup' },
  { keywords: ['latte', 'cappuccino'], unitCalories: 120, unitProtein: 6.0, unitCarbs: 10.0, unitFat: 6.0, defaultUnit: '1 cup' },
  { keywords: ['green tea', 'tea', 'black tea'], unitCalories: 2, unitProtein: 0.1, unitCarbs: 0.4, unitFat: 0.0, defaultUnit: '1 cup' },
  { keywords: ['almonds', 'nuts', 'mixed nuts'], unitCalories: 160, unitProtein: 6.0, unitCarbs: 6.0, unitFat: 14.0, defaultUnit: 'handful (28g)' },
  { keywords: ['peanut butter'], unitCalories: 190, unitProtein: 8.0, unitCarbs: 7.0, unitFat: 16.0, defaultUnit: '2 tbsp (32g)' },
  { keywords: ['salad', 'green salad'], unitCalories: 50, unitProtein: 2.0, unitCarbs: 8.0, unitFat: 1.0, defaultUnit: '1 bowl' },
  { keywords: ['pizza', 'pizza slice'], unitCalories: 285, unitProtein: 12.0, unitCarbs: 36.0, unitFat: 10.0, defaultUnit: '1 slice' },
  { keywords: ['burger', 'sandwich'], unitCalories: 400, unitProtein: 20.0, unitCarbs: 38.0, unitFat: 18.0, defaultUnit: '1 serving' },
  { keywords: ['pasta'], unitCalories: 220, unitProtein: 8.0, unitCarbs: 43.0, unitFat: 1.5, defaultUnit: '1 cup cooked' },
  { keywords: ['butter', 'ghee'], unitCalories: 102, unitProtein: 0.1, unitCarbs: 0.0, unitFat: 11.5, defaultUnit: '1 tbsp' },
  { keywords: ['olive oil', 'oil'], unitCalories: 119, unitProtein: 0.0, unitCarbs: 0.0, unitFat: 13.5, defaultUnit: '1 tbsp' }
];

export class NutritionEstimatorService {
  /**
   * Parses natural language meal text (e.g. "I had 2 boiled eggs, 2 slices whole wheat toast and black coffee for breakfast")
   * and calculates calories and macros.
   */
  public parseAndEstimateMeal(rawText: string, defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'): MealEntry {
    const textLower = rawText.toLowerCase();

    // 1. Detect meal type
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = defaultMealType || 'snack';
    if (textLower.includes('breakfast') || textLower.includes('morning')) {
      mealType = 'breakfast';
    } else if (textLower.includes('lunch') || textLower.includes('afternoon')) {
      mealType = 'lunch';
    } else if (textLower.includes('dinner') || textLower.includes('night') || textLower.includes('supper')) {
      mealType = 'dinner';
    } else if (textLower.includes('snack') || textLower.includes('evening') || textLower.includes('tea time')) {
      mealType = 'snack';
    }

    // 2. Extract food clauses (split by comma, 'and', '+', '&', 'with')
    const cleaned = textLower
      .replace(/for (breakfast|lunch|dinner|snack|my meal)/g, '')
      .replace(/i (had|ate|consumed|drank|took)/g, '')
      .replace(/today/g, '');

    const clauses = cleaned.split(/,|\band\b|\+|\bwith\b|\n/).map(c => c.trim()).filter(c => c.length > 0);

    const items: FoodItem[] = [];

    for (const clause of clauses) {
      // Find quantity multiplier (e.g. "2 eggs", "3 slices", "100g", "half")
      let count = 1;
      const numMatch = clause.match(/(\d+(\.\d+)?)/);
      if (numMatch) {
        count = parseFloat(numMatch[1]);
      } else if (clause.includes('half')) {
        count = 0.5;
      } else if (clause.includes('a pair') || clause.includes('couple')) {
        count = 2;
      } else if (clause.includes('a ') || clause.includes('an ') || clause.includes('one ')) {
        count = 1;
      }

      // Match against food database
      let matchedRef: NutritionRef | null = null;
      for (const food of FOOD_DATABASE) {
        for (const kw of food.keywords) {
          if (clause.includes(kw)) {
            matchedRef = food;
            break;
          }
        }
        if (matchedRef) break;
      }

      if (matchedRef) {
        const itemName = clause.charAt(0).toUpperCase() + clause.slice(1);
        items.push({
          name: itemName,
          quantity: `${count} ${matchedRef.defaultUnit}`,
          calories: Math.round(matchedRef.unitCalories * count),
          protein: Number((matchedRef.unitProtein * count).toFixed(1)),
          carbs: Number((matchedRef.unitCarbs * count).toFixed(1)),
          fat: Number((matchedRef.unitFat * count).toFixed(1))
        });
      } else {
        // Generic fallback for unrecognized item (estimated balanced food portion)
        const itemName = clause.charAt(0).toUpperCase() + clause.slice(1);
        const estimatedCal = Math.round(150 * count);
        items.push({
          name: itemName,
          quantity: `${count} portion`,
          calories: estimatedCal,
          protein: Number((6 * count).toFixed(1)),
          carbs: Number((18 * count).toFixed(1)),
          fat: Number((5 * count).toFixed(1))
        });
      }
    }

    // If no specific clause was extracted, make a default estimate
    if (items.length === 0) {
      items.push({
        name: rawText.trim() || 'Meal Portion',
        quantity: '1 serving',
        calories: 350,
        protein: 18.0,
        carbs: 40.0,
        fat: 12.0
      });
    }

    const totalCalories = items.reduce((acc, i) => acc + i.calories, 0);
    const totalProtein = Number(items.reduce((acc, i) => acc + i.protein, 0).toFixed(1));
    const totalCarbs = Number(items.reduce((acc, i) => acc + i.carbs, 0).toFixed(1));
    const totalFat = Number(items.reduce((acc, i) => acc + i.fat, 0).toFixed(1));

    const todayStr = new Date().toISOString().split('T')[0];

    const mealEntry: MealEntry = {
      id: uuidv4(),
      mealType,
      date: todayStr,
      rawText,
      items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      source: 'antigravity',
      timestamp: new Date().toISOString()
    };

    return mealEntry;
  }

  /**
   * Processes Antigravity input, calculates calories, and saves to database directly!
   */
  public async logMealFromAntigravity(text: string, mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Promise<MealEntry> {
    const meal = this.parseAndEstimateMeal(text, mealType);
    await firestoreService.saveMealEntry(meal);
    return meal;
  }
}

export const nutritionEstimatorService = new NutritionEstimatorService();
