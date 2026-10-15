import { useEffect, useRef, useState } from 'react';

import {
  loadWorkoutHistory,
  saveWorkoutHistory,
} from '../storage/workout.storage';
import type { WorkoutSession } from '../types/workout.types';

export function useWorkoutHistory() {
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const historyRef = useRef<WorkoutSession[]>([]);
  const readyRef = useRef(false);
  const busyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    let active = true;

    mountedRef.current = true;
    readyRef.current = false;
    busyRef.current = true;

    loadWorkoutHistory()
      .then((saved) => {
        if (!active) return;

        historyRef.current = saved;
        readyRef.current = true;

        setHistory(saved);
        setReady(true);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError(
            'Could not load saved workouts. Please retry.',
          );
        }
      })
      .finally(() => {
        if (active) {
          busyRef.current = false;
          setLoading(false);
        }
      });

    return () => {
      active = false;
      mountedRef.current = false;
      readyRef.current = false;
    };
  }, [loadAttempt]);

  function retryLoad() {
    if (
      !mountedRef.current ||
      busyRef.current ||
      readyRef.current
    ) {
      return;
    }

    busyRef.current = true;

    setLoading(true);
    setReady(false);
    setError(null);
    setLoadAttempt((current) => current + 1);
  }

  async function commit(
    change: (current: WorkoutSession[]) => WorkoutSession[],
  ): Promise<boolean> {
    if (
      !mountedRef.current ||
      !readyRef.current ||
      busyRef.current
    ) {
      return false;
    }

    busyRef.current = true;
    setSaving(true);
    setError(null);

    try {
      const next = change(historyRef.current);

      await saveWorkoutHistory(next);

      historyRef.current = next;

      if (mountedRef.current) {
        setHistory(next);
      }

      return true;
    } catch {
      if (mountedRef.current) {
        setError(
          'Could not save your changes. Please try again.',
        );
      }

      return false;
    } finally {
      busyRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }

  function addWorkout(
    workout: WorkoutSession,
  ): Promise<boolean> {
    return commit((current) => [
      workout,
      ...current.filter((item) => item.id !== workout.id),
    ]);
  }

  function deleteWorkout(
    workoutId: string,
  ): Promise<boolean> {
    return commit((current) =>
      current.filter((workout) => workout.id !== workoutId),
    );
  }

  return {
    history,
    loading,
    ready,
    saving,
    error,
    addWorkout,
    deleteWorkout,
    retryLoad,
  };
}