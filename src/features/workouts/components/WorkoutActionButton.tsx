import { useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type WorkoutActionButtonProps = {
  action: 'discard' | 'delete';
  onConfirm: () => void;
};

export function WorkoutActionButton({
  action,
  onConfirm,
}: WorkoutActionButtonProps) {
  const [visible, setVisible] = useState(false);

  const isDiscard = action === 'discard';

  function handleOpen() {
    Keyboard.dismiss();
    setVisible(true);
  }

  function handleConfirm() {
    setVisible(false);
    onConfirm();
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isDiscard ? 'Discard active workout' : 'Delete workout'
        }
        onPress={handleOpen}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>
          {isDiscard ? '✕' : 'Delete'}
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View
            style={styles.dialog}
            accessibilityViewIsModal
          >
            <Text
              accessibilityRole="header"
              style={styles.title}
            >
              {isDiscard ? 'Discard workout?' : 'Delete workout?'}
            </Text>

            <Text style={styles.message}>
              {isDiscard
                ? 'This session and its entered details will be discarded without saving.'
                : 'Remove this completed workout from your history?'}
            </Text>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(false)}
                style={[styles.button, styles.keepButton]}
              >
                <Text style={styles.keepText}>
                  Keep workout
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={handleConfirm}
                style={[styles.button, styles.confirmButton]}
              >
                <Text style={styles.confirmText}>
                  {isDiscard ? 'Discard' : 'Delete'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 10,
  },
  triggerText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#18221F',
    padding: 20,
    borderRadius: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    color: '#AAB8B1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    minHeight: 44,
    padding: 12,
    justifyContent: 'center',
    borderRadius: 10,
  },
  keepButton: {
    backgroundColor: '#26332E',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
  },
  keepText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmText: {
    color: '#101513',
    fontWeight: '700',
  },
});