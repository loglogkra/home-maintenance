import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadHomeData, saveHomeData } from '../storage/storage';
import { HomeItem, Task, defaultHome } from '../types/models';

type SyncEntity = 'task' | 'item';
type SyncOperation = 'create' | 'update' | 'delete';

export type ChangeRecord = {
  id: string;
  entity: SyncEntity;
  entityId: string;
  operation: SyncOperation;
  timestamp: string;
  data?: Partial<Task> | Partial<HomeItem>;
};

type SyncState = {
  tasks: Task[];
  items: HomeItem[];
  changeLog: ChangeRecord[];
  pendingSync: ChangeRecord[];
  homeId: string;
};

const CHANGE_LOG_KEY = 'homecare-change-log';
const PENDING_SYNC_KEY = 'homecare-pending-sync';

const loadChangeLog = async (): Promise<ChangeRecord[]> => {
  const stored = await AsyncStorage.getItem(CHANGE_LOG_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as ChangeRecord[];
  } catch (error) {
    console.warn('Failed to parse change log', error);
    return [];
  }
};

const saveChangeLog = async (changeLog: ChangeRecord[]): Promise<void> => {
  await AsyncStorage.setItem(CHANGE_LOG_KEY, JSON.stringify(changeLog));
};

const loadPendingSync = async (): Promise<ChangeRecord[]> => {
  const stored = await AsyncStorage.getItem(PENDING_SYNC_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as ChangeRecord[];
  } catch (error) {
    console.warn('Failed to parse pending sync queue', error);
    return [];
  }
};

const savePendingSync = async (pending: ChangeRecord[]): Promise<void> => {
  await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
};

const appendToQueues = async (record: ChangeRecord): Promise<void> => {
  const [log, pending] = await Promise.all([loadChangeLog(), loadPendingSync()]);
  const updatedLog = [...log, record];
  const updatedPending = [...pending, record];
  await Promise.all([saveChangeLog(updatedLog), savePendingSync(updatedPending)]);
};

const dedupeChangeLog = (changeLog: ChangeRecord[]): ChangeRecord[] => {
  const map = new Map<string, ChangeRecord>();

  changeLog
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .forEach((record) => {
      const key = `${record.entity}-${record.entityId}`;
      const existing = map.get(key);

      if (!existing || new Date(existing.timestamp).getTime() <= new Date(record.timestamp).getTime()) {
        map.set(key, record);
      }
    });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
};

const applyChangeLog = (tasks: Task[], items: HomeItem[], changeLog: ChangeRecord[]) => {
  let updatedTasks = [...tasks];
  let updatedItems = [...items];

  const sorted = changeLog.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  sorted.forEach((record) => {
    if (record.entity === 'task') {
      updatedTasks = applyTaskChange(updatedTasks, record);
    }

    if (record.entity === 'item') {
      updatedItems = applyItemChange(updatedItems, record);
    }
  });

  return { tasks: updatedTasks, items: updatedItems };
};

const applyTaskChange = (tasks: Task[], change: ChangeRecord): Task[] => {
  const { operation, entityId, data } = change;

  switch (operation) {
    case 'create':
      return data ? [...tasks, data as Task] : tasks;
    case 'update':
      return tasks.map((task) => (task.id === entityId ? { ...task, ...(data as Partial<Task>) } : task));
    case 'delete':
      return tasks.filter((task) => task.id !== entityId);
    default:
      return tasks;
  }
};

const applyItemChange = (items: HomeItem[], change: ChangeRecord): HomeItem[] => {
  const { operation, entityId, data } = change;

  switch (operation) {
    case 'create':
      return data ? [...items, data as HomeItem] : items;
    case 'update':
      return items.map((item) => (item.id === entityId ? { ...item, ...(data as Partial<HomeItem>) } : item));
    case 'delete':
      return items.filter((item) => item.id !== entityId);
    default:
      return items;
  }
};

const normalizeHomeAssignments = (
  tasks: Task[],
  items: HomeItem[],
  homeId: string,
): { tasks: Task[]; items: HomeItem[] } => {
  const normalizedTasks = tasks.map((task) => ({ ...task, homeId: task.homeId ?? homeId }));
  const normalizedItems = items.map((item) => ({ ...item, homeId: item.homeId ?? homeId }));
  return { tasks: normalizedTasks, items: normalizedItems };
};

const ensureHomeId = (homeId?: string | null): string => homeId ?? defaultHome.id;

export const recordTaskCreate = async (task: Task): Promise<void> => {
  const record: ChangeRecord = {
    id: `change-${Date.now()}-${task.id}`,
    entity: 'task',
    entityId: task.id,
    operation: 'create',
    timestamp: new Date().toISOString(),
    data: task,
  };

  await appendToQueues(record);
};

export const recordTaskUpdate = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const record: ChangeRecord = {
    id: `change-${Date.now()}-${taskId}`,
    entity: 'task',
    entityId: taskId,
    operation: 'update',
    timestamp: new Date().toISOString(),
    data: updates,
  };

  await appendToQueues(record);
};

export const recordTaskDelete = async (taskId: string): Promise<void> => {
  const record: ChangeRecord = {
    id: `change-${Date.now()}-${taskId}`,
    entity: 'task',
    entityId: taskId,
    operation: 'delete',
    timestamp: new Date().toISOString(),
  };

  await appendToQueues(record);
};

export const recordItemCreate = async (item: HomeItem): Promise<void> => {
  const record: ChangeRecord = {
    id: `change-${Date.now()}-${item.id}`,
    entity: 'item',
    entityId: item.id,
    operation: 'create',
    timestamp: new Date().toISOString(),
    data: item,
  };

  await appendToQueues(record);
};

export const recordItemUpdate = async (itemId: string, updates: Partial<HomeItem>): Promise<void> => {
  const record: ChangeRecord = {
    id: `change-${Date.now()}-${itemId}`,
    entity: 'item',
    entityId: itemId,
    operation: 'update',
    timestamp: new Date().toISOString(),
    data: updates,
  };

  await appendToQueues(record);
};

export const recordItemDelete = async (itemId: string): Promise<void> => {
  const record: ChangeRecord = {
    id: `change-${Date.now()}-${itemId}`,
    entity: 'item',
    entityId: itemId,
    operation: 'delete',
    timestamp: new Date().toISOString(),
  };

  await appendToQueues(record);
};

export const runLocalSync = async (): Promise<SyncState> => {
  const storedState = await loadHomeData();
  const changeLog = dedupeChangeLog(await loadChangeLog());
  const pendingSync = dedupeChangeLog(await loadPendingSync());

  const homeId = ensureHomeId(storedState?.activeHomeId ?? storedState?.homes?.[0]?.id);
  const initialTasks = storedState?.tasks ?? [];
  const initialItems = storedState?.items ?? [];

  const { tasks: appliedTasks, items: appliedItems } = applyChangeLog(initialTasks, initialItems, changeLog);
  const { tasks, items } = normalizeHomeAssignments(appliedTasks, appliedItems, homeId);

  if (storedState) {
    await saveHomeData({
      ...storedState,
      activeHomeId: homeId,
      tasks,
      items,
      homes: storedState.homes ?? [defaultHome],
    });
  }

  await Promise.all([saveChangeLog(changeLog), savePendingSync(pendingSync)]);

  return { tasks, items, changeLog, pendingSync, homeId };
};

export const prepareForCloudSync = async (): Promise<{
  homeId: string;
  tasks: Task[];
  items: HomeItem[];
  changeLog: ChangeRecord[];
}> => {
  const syncedState = await runLocalSync();
  return {
    homeId: syncedState.homeId,
    tasks: syncedState.tasks,
    items: syncedState.items,
    changeLog: syncedState.changeLog,
  };
};

export const getPendingSync = async (): Promise<ChangeRecord[]> => dedupeChangeLog(await loadPendingSync());

export const clearPendingSync = async (): Promise<void> => {
  await savePendingSync([]);
};

export const clearChangeLog = async (): Promise<void> => {
  await saveChangeLog([]);
};

export const enqueueSyncRecord = appendToQueues;

