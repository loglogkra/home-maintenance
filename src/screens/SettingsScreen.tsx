import React, { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useHomeStore } from '../state/useHomeStore';
import { ThemeColors, spacing, typography } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeProvider';

const SettingsScreen: React.FC = () => {
  const {
    resetDemoData,
    notificationsEnabled,
    toggleNotifications,
    region,
    setRegion,
    addSeasonalChecklists,
  } = useHomeStore();
  const { colors, themeName, toggleTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleReset = async () => {
    await AsyncStorage.clear();
    await resetDemoData();
    Alert.alert('Demo data restored', 'We reset your demo tasks and items.');
  };

  const handleAddSeasonal = () => {
    const added = addSeasonalChecklists();
    Alert.alert(
      added > 0 ? 'Seasonal tasks added' : 'Already added',
      added > 0
        ? `We added ${added} seasonal tasks for ${region}.`
        : 'Seasonal tasks for this region already exist.',
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Settings</Text>
        <Pressable style={styles.resetPill} onPress={handleReset}>
          <Text style={styles.resetPillText}>Reset data</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Region</Text>
        <Text style={styles.value}>Choose the closest climate profile</Text>
        <View style={styles.regionRow}>
          {['United States', 'Canada', 'Mild Winter'].map((entry) => {
            const isSelected = entry === region;
            return (
              <Pressable
                key={entry}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setRegion(entry)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{entry}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={[styles.secondaryButton, styles.seasonButton]} onPress={handleAddSeasonal}>
          <Text style={styles.secondaryText}>Add seasonal tasks for {region}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Notifications</Text>
            <Text style={styles.value}>Stay reminded about upcoming tasks</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Appearance</Text>
            <Text style={styles.value}>Toggle light or dark mode</Text>
          </View>
          <Switch
            value={themeName === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>HomeCare</Text>
        <Text style={styles.value}>Version 1.0.0</Text>
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
    },
    heading: {
      fontSize: typography.heading,
      fontWeight: '800',
      color: colors.text,
    },
    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    label: {
      color: colors.text,
      fontWeight: '700',
      fontSize: typography.body,
    },
    value: {
      color: colors.muted,
      marginTop: spacing.xs,
    },
    regionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    resetPill: {
      backgroundColor: '#fee2e2',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: '#fecdd3',
    },
    resetPillText: {
      color: '#b91c1c',
      fontWeight: '700',
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
    secondaryButton: {
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryText: {
      textAlign: 'center',
      color: colors.text,
      fontWeight: '700',
    },
    seasonButton: {
      alignSelf: 'flex-start',
    },
  });

export default SettingsScreen;
