export type WorkoutType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'gym'
  | 'yoga'
  | 'swimming'
  | 'hiit'
  | 'sports';

export type WorkoutSession = {
  id: string;
  type: WorkoutType;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  caloriesBurned: number;
  distanceKm: number;
  heartRate: number | null;
  notes: string;
};