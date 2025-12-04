import React, { useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import dayjs from 'dayjs';
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
    homes,
    activeHomeId,
    createHome,
    setActiveHome,
    tasks,
    items,
  } = useHomeStore();
  const { colors, themeName, toggleTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');

  const activeHome = useMemo(
    () => homes.find((home) => home.id === activeHomeId) ?? homes[0],
    [activeHomeId, homes],
  );

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

  const handleCreateHome = () => {
    const trimmed = newHomeName.trim();
    if (!trimmed) {
      Alert.alert('Home name required', 'Please enter a name for your home.');
      return;
    }

    createHome(trimmed);
    setNewHomeName('');
    setCreateModalVisible(false);
  };

  const handleShareHome = async () => {
    if (!activeHome) {
      Alert.alert('No home selected', 'Pick a home to share its checklist.');
      return;
    }

    const tasksForHome = tasks.filter((task) => task.homeId === activeHome.id);
    const itemsForHome = items.filter((item) => item.homeId === activeHome.id);

    const formatTaskLine = (taskName: string, frequency?: string | null, dueDate?: string, room?: string) => {
      const frequencyText = frequency ? `${frequency}` : 'No cadence';
      const dueText = dueDate ? `Due ${dayjs(dueDate).format('MMM D, YYYY')}` : 'No due date';
      const roomText = room ? `Room: ${room}` : undefined;
      return [taskName, `(${frequencyText}, ${dueText}${roomText ? `, ${roomText}` : ''})`].join(' ');
    };

    const formatItemLine = (
      name: string,
      model?: string,
      installDate?: string,
      warrantyEnd?: string,
    ) => {
      const parts = [name];
      if (model) parts.push(`– ${model}`);
      if (installDate) parts.push(`Installed ${dayjs(installDate).format('MMM D, YYYY')}`);
      if (warrantyEnd) parts.push(`Warranty ${dayjs(warrantyEnd).format('YYYY')}`);
      return parts.join(' ');
    };

    const summary = [
      `HomeCare – ${activeHome.name}`,
      '',
      'Tasks:',
      ...tasksForHome.map((task) =>
        formatTaskLine(task.name, task.frequency?.toString(), task.dueDate, task.room),
      ),
      '',
      'Items:',
      ...itemsForHome.map((item) =>
        formatItemLine(item.name, item.model, item.installDate, item.warrantyEnd),
      ),
    ].join('\n');

    const payload = { home: activeHome, tasks: tasksForHome, items: itemsForHome };
    // Future Azure sync could upload this payload for collaborators instead of only sharing locally.
    console.log('Home share payload', payload);

    try {
      await Share.share({ message: summary });
    } catch (error) {
      console.warn('Share failed', error);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.heading}>Settings</Text>
            {activeHome && <Text style={styles.value}>Current home: {activeHome.name}</Text>}
          </View>
          <Pressable style={styles.resetPill} onPress={handleReset}>
            <Text style={styles.resetPillText}>Reset data</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Homes</Text>
          <Text style={styles.value}>Switch between spaces and share a checklist.</Text>
          <View style={styles.homeList}>
            {homes.length === 0 && (
              <Text style={styles.value}>No homes yet. Create one to get started.</Text>
            )}
            {homes.map((home) => {
              const isActive = home.id === activeHome?.id;
              return (
                <Pressable
                  key={home.id}
                  style={[styles.homeRow, isActive && styles.homeRowActive]}
                  onPress={() => setActiveHome(home.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Switch to ${home.name}`}
                >
                  <Text style={[styles.homeName, isActive && styles.homeNameActive]}>{home.name}</Text>
                  {isActive && <Text style={styles.homeBadge}>Active</Text>}
                </Pressable>
              );
            })}
          </View>
          <View style={styles.homeActionsRow}>
            <Pressable
              style={[styles.secondaryButton, styles.homeActionButton]}
              onPress={() => setCreateModalVisible(true)}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryText}>Create new home</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, styles.homeActionButton, styles.shareButton]}
              onPress={handleShareHome}
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryText, styles.shareText]}>Share home checklist</Text>
            </Pressable>
          </View>
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

      <Modal transparent visible={isCreateModalVisible} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setCreateModalVisible(false)}>
          <Pressable
            style={styles.modalContent}
            onPress={(event) => event.stopPropagation?.()}
          >
            <Text style={styles.modalTitle}>Create a new home</Text>
            <TextInput
              value={newHomeName}
              onChangeText={setNewHomeName}
              placeholder="e.g. Lake Cabin"
              style={styles.modalInput}
              placeholderTextColor={colors.muted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.secondaryButton, styles.modalButton]} onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, styles.modalButton, styles.createButton]} onPress={handleCreateHome}>
                <Text style={[styles.secondaryText, styles.createText]}>Create</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
    homeList: {
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    homeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
    },
    homeRowActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '1a',
    },
    homeName: {
      color: colors.text,
      fontWeight: '700',
    },
    homeNameActive: {
      color: colors.primary,
    },
    homeBadge: {
      color: colors.primary,
      fontWeight: '700',
    },
    homeActionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    homeActionButton: {
      marginTop: 0,
      flex: 1,
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
    shareButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    shareText: {
      color: colors.white,
    },
    seasonButton: {
      alignSelf: 'flex-start',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: typography.subheading,
      fontWeight: '800',
      color: colors.text,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.md,
      color: colors.text,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'flex-end',
    },
    modalButton: {
      flex: 1,
      marginTop: 0,
    },
    createButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    createText: {
      color: colors.white,
    },
  });

export default SettingsScreen;
