import { Stack } from 'expo-router';
import Screen from '@/features/goals/screens/GoalsScreen';
import { colors } from '@/theme/colors';
export default function Route() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Goals',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <Screen />
    </>
  );
}
