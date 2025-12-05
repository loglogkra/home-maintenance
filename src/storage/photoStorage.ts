import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export type PhotoEntityType = 'task' | 'item' | 'item_receipt' | 'item_warranty';

export type StoredPhoto = {
  entityId: string;
  entityType: PhotoEntityType;
  /** URI of the stored file in the app sandbox */
  uri: string;
  /** Original URI returned by the picker */
  originalUri?: string;
  storedAt: string;
};

const STORAGE_KEY = 'homecare_photos';
const PHOTOS_DIR = `${FileSystem.documentDirectory}photos/`;

const ensurePhotoDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
};

const loadStoredPhotos = async (): Promise<StoredPhoto[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredPhoto[];
  } catch (error) {
    console.warn('Failed to parse stored photos', error);
    return [];
  }
};

const persistPhotos = async (photos: StoredPhoto[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
};

export const listPhotosForEntity = async (
  entityType: PhotoEntityType,
  entityId: string,
): Promise<string[]> => {
  const photos = await loadStoredPhotos();
  return photos.filter((photo) => photo.entityType === entityType && photo.entityId === entityId).map((photo) => photo.uri);
};

export const saveLocalPhoto = async (
  entityType: PhotoEntityType,
  entityId: string,
  uri: string,
): Promise<string> => {
  await ensurePhotoDir();
  const photos = await loadStoredPhotos();
  const existing = photos.find(
    (photo) => photo.entityId === entityId && photo.entityType === entityType && photo.uri === uri,
  );
  if (existing) return existing.uri;

  const extension = uri.split('.').pop();
  const filename = `${entityType}-${entityId}-${Date.now()}.${extension ?? 'jpg'}`;
  const destination = `${PHOTOS_DIR}${filename}`;

  await FileSystem.copyAsync({ from: uri, to: destination });

  // Future: Upload the file to Azure Blob Storage and replace `destination` with the remote URI.
  // This hook keeps the local reference for offline access while allowing cloud sync later.

  const updated = [
    ...photos,
    {
      entityId,
      entityType,
      uri: destination,
      originalUri: uri,
      storedAt: new Date().toISOString(),
    },
  ];

  await persistPhotos(updated);
  return destination;
};

export const deletePhoto = async (entityType: PhotoEntityType, entityId: string, uri: string): Promise<void> => {
  const photos = await loadStoredPhotos();
  const remaining = photos.filter(
    (photo) => !(photo.entityType === entityType && photo.entityId === entityId && photo.uri === uri),
  );
  await persistPhotos(remaining);

  if (uri.startsWith(PHOTOS_DIR)) {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  }
};
