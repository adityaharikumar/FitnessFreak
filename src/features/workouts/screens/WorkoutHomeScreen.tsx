import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WorkoutTypeCard } from '../components/WorkoutTypeCard';
import {
  createWorkoutSession,
  finishWorkoutSession,
  workoutTypes,
} from '../model/workout.model';
import type {
  WorkoutSession,
  WorkoutType,
} from '../types/workout.types';

export function WorkoutHomeScreen() {
  const [selectedType, setSelectedType] =
    useState<WorkoutType>('walking');

  const [activeWorkout, setActiveWorkout] =
    useState<WorkoutSession | null>(null);

  const [history, setHistory] =
    useState<WorkoutSession[]>([]);

  function handleStartWorkout() {
    setActiveWorkout(createWorkoutSession(selectedType));
  }

  function handleStopWorkout() {
    if (!activeWorkout) return;

    const startedAt = new Date(activeWorkout.startTime).getTime();
    const durationMinutes = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 60000),
    );

    const completedWorkout = finishWorkoutSession(
      activeWorkout,
      {
        durationMinutes,
        caloriesBurned: 0,
        distanceKm: 0,
      },
    );

    setHistory((current) => [
      completedWorkout,
      ...current,
    ]);

    setActiveWorkout(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Workout Tracker</Text>

      <Text style={styles.subtitle}>
        Select a workout and start your session
      </Text>

      <Text style={styles.sectionTitle}>
        Workout type
      </Text>

      <View style={styles.typesGrid}>
        {workoutTypes.map((type) => (
          <WorkoutTypeCard
            key={type}
            type={type}
            selected={selectedType === type}
            onPress={() => setSelectedType(type)}
          />
        ))}
      </View>

      {activeWorkout ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeTitle}>
            Workout in progress
          </Text>

          <Text style={styles.activeText}>
            Type: {activeWorkout.type}
          </Text>

          <Text style={styles.activeText}>
            Started:{' '}
            {new Date(
              activeWorkout.startTime,
            ).toLocaleTimeString()}
          </Text>

          <Pressable
            style={styles.stopButton}
            onPress={handleStopWorkout}
          >
            <Text style={styles.stopButtonText}>
              Stop Workout
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.startButton}
          onPress={handleStartWorkout}
        >
          <Text style={styles.startButtonText}>
            Start Workout
          </Text>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>
        Workout history
      </Text>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>
          No completed workouts yet.
        </Text>
      ) : (
        history.map((workout) => (
          <View key={workout.id} style={styles.historyCard}>
            <Text style={styles.historyTitle}>
              {workout.type}
            </Text>

            <Text style={styles.historyText}>
              Duration: {workout.durationMinutes} minutes
            </Text>

            <Text style={styles.historyText}>
              Calories: {workout.caloriesBurned} kcal
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#101513',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 24,
  },
  subtitle: {
    color: '#AAB8B1',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  startButton: {
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#C8F169',
  },
  startButtonText: {
    color: '#101513',
    fontSize: 16,
    fontWeight: '800',
  },
  stopButton: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  activeCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#18221F',
    borderWidth: 1,
    borderColor: '#C8F169',
  },
  activeTitle: {
    color: '#C8F169',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 6,
  },
  historyCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#18221F',
  },
  historyTitle: {
    color: '#C8F169',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  historyText: {
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyText: {
    color: '#AAB8B1',
  },
});