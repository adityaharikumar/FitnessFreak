import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import {
  cancelWorkoutNotification,
  showWorkoutNotification,
} from '../services/workout-notification.service';
import type { WorkoutSession } from '../types/workout.types';

// Keep notification updates in order.
// An older "show" must finish before a newer "cancel".
let notificationQueue: Promise<void> = Promise.resolve();

export function useWorkoutNotification(
  workout: WorkoutSession | null,
) {
  const [notificationError, setNotificationError] =
    useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  const workoutId = workout?.id;
  const workoutType = workout?.type;
  const startTime = workout?.startTime;

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let disposed = false;

    function synchronizeNotification() {
      notificationQueue = notificationQueue
        .then(async () => {
          if (disposed) return;

          if (
            workoutId !== undefined &&
            workoutType !== undefined &&
            startTime !== undefined
          ) {
            const shown = await showWorkoutNotification({
              id: workoutId,
              type: workoutType,
              startTime,
            });

            if (!disposed) {
              setNotificationError(
                shown
                  ? null
                  : 'Notifications are disabled. Enable FitnessFreak notifications in your phone settings.',
              );
            }
          } else {
            await cancelWorkoutNotification();

            if (!disposed) {
              setNotificationError(null);
            }
          }
        })
        .catch(() => {
          if (!disposed) {
            setNotificationError(
              'Could not update the workout notification. Tap Retry notification.',
            );
          }
        });
    }

    synchronizeNotification();

    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          synchronizeNotification();
        }
      },
    );

    return () => {
      disposed = true;
      subscription.remove();

      // Do not cancel here: leaving the screen does not
      // mean the workout has ended.
    };
  }, [workoutId, workoutType, startTime, retryCount]);

  function retryNotification() {
    setRetryCount((current) => current + 1);
  }

  return {
    notificationError,
    retryNotification,
  };
}