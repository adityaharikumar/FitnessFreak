import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDailyWorkoutTotals } from '../src/features/dashboard/model/dashboard-workouts.model.ts';

const now = new Date(2026, 9, 18, 12);
const session = (id, endTime, overrides = {}) => ({
  id,
  type: 'walking',
  startTime: new Date(2026, 9, 18, 8).toISOString(),
  endTime,
  durationMinutes: 12.5,
  caloriesBurned: 100,
  distanceKm: 1.25,
  heartRate: null,
  notes: '',
  ...overrides,
});

test('empty history has zero totals', () => {
  assert.deepEqual(getDailyWorkoutTotals([], now), { calories: 0, minutes: 0, distanceKm: 0 });
});
test('counts completed sessions today and excludes active and other days', () => {
  const history = [
    session('1', new Date(2026, 9, 18, 9).toISOString()),
    session('2', new Date(2026, 9, 18, 11).toISOString()),
    session('old', new Date(2026, 9, 17, 23).toISOString()),
    session('future', new Date(2026, 9, 19, 1).toISOString()),
    session('active', null),
  ];
  assert.deepEqual(getDailyWorkoutTotals(history, now), {
    calories: 200,
    minutes: 25,
    distanceKm: 2.5,
  });
  assert.deepEqual(
    getDailyWorkoutTotals(
      history.filter((w) => w.id !== '1'),
      now,
    ),
    { calories: 100, minutes: 12.5, distanceKm: 1.25 },
  );
});
test('overnight workout belongs to finish day, including local midnight', () => {
  const history = [
    session('overnight', new Date(2026, 9, 18, 0).toISOString(), {
      startTime: new Date(2026, 9, 17, 23, 30).toISOString(),
    }),
  ];
  assert.equal(getDailyWorkoutTotals(history, now).calories, 100);
  assert.equal(getDailyWorkoutTotals(history, new Date(2026, 9, 17, 12)).calories, 0);
});
