import dayjs from 'dayjs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../types/models';
import { colors, spacing, typography } from '../theme/theme';

interface TaskCardProps {
  task: Task;
  onToggle?: (id: string) => void;
  onPress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onPress }) => {
  const dueLabel = task.dueDate ? dayjs(task.dueDate).format('MMM D') : 'No due date';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{task.name}</Text>
        <Pressable style={styles.checkbox} onPress={() => onToggle?.(task.id)}>
          <View style={[styles.checkboxInner, task.isCompleted && styles.checkboxChecked]} />
        </Pressable>
      </View>
      <Text style={styles.meta}>{task.frequency}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.due}>Due {dueLabel}</Text>
        {task.room && <Text style={styles.room}>{task.room}</Text>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  meta: {
    color: colors.muted,
    fontSize: typography.small,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  due: {
    color: colors.text,
    fontWeight: '600',
  },
  room: {
    color: colors.muted,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
});
