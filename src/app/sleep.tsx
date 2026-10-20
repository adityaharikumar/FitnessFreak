import { Stack } from 'expo-router';
import Screen from '@/features/sleep/screens/SleepScreen';
import { colors } from '@/theme/colors';
export default function Route() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Sleep',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <Screen />
    </>
  );
}
