import { emptyWellness, validDay } from './wellness.model.ts';
import type { WellnessData } from './wellness.types';
function record(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Invalid saved data.');
  return v as Record<string, unknown>;
}
function assert(ok: unknown): asserts ok {
  if (!ok) throw new Error('Invalid saved data.');
}
function num(v: unknown, min = 0, max = 1e7) {
  assert(typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max);
}
function text(v: unknown) {
  assert(typeof v === 'string');
}
function nullable(v: unknown, min = 0, max = 1e7) {
  if (v !== null) num(v, min, max);
}
function array(v: unknown, check: (e: Record<string, unknown>) => void, perDay = false) {
  assert(Array.isArray(v));
  const ids = new Set(),
    dates = new Set();
  for (const item of v) {
    const e = record(item);
    text(e.id);
    assert(e.id !== '' && !ids.has(e.id));
    ids.add(e.id);
    check(e);
    if (perDay) {
      assert(!dates.has(e.date));
      dates.add(e.date);
    }
  }
}
function dated(e: Record<string, unknown>) {
  assert(typeof e.date === 'string' && validDay(e.date));
}
function strength(e: Record<string, unknown>, completed: boolean) {
  text(e.name);
  text(e.notes);
  assert(typeof e.startTime === 'string' && Number.isFinite(Date.parse(e.startTime)));
  assert(e.status === (completed ? 'completed' : 'active'));
  if (completed) {
    assert(
      typeof e.endTime === 'string' &&
        Number.isFinite(Date.parse(e.endTime)) &&
        Date.parse(e.endTime) >= Date.parse(e.startTime),
    );
  } else assert(e.endTime === null);
  array(e.exercises, (exercise) => {
    text(exercise.name);
    text(exercise.notes);
    array(exercise.sets, (set) => {
      nullable(set.reps, 1);
      nullable(set.weightKg);
      num(set.restSeconds);
      assert(typeof set.completed === 'boolean');
      if (set.reps !== null) assert(Number.isSafeInteger(set.reps));
      if (set.completed) assert(set.reps !== null && set.weightKg !== null);
    });
  });
}
export function decodeWellness(raw: string | null): WellnessData {
  if (raw === null) return emptyWellness();
  const d = record(JSON.parse(raw));
  assert(d.version === 1);
  const g = record(d.goals);
  num(g.steps, 1, 100000);
  num(g.workoutMinutes, 1, 1440);
  num(g.sleepHours, 1, 24);
  num(g.calories, 1, 20000);
  num(g.protein, 1, 1000);
  nullable(g.targetWeightKg, 1, 500);
  const p = record(d.profile);
  text(p.name);
  text(p.activityLevel);
  text(p.fitnessGoal);
  nullable(p.heightCm, 50, 250);
  array(d.foods, (e) => {
    dated(e);
    text(e.name);
    assert(['Breakfast', 'Lunch', 'Snacks', 'Dinner'].includes(String(e.meal)));
    for (const key of ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar']) num(e[key]);
  });
  array(
    d.activity,
    (e) => {
      dated(e);
      num(e.steps, 0, 100000);
      assert(Number.isInteger(e.steps));
      num(e.distanceKm, 0, 1000);
      num(e.activeMinutes, 0, 1440);
    },
    true,
  );
  array(
    d.sleep,
    (e) => {
      dated(e);
      num(e.minutes, 1, 1440);
      assert(['Poor', 'Okay', 'Good'].includes(String(e.quality)));
      assert(typeof e.bedtime === 'string' && typeof e.wakeTime === 'string');
      const start = Date.parse(e.bedtime),
        end = Date.parse(e.wakeTime);
      assert(
        Number.isFinite(start) &&
          Number.isFinite(end) &&
          Math.abs((end - start) / 60000 - Number(e.minutes)) < 0.001,
      );
    },
    true,
  );
  array(
    d.body,
    (e) => {
      dated(e);
      num(e.weightKg, 1, 500);
      nullable(e.bodyFat, 0, 100);
      nullable(e.waistCm, 1, 300);
      text(e.notes);
    },
    true,
  );
  array(d.plans, (e) => {
    dated(e);
    text(e.title);
    assert(typeof e.completed === 'boolean');
  });
  array(d.strength, (e) => strength(e, true));
  if (d.strengthDraft !== null) {
    const draft = record(d.strengthDraft);
    text(draft.id);
    strength(draft, false);
  }
  return d as unknown as WellnessData;
}
