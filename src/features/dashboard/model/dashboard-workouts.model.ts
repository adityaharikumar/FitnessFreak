import type { WorkoutSession } from '../../workouts/types/workout.types';

export type WorkoutTotals = {
  calories: number;
  minutes: number;
  distanceKm: number;
};

// Attribute the whole session to the local calendar day on which it finished.
export function getDailyWorkoutTotals(
  history: readonly WorkoutSession[],
  now: Date = new Date(),
): WorkoutTotals {
  const today = now.toDateString();

  return history.reduce<WorkoutTotals>(
    (totals, workout) => {
      if (!workout.endTime || new Date(workout.endTime).toDateString() !== today) {
        return totals;
      }

      return {
        calories: totals.calories + workout.caloriesBurned,
        minutes: totals.minutes + workout.durationMinutes,
        distanceKm: totals.distanceKm + workout.distanceKm,
      };
    },
    { calories: 0, minutes: 0, distanceKm: 0 },
  );
}
