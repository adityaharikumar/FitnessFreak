import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyWellness,
  dayKey,
  validDay,
  requireDay,
  numberInput,
  foodTotals,
  dailyProgress,
  lastDays,
  sleepInterval,
} from '../src/shared/model/wellness.model.ts';
import { decodeWellness } from '../src/shared/model/wellness.codec.ts';
test('empty store contains no fabricated history', () => {
  const d = decodeWellness(null);
  assert.equal(
    d.foods.length + d.activity.length + d.sleep.length + d.body.length + d.strength.length,
    0,
  );
  assert.equal(d.strengthDraft, null);
  assert.equal(d.profile.name, '');
});
test('date validation rejects impossible days and future log dates', () => {
  assert.equal(validDay('2026-02-30'), false);
  assert.equal(validDay('2024-02-29'), true);
  assert.throws(() => requireDay('2999-01-01'));
  assert.equal(requireDay('2999-01-01', true), '2999-01-01');
  assert.deepEqual(lastDays(3, new Date(2026, 0, 1, 12)), [
    '2025-12-30',
    '2025-12-31',
    '2026-01-01',
  ]);
});
test('numeric form validation rejects empty, hex, infinity and fractional steps', () => {
  for (const v of ['', '0x10', 'Infinity', '1e3', '-2', '2a'])
    assert.throws(() => numberInput(v, 'steps', 0, 100000, true));
  assert.throws(() => numberInput('1.5', 'steps', 0, 100000, true));
  assert.equal(numberInput('1,5', 'weight', 1, 500), 1.5);
});
test('food totals respect dates and sum all nutrition fields', () => {
  const e = {
    id: '1',
    date: '2026-01-01',
    meal: 'Lunch',
    name: 'Meal',
    calories: 400,
    protein: 20,
    carbs: 60,
    fat: 10,
    fiber: 5,
    sugar: 4,
  };
  const totals = foodTotals(
    [e, { ...e, id: '2' }, { ...e, id: '3', date: '2026-01-02' }],
    '2026-01-01',
  );
  assert.deepEqual(totals, {
    calories: 800,
    protein: 40,
    carbs: 120,
    fat: 20,
    fiber: 10,
    sugar: 8,
  });
});
test('daily ring caps each goal separately', () => {
  const goals = { steps: 10000, water: 2000, minutes: 30, sleep: 8 };
  assert.equal(dailyProgress({ steps: 20000, water: 0, minutes: 0, sleep: 0 }, goals), 25);
  assert.equal(dailyProgress({ steps: 10000, water: 2000, minutes: 30, sleep: 8 }, goals), 100);
  assert.equal(dailyProgress({ steps: 5000, water: 1000, minutes: 15, sleep: 4 }, goals), 50);
});
test('sleep handles overnight dates and rejects reversed intervals', () => {
  const result = sleepInterval('2025-01-01', '23:00', '2025-01-02', '07:00');
  assert.equal(result.minutes, 480);
  assert.throws(() => sleepInterval('2025-01-02', '23:00', '2025-01-02', '07:00'));
  assert.throws(() => sleepInterval('2025-01-01', '25:00', '2025-01-02', '07:00'));
});
test('codec preserves records and rejects corrupt data rather than resetting it', () => {
  const d = emptyWellness();
  d.activity = [{ id: 'a', date: '2025-01-01', steps: 8000, distanceKm: 4, activeMinutes: 30 }];
  d.body = [{ id: 'w', date: '2025-01-01', weightKg: 72, bodyFat: null, waistCm: null, notes: '' }];
  assert.deepEqual(decodeWellness(JSON.stringify(d)), d);
  for (const raw of ['oops', '{}', 'null', '{"version":2}'])
    assert.throws(() => decodeWellness(raw));
  assert.throws(() =>
    decodeWellness(
      JSON.stringify({ ...d, activity: [...d.activity, { ...d.activity[0], id: 'b' }] }),
    ),
  );
  assert.throws(() => decodeWellness(JSON.stringify({ ...d, goals: { ...d.goals, steps: 0 } })));
});
test('strength draft and completed history round trip', () => {
  const d = emptyWellness();
  const session = {
    id: 'strength',
    name: 'Push',
    status: 'active',
    startTime: '2025-01-01T10:00:00Z',
    endTime: null,
    notes: '',
    exercises: [
      {
        id: 'ex',
        name: 'Bench',
        notes: '',
        sets: [{ id: 'set', reps: 10, weightKg: 50, restSeconds: 90, completed: true }],
      },
    ],
  };
  d.strengthDraft = session;
  assert.deepEqual(decodeWellness(JSON.stringify(d)), d);
  d.strengthDraft = null;
  d.strength = [{ ...session, status: 'completed', endTime: '2025-01-01T10:30:00Z' }];
  assert.deepEqual(decodeWellness(JSON.stringify(d)), d);
  d.strength[0].exercises[0].sets[0].reps = null;
  assert.throws(() => decodeWellness(JSON.stringify(d)));
});
