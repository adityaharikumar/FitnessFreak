import type {
  StrengthExercise,
  StrengthSession,
  StrengthSet,
} from '../types/strength.types';

let idCounter = 0;

function createId(): string {
  idCounter += 1;

  return [
    Date.now().toString(36),
    idCounter.toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join('-');
}

function requireName(value: string, label: string): string {
  const name = value.trim();

  if (name.length === 0) {
    throw new Error(`${label} is required.`);
  }

  if (name.length > 80) {
    throw new Error(`${label} must be 80 characters or fewer.`);
  }

  return name;
}

function requireActiveSession(session: StrengthSession): void {
  if (session.status !== 'active') {
    throw new Error('This session has already been completed.');
  }
}

export function createStrengthSet(): StrengthSet {
  return {
    id: createId(),
    reps: null,
    weightKg: null,
    restSeconds: 90,
    completed: false,
  };
}

export function createStrengthExercise(
  name: string,
): StrengthExercise {
  return {
    id: createId(),
    name: requireName(name, 'Exercise name'),
    sets: [createStrengthSet()],
    notes: '',
  };
}

export function createStrengthSession(
  name: string,
): StrengthSession {
  return {
    id: createId(),
    name: requireName(name, 'Session name'),
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: null,
    exercises: [],
    notes: '',
  };
}

export function addExerciseToSession(
  session: StrengthSession,
  exerciseName: string,
): StrengthSession {
  requireActiveSession(session);

  const exercise = createStrengthExercise(exerciseName);

  return {
    ...session,
    exercises: [...session.exercises, exercise],
  };
}

export function addSetToExercise(
  session: StrengthSession,
  exerciseId: string,
): StrengthSession {
  requireActiveSession(session);

  const exerciseExists = session.exercises.some(
    (exercise) => exercise.id === exerciseId,
  );

  if (!exerciseExists) {
    throw new Error('Exercise not found.');
  }

  const newSet = createStrengthSet();

  return {
    ...session,
    exercises: session.exercises.map((exercise) =>
      exercise.id === exerciseId
        ? {
            ...exercise,
            sets: [...exercise.sets, newSet],
          }
        : exercise,
    ),
  };
}

export function updateStrengthSet(
  session: StrengthSession,
  exerciseId: string,
  setId: string,
  values: {
    reps: number | null;
    weightKg: number | null;
  },
): StrengthSession {
  requireActiveSession(session);

  const exercise = session.exercises.find(
    (item) => item.id === exerciseId,
  );

  if (!exercise || !exercise.sets.some((set) => set.id === setId)) {
    throw new Error('Exercise or set not found.');
  }

  if (
    values.reps !== null &&
    (!Number.isSafeInteger(values.reps) || values.reps <= 0)
  ) {
    throw new Error('Reps must be a positive whole number.');
  }

  if (
    values.weightKg !== null &&
    (!Number.isFinite(values.weightKg) || values.weightKg < 0)
  ) {
    throw new Error('Weight must be zero or greater.');
  }

  return {
    ...session,
    exercises: session.exercises.map((item) =>
      item.id === exerciseId
        ? {
            ...item,
            sets: item.sets.map((set) =>
              set.id === setId
                ? {
                    ...set,
                    ...values,
                    completed: false,
                  }
                : set,
            ),
          }
        : item,
    ),
  };
}
export function toggleStrengthSetCompleted(
  session: StrengthSession,
  exerciseId: string,
  setId: string,
): StrengthSession {
  requireActiveSession(session);

  const exercise = session.exercises.find(
    (item) => item.id === exerciseId,
  );

  const targetSet = exercise?.sets.find(
    (set) => set.id === setId,
  );

  if (!targetSet) {
    throw new Error('Exercise or set not found.');
  }

  if (
    !targetSet.completed &&
    (
      targetSet.reps === null ||
      !Number.isSafeInteger(targetSet.reps) ||
      targetSet.reps <= 0 ||
      targetSet.weightKg === null ||
      !Number.isFinite(targetSet.weightKg) ||
      targetSet.weightKg < 0
    )
  ) {
    throw new Error('Update valid reps and weight first.');
  }

  return {
    ...session,
    exercises: session.exercises.map((item) =>
      item.id === exerciseId
        ? {
            ...item,
            sets: item.sets.map((set) =>
              set.id === setId
                ? { ...set, completed: !set.completed }
                : set,
            ),
          }
        : item,
    ),
  };
}