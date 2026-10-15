import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import { Platform } from 'react-native';

import type { WorkoutSession } from '../types/workout.types';

const CHANNEL_ID = 'active-workouts';
const NOTIFICATION_ID = 'active-workout';

export async function requestWorkoutNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const settings = await notifee.requestPermission();

  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
  );
}

export async function showWorkoutNotification(
  workout: Pick<WorkoutSession, 'id' | 'type' | 'startTime'>,
): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const startedAt = Date.parse(workout.startTime);

  if (!Number.isFinite(startedAt)) {
    throw new Error('Invalid workout start time.');
  }

  const settings = await notifee.getNotificationSettings();

  if (
    settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED
  ) {
    return false;
  }

  const channelId = await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Active workouts',
    importance: AndroidImportance.LOW,
    vibration: false,
  });

  if (await notifee.isChannelBlocked(channelId)) {
    return false;
  }

  const workoutName =
    workout.type === 'hiit'
      ? 'HIIT'
      : workout.type.charAt(0).toUpperCase() + workout.type.slice(1);

  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: `${workoutName} in progress`,
    body: 'Workout timer running • Tap to open FitnessFreak',
    data: {
      workoutId: workout.id,
    },
    android: {
      channelId,
      ongoing: true,
      autoCancel: false,
      onlyAlertOnce: true,
      timestamp: startedAt,
      showTimestamp: true,
      showChronometer: true,
      chronometerDirection: 'up',
      pressAction: {
        id: 'default',
      },
    },
  });

  return true;
}

export async function cancelWorkoutNotification(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.cancelNotification(NOTIFICATION_ID);
}
