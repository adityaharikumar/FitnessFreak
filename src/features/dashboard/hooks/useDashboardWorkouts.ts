import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

import type { WorkoutSession } from '@/features/workouts/types/workout.types';
import { loadWorkoutHistory } from '@/features/workouts/storage/workout.storage';
import { getDailyWorkoutTotals, type WorkoutTotals } from '../model/dashboard-workouts.model';

type DashboardWorkoutState = {
  history: WorkoutSession[];
  totals: WorkoutTotals;
  ready: boolean;
  loading: boolean;
  error: string | null;
};

export function useDashboardWorkouts() {
  const refreshRef = useRef<() => void>(() => {});
  const [state, setState] = useState<DashboardWorkoutState>({
    history: [],
    totals: { calories: 0, minutes: 0, distanceKm: 0 },
    ready: false,
    loading: true,
    error: null,
  });

  useFocusEffect(
    useCallback(() => {
      let disposed = false;
      let latestRequest = 0;
      let displayedDay = new Date().toDateString();

      async function refresh() {
        const requestId = ++latestRequest;
        // Defer state changes until after the focus effect has been installed.
        await Promise.resolve();
        if (disposed || requestId !== latestRequest) return;
        setState((current) => ({ ...current, ready: false, loading: true, error: null }));

        try {
          const history = await loadWorkoutHistory();
          if (disposed || requestId !== latestRequest) return;

          const now = new Date();
          displayedDay = now.toDateString();
          setState({
            history,
            totals: getDailyWorkoutTotals(history, now),
            ready: true,
            loading: false,
            error: null,
          });
        } catch {
          if (disposed || requestId !== latestRequest) return;
          setState((current) => ({
            ...current,
            ready: false,
            loading: false,
            error: 'Could not load saved workout totals. Please try again.',
          }));
        }
      }

      refreshRef.current = () => {
        void refresh();
      };
      void refresh();
      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') void refresh();
      });
      const interval = setInterval(() => {
        if (AppState.currentState === 'active' && new Date().toDateString() !== displayedDay) {
          void refresh();
        }
      }, 30_000);

      return () => {
        disposed = true;
        refreshRef.current = () => {};
        subscription.remove();
        clearInterval(interval);
      };
    }, []),
  );

  const retry = useCallback(() => refreshRef.current(), []);
  return { ...state, retry };
}
