import { Stack } from 'expo-router';
import Screen from '@/features/body-progress/screens/WeightScreen';
import { colors } from '@/theme/colors';
export default function Route() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Weight',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <Screen />
    </>
  );
}
