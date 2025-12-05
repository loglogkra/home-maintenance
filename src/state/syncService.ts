import { Home, HomeItem, Task, defaultHome } from '../types/models';
import { ChangeAction, ChangeEntity, ChangeRecord } from '../types/sync';

const createChangeRecord = (
  entity: ChangeEntity,
  action: ChangeAction,
  homeId: string,
  payload?: Record<string, unknown>,
): ChangeRecord => ({
  id: `sync-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  entity,
  action,
  homeId,
  payload,
  timestamp: new Date().toISOString(),
});

export const trackTaskChange = (
  pendingSync: ChangeRecord[],
  action: ChangeAction,
  task: Task,
  payload?: Record<string, unknown>,
): ChangeRecord[] => {
  const record = createChangeRecord('task', action, task.homeId, payload ?? { ...task });
  return [...pendingSync, record];
};

export const trackItemChange = (
  pendingSync: ChangeRecord[],
  action: ChangeAction,
  item: HomeItem,
  payload?: Record<string, unknown>,
): ChangeRecord[] => {
  const record = createChangeRecord('item', action, item.homeId, payload ?? { ...item });
  return [...pendingSync, record];
};

type RunLocalSyncParams = {
  tasks: Task[];
  items: HomeItem[];
  homes: Home[];
  activeHomeId: string | null;
  pendingSync?: ChangeRecord[];
};

type RunLocalSyncResult = {
  tasks: Task[];
  items: HomeItem[];
  pendingSync: ChangeRecord[];
};

const resolveHomeId = (
  candidateHomeId: string | undefined,
  activeHomeId: string | null,
  homes: Home[],
): string => {
  const validIds = new Set(homes.map((home) => home.id));
  if (candidateHomeId && validIds.has(candidateHomeId)) return candidateHomeId;
  return activeHomeId ?? homes[0]?.id ?? defaultHome.id;
};

export const runLocalSync = ({ tasks, items, homes, activeHomeId, pendingSync = [] }: RunLocalSyncParams): RunLocalSyncResult => {
  const normalizedTasks = tasks.map((task) => ({
    ...task,
    homeId: resolveHomeId(task.homeId, activeHomeId, homes),
  }));
  const normalizedItems = items.map((item) => ({
    ...item,
    homeId: resolveHomeId(item.homeId, activeHomeId, homes),
  }));

  return { tasks: normalizedTasks, items: normalizedItems, pendingSync };
};
