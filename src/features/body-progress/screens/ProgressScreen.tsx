import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useWellness } from '@/shared/providers/WellnessProvider';
import { useHydration } from '@/features/hydration/hooks/useHydration';
import { useDashboardWorkouts } from '@/features/dashboard/hooks/useDashboardWorkouts';
import { Bars, Button, Card, Choices, ErrorText, Screen, ui } from '@/shared/components/TrackerUI';
import { dayKey, lastDays, foodTotals } from '@/shared/model/wellness.model';
export default function ProgressScreen() {
  const s = useWellness(),
    water = useHydration(),
    workouts = useDashboardWorkouts();
  const [period, setPeriod] = useState('7 days');
  const count = Number(period.split(' ')[0]);
  const dates = lastDays(count),
    dateSet = new Set(dates);
  const activities = s.data.activity.filter((e) => dateSet.has(e.date)),
    sleep = s.data.sleep.filter((e) => dateSet.has(e.date)),
    body = s.data.body
      .filter((e) => dateSet.has(e.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  const sessions = workouts.history.filter(
    (e) => e.endTime && dateSet.has(dayKey(new Date(e.endTime))),
  );
  const strength = s.data.strength.filter(
    (e) => e.endTime && dateSet.has(dayKey(new Date(e.endTime))),
  );
  const duration =
    sessions.reduce((a, e) => a + e.durationMinutes, 0) +
    strength.reduce((a, e) => a + (Date.parse(e.endTime!) - Date.parse(e.startTime)) / 60000, 0);
  const waterMl = water.history
    .filter((e) => dateSet.has(e.localDate))
    .reduce((a, e) => a + e.amountMl, 0);
  const allWorkoutDates = new Set(
    [...workouts.history, ...s.data.strength]
      .filter((e) => e.endTime)
      .map((e) => dayKey(new Date(e.endTime!))),
  );
  let streak = 0;
  const recent = lastDays(366).reverse();
  let index = allWorkoutDates.has(recent[0]) ? 0 : 1;
  while (index < recent.length && allWorkoutDates.has(recent[index])) {
    streak++;
    index++;
  }
  const bucketSize = Math.ceil(count / 7);
  const buckets = Array.from({ length: Math.ceil(count / bucketSize) }, (_, i) =>
    dates.slice(i * bucketSize, (i + 1) * bucketSize),
  );
  return (
    <Screen
      title="Your progress"
      subtitle="Reports from your saved entries. Missing days count as zero in totals."
    >
      <Choices
        items={['7 days', '30 days', '90 days', '365 days']}
        value={period}
        onChange={setPeriod}
      />
      {workouts.error && (
        <>
          <ErrorText text={workouts.error} />
          <Button label="Retry workouts" onPress={workouts.retry} />
        </>
      )}
      <Card title="Training">
        <Text style={ui.big}>
          {workouts.ready ? sessions.length + strength.length : '—'} sessions
        </Text>
        <Text style={ui.text}>{workouts.ready ? duration.toFixed(1) : '—'} workout minutes</Text>
        <Text style={ui.text}>
          {workouts.ready ? sessions.reduce((a, e) => a + e.caloriesBurned, 0).toFixed(0) : '—'}{' '}
          logged kcal •{' '}
          {workouts.ready ? sessions.reduce((a, e) => a + e.distanceKm, 0).toFixed(2) : '—'} km
        </Text>
        <Text style={ui.muted}>
          Current workout streak: {workouts.ready ? `${streak} days` : 'loading'}. Includes today or
          a streak ending yesterday.
        </Text>
      </Card>
      <Card title="Steps">
        <Text style={ui.big}>{activities.reduce((a, e) => a + e.steps, 0).toLocaleString()}</Text>
        <Bars
          points={buckets.map((days) => ({
            label: days[0].slice(5),
            value: activities.filter((e) => days.includes(e.date)).reduce((a, e) => a + e.steps, 0),
          }))}
          unit="steps"
        />
        <Text style={ui.muted}>
          Each bar totals up to {bucketSize} day{bucketSize === 1 ? '' : 's'}, starting on the date
          shown.
        </Text>
      </Card>
      <Card title="Nutrition, water & sleep">
        <Text style={ui.text}>
          Food:{' '}
          {dates.reduce((a, date) => a + foodTotals(s.data.foods, date).calories, 0).toFixed(0)}{' '}
          kcal logged
        </Text>
        <Text style={ui.text}>
          Protein:{' '}
          {dates.reduce((a, date) => a + foodTotals(s.data.foods, date).protein, 0).toFixed(1)} g
          logged
        </Text>
        <Text style={ui.text}>Water: {water.ready ? (waterMl / 1000).toFixed(2) : '—'} L</Text>
        <Text style={ui.text}>
          Average sleep:{' '}
          {sleep.length
            ? (sleep.reduce((a, e) => a + e.minutes, 0) / sleep.length / 60).toFixed(1)
            : '—'}{' '}
          hours
        </Text>
        <Text style={ui.muted}>
          Sleep average uses {sleep.length} recorded night{sleep.length === 1 ? '' : 's'}.
        </Text>
      </Card>
      <Card title="Weight trend">
        {body.length ? (
          <>
            <Bars
              points={body.slice(-7).map((e) => ({ label: e.date.slice(5), value: e.weightKg }))}
              unit="kg"
            />
            <Text style={ui.muted}>
              Latest 7 check-ins within this period.{'\n'}
              {body[0].weightKg} kg → {body[body.length - 1].weightKg} kg
            </Text>
          </>
        ) : (
          <Text style={ui.muted}>No measurements in this period.</Text>
        )}
        <Button label="Log weight & measurements" onPress={() => router.push('/weight')} />
      </Card>
    </Screen>
  );
}
