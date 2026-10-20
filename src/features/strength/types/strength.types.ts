export type StrengthSessionStatus = 'active' | 'completed';

export type StrengthSet = {
  id: string;
  reps: number | null;
  weightKg: number | null;
  restSeconds: number;
  completed: boolean;
};

export type StrengthExercise = {
  id: string;
  name: string;
  sets: StrengthSet[];
  notes: string;
};

export type StrengthSession = {
  id: string;
  name: string;
  status: StrengthSessionStatus;
  startTime: string;
  endTime: string | null;
  exercises: StrengthExercise[];
  notes: string;
};
