import { Text, View } from 'react-native';
import { router } from 'expo-router';
import ProgressRing from '@/components/ProgressRing';
import MetricCard from '../components/MetricCard';
import WeeklyActivity from '../components/WeeklyActivity';
import WaterTrackerCard from '@/features/hydration/components/WaterTrackerCard';
import { useHydration } from '@/features/hydration/hooks/useHydration';
import { useDashboardWorkouts } from '../hooks/useDashboardWorkouts';
import { useWellness } from '@/shared/providers/WellnessProvider';
import { Button, Card, ErrorText, Screen, ui } from '@/shared/components/TrackerUI';
import { dailyProgress, dayKey, foodTotals, progressPercent } from '@/shared/model/wellness.model';
export default function HomeScreen() {
  const water = useHydration(),
    workouts = useDashboardWorkouts(),
    s = useWellness();
  const now = new Date(),
    hour = now.getHours(),
    greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const activity = s.data.activity.find((e) => e.date === s.today);
  const sleep = s.data.sleep.find((e) => e.date === s.today);
  const body = [...s.data.body]
    .filter((e) => e.date <= s.today)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const food = foodTotals(s.data.foods, s.today);
  const goals = s.data.goals;
  const strengthMinutes = s.data.strength
    .filter((e) => e.endTime && dayKey(new Date(e.endTime)) === s.today)
    .reduce((sum, e) => sum + (Date.parse(e.endTime!) - Date.parse(e.startTime)) / 60000, 0);
  const minutes = workouts.totals.minutes + strengthMinutes;
  const progress = dailyProgress(
    {
      steps: activity?.steps ?? 0,
      water: water.totalMl,
      minutes,
      sleep: (sleep?.minutes ?? 0) / 60,
    },
    {
      steps: goals.steps,
      water: water.goalMl,
      minutes: goals.workoutMinutes,
      sleep: goals.sleepHours,
    },
  );
  return (
    <Screen
      title="FITNESSFREAK"
      subtitle={`${greeting}${s.data.profile.name ? `, ${s.data.profile.name}` : ''} · ${now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`}
    >
      <Card title="Today's activity">
        {workouts.ready && water.ready ? (
          <View style={{ alignItems: 'center' }}>
            <ProgressRing progress={progress} />
          </View>
        ) : (
          <Text style={ui.muted}>
            Your daily goal is available once workout and water entries load.
          </Text>
        )}
        <Text style={ui.muted}>
          Steps, water, workout minutes and sleep contribute equally to your daily ring.
        </Text>
        <Button label="Manage goals" secondary onPress={() => router.push('/goals')} />
      </Card>
      {workouts.loading && <Text style={ui.muted}>Loading workouts...</Text>}
      {workouts.error && (
        <>
          <ErrorText text={workouts.error} />
          <Button label="Retry workout totals" onPress={workouts.retry} />
        </>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <MetricCard
          icon="👟"
          label="Steps"
          value={(activity?.steps ?? 0).toLocaleString()}
          unit={`/ ${goals.steps.toLocaleString()}`}
          progress={progressPercent(activity?.steps ?? 0, goals.steps)}
          onPress={() => router.push('/activity')}
        />
        <MetricCard
          icon="🔥"
          label="Workout calories"
          value={workouts.ready ? workouts.totals.calories.toFixed(0) : '—'}
          unit="kcal"
          onPress={() => router.push('/(tabs)/train')}
        />
        <MetricCard
          icon="🍴"
          label="Calorie intake"
          value={food.calories.toFixed(0)}
          unit="kcal"
          onPress={() => router.push('/(tabs)/nutrition')}
        />
        <MetricCard
          icon="🏋️"
          label="Workout"
          value={workouts.ready ? minutes.toFixed(1) : '—'}
          unit="min"
          progress={workouts.ready ? progressPercent(minutes, goals.workoutMinutes) : undefined}
          onPress={() => router.push('/(tabs)/train')}
        />
        <MetricCard
          icon="📍"
          label="Workout distance"
          value={workouts.ready ? workouts.totals.distanceKm.toFixed(2) : '—'}
          unit="km"
          onPress={() => router.push('/(tabs)/train')}
        />
        <MetricCard
          icon="💧"
          label="Water"
          value={water.ready ? (water.totalMl / 1000).toFixed(2) : '—'}
          unit={`/ ${water.goalMl / 1000} L`}
          progress={water.ready ? water.progress : undefined}
          onPress={() => router.push('/hydration')}
        />
        <MetricCard
          icon="🌙"
          label="Sleep"
          value={
            sleep ? `${Math.floor(sleep.minutes / 60)}h ${Math.round(sleep.minutes % 60)}m` : '—'
          }
          unit=""
          onPress={() => router.push('/sleep')}
        />
        <MetricCard
          icon="⚖️"
          label="Latest weight"
          value={body ? String(body.weightKg) : '—'}
          unit="kg"
          onPress={() => router.push('/weight')}
        />
      </View>
      <Text style={ui.muted}>
        Tap a card to log or review entries. Calories and distance come from saved workouts; workout
        minutes also include completed strength sessions. Steps are entered manually.
      </Text>
      {body && <Text style={ui.muted}>Latest weight recorded on {body.date}.</Text>}
      <View style={ui.wrap}>
        <Button label="Plan a workout" secondary onPress={() => router.push('/planner')} />
        <Button label="Strength training" secondary onPress={() => router.push('/strength')} />
      </View>
      <WaterTrackerCard />
      <WeeklyActivity />
    </Screen>
  );
}
