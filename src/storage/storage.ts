import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, HomeItem, Task } from '../types/models';
import { ThemeName } from '../theme/theme';

const STORAGE_KEY = 'homecare-data';

export type PersistedState = {
  tasks: Task[];
  items: HomeItem[];
  region: string;
  theme?: ThemeName;
  homes?: Home[];
  activeHomeId?: string | null;
};

export const loadHomeData = async (): Promise<PersistedState | null> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedState;
  } catch (error) {
    console.warn('Failed to parse stored data', error);
    return null;
  }
};

export const saveHomeData = async (data: PersistedState): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clearHomeData = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
