import type {
  WorkoutSession,
  WorkoutType,
} from '../types/workout.types';

export const workoutTypes: WorkoutType[] = [
  'walking',
  'running',
  'cycling',
  'gym',
  'yoga',
  'swimming',
  'hiit',
  'sports',
];

export function createWorkoutSession(
  type: WorkoutType,
): WorkoutSession {
  return {
    id: Date.now().toString(),
    type,
    startTime: new Date().toISOString(),
    endTime: null,
    durationMinutes: 0,
    caloriesBurned: 0,
    distanceKm: 0,
    heartRate: null,
    notes: '',
  };
}

export function finishWorkoutSession(
  session: WorkoutSession,
  details: {
    durationMinutes: number;
    caloriesBurned: number;
    distanceKm: number;
    heartRate?: number;
    notes?: string;
  },
): WorkoutSession {
  return {
    ...session,
    endTime: new Date().toISOString(),
    durationMinutes: details.durationMinutes,
    caloriesBurned: details.caloriesBurned,
    distanceKm: details.distanceKm,
    heartRate: details.heartRate ?? null,
    notes: details.notes ?? '',
  };
}