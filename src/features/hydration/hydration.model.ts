import type { HydrationData, WaterEntry } from './hydration.types.ts';

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function emptyHydration(): HydrationData {
  return { version: 1, goalMl: 2500, entries: [] };
}

export function isValidGoal(goalMl: number): boolean {
  return Number.isInteger(goalMl) && goalMl >= 250 && goalMl <= 10000;
}

export function entriesForDay(data: HydrationData, date: string): WaterEntry[] {
  return data.entries.filter((entry) => entry.localDate === date);
}

export function dailyTotal(data: HydrationData, date: string): number {
  return entriesForDay(data, date).reduce((sum, entry) => sum + entry.amountMl, 0);
}

export function undoForDay(data: HydrationData, date: string): HydrationData {
  const last = data.entries.findLastIndex((entry) => entry.localDate === date);
  return { ...data, entries: data.entries.filter((_, index) => index !== last) };
}

export function decodeHydration(raw: string | null): HydrationData {
  if (raw === null) return emptyHydration();
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Invalid water data');
  const data = value as Partial<HydrationData>;
  if (
    data.version !== 1 ||
    typeof data.goalMl !== 'number' ||
    !isValidGoal(data.goalMl) ||
    !Array.isArray(data.entries)
  ) {
    throw new Error('Unsupported water data');
  }
  const ids = new Set<string>();
  for (const entry of data.entries) {
    if (
      !entry ||
      typeof entry.id !== 'string' ||
      !entry.id ||
      ids.has(entry.id) ||
      !Number.isInteger(entry.amountMl) ||
      entry.amountMl <= 0 ||
      entry.amountMl > 10000 ||
      typeof entry.recordedAt !== 'string' ||
      !Number.isFinite(Date.parse(entry.recordedAt)) ||
      typeof entry.localDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(entry.localDate)
    ) {
      throw new Error('Invalid water entry');
    }
    ids.add(entry.id);
  }
  return data as HydrationData;
}
