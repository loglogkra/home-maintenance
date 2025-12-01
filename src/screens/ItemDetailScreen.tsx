import dayjs from 'dayjs';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ItemsStackParamList } from '../navigation/RootNavigator';
import { useHomeStore } from '../state/useHomeStore';
import { colors, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<ItemsStackParamList, 'ItemDetail'>;

const ItemDetailScreen: React.FC<Props> = ({ route }) => {
  const { id } = route.params;
  const { items } = useHomeStore();

  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Item not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{item.name}</Text>
      {item.model && <Text style={styles.meta}>Model: {item.model}</Text>}
      {item.serialNumber && <Text style={styles.meta}>Serial: {item.serialNumber}</Text>}
      {item.installDate && (
        <Text style={styles.meta}>Installed: {dayjs(item.installDate).format('MMM D, YYYY')}</Text>
      )}
      {item.warrantyEnd && (
        <Text style={styles.meta}>Warranty ends: {dayjs(item.warrantyEnd).format('MMM D, YYYY')}</Text>
      )}
      {item.room && <Text style={styles.meta}>Room: {item.room}</Text>}
      {item.notes && <Text style={styles.meta}>Notes: {item.notes}</Text>}
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
  heading: {
    fontSize: typography.heading,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    color: colors.muted,
    marginTop: spacing.sm,
    fontSize: typography.body,
  },
});

export default ItemDetailScreen;
