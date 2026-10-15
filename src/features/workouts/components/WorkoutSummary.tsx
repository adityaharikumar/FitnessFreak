import { StyleSheet, Text, View } from 'react-native';

import type { WorkoutSession } from '../types/workout.types';

type WorkoutSummaryProps = {
  workouts: WorkoutSession[];
};

export function WorkoutSummary({
  workouts,
}: WorkoutSummaryProps) {
  const today = new Date().toDateString();

  // Count completed workouts on the day they finished.
  const todaysWorkouts = workouts.filter((workout) => {
    if (!workout.endTime) return false;

    return new Date(workout.endTime).toDateString() === today;
  });

  const totals = todaysWorkouts.reduce(
    (summary, workout) => ({
      minutes: summary.minutes + workout.durationMinutes,
      calories: summary.calories + workout.caloriesBurned,
      distance: summary.distance + workout.distanceKm,
    }),
    {
      minutes: 0,
      calories: 0,
      distance: 0,
    },
  );

  const metrics = [
    {
      label: 'Sessions',
      value: String(todaysWorkouts.length),
    },
    {
      label: 'Minutes',
      value: totals.minutes.toFixed(1),
    },
    {
      label: 'Calories (kcal)',
      value: totals.calories.toFixed(0),
    },
    {
      label: 'Distance (km)',
      value: totals.distance.toFixed(2),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today’s workouts</Text>

      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.card}>
            <Text style={styles.value}>
              {metric.value}
            </Text>

            <Text style={styles.label}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.caption}>
        Completed sessions only
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#18221F',
  },
  value: {
    color: '#C8F169',
    fontSize: 26,
    fontWeight: '800',
  },
  label: {
    color: '#AAB8B1',
    fontSize: 13,
    marginTop: 6,
  },
  caption: {
    color: '#AAB8B1',
    fontSize: 12,
    marginTop: 10,
  },
});