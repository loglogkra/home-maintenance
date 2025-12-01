import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useHomeStore } from '../state/useHomeStore';
import { colors, spacing, typography } from '../theme/theme';

const SettingsScreen: React.FC = () => {
  const { resetDemoData, notificationsEnabled, toggleNotifications } = useHomeStore();

  const handleReset = async () => {
    await resetDemoData();
    Alert.alert('Demo data restored', 'We reset your demo tasks and items.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Region</Text>
        <Text style={styles.value}>United States</Text>
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

      <Pressable style={[styles.card, styles.resetButton]} onPress={handleReset}>
        <Text style={[styles.label, styles.resetText]}>Reset demo data</Text>
        <Text style={[styles.value, styles.resetText]}>Clear and reseed sample tasks</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.label}>HomeCare</Text>
        <Text style={styles.value}>Version 1.0.0</Text>
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecdd3',
  },
  resetText: {
    color: '#b91c1c',
  },
});

export default SettingsScreen;
