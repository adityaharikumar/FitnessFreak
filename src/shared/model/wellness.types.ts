import type { StrengthSession } from '../../features/strength/types/strength.types';
export type Meal = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
export type FoodEntry = {
  id: string;
  date: string;
  meal: Meal;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
};
export type ActivityEntry = {
  id: string;
  date: string;
  steps: number;
  distanceKm: number;
  activeMinutes: number;
};
export type SleepEntry = {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  minutes: number;
  quality: 'Poor' | 'Okay' | 'Good';
};
export type BodyEntry = {
  id: string;
  date: string;
  weightKg: number;
  bodyFat: number | null;
  waistCm: number | null;
  notes: string;
};
export type PlanEntry = { id: string; date: string; title: string; completed: boolean };
export type Goals = {
  steps: number;
  workoutMinutes: number;
  sleepHours: number;
  calories: number;
  protein: number;
  targetWeightKg: number | null;
};
export type Profile = {
  name: string;
  heightCm: number | null;
  activityLevel: string;
  fitnessGoal: string;
};
export type WellnessData = {
  version: 1;
  foods: FoodEntry[];
  activity: ActivityEntry[];
  sleep: SleepEntry[];
  body: BodyEntry[];
  plans: PlanEntry[];
  strength: StrengthSession[];
  strengthDraft: StrengthSession | null;
  goals: Goals;
  profile: Profile;
};
