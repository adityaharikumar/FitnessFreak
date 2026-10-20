import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HydrationProvider } from '@/features/hydration/providers/HydrationProvider';
import { WellnessProvider } from '@/shared/providers/WellnessProvider';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HydrationProvider>
        <WellnessProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </WellnessProvider>
      </HydrationProvider>
    </SafeAreaProvider>
  );
}
