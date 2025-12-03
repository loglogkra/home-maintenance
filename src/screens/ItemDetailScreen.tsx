import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ItemsStackParamList } from '../navigation/RootNavigator';
import { useHomeStore } from '../state/useHomeStore';
import { colors, spacing, typography } from '../theme/theme';
import { PhotoAttachments } from '../components/PhotoAttachments';

type Props = NativeStackScreenProps<ItemsStackParamList, 'ItemDetail'>;

const ItemDetailScreen: React.FC<Props> = ({ route }) => {
  const { id } = route.params;
  const { items, updateItem } = useHomeStore();

  const item = items.find((entry) => entry.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item?.name ?? '');
  const [model, setModel] = useState(item?.model ?? '');
  const [serialNumber, setSerialNumber] = useState(item?.serialNumber ?? '');
  const [installDate, setInstallDate] = useState(item?.installDate ? dayjs(item.installDate).format('YYYY-MM-DD') : '');
  const [warrantyEnd, setWarrantyEnd] = useState(
    item?.warrantyEnd ? dayjs(item.warrantyEnd).format('YYYY-MM-DD') : '',
  );
  const [room, setRoom] = useState(item?.room ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [photos, setPhotos] = useState<string[]>(item?.photos ?? []);
  const [receiptPhotos, setReceiptPhotos] = useState<string[]>(item?.receiptPhotos ?? []);
  const [warrantyPhotos, setWarrantyPhotos] = useState<string[]>(item?.warrantyPhotos ?? []);

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setModel(item.model ?? '');
    setSerialNumber(item.serialNumber ?? '');
    setInstallDate(item.installDate ? dayjs(item.installDate).format('YYYY-MM-DD') : '');
    setWarrantyEnd(item.warrantyEnd ? dayjs(item.warrantyEnd).format('YYYY-MM-DD') : '');
    setRoom(item.room ?? '');
    setNotes(item.notes ?? '');
    setPhotos(item.photos ?? []);
    setReceiptPhotos(item.receiptPhotos ?? []);
    setWarrantyPhotos(item.warrantyPhotos ?? []);
  }, [item]);

  const parsedInstallDate = useMemo(() => {
    if (!installDate) return undefined;
    const parsed = dayjs(installDate);
    return parsed.isValid() ? parsed.toISOString() : undefined;
  }, [installDate]);

  const parsedWarrantyEnd = useMemo(() => {
    if (!warrantyEnd) return undefined;
    const parsed = dayjs(warrantyEnd);
    return parsed.isValid() ? parsed.toISOString() : undefined;
  }, [warrantyEnd]);

  const handleSave = () => {
    if (!item) return;

    if (!name.trim()) {
      Alert.alert('Missing name', 'Please provide a name for the item.');
      return;
    }

    if (installDate && !parsedInstallDate) {
      Alert.alert('Invalid install date', 'Use YYYY-MM-DD for install date.');
      return;
    }

    if (warrantyEnd && !parsedWarrantyEnd) {
      Alert.alert('Invalid warranty end date', 'Use YYYY-MM-DD for warranty end.');
      return;
    }

    updateItem(item.id, {
      name: name.trim(),
      model: model.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      installDate: parsedInstallDate,
      warrantyEnd: parsedWarrantyEnd,
      room: room.trim() || undefined,
      notes: notes.trim() || undefined,
      photos,
      receiptPhotos,
      warrantyPhotos,
    });
    setIsEditing(false);
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Item not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{item.name}</Text>
        {!isEditing && (
          <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        )}
      </View>

      {isEditing ? (
        <View>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Item name"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Model (optional)</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="Model"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Serial (optional)</Text>
          <TextInput
            style={styles.input}
            value={serialNumber}
            onChangeText={setSerialNumber}
            placeholder="Serial"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Install date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={installDate}
            onChangeText={setInstallDate}
            placeholder={dayjs().format('YYYY-MM-DD')}
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Warranty end date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={warrantyEnd}
            onChangeText={setWarrantyEnd}
            placeholder={dayjs().add(1, 'year').format('YYYY-MM-DD')}
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Room</Text>
          <TextInput
            style={styles.input}
            value={room}
            onChangeText={setRoom}
            placeholder="Basement"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notes]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Maintenance notes"
            placeholderTextColor={colors.muted}
            multiline
          />

          <PhotoAttachments label="Item photos" value={photos} onChange={setPhotos} />
          <PhotoAttachments label="Receipts" value={receiptPhotos} onChange={setReceiptPhotos} />
          <PhotoAttachments
            label="Warranties"
            value={warrantyPhotos}
            onChange={setWarrantyPhotos}
          />

          <View style={styles.actionsRow}>
            <Pressable style={[styles.actionButton, styles.secondary]} onPress={() => setIsEditing(false)}>
              <Text style={[styles.actionText, styles.secondaryText]}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleSave}>
              <Text style={styles.actionText}>Save</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
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
          {photos.length > 0 && (
            <View style={styles.galleryBlock}>
              <Text style={styles.sectionHeading}>Item photos</Text>
              <View style={styles.galleryRow}>
                {photos.map((uri) => (
                  <Image key={uri} source={{ uri }} style={styles.thumbnail} />
                ))}
              </View>
            </View>
          )}
          {receiptPhotos.length > 0 && (
            <View style={styles.galleryBlock}>
              <Text style={styles.sectionHeading}>Receipts</Text>
              <View style={styles.galleryRow}>
                {receiptPhotos.map((uri) => (
                  <Image key={uri} source={{ uri }} style={styles.thumbnail} />
                ))}
              </View>
            </View>
          )}
          {warrantyPhotos.length > 0 && (
            <View style={styles.galleryBlock}>
              <Text style={styles.sectionHeading}>Warranties</Text>
              <View style={styles.galleryRow}>
                {warrantyPhotos.map((uri) => (
                  <Image key={uri} source={{ uri }} style={styles.thumbnail} />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    color: colors.muted,
    marginTop: spacing.sm,
    fontSize: typography.body,
  },
  galleryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  galleryBlock: {
    marginTop: spacing.md,
  },
  sectionHeading: {
    color: colors.text,
    fontWeight: '700',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  editText: {
    color: colors.white,
    fontWeight: '700',
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.body,
  },
  notes: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
  },
  actionText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
  },
});

export default ItemDetailScreen;
