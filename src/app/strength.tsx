import { Stack } from 'expo-router';

import { StrengthHomeScreen } from '../features/strength/screens/StrengthHomeScreen';

export default function StrengthRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Strength Training',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#101513',
          },
          headerTintColor: '#FFFFFF',
        }}
      />

      <StrengthHomeScreen />
    </>
  );
}