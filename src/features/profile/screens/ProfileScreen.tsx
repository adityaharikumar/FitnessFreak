import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useWellness } from '@/shared/providers/WellnessProvider';
import { Button, Card, Choices, ErrorText, Field, Screen, ui } from '@/shared/components/TrackerUI';
import { optionalNumber } from '@/shared/model/wellness.model';
export default function ProfileScreen() {
  return (
    <Screen title="Your profile" subtitle="Personalize your on-device fitness journal.">
      <ProfileForm />
    </Screen>
  );
}
function ProfileForm() {
  const s = useWellness();
  const [name, setName] = useState(s.data.profile.name),
    [height, setHeight] = useState(
      s.data.profile.heightCm === null ? '' : String(s.data.profile.heightCm),
    ),
    [level, setLevel] = useState(s.data.profile.activityLevel),
    [goal, setGoal] = useState(s.data.profile.fitnessGoal),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function save() {
    setError('');
    setMessage('');
    try {
      if (name.trim().length > 60) throw new Error('Use a name of 60 characters or fewer.');
      const profile = {
        name: name.trim(),
        heightCm: optionalNumber(height, 'height', 50, 250),
        activityLevel: level,
        fitnessGoal: goal,
      };
      if (await s.update((d) => ({ ...d, profile }))) setMessage('Profile saved.');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <Card title="About you">
        <Field label="Display name" value={name} onChange={setName} />
        <Field label="Height (cm, optional)" value={height} onChange={setHeight} numeric />
        <Text style={ui.text}>Activity level</Text>
        <Choices items={['Low', 'Moderate', 'High']} value={level} onChange={setLevel} />
        <Text style={ui.text}>Fitness focus</Text>
        <Choices
          items={['General fitness', 'Build strength', 'Improve endurance', 'Weight management']}
          value={goal}
          onChange={setGoal}
        />
        <ErrorText text={error} />
        <Button
          label={s.saving ? 'Saving...' : 'Save profile'}
          disabled={s.saving}
          onPress={() => void save()}
        />
        <Text style={ui.muted}>{message}</Text>
      </Card>
      <Button label="Edit daily goals" onPress={() => router.push('/goals')} />
      <Button label="Workout planner" secondary onPress={() => router.push('/planner')} />
      <Card title="Storage & privacy">
        <Text style={ui.text}>
          Entries are stored locally on this device using app storage. There is no account or cloud
          synchronization in this version.
        </Text>
        <Text style={ui.muted}>
          Uninstalling the app or clearing its storage may remove entries. Web and Android keep
          separate data. App storage is not an encrypted medical record.
        </Text>
        <Text style={ui.muted}>Units: kg, cm, km, ml and kcal. Theme: dark.</Text>
      </Card>
    </>
  );
}
