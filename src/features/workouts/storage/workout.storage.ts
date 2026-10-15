import AsyncStorage from '@react-native-async-storage/async-storage';

import { workoutTypes } from '../model/workout.model';
import type { WorkoutSession } from '../types/workout.types';

const STORAGE_KEY = 'fitnessfreak:workouts:v1';

function isNonNegativeNumber(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function isCompletedWorkout(
  value: unknown,
): value is WorkoutSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const workout = value as Partial<WorkoutSession>;

  return (
    typeof workout.id === 'string' &&
    workout.id.trim() !== '' &&
    workoutTypes.some((type) => type === workout.type) &&
    typeof workout.startTime === 'string' &&
    typeof workout.endTime === 'string' &&
    Number.isFinite(Date.parse(workout.startTime)) &&
    Number.isFinite(Date.parse(workout.endTime)) &&
    Date.parse(workout.endTime) >=
      Date.parse(workout.startTime) &&
    isNonNegativeNumber(workout.durationMinutes) &&
    isNonNegativeNumber(workout.caloriesBurned) &&
    isNonNegativeNumber(workout.distanceKm) &&
    (workout.heartRate === null ||
      (typeof workout.heartRate === 'number' &&
        Number.isSafeInteger(workout.heartRate) &&
        workout.heartRate > 0)) &&
    typeof workout.notes === 'string'
  );
}

export async function loadWorkoutHistory(): Promise<
  WorkoutSession[]
> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);

  if (stored === null) {
    return [];
  }

  const parsed: unknown = JSON.parse(stored);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('version' in parsed) ||
    parsed.version !== 1 ||
    !('workouts' in parsed) ||
    !Array.isArray(parsed.workouts) ||
    !parsed.workouts.every(isCompletedWorkout)
  ) {
    throw new Error('Saved workout data is invalid.');
  }

  return parsed.workouts;
}

export async function saveWorkoutHistory(
  workouts: readonly WorkoutSession[],
): Promise<void> {
  if (!workouts.every(isCompletedWorkout)) {
    throw new Error(
      'Only valid completed workouts can be saved.',
    );
  }

  const data = {
    version: 1,
    workouts,
  };

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}