import type { WellnessData, FoodEntry } from './wellness.types';
export function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00`);
  return Number.isFinite(d.getTime()) && dayKey(d) === value;
}
export function requireDay(value: string, future = false): string {
  if (!validDay(value) || (!future && value > dayKey()))
    throw new Error(
      future
        ? 'Enter a real date in YYYY-MM-DD format.'
        : 'Enter a real date in YYYY-MM-DD format, no later than today.',
    );
  return value;
}
export function numberInput(
  text: string,
  label: string,
  min: number,
  max: number,
  integer = false,
): number {
  const normalized = text.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) throw new Error(`Enter a valid ${label}.`);
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n)))
    throw new Error(
      `${label} must be ${integer ? 'a whole number ' : ''}between ${min} and ${max}.`,
    );
  return n;
}
export function optionalNumber(
  text: string,
  label: string,
  min: number,
  max: number,
): number | null {
  return text.trim() ? numberInput(text, label, min, max) : null;
}
export function requiredText(text: string, label: string, max = 100): string {
  const value = text.trim();
  if (!value || value.length > max)
    throw new Error(`${label} is required (up to ${max} characters).`);
  return value;
}
export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
export function emptyWellness(): WellnessData {
  return {
    version: 1,
    foods: [],
    activity: [],
    sleep: [],
    body: [],
    plans: [],
    strength: [],
    strengthDraft: null,
    goals: {
      steps: 10000,
      workoutMinutes: 30,
      sleepHours: 8,
      calories: 2200,
      protein: 120,
      targetWeightKg: null,
    },
    profile: {
      name: '',
      heightCm: null,
      activityLevel: 'Moderate',
      fitnessGoal: 'General fitness',
    },
  };
}
export function foodTotals(foods: readonly FoodEntry[], date: string) {
  return foods
    .filter((e) => e.date === date)
    .reduce(
      (a, e) => ({
        calories: a.calories + e.calories,
        protein: a.protein + e.protein,
        carbs: a.carbs + e.carbs,
        fat: a.fat + e.fat,
        fiber: a.fiber + e.fiber,
        sugar: a.sugar + e.sugar,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
    );
}
export function sleepInterval(bedDate: string, bed: string, wakeDate: string, wake: string) {
  requireDay(bedDate);
  requireDay(wakeDate);
  if (![bed, wake].every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)))
    throw new Error('Enter times as HH:mm using the 24-hour clock.');
  const start = new Date(`${bedDate}T${bed}:00`),
    end = new Date(`${wakeDate}T${wake}:00`);
  const minutes = (end.getTime() - start.getTime()) / 60000;
  if (minutes <= 0 || minutes > 1440 || end.getTime() > Date.now())
    throw new Error('Wake time must follow bedtime, be in the past, and be within 24 hours.');
  return { bedtime: start.toISOString(), wakeTime: end.toISOString(), minutes };
}
export function progressPercent(value: number, goal: number) {
  return goal > 0 ? Math.min(100, Math.max(0, (value / goal) * 100)) : 0;
}
export function dailyProgress(
  values: { steps: number; water: number; minutes: number; sleep: number },
  goals: { steps: number; water: number; minutes: number; sleep: number },
) {
  return Math.round(
    (progressPercent(values.steps, goals.steps) +
      progressPercent(values.water, goals.water) +
      progressPercent(values.minutes, goals.minutes) +
      progressPercent(values.sleep, goals.sleep)) /
      4,
  );
}
export function lastDays(count: number, now = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (count - 1 - i));
    return dayKey(d);
  });
}
