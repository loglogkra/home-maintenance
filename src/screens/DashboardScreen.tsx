import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SectionHeader } from '../components/SectionHeader';
import { TaskCard } from '../components/TaskCard';
import { useHomeStore } from '../state/useHomeStore';
import { ThemeColors, spacing, typography } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeProvider';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { tasks, toggleTaskCompleted } = useHomeStore();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const overdueTasks = tasks.filter(
    (task) => task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && !task.isCompleted,
  );

  const upcomingWeekTasks = tasks.filter((task) => {
    if (!task.dueDate || task.isCompleted) return false;
    const due = dayjs(task.dueDate);
    return due.isAfter(dayjs().subtract(1, 'day')) && due.isBefore(dayjs().add(7, 'day'));
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>HomeCare</Text>
      <Text style={styles.subheading}>Stay on top of your home upkeep.</Text>

      <SectionHeader title="Overdue" />
      {overdueTasks.length === 0 && <Text style={styles.emptyText}>No overdue tasks 🎉</Text>}
      {overdueTasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggle={toggleTaskCompleted} />
      ))}

      <SectionHeader title="This Week" />
      {upcomingWeekTasks.length === 0 && <Text style={styles.emptyText}>Nothing due soon.</Text>}
      {upcomingWeekTasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggle={toggleTaskCompleted} />
      ))}

      <SectionHeader title="Quick Actions" />
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TasksTab' as never)}
        >
          <Text style={styles.actionText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ItemsTab' as never)}
        >
          <Text style={styles.actionText}>Items</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Settings' as never)}>
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
      paddingBottom: spacing.xl,
    },
    heading: {
      fontSize: typography.heading,
      fontWeight: '800',
      color: colors.text,
    },
    subheading: {
      color: colors.muted,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    emptyText: {
      color: colors.muted,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: 12,
    },
    actionText: {
      color: colors.white,
      textAlign: 'center',
      fontWeight: '700',
    },
  });

export default DashboardScreen;
