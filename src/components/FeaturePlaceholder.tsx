import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

export default function FeaturePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.badge}>Coming soon</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  description: { color: colors.muted, fontSize: 16, textAlign: 'center', marginTop: 12 },
  badge: { color: colors.accent, marginTop: 24 },
});
