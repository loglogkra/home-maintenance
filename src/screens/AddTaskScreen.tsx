import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import dayjs from 'dayjs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TaskFrequency } from '../types/models';
import { useHomeStore } from '../state/useHomeStore';
import { TaskStackParamList } from '../navigation/RootNavigator';
import { colors, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<TaskStackParamList, 'AddTask'>;

const frequencies: TaskFrequency[] = [
  'One-time',
  'Weekly',
  'Monthly',
  'Quarterly',
  'Every 6 Months',
  'Yearly',
  'Custom',
];

const AddTaskScreen: React.FC<Props> = ({ navigation }) => {
  const { addTask } = useHomeStore();
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<TaskFrequency>('Monthly');
  const [room, setRoom] = useState('');
  const [dueDate, setDueDate] = useState('');

  const parsedDueDate = useMemo(() => {
    if (!dueDate) return undefined;
    const parsed = dayjs(dueDate);
    return parsed.isValid() ? parsed.toISOString() : undefined;
  }, [dueDate]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please provide a name for the task.');
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      name: name.trim(),
      frequency,
      room: room.trim() || undefined,
      dueDate: parsedDueDate,
      isCompleted: false,
    };

    addTask(newTask);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Task name *</Text>
      <TextInput
        placeholder="e.g. Flush water heater"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {frequencies.map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, frequency === item && styles.chipSelected]}
            onPress={() => setFrequency(item)}
          >
            <Text style={[styles.chipText, frequency === item && styles.chipTextSelected]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Room (optional)</Text>
      <TextInput
        placeholder="Kitchen, Basement, Exterior"
        value={room}
        onChangeText={setRoom}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
      <TextInput
        placeholder={dayjs().format('YYYY-MM-DD')}
        value={dueDate}
        onChangeText={setDueDate}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Task</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.body,
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
  },
  saveText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '700',
  },
});

export default AddTaskScreen;
