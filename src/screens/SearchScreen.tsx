import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../components/SectionHeader';
import { RootTabParamList, DashboardStackParamList } from '../navigation/RootNavigator';
import { useHomeStore, searchEntities } from '../state/useHomeStore';
import { Home, HomeItem, Task } from '../types/models';
import { useAppTheme } from '../theme/ThemeProvider';
import { ThemeColors, spacing, typography } from '../theme/theme';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DashboardStackParamList, 'Search'>,
  BottomTabNavigationProp<RootTabParamList>
>;

type TaskRowProps = {
  task: Task;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  homeName?: string;
};

type ItemRowProps = {
  item: HomeItem;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  homeName?: string;
};

type HomeRowProps = {
  home: Home;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

const TaskRow: React.FC<TaskRowProps> = ({ task, onPress, styles, homeName }) => (
  <Pressable style={styles.resultRow} onPress={onPress} accessibilityRole="button">
    <View style={{ flex: 1 }}>
      <Text style={styles.resultTitle}>{task.name}</Text>
      <Text style={styles.resultMeta}>
        {[task.frequency, task.room, task.dueDate ? dayjs(task.dueDate).format('MMM D, YYYY') : null]
          .filter(Boolean)
          .join(' • ')}
      </Text>
      {homeName && <Text style={styles.resultBadge}>Home: {homeName}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color={styles.resultIcon.color} />
  </Pressable>
);

const ItemRow: React.FC<ItemRowProps> = ({ item, onPress, styles, homeName }) => (
  <Pressable style={styles.resultRow} onPress={onPress} accessibilityRole="button">
    <View style={{ flex: 1 }}>
      <Text style={styles.resultTitle}>{item.name}</Text>
      <Text style={styles.resultMeta}>
        {[item.model, item.room, item.serialNumber].filter(Boolean).join(' • ')}
      </Text>
      {homeName && <Text style={styles.resultBadge}>Home: {homeName}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color={styles.resultIcon.color} />
  </Pressable>
);

const HomeRow: React.FC<HomeRowProps> = ({ home, onPress, styles }) => (
  <Pressable style={styles.resultRow} onPress={onPress} accessibilityRole="button">
    <View style={{ flex: 1 }}>
      <Text style={styles.resultTitle}>{home.name}</Text>
      <Text style={styles.resultMeta}>Switch to this home</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={styles.resultIcon.color} />
  </Pressable>
);

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { tasks, items, homes, activeHomeId, setActiveHome } = useHomeStore();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [inAllHomes, setInAllHomes] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handle);
  }, [query]);

  const results = useMemo(
    () => searchEntities(debouncedQuery, { inAllHomes }, { tasks, items, homes, activeHomeId }),
    [debouncedQuery, inAllHomes, tasks, items, homes, activeHomeId],
  );

  const homeNameLookup = useMemo(
    () => Object.fromEntries(homes.map((home) => [home.id, home.name])),
    [homes],
  );

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TasksTab', { screen: 'AddTask', params: { id: taskId } });
  };

  const handleItemPress = (itemId: string) => {
    navigation.navigate('ItemsTab', { screen: 'ItemDetail', params: { id: itemId } });
  };

  const handleHomePress = (homeId: string) => {
    setActiveHome(homeId);
    navigation.goBack();
  };

  const renderSection = <T,>(
    title: string,
    data: T[],
    renderItem: ({ item }: { item: T }) => React.ReactElement,
    keyExtractor: (item: T, index: number) => string,
  ) => (
    <View style={styles.section}>
      <SectionHeader title={title} />
      {data.length === 0 ? (
        <Text style={styles.emptySection}>No results</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );

  const showEmptyState = debouncedQuery.length === 0;
  const noResults =
    debouncedQuery.length > 0 &&
    results.tasks.length === 0 &&
    results.items.length === 0 &&
    results.homes.length === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.muted} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search tasks, items, homes"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoFocus
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Search all homes</Text>
        <Switch value={inAllHomes} onValueChange={setInAllHomes} />
      </View>

      {showEmptyState && <Text style={styles.hint}>Type to search tasks, items, or homes.</Text>}
      {noResults && <Text style={styles.emptySection}>No results</Text>}

      {!showEmptyState && (
        <>
          {renderSection<Task>(
            'Tasks',
            results.tasks,
            ({ item }) => (
              <TaskRow
                task={item}
                onPress={() => handleTaskPress(item.id)}
                styles={styles}
                homeName={inAllHomes ? homeNameLookup[item.homeId] : undefined}
              />
            ),
            (item) => item.id,
          )}

          {renderSection<HomeItem>(
            'Items',
            results.items,
            ({ item }) => (
              <ItemRow
                item={item}
                onPress={() => handleItemPress(item.id)}
                styles={styles}
                homeName={inAllHomes ? homeNameLookup[item.homeId] : undefined}
              />
            ),
            (item) => item.id,
          )}

          {renderSection<Home>('Homes', results.homes, ({ item }) => (
            <HomeRow home={item} onPress={() => handleHomePress(item.id)} styles={styles} />
          ), (item) => item.id)}
        </>
      )}
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
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.sm,
      color: colors.text,
      fontSize: typography.body,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    toggleLabel: {
      color: colors.text,
      fontWeight: '600',
    },
    hint: {
      color: colors.muted,
      marginTop: spacing.lg,
    },
    section: {
      marginTop: spacing.lg,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
    },
    emptySection: {
      color: colors.muted,
      marginTop: spacing.sm,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    resultTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: typography.body,
    },
    resultMeta: {
      color: colors.muted,
      marginTop: spacing.xs / 2,
    },
    resultBadge: {
      color: colors.text,
      marginTop: spacing.xs,
      fontSize: typography.small,
    },
    resultIcon: {
      color: colors.muted,
      marginLeft: spacing.sm,
    },
  });

export default SearchScreen;
