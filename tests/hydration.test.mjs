import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyHydration,
  decodeHydration,
  dailyTotal,
  undoForDay,
  isValidGoal,
  localDateKey,
} from '../src/features/hydration/hydration.model.ts';

const entry = (id, amountMl, localDate) => ({
  id,
  amountMl,
  localDate,
  recordedAt: '2026-10-05T20:00:00.000Z',
});

test('new storage starts empty with a sample goal', () => {
  assert.deepEqual(decodeHydration(null), { version: 1, goalMl: 2500, entries: [] });
});
test('totals and undo use today only and retain previous history', () => {
  const data = {
    ...emptyHydration(),
    entries: [
      entry('1', 500, '2026-10-04'),
      entry('2', 250, '2026-10-05'),
      entry('3', 500, '2026-10-05'),
    ],
  };
  assert.equal(dailyTotal(data, '2026-10-05'), 750);
  const undone = undoForDay(data, '2026-10-05');
  assert.equal(dailyTotal(undone, '2026-10-05'), 250);
  assert.equal(dailyTotal(undone, '2026-10-04'), 500);
  assert.equal(dailyTotal(undone, '2026-10-06'), 0);
  assert.deepEqual(undoForDay(undone, '2026-10-06'), undone);
  assert.equal(data.entries.length, 3);
});
test('round-trip preserves goal, timestamps, dates and entries', () => {
  const data = { version: 1, goalMl: 3000, entries: [entry('1', 500, '2026-10-05')] };
  assert.deepEqual(decodeHydration(JSON.stringify(data)), data);
});
test('invalid storage is rejected instead of silently reset', () => {
  for (const raw of [
    'oops',
    'null',
    '{}',
    JSON.stringify({ ...emptyHydration(), version: 2 }),
    JSON.stringify({ ...emptyHydration(), goalMl: 0 }),
    JSON.stringify({ ...emptyHydration(), entries: [entry('1', -1, '2026-10-05')] }),
    JSON.stringify({
      ...emptyHydration(),
      entries: [entry('1', 250, '2026-10-05'), entry('1', 250, '2026-10-05')],
    }),
  ]) {
    assert.throws(() => decodeHydration(raw));
  }
});
test('goals must be whole numbers within the editable range', () => {
  for (const goal of [0, -1, 249, 10001, Infinity, NaN, 250.5])
    assert.equal(isValidGoal(goal), false);
  for (const goal of [250, 2500, 10000]) assert.equal(isValidGoal(goal), true);
});
test('day key uses the local calendar, including month rollover', () => {
  assert.equal(localDateKey(new Date(2026, 0, 1, 0, 5)), '2026-01-01');
  assert.equal(localDateKey(new Date(2026, 9, 31, 23, 59)), '2026-10-31');
  assert.equal(localDateKey(new Date(2026, 10, 1, 0, 0)), '2026-11-01');
});
