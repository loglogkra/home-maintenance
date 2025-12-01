import React, { useEffect } from 'react';
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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.headerButton} onPress={() => navigation.navigate('AddTask')}>
          <Text style={styles.headerButtonText}>Add</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const renderItem = ({ item }: { item: Task }) => (
    <TaskCard task={item} onToggle={toggleTaskCompleted} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={[...tasks].sort(sortByDueDate)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Add your first task to get started.</Text>}
      />
      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
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
