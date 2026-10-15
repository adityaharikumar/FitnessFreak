import AsyncStorage from '@react-native-async-storage/async-storage';

import { workoutTypes } from '../model/workout.model';
import type { WorkoutType } from '../types/workout.types';

const STORAGE_KEY = 'fitnessfreak:active-workout:v1';

export type ActiveWorkoutDraft = {
  id: string;
  type: WorkoutType;
  startTime: string;
  details: {
    calories: string;
    distance: string;
    heartRate: string;
    notes: string;
  };
};

function isActiveWorkoutDraft(
  value: unknown,
): value is ActiveWorkoutDraft {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const draft = value as Partial<ActiveWorkoutDraft>;
  const details = draft.details;

  return (
    typeof draft.id === 'string' &&
    draft.id.trim() !== '' &&
    workoutTypes.some((type) => type === draft.type) &&
    typeof draft.startTime === 'string' &&
    Number.isFinite(Date.parse(draft.startTime)) &&
    typeof details === 'object' &&
    details !== null &&
    typeof details.calories === 'string' &&
    typeof details.distance === 'string' &&
    typeof details.heartRate === 'string' &&
    typeof details.notes === 'string'
  );
}

export async function saveActiveWorkout(
  draft: ActiveWorkoutDraft,
): Promise<void> {
  if (!isActiveWorkoutDraft(draft)) {
    throw new Error('Cannot save an invalid workout draft.');
  }

  const storedData = {
    version: 1,
    draft,
  };

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(storedData),
  );
}

export async function loadActiveWorkout():
  Promise<ActiveWorkoutDraft | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);

  if (stored === null) {
    return null;
  }

  const parsed: unknown = JSON.parse(stored);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('version' in parsed) ||
    parsed.version !== 1 ||
    !('draft' in parsed) ||
    !isActiveWorkoutDraft(parsed.draft)
  ) {
    throw new Error('Saved workout draft is invalid.');
  }

  return parsed.draft;
}

export async function clearActiveWorkout(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}