import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ItemsStackParamList } from '../navigation/RootNavigator';
import { useHomeStore } from '../state/useHomeStore';
import { defaultHome } from '../types/models';
import { ThemeColors, spacing, typography } from '../theme/theme';
import { PhotoAttachments } from '../components/PhotoAttachments';
import { useAppTheme } from '../theme/ThemeProvider';
import { deletePhoto, listPhotosForEntity, saveLocalPhoto } from '../storage/photoStorage';

type Props = NativeStackScreenProps<ItemsStackParamList, 'AddItem'>;

const AddItemScreen: React.FC<Props> = ({ navigation }) => {
  const { addItem, activeHomeId, homes } = useHomeStore();
  const [itemId] = useState(Date.now().toString());
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [warrantyEnd, setWarrantyEnd] = useState('');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [receiptPhotos, setReceiptPhotos] = useState<string[]>([]);
  const [warrantyPhotos, setWarrantyPhotos] = useState<string[]>([]);
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const resolvedHomeId = useMemo(
    () => activeHomeId ?? homes[0]?.id ?? defaultHome.id,
    [activeHomeId, homes],
  );

  useEffect(() => {
    const loadPhotos = async () => {
      const [itemPhotos, receiptUris, warrantyUris] = await Promise.all([
        listPhotosForEntity('item', itemId),
        listPhotosForEntity('item_receipt', itemId),
        listPhotosForEntity('item_warranty', itemId),
      ]);

      if (itemPhotos.length) setPhotos(itemPhotos);
      if (receiptUris.length) setReceiptPhotos(receiptUris);
      if (warrantyUris.length) setWarrantyPhotos(warrantyUris);
    };

    void loadPhotos();
  }, [itemId]);

  const handlePhotoChange = async (type: 'item' | 'item_receipt' | 'item_warranty', next: string[]) => {
    const stateMap = {
      item: { value: photos, setter: setPhotos },
      item_receipt: { value: receiptPhotos, setter: setReceiptPhotos },
      item_warranty: { value: warrantyPhotos, setter: setWarrantyPhotos },
    } as const;

    const { value, setter } = stateMap[type];
    const added = next.filter((uri) => !value.includes(uri));
    const removed = value.filter((uri) => !next.includes(uri));

    const storedAdded = await Promise.all(added.map((uri) => saveLocalPhoto(type, itemId, uri)));
    await Promise.all(removed.map((uri) => deletePhoto(type, itemId, uri)));

    setter([...value.filter((uri) => !removed.includes(uri)), ...storedAdded]);
  };

  const handleSave = () => {
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

    const newItem = {
      id: itemId,
      homeId: resolvedHomeId,
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
    };

    addItem(newItem);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name *</Text>
      <TextInput
        placeholder="Water Heater"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Model (optional)</Text>
      <TextInput
        placeholder="Model"
        value={model}
        onChangeText={setModel}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Serial (optional)</Text>
      <TextInput
        placeholder="Serial"
        value={serialNumber}
        onChangeText={setSerialNumber}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Install date (YYYY-MM-DD)</Text>
      <TextInput
        placeholder={dayjs().format('YYYY-MM-DD')}
        value={installDate}
        onChangeText={setInstallDate}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Warranty end date (YYYY-MM-DD)</Text>
      <TextInput
        placeholder={dayjs().add(1, 'year').format('YYYY-MM-DD')}
        value={warrantyEnd}
        onChangeText={setWarrantyEnd}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Room</Text>
      <TextInput
        placeholder="Basement, Kitchen"
        value={room}
        onChangeText={setRoom}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        placeholder="Maintenance notes"
        value={notes}
        onChangeText={setNotes}
        style={[styles.input, styles.notes]}
        multiline
        placeholderTextColor={colors.muted}
      />

      <PhotoAttachments
        label="Item photos"
        value={photos}
        onChange={(uris) => handlePhotoChange('item', uris)}
      />
      <PhotoAttachments
        label="Receipts"
        value={receiptPhotos}
        onChange={(uris) => handlePhotoChange('item_receipt', uris)}
      />
      <PhotoAttachments
        label="Warranties"
        value={warrantyPhotos}
        onChange={(uris) => handlePhotoChange('item_warranty', uris)}
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Item</Text>
      </Pressable>
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
    label: {
      color: colors.text,
      fontWeight: '700',
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: typography.body,
      color: colors.text,
    },
    notes: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    saveButton: {
      marginTop: spacing.xl,
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: 12,
    },
    saveText: {
      color: colors.white,
      textAlign: 'center',
      fontWeight: '700',
    },
  });

export default AddItemScreen;
