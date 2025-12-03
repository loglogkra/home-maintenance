import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { TaskCard } from '../components/TaskCard';
import { Task } from '../types/models';
import { TaskStackParamList } from '../navigation/RootNavigator';
import { useHomeStore } from '../state/useHomeStore';
import { colors, spacing } from '../theme/theme';

const sortByDueDate = (a: Task, b: Task) => {
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return dayjs(a.dueDate).diff(dayjs(b.dueDate));
};

const TasksScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TaskStackParamList>>();
  const { tasks, toggleTaskCompleted } = useHomeStore();
  const [selectedRoom, setSelectedRoom] = useState('All');

  const handleAddTask = useCallback(() => {
    navigation.navigate('AddTask');
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.headerButton} onPress={handleAddTask}>
          <Text style={styles.headerButtonText}>＋</Text>
        </Pressable>
      ),
    });
  }, [handleAddTask, navigation]);

  const roomFilters = useMemo(() => {
    const defaults = ['All', 'Kitchen', 'Basement', 'Exterior'];
    const taskRooms = tasks
      .map((task) => task.room)
      .filter((room): room is string => Boolean(room) && room.trim().length > 0);
    const uniqueRooms = Array.from(new Set([...defaults, ...taskRooms]));
    return uniqueRooms;
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const list =
      selectedRoom === 'All'
        ? tasks
        : tasks.filter((task) => (task.room ? task.room === selectedRoom : false));
    return [...list].sort(sortByDueDate);
  }, [selectedRoom, tasks]);

  const renderItem = ({ item }: { item: Task }) => (
    <TaskCard task={item} onToggle={toggleTaskCompleted} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.filtersRow}>
        {roomFilters.map((room) => {
          const isSelected = room === selectedRoom;
          return (
            <Pressable
              key={room}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
              onPress={() => setSelectedRoom(room)}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>{room}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Add your first task to get started.</Text>}
      />
      <Pressable style={styles.fab} onPress={handleAddTask}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: spacing.xl,
  },
  headerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  headerButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 28,
  },
});

export default TasksScreen;
