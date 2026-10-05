import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';

const tabs = [
  { name: 'index', title: 'Home', icon: 'home-outline' },
  { name: 'train', title: 'Train', icon: 'barbell-outline' },
  { name: 'nutrition', title: 'Nutrition', icon: 'restaurant-outline' },
  { name: 'progress', title: 'Progress', icon: 'stats-chart-outline' },
  { name: 'profile', title: 'Profile', icon: 'person-outline' },
] as const;

export default function MainTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
