import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { StrengthSetRow } from '../components/StrengthSetRow';
import {
    addExerciseToSession,
    addSetToExercise,
    createStrengthSession,
    toggleStrengthSetCompleted,
    updateStrengthSet,
} from '../model/strength.model';
import type { StrengthSession } from '../types/strength.types';

export function StrengthHomeScreen() {
    const [sessionName, setSessionName] = useState('');
    const [exerciseName, setExerciseName] = useState('');
    const [session, setSession] =
        useState<StrengthSession | null>(null);
    const [error, setError] = useState('');

    function handleStartSession() {
        if (session) return;

        try {
            const nextSession = createStrengthSession(sessionName);

            setSession(nextSession);
            setSessionName('');
            setError('');
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not start the session.',
            );
        }
    }

    function handleAddExercise() {
        if (!session) return;

        try {
            const nextSession = addExerciseToSession(
                session,
                exerciseName,
            );

            setSession(nextSession);
            setExerciseName('');
            setError('');
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not add the exercise.',
            );
        }
    }

    function handleAddSet(exerciseId: string) {
        if (!session) return;

        try {
            setSession(addSetToExercise(session, exerciseId));
            setError('');
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not add the set.',
            );
        }
    }

    function handleUpdateSet(
        exerciseId: string,
        setId: string,
        values: {
            reps: number | null;
            weightKg: number | null;
        },
    ): boolean {
        if (!session) return false;

        try {
            const nextSession = updateStrengthSet(
                session,
                exerciseId,
                setId,
                values,
            );

            setSession(nextSession);
            setError('');
            return true;
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not update the set.',
            );

            return false;
        }
    }
    function handleToggleSetCompleted(
        exerciseId: string,
        setId: string,
    ) {
        if (!session) return;

        try {
            const nextSession = toggleStrengthSetCompleted(
                session,
                exerciseId,
                setId,
            );

            setSession(nextSession);
            setError('');
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not change set completion.',
            );
        }
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Strength Training</Text>

            <Text style={styles.subtitle}>
                Build your session, one exercise at a time.
            </Text>

            {error !== '' && (
                <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                </Text>
            )}

            {!session ? (
                <View style={styles.card}>
                    <Text style={styles.heading}>New session</Text>

                    <Text style={styles.label}>Session name</Text>

                    <TextInput
                        accessibilityLabel="Session name"
                        value={sessionName}
                        onChangeText={setSessionName}
                        placeholder="For example, Push Day"
                        placeholderTextColor="#82958B"
                        maxLength={80}
                        style={styles.input}
                    />

                    <Pressable
                        accessibilityRole="button"
                        onPress={handleStartSession}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            Start strength session
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <>
                    <View style={styles.card}>
                        <Text style={styles.heading}>{session.name}</Text>

                        <Text style={styles.subtitle}>
                            {session.exercises.length} exercises
                        </Text>

                        <Text style={styles.label}>Exercise name</Text>

                        <TextInput
                            accessibilityLabel="Exercise name"
                            value={exerciseName}
                            onChangeText={setExerciseName}
                            placeholder="For example, Bench Press"
                            placeholderTextColor="#82958B"
                            maxLength={80}
                            style={styles.input}
                        />

                        <Pressable
                            accessibilityRole="button"
                            onPress={handleAddExercise}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>
                                Add exercise
                            </Text>
                        </Pressable>
                    </View>

                    {session.exercises.length === 0 && (
                        <Text style={styles.subtitle}>
                            Add your first exercise to begin.
                        </Text>
                    )}

                    {session.exercises.map((exercise) => (
                        <View key={exercise.id} style={styles.card}>
                            <Text style={styles.heading}>
                                {exercise.name}
                            </Text>

                            {exercise.sets.map((set, index) => (
                                <StrengthSetRow
                                    key={set.id}
                                    set={set}
                                    number={index + 1}
                                    onSave={(values) =>
                                        handleUpdateSet(exercise.id, set.id, values)
                                    }
                                    onToggleCompleted={() =>
                                        handleToggleSetCompleted(exercise.id, set.id)
                                    }
                                />
                            ))}

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Add set to ${exercise.name}`}
                                onPress={() => handleAddSet(exercise.id)}
                                style={styles.secondaryButton}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    + Add set
                                </Text>
                            </Pressable>
                        </View>
                    ))}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#101513',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        color: '#AAB8B1',
        fontSize: 14,
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#18221F',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
    },
    heading: {
        color: '#C8F169',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    label: {
        color: '#FFFFFF',
        marginBottom: 8,
    },
    input: {
        color: '#FFFFFF',
        backgroundColor: '#101513',
        borderWidth: 1,
        borderColor: '#36483F',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        marginBottom: 14,
    },
    button: {
        backgroundColor: '#C8F169',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#101513',
        fontWeight: '800',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: '#C8F169',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    secondaryButtonText: {
        color: '#C8F169',
        fontWeight: '700',
    },
    setRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#36483F',
    },
    setText: {
        color: '#FFFFFF',
    },
    error: {
        color: '#FF6B6B',
        marginBottom: 16,
    },
});