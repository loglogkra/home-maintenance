import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, spacing, typography } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeProvider';

export type PhotoAttachmentsProps = {
  label: string;
  value: string[];
  onChange: (photos: string[]) => void;
};

const requestPermission = async (
  type: 'camera' | 'library',
): Promise<ImagePicker.PermissionStatus | undefined> => {
  if (type === 'camera') {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    return result.status;
  }

  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return result.status;
};

export const PhotoAttachments: React.FC<PhotoAttachmentsProps> = ({ label, value, onChange }) => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePick = useCallback(
    async (mode: 'library' | 'camera') => {
      const permission = await requestPermission(mode === 'camera' ? 'camera' : 'library');
      if (!permission || permission !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to continue.');
        return;
      }

      const pickerFn =
        mode === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;

      const result = await pickerFn({
        allowsEditing: true,
        quality: 0.7,
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) {
        const uris = result.assets?.map((asset) => asset.uri) ?? [];
        onChange([...value, ...uris]);
      }
    },
    [onChange, value],
  );

  const handleRemove = useCallback(
    (uri: string) => {
      onChange(value.filter((item) => item !== uri));
    },
    [onChange, value],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label} accessibilityRole="header">
          {label}
        </Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => handlePick('library')}
            accessibilityRole="button"
            accessibilityLabel="Upload a photo from library"
          >
            <Text style={styles.secondaryText}>Upload</Text>
          </Pressable>
          <Pressable
            style={styles.primaryButton}
            onPress={() => handlePick('camera')}
            accessibilityRole="button"
            accessibilityLabel="Take a photo with camera"
          >
            <Text style={styles.primaryText}>Camera</Text>
          </Pressable>
        </View>
      </View>

      {value.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
          {value.map((uri) => (
            <View key={uri} style={styles.thumbnailWrapper}>
              <Image source={{ uri }} style={styles.thumbnail} />
              <Pressable
                style={styles.removeBadge}
                onPress={() => handleRemove(uri)}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.helper}>No photos yet</Text>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    label: {
      color: colors.text,
      fontWeight: '700',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 10,
    },
    primaryText: {
      color: colors.white,
      fontWeight: '700',
    },
    secondaryButton: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryText: {
      color: colors.text,
      fontWeight: '700',
    },
    previewRow: {
      marginTop: spacing.md,
    },
    thumbnailWrapper: {
      marginRight: spacing.sm,
    },
    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    removeBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    removeText: {
      color: colors.white,
      fontSize: typography.subheading,
      lineHeight: typography.subheading,
    },
    helper: {
      color: colors.muted,
      marginTop: spacing.sm,
    },
  });

export default PhotoAttachments;
