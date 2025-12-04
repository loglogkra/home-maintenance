import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import dayjs from 'dayjs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TaskFrequency } from '../types/models';
import { useHomeStore } from '../state/useHomeStore';
import { TaskStackParamList } from '../navigation/RootNavigator';
import { ThemeColors, spacing, typography } from '../theme/theme';
import { PhotoAttachments } from '../components/PhotoAttachments';
import { useAppTheme } from '../theme/ThemeProvider';

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

const AddTaskScreen: React.FC<Props> = ({ navigation, route }) => {
  const { addTask, updateTask, tasks } = useHomeStore();
  const editingTask = tasks.find((entry) => entry.id === route.params?.id);
  const isEditing = Boolean(route.params?.id && editingTask);
  const [name, setName] = useState(editingTask?.name ?? '');
  const [frequency, setFrequency] = useState<TaskFrequency | string>(
    (editingTask?.frequency as TaskFrequency) ?? 'Monthly',
  );
  const [room, setRoom] = useState(editingTask?.room ?? '');
  const [dueDate, setDueDate] = useState(
    editingTask?.dueDate ? dayjs(editingTask.dueDate).format('YYYY-MM-DD') : '',
  );
  const [photos, setPhotos] = useState<string[]>(editingTask?.photos ?? []);
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const parsedDueDate = useMemo(() => {
    if (!dueDate) return undefined;
    const parsed = dayjs(dueDate);
    return parsed.isValid() ? parsed.toISOString() : undefined;
  }, [dueDate]);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Task' : 'Add Task' });
  }, [isEditing, navigation]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please provide a name for the task.');
      return;
    }

    if (dueDate && !parsedDueDate) {
      Alert.alert('Invalid date', 'Please enter a due date in the format YYYY-MM-DD.');
      return;
    }

    if (isEditing && editingTask) {
      updateTask(editingTask.id, {
        name: name.trim(),
        frequency,
        room: room.trim() || undefined,
        dueDate: parsedDueDate ?? editingTask.dueDate,
        photos,
      });
      navigation.goBack();
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      name: name.trim(),
      frequency,
      room: room.trim() || undefined,
      dueDate: parsedDueDate,
      isCompleted: false,
      photos,
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
        accessibilityLabel="Task name"
      />

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {frequencies.map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, frequency === item && styles.chipSelected]}
            onPress={() => setFrequency(item)}
            accessibilityRole="button"
            accessibilityState={{ selected: frequency === item }}
            accessibilityLabel={`Set frequency to ${item}`}
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
        accessibilityLabel="Room"
      />

      <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
      <TextInput
        placeholder={dayjs().format('YYYY-MM-DD')}
        value={dueDate}
        onChangeText={setDueDate}
        style={styles.input}
        placeholderTextColor={colors.muted}
        accessibilityLabel="Due date"
      />

      <PhotoAttachments label="Task photos" value={photos} onChange={setPhotos} />

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
        accessibilityRole="button"
        accessibilityLabel={isEditing ? 'Update task' : 'Save task'}
      >
        <Text style={styles.saveText}>{isEditing ? 'Update Task' : 'Save Task'}</Text>
      </Pressable>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: typography.body,
      color: colors.text,
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
