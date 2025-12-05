import dayjs from 'dayjs';
import React, { useLayoutEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SectionHeader } from '../components/SectionHeader';
import { TaskCard } from '../components/TaskCard';
import { DashboardStackParamList, RootTabParamList } from '../navigation/RootNavigator';
import { useHomeStore } from '../state/useHomeStore';
import { ThemeColors, spacing, typography } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeProvider';

type DashboardNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DashboardStackParamList, 'DashboardHome'>,
  BottomTabNavigationProp<RootTabParamList>
>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { tasks, toggleTaskCompleted, activeHomeId, homes } = useHomeStore();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const resolvedHomeId = activeHomeId ?? homes[0]?.id;
  const activeHome = useMemo(
    () => homes.find((home) => home.id === resolvedHomeId) ?? homes[0],
    [homes, resolvedHomeId],
  );

  const tasksForHome = useMemo(
    () => (resolvedHomeId ? tasks.filter((task) => task.homeId === resolvedHomeId) : tasks),
    [resolvedHomeId, tasks],
  );

  const overdueTasks = tasksForHome.filter(
    (task) => task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && !task.isCompleted,
  );

  const upcomingWeekTasks = tasksForHome.filter((task) => {
    if (!task.dueDate || task.isCompleted) return false;
    const due = dayjs(task.dueDate);
    return due.isAfter(dayjs().subtract(1, 'day')) && due.isBefore(dayjs().add(7, 'day'));
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          accessibilityRole="button"
          accessibilityLabel="Search tasks, items, or homes"
        >
          <Ionicons name="search" size={22} color={colors.text} />
        </TouchableOpacity>
      ),
      headerTitle: 'Dashboard',
    });
  }, [colors.text, navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>HomeCare</Text>
        {activeHome && <Text style={styles.homeBadge}>{activeHome.name}</Text>}
      </View>
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
          onPress={() => navigation.navigate('TasksTab', { screen: 'Tasks' })}
          accessibilityRole="button"
          accessibilityLabel="View tasks"
        >
          <Text style={styles.actionText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ItemsTab', { screen: 'Items' })}
          accessibilityRole="button"
          accessibilityLabel="View items"
        >
          <Text style={styles.actionText}>Items</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Settings', { screen: 'SettingsHome' })}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
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
    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    heading: {
      fontSize: typography.heading,
      fontWeight: '800',
      color: colors.text,
    },
    homeBadge: {
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontWeight: '700',
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
