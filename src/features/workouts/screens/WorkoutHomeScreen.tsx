import { useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { WorkoutSummary } from '../components/WorkoutSummary';
import { useWorkoutNotification } from '../hooks/useWorkoutNotification';
import {
  requestWorkoutNotificationPermission,
} from '../services/workout-notification.service';


import { WorkoutActionButton } from '../components/WorkoutActionButton';
import {
  WorkoutDetailsForm,
  type WorkoutFormValues,
} from '../components/WorkoutDetailsForm';
import { WorkoutTimer } from '../components/WorkoutTimer';
import { WorkoutTypeCard } from '../components/WorkoutTypeCard';
import { useWorkoutDraft } from '../hooks/useWorkoutDraft';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import {
  createWorkoutSession,
  finishWorkoutSession,
  workoutTypes,
} from '../model/workout.model';
import type {
  WorkoutSession,
  WorkoutType,
} from '../types/workout.types';

const EMPTY_DETAILS: WorkoutFormValues = {
  calories: '',
  distance: '',
  heartRate: '',
  notes: '',
};

export function WorkoutHomeScreen() {
  const historyState = useWorkoutHistory();
  const draftState = useWorkoutDraft();

  const loading = historyState.loading || draftState.loading;

  if (loading || !historyState.ready || !draftState.ready) {
    return (
      <View style={[styles.container, styles.statusContainer]}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#C8F169" />

            <Text style={styles.statusText}>
              Loading saved workouts...
            </Text>
          </>
        ) : (
          <>
            <Text
              accessibilityRole="alert"
              style={styles.statusText}
            >
              {historyState.error ??
                draftState.error ??
                'Could not load workouts.'}
            </Text>

            <Pressable
              style={styles.startButton}
              onPress={() => {
                historyState.retryLoad();
                draftState.retryLoad();
              }}
            >
              <Text style={styles.startButtonText}>
                Retry loading
              </Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <WorkoutContent
      historyState={historyState}
      draftState={draftState}
    />
  );
}

type WorkoutContentProps = {
  historyState: ReturnType<typeof useWorkoutHistory>;
  draftState: ReturnType<typeof useWorkoutDraft>;
};

function WorkoutContent({
  historyState,
  draftState,
}: WorkoutContentProps) {
  const {
    history,
    saving,
    error: storageError,
    addWorkout,
    deleteWorkout,
  } = historyState;

  const {
    draft,
    saving: draftSaving,
    error: draftError,
    saveDraft,
    clearDraft,
  } = draftState;

  const [restoredDraft] = useState(() =>
    draft && !history.some((item) => item.id === draft.id)
      ? draft
      : null,
  );

  const [selectedType, setSelectedType] =
    useState<WorkoutType>(restoredDraft?.type ?? 'walking');

  const [activeWorkout, setActiveWorkout] =
    useState<WorkoutSession | null>(() =>
      restoredDraft
        ? {
          ...createWorkoutSession(restoredDraft.type),
          id: restoredDraft.id,
          startTime: restoredDraft.startTime,
        }
        : null,
    );

  const [details, setDetails] = useState<WorkoutFormValues>(
    () =>
      restoredDraft
        ? { ...restoredDraft.details }
        : EMPTY_DETAILS,
  );
  const [historyFilter, setHistoryFilter] =
    useState<WorkoutType | 'all'>('all');

  const filteredHistory =
    historyFilter === 'all'
      ? history
      : history.filter(
        (workout) => workout.type === historyFilter,
      );

  const [needsCleanup, setNeedsCleanup] = useState(
    () =>
      draft !== null &&
      history.some((item) => item.id === draft.id),
  );

  const [formError, setFormError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const actionRef = useRef(false);
  const {
    notificationError,
    retryNotification,
  } = useWorkoutNotification(activeWorkout);

  function makeDraft(
    workout: WorkoutSession,
    values: WorkoutFormValues,
  ) {
    return {
      id: workout.id,
      type: workout.type,
      startTime: workout.startTime,
      details: { ...values },
    };
  }

  async function runAction(action: () => Promise<void>) {
    if (actionRef.current) return;

    actionRef.current = true;
    setActionBusy(true);

    try {
      await action();
    } finally {
      actionRef.current = false;
      setActionBusy(false);
    }
  }

  function resetSession() {
    setActiveWorkout(null);
    setDetails(EMPTY_DETAILS);
    setFormError('');
  }

  async function handleStartWorkout(
    type: WorkoutType = selectedType,
  ) {
    if (activeWorkout || actionRef.current) return;

    await runAction(async () => {
      try {
        const allowed =
          await requestWorkoutNotificationPermission();

        if (!allowed) {
          Alert.alert(
            'Notifications disabled',
            'Your workout will still be saved. Enable FitnessFreak notifications in your phone settings to see the timer in the notification bar.',
          );
        }
      } catch {
        Alert.alert(
          'Notification permission unavailable',
          'Your workout can still start. You can retry the notification from this screen.',
        );
      }

      const workout = createWorkoutSession(type);

      const saved = await saveDraft(
        makeDraft(workout, EMPTY_DETAILS),
      );

      if (!saved) return;
      setSelectedType(type);
      setDetails(EMPTY_DETAILS);
      setFormError('');
      setActiveWorkout(workout);
    });
  }

  function handleDetailsChange(values: WorkoutFormValues) {
    if (!activeWorkout || actionRef.current) return;

    setDetails(values);
    setFormError('');

    void saveDraft(makeDraft(activeWorkout, values));
  }

  async function handleRetryDraftSave() {
    if (!activeWorkout) return;

    await runAction(async () => {
      await saveDraft(makeDraft(activeWorkout, details));
    });
  }

  async function handleStopWorkout() {
    if (!activeWorkout || actionRef.current) return;

    const caloriesBurned = Number(
      details.calories.trim().replace(',', '.'),
    );

    const distanceKm = Number(
      details.distance.trim().replace(',', '.'),
    );

    const heartRateText = details.heartRate.trim();

    const heartRate =
      heartRateText === ''
        ? undefined
        : Number(heartRateText);

    if (
      details.calories.trim() === '' ||
      details.distance.trim() === '' ||
      !Number.isFinite(caloriesBurned) ||
      !Number.isFinite(distanceKm) ||
      caloriesBurned < 0 ||
      distanceKm < 0
    ) {
      setFormError(
        'Enter valid calories and distance: zero or greater.',
      );
      return;
    }

    if (
      heartRate !== undefined &&
      (!Number.isSafeInteger(heartRate) || heartRate <= 0)
    ) {
      setFormError(
        'Enter a positive whole number for heart rate, or leave it blank.',
      );
      return;
    }

    await runAction(async () => {
      const startedAt = Date.parse(activeWorkout.startTime);

      const completedWorkout = finishWorkoutSession(
        activeWorkout,
        {
          durationMinutes: Math.max(
            0,
            (Date.now() - startedAt) / 60000,
          ),
          caloriesBurned,
          distanceKm,
          heartRate,
          notes: details.notes.trim(),
        },
      );

      const saved = await addWorkout(completedWorkout);

      if (!saved) return;

      resetSession();

      const cleared = await clearDraft();
      setNeedsCleanup(!cleared);
    });
  }

  async function handleDiscardWorkout() {
    await runAction(async () => {
      const cleared = await clearDraft();

      if (cleared) resetSession();
    });
  }

  async function handleDeleteWorkout(workoutId: string) {
    await runAction(async () => {
      await deleteWorkout(workoutId);
    });
  }

  async function handleCleanup() {
    await runAction(async () => {
      const cleared = await clearDraft();

      if (cleared) setNeedsCleanup(false);
    });
  }

  if (actionBusy || saving || needsCleanup) {
    return (
      <View style={[styles.container, styles.statusContainer]}>
        {actionBusy || saving ? (
          <>
            <ActivityIndicator size="large" color="#C8F169" />

            <Text style={styles.statusText}>
              Saving changes...
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.statusText}>
              Your workout is already saved in history.
              Clear its recovery draft to continue.
            </Text>

            {draftError !== null && (
              <Text
                accessibilityRole="alert"
                style={styles.formError}
              >
                {draftError}
              </Text>
            )}

            <Pressable
              style={styles.startButton}
              onPress={handleCleanup}
            >
              <Text style={styles.startButtonText}>
                Clear recovery draft
              </Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Workout Tracker</Text>

      <Text style={styles.subtitle}>
        Tap a workout type to start your session
      </Text>
      <WorkoutSummary workouts={history} />
      {!activeWorkout && (
        <Link href="/strength" asChild>
          <Pressable
            accessibilityRole="button"
            style={StyleSheet.flatten([
              styles.startButton,
              {
                marginTop: 0,
                marginBottom: 24,
              },
            ])}
          >
            <Text style={styles.startButtonText}>
              Open Strength Training
            </Text>
          </Pressable>
        </Link>
      )}
      {notificationError !== null && (
        <View>
          <Text
            accessibilityRole="alert"
            style={styles.formError}
          >
            {notificationError}
          </Text>

          <Pressable
            style={styles.startButton}
            onPress={retryNotification}
          >
            <Text style={styles.startButtonText}>
              Retry notification
            </Text>
          </Pressable>
        </View>
      )}

      {storageError !== null && (
        <Text
          accessibilityRole="alert"
          style={styles.formError}
        >
          {storageError}
        </Text>
      )}

      {draftError !== null && (
        <View>
          <Text
            accessibilityRole="alert"
            style={styles.formError}
          >
            {draftError}
          </Text>

          {activeWorkout !== null && (
            <Pressable
              style={styles.startButton}
              onPress={handleRetryDraftSave}
            >
              <Text style={styles.startButtonText}>
                Retry saving progress
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {activeWorkout !== null && (
        <Text style={styles.activeText}>
          {draftSaving
            ? 'Saving progress...'
            : draftError
              ? 'Progress not saved'
              : 'Progress saved on this device'}
        </Text>
      )}

      <Text style={styles.sectionTitle}>Workout type</Text>

      <View style={styles.typesGrid}>
        {workoutTypes.map((type) => (
          <WorkoutTypeCard
            key={type}
            type={type}
            selected={
              (activeWorkout?.type ?? selectedType) === type
            }
            onPress={() => {
              if (!activeWorkout && !actionRef.current) {
    setSelectedType(type);
              }
            }}
          />
        ))}
      </View>

      {activeWorkout ? (
        <View style={styles.activeCard}>
          <View style={styles.cardHeader}>
            <Text
              style={[styles.activeTitle, styles.cardHeading]}
            >
              Workout in progress
            </Text>

            <WorkoutActionButton
              action="discard"
              onConfirm={handleDiscardWorkout}
            />
          </View>

          <Text style={styles.activeText}>
            Type: {activeWorkout.type}
          </Text>

          <Text style={styles.activeText}>
            Started:{' '}
            {new Date(
              activeWorkout.startTime,
            ).toLocaleTimeString()}
          </Text>

          <WorkoutTimer
            key={activeWorkout.id}
            startTime={activeWorkout.startTime}
          />

          <WorkoutDetailsForm
            values={details}
            onChange={handleDetailsChange}
          />

          {formError !== '' && (
            <Text
              accessibilityRole="alert"
              style={styles.formError}
            >
              {formError}
            </Text>
          )}

          <Pressable
            style={styles.stopButton}
            onPress={() => {
              void handleStopWorkout();
            }}
          >
            <Text style={styles.stopButtonText}>
              Stop & Save
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.startButton}
          onPress={() => {
            void handleStartWorkout();
          }}
        >
          <Text style={styles.startButtonText}>
            Start Workout
          </Text>
        </Pressable>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyFilters}
      >
        {(['all', ...workoutTypes] as const).map((type) => (
          <Pressable
            key={type}
            accessibilityRole="button"
            accessibilityState={{
              selected: historyFilter === type,
            }}
            onPress={() => setHistoryFilter(type)}
            style={[
              styles.filterButton,
              historyFilter === type && styles.filterButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                historyFilter === type && styles.filterTextSelected,
              ]}
            >
              {type === 'all'
                ? 'All'
                : type === 'hiit'
                  ? 'HIIT'
                  : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.sectionTitle}>
        Workout history
      </Text>

      {filteredHistory.length === 0 ? (
        <Text style={styles.emptyText}>
          {historyFilter === 'all'
            ? 'No completed workouts yet.'
            : `No ${historyFilter} workouts yet.`}
        </Text>
      ) : (
        filteredHistory.map((workout) => (
          <View
            key={workout.id}
            style={styles.historyCard}
          >
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.historyTitle,
                  styles.cardHeading,
                ]}
              >
                {workout.type}
              </Text>

              <WorkoutActionButton
                action="delete"
                onConfirm={() =>
                  handleDeleteWorkout(workout.id)
                }
              />
            </View>
            <Text style={styles.historyText}>
              Date:{' '}
              {new Date(workout.startTime).toLocaleDateString(
                undefined,
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                },
              )}
            </Text>

            <Text style={styles.historyText}>
              Started:{' '}
              {new Date(workout.startTime).toLocaleTimeString(
                undefined,
                {
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )}
            </Text>

            {workout.endTime !== null && (
              <Text style={styles.historyText}>
                Finished:{' '}
                {new Date(workout.endTime).toLocaleString(
                  undefined,
                  {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}
              </Text>
            )}

            <Text style={styles.historyText}>
              Duration:{' '}
              {workout.durationMinutes.toFixed(1)} minutes
            </Text>

            <Text style={styles.historyText}>
              Calories: {workout.caloriesBurned} kcal
            </Text>

            <Text style={styles.historyText}>
              Distance: {workout.distanceKm} km
            </Text>

            {workout.heartRate !== null && (
              <Text style={styles.historyText}>
                Heart rate: {workout.heartRate} bpm
              </Text>
            )}

            {workout.notes !== '' && (
              <Text style={styles.historyText}>
                Notes: {workout.notes}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  cardHeading: {
    flex: 1,
    marginBottom: 0,
  },
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
  formError: {
    color: '#FF6B6B',
    marginBottom: 12,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statusText: {
    color: '#AAB8B1',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  historyFilters: {
    gap: 8,
    marginTop: 16,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#18221F',
  },
  filterButtonSelected: {
    backgroundColor: '#C8F169',
  },
  filterText: {
    color: '#AAB8B1',
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#101513',
  },
});