import { Stack } from 'expo-router';
import Screen from '@/features/activity/screens/ActivityScreen';
import { colors } from '@/theme/colors';
export default function Route() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Activity',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <Screen />
    </>
  );
}
