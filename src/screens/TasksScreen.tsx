import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Swipeable } from 'react-native-gesture-handler';
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
  const {
    tasks,
    toggleTaskCompleted,
    removeTask,
    bulkAddRecommendedTasks,
    addSeasonalChecklists,
    region,
  } = useHomeStore();
  const [selectedRoom, setSelectedRoom] = useState('All');

  const handleAddTask = useCallback(() => {
    navigation.navigate('AddTask');
  }, [navigation]);

  const handleBulkAdd = useCallback(() => {
    const added = bulkAddRecommendedTasks();
    Alert.alert(
      added > 0 ? 'Recommendations added' : 'All caught up',
      added > 0
        ? `We added ${added} suggested home tasks for you.`
        : 'Recommended tasks are already in your list.',
    );
  }, [bulkAddRecommendedTasks]);

  const handleSeasonalAdd = useCallback(() => {
    const added = addSeasonalChecklists();
    Alert.alert(
      added > 0 ? 'Seasonal checklists' : 'Seasonal tasks up to date',
      added > 0
        ? `We added ${added} seasonal tasks tailored for ${region}.`
        : 'Seasonal tasks for your region already exist.',
    );
  }, [addSeasonalChecklists, region]);

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

  const TaskRow: React.FC<{ task: Task }> = ({ task }) => {
    const swipeRef = React.useRef<Swipeable | null>(null);
    const closeSwipe = () => swipeRef.current?.close();

    const handleDelete = () => {
      Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel', onPress: closeSwipe },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeTask(task.id);
            closeSwipe();
          },
        },
      ]);
    };

    return (
      <Swipeable
        ref={swipeRef}
        renderLeftActions={() => (
          <Pressable
            style={[styles.swipeAction, styles.completeAction]}
            onPress={() => {
              toggleTaskCompleted(task.id);
              closeSwipe();
            }}
          >
            <Text style={styles.swipeText}>Mark {task.isCompleted ? 'open' : 'complete'}</Text>
          </Pressable>
        )}
        renderRightActions={() => (
          <View style={styles.rightActions}>
            <Pressable
              style={[styles.swipeAction, styles.editAction]}
              onPress={() => {
                navigation.navigate('AddTask', { id: task.id });
                closeSwipe();
              }}
            >
              <Text style={styles.swipeText}>Edit</Text>
            </Pressable>
            <Pressable
              style={[styles.swipeAction, styles.deleteAction]}
              onPress={handleDelete}
            >
              <Text style={styles.swipeText}>Delete</Text>
            </Pressable>
          </View>
        )}
      >
        <TaskCard
          task={task}
          onToggle={(id) => {
            toggleTaskCompleted(id);
            closeSwipe();
          }}
          onPress={() => {
            navigation.navigate('AddTask', { id: task.id });
            closeSwipe();
          }}
        />
      </Swipeable>
    );
  };

  const renderItem = ({ item }: { item: Task }) => <TaskRow task={item} />;

  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <Pressable style={styles.actionCard} onPress={handleBulkAdd}>
          <Text style={styles.actionTitle}>Add 12 recommended tasks</Text>
          <Text style={styles.actionDescription}>
            Quickly seed furnace filters, gutters, and more upkeep tasks.
          </Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={handleSeasonalAdd}>
          <Text style={styles.actionTitle}>Seasonal lists ({region})</Text>
          <Text style={styles.actionDescription}>
            Drop in summer, fall prep, and winterizing checklists.
          </Text>
        </Pressable>
      </View>

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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  actionCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTitle: {
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    color: colors.muted,
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
  swipeAction: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 90,
  },
  swipeText: {
    color: colors.white,
    fontWeight: '800',
  },
  completeAction: {
    backgroundColor: '#16a34a',
  },
  editAction: {
    backgroundColor: colors.primary,
  },
  deleteAction: {
    backgroundColor: '#dc2626',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
});

export default TasksScreen;
