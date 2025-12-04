import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { ItemsStackParamList } from '../navigation/RootNavigator';
import { useHomeStore } from '../state/useHomeStore';
import { HomeItem } from '../types/models';
import { ThemeColors, spacing, typography } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeProvider';

const ItemCard: React.FC<{ item: HomeItem; onPress: () => void; styles: ReturnType<typeof createStyles> }> = ({
  item,
  onPress,
  styles,
}) => (
  <Pressable
    style={styles.card}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${item.name} details`}
    accessibilityHint="Opens item details"
  >
    <Text style={styles.title}>{item.name}</Text>
    {item.model && <Text style={styles.meta}>{item.model}</Text>}
    <View style={styles.row}>
      {item.installDate && (
        <Text style={styles.meta}>Installed {dayjs(item.installDate).format('MMM D, YYYY')}</Text>
      )}
      {item.warrantyEnd && (
        <Text style={styles.meta}>Warranty {dayjs(item.warrantyEnd).format('YYYY')}</Text>
      )}
    </View>
  </Pressable>
);

const ItemsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ItemsStackParamList>>();
  const { items, activeHomeId, homes } = useHomeStore();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const resolvedHomeId = activeHomeId ?? homes[0]?.id;
  const visibleItems = useMemo(
    () => (resolvedHomeId ? items.filter((item) => item.homeId === resolvedHomeId) : items),
    [items, resolvedHomeId],
  );

  const handleAddItem = useCallback(() => {
    navigation.navigate('AddItem');
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={styles.headerButton}
          onPress={handleAddItem}
          accessibilityRole="button"
          accessibilityLabel="Add a new item"
        >
          <Text style={styles.headerButtonText}>＋</Text>
        </Pressable>
      ),
    });
  }, [handleAddItem, navigation, styles]);

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleItems}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => navigation.navigate('ItemDetail', { id: item.id })}
            styles={styles}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Add home items to keep details handy.</Text>}
      />
      <Pressable
        style={styles.fab}
        onPress={handleAddItem}
        accessibilityRole="button"
        accessibilityLabel="Create a home item"
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.subheading,
      fontWeight: '700',
      color: colors.text,
    },
    meta: {
      color: colors.muted,
      marginTop: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    emptyText: {
      color: colors.muted,
      textAlign: 'center',
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

export default ItemsScreen;
