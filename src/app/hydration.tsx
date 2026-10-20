import { Stack } from 'expo-router';
import { Screen } from '@/shared/components/TrackerUI';
import WaterTrackerCard from '@/features/hydration/components/WaterTrackerCard';
import { colors } from '@/theme/colors';
export default function HydrationRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Water',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <Screen
        title="Water tracker"
        subtitle="Quick additions, your daily goal, and saved water entries."
      >
        <WaterTrackerCard />
      </Screen>
    </>
  );
}
