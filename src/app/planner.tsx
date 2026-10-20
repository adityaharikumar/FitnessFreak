import { Stack } from 'expo-router';
import Screen from '@/features/planner/screens/PlannerScreen';
import { colors } from '@/theme/colors';
export default function Route() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Planner',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <Screen />
    </>
  );
}
